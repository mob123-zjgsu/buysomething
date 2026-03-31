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

    if (queryResult.data.length === 0) {
      const result = { code: 1004, message: '商品不存在', data: {} };
      if (isHttpCall) return { statusCode: 404, headers, body: JSON.stringify(result) };
      return result;
    }

    const product = queryResult.data[0];
    const productDetail = {
      productId: product._id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      images: product.images || [],
      categoryId: product.categoryId,
      description: product.description || '',
      specs: product.specs || {},
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
