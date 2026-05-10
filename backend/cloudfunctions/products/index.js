const cloud = require('wx-server-sdk');

// 初始化 CloudBase
cloud.init({
  env: 'buysomething-6gbmbtpxff05be35'
});

const db = cloud.database();

/**
 * 商品列表 API
 * 支持小程序 callFunction 和 HTTP 两种调用方式
 */
exports.main = async (event, context) => {
  const isHttpCall = event.httpMethod !== undefined;
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Content-Type': 'application/json'
  };

  if (isHttpCall && event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // 小程序调用时 event 直接是数据，HTTP 调用时需要解析
    let params;
    if (isHttpCall) {
      const query = event.queryStringParameters || {};
      const body = event.body ? JSON.parse(event.body) : {};
      params = { ...query, ...body };
    } else {
      params = event;
    }
    
    const { page = 1, pageSize = 20, categoryId, keyword, sort } = params;
    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    console.log('商品列表请求:', { page, pageSize, categoryId, keyword, sort });

    let collection = db.collection('products');
    let whereCondition = { status: 1 }; // 只查询上架商品

    // 分类筛选
    if (categoryId) {
      whereCondition.categoryId = categoryId;
    }

    // 关键词搜索
    if (keyword) {
      whereCondition.name = db.RegExp({
        regexp: keyword,
        options: 'i'
      });
    }

    // 查询数据
    let queryBuilder = collection.where(whereCondition);

    // 排序
    let sortField = 'createTime';
    let sortOrder = 'desc';
    if (sort === 'price_asc') {
      sortField = 'price';
      sortOrder = 'asc';
    } else if (sort === 'price_desc') {
      sortField = 'price';
      sortOrder = 'desc';
    } else if (sort === 'sales') {
      sortField = 'sales';
      sortOrder = 'desc';
    }

    queryBuilder = queryBuilder.orderBy(sortField, sortOrder);

    // 分页
    const result = await queryBuilder.skip(skip).limit(parseInt(pageSize)).get();

    // 获取总数
    const countResult = await collection.where(whereCondition).count();
    const total = countResult.total;

    // 处理商品数据
    const products = result.data.map(item => {
      // 如果没有 specs 字段，提供默认规格
      let specs = item.specs || {};
      const hasColors = specs.colors && specs.colors.length > 0;
      const hasSizes = specs.sizes && specs.sizes.length > 0;
      
      if (!hasColors && !hasSizes) {
        specs.colors = ['标准'];
        specs.sizes = ['标准'];
      }
      
      // 统一处理图片 - 过滤无效的外部链接，使用本地图片
      let image = item.image || '/images/product1.jpg';
      if (image.includes('img.example.com') || image.includes('placeholder') || !image.startsWith('/images/')) {
        image = '/images/product1.jpg';
      }
      let images = item.images && item.images.length > 0 ? item.images : [image];
      // 过滤 images 数组中的无效链接
      images = images.map(img => {
        if (img.includes('img.example.com') || img.includes('placeholder') || !img.startsWith('/images/')) {
          return image;
        }
        return img;
      });
      
      return {
        productId: item._id,
        name: item.name,
        price: item.price,
        originalPrice: item.originalPrice,
        image: image,
        images: images,
        categoryId: item.categoryId,
        sales: item.sales || 0,
        rating: item.rating || 5,
        stock: item.stock || 999,
        specs: specs
      };
    });

    const responseData = {
      code: 0,
      message: 'success',
      data: {
        list: products,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    };

    if (isHttpCall) {
      return { statusCode: 200, headers, body: JSON.stringify(responseData) };
    }
    return responseData;

  } catch (err) {
    console.error('商品列表查询失败:', err);
    const errorResult = { code: 2001, message: '服务器错误', data: { error: err.message } };
    if (isHttpCall) {
      return { statusCode: 500, headers, body: JSON.stringify(errorResult) };
    }
    return errorResult;
  }
};
