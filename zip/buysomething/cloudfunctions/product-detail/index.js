const cloud = require('wx-server-sdk')

cloud.init({ env: 'buysomething-6gbmbtpxff05be35' })
const db = cloud.database()

/**
 * 商品详情 API
 * 支持小程序 callFunction 和 HTTP 两种调用方式
 */
exports.main = async (event, context) => {
  const isHttpCall = event.httpMethod !== undefined;
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Content-Type': 'application/json'
  };

  if (isHttpCall && event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // 解析参数
    let productId;
    if (isHttpCall) {
      const query = event.queryStringParameters || {};
      productId = query.productId;
    } else {
      productId = event.productId;
    }

    if (!productId) {
      const result = { code: 1001, message: '商品ID不能为空', data: {} };
      if (isHttpCall) return { statusCode: 400, headers, body: JSON.stringify(result) };
      return result;
    }

    const queryResult = await db.collection('products').doc(productId).get();
    
    // 兼容不同版本的返回格式
    const productData = queryResult.data || queryResult || [];
    const product = Array.isArray(productData) ? productData[0] : productData;

    if (!product) {
      const result = { code: 1004, message: '商品不存在', data: {} };
      if (isHttpCall) return { statusCode: 404, headers, body: JSON.stringify(result) };
      return result;
    }

    // 如果没有 specs 字段，提供默认规格
    const specs = (product && product.specs) || {};
    const hasColors = specs.colors && specs.colors.length > 0;
    const hasSizes = specs.sizes && specs.sizes.length > 0;
    
    // 为没有规格的商品设置默认规格
    if (!hasColors && !hasSizes) {
      specs.colors = ['标准'];
      specs.sizes = ['标准'];
    }
    
    // 统一处理图片 - 过滤无效的外部链接，使用本地图片
    let image = product.image || '/images/product1.jpg';
    if (image.includes('img.example.com') || image.includes('placeholder') || !image.startsWith('/images/')) {
      image = '/images/product1.jpg';
    }
    let images = product.images && product.images.length > 0 ? product.images : [image];
    // 过滤 images 数组中的无效链接
    images = images.map(img => {
      if (img.includes('img.example.com') || img.includes('placeholder') || !img.startsWith('/images/')) {
        return image;
      }
      return img;
    });
    
    const productDetail = {
      productId: product._id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: image,
      images: images,
      categoryId: product.categoryId,
      description: product.description || '',
      specs: specs,
      sales: product.sales || 0,
      rating: product.rating || 5,
      stock: product.stock || 0,
      status: product.status
    };

    const responseData = { code: 0, message: 'success', data: productDetail };
    if (isHttpCall) {
      return { statusCode: 200, headers, body: JSON.stringify(responseData) };
    }
    return responseData;

  } catch (err) {
    console.error('商品详情查询失败:', err);
    const errorResult = { code: 2001, message: '服务器错误', data: { error: err.message } };
    if (isHttpCall) {
      return { statusCode: 500, headers, body: JSON.stringify(errorResult) };
    }
    return errorResult;
  }
};
