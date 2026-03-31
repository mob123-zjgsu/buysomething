const cloud = require('wx-server-sdk')

cloud.init({ env: 'buysomething-6gbmbtpxff05be35' })
const db = cloud.database()

/**
 * 购物车 API
 * 支持小程序 callFunction 和 HTTP 两种调用方式
 * 小程序调用: action 参数指定操作 (list/add/update/delete)
 * HTTP 调用: 使用 GET/POST/PUT/DELETE 方法
 */
exports.main = async (event, context) => {
  const isHttpCall = event.httpMethod !== undefined;
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Content-Type': 'application/json'
  };

  if (isHttpCall && event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // 解析参数
    let method, body, query;
    if (isHttpCall) {
      method = event.httpMethod;
      query = event.queryStringParameters || {};
      body = event.body ? JSON.parse(event.body) : {};
    } else {
      // 小程序调用: 使用 action 参数
      method = 'CALLFUNCTION';
      body = event;
      query = event;
    }

    // 获取 userId
    const userId = body.userId || query.userId || 'test-user-001';

    // 小程序调用使用 action 参数
    const action = body.action || query.action;

    // GET / list - 获取购物车列表
    if (!isHttpCall && (action === 'list' || action === undefined)) {
      const cartResult = await db.collection('cart').where({
        userId: userId
      }).get();

      const cartItems = await Promise.all(cartResult.data.map(async (item) => {
        try {
          const product = await db.collection('products').doc(item.productId).get();
          return {
            cartId: item._id,
            productId: item.productId,
            quantity: item.quantity,
            spec: item.spec || {},
            product: product.data.length > 0 ? {
              name: product.data[0].name,
              price: product.data[0].price,
              image: product.data[0].image,
              stock: product.data[0].stock || 0
            } : null
          };
        } catch (e) {
          return { cartId: item._id, productId: item.productId, quantity: item.quantity, product: null };
        }
      }));

      const result = { code: 0, message: 'success', data: { list: cartItems, total: cartItems.length } };
      if (isHttpCall) return { statusCode: 200, headers, body: JSON.stringify(result) };
      return result;
    }

    // POST / add - 添加商品到购物车
    if (!isHttpCall && action === 'add') {
      const { productId, quantity = 1, spec = {} } = body;

      if (!productId) {
        const result = { code: 1001, message: '商品ID不能为空', data: {} };
        if (isHttpCall) return { statusCode: 400, headers, body: JSON.stringify(result) };
        return result;
      }

      const product = await db.collection('products').doc(productId).get();
      if (product.data.length === 0) {
        const result = { code: 1004, message: '商品不存在', data: {} };
        if (isHttpCall) return { statusCode: 404, headers, body: JSON.stringify(result) };
        return result;
      }

      const existingCart = await db.collection('cart').where({
        userId: userId,
        productId: productId
      }).get();

      let cartId;
      if (existingCart.data.length > 0) {
        await db.collection('cart').doc(existingCart.data[0]._id).update({
          data: { quantity: existingCart.data[0].quantity + quantity }
        });
        cartId = existingCart.data[0]._id;
      } else {
        const result = await db.collection('cart').add({
          data: {
            userId: userId,
            productId: productId,
            quantity: quantity,
            spec: spec,
            createTime: db.serverDate()
          }
        });
        cartId = result._id;
      }

      const result = { code: 0, message: 'success', data: { cartId } };
      if (isHttpCall) return { statusCode: 200, headers, body: JSON.stringify(result) };
      return result;
    }

    // PUT / update - 更新购物车商品数量
    if (!isHttpCall && action === 'update') {
      const { cartId, quantity } = body;

      if (!cartId || quantity === undefined) {
        const result = { code: 1001, message: '参数不完整', data: {} };
        if (isHttpCall) return { statusCode: 400, headers, body: JSON.stringify(result) };
        return result;
      }

      if (quantity <= 0) {
        await db.collection('cart').doc(cartId).remove();
        const result = { code: 0, message: 'success', data: { action: 'deleted' } };
        if (isHttpCall) return { statusCode: 200, headers, body: JSON.stringify(result) };
        return result;
      }

      await db.collection('cart').doc(cartId).update({
        data: { quantity: quantity }
      });

      const result = { code: 0, message: 'success', data: { cartId } };
      if (isHttpCall) return { statusCode: 200, headers, body: JSON.stringify(result) };
      return result;
    }

    // DELETE / delete - 删除购物车商品
    if (!isHttpCall && action === 'delete') {
      const { cartId } = body;

      if (!cartId) {
        const result = { code: 1001, message: '购物车ID不能为空', data: {} };
        if (isHttpCall) return { statusCode: 400, headers, body: JSON.stringify(result) };
        return result;
      }

      await db.collection('cart').doc(cartId).remove();

      const result = { code: 0, message: 'success', data: {} };
      if (isHttpCall) return { statusCode: 200, headers, body: JSON.stringify(result) };
      return result;
    }

    // HTTP 方法处理
    if (isHttpCall) {
      if (method === 'GET') {
        const cartResult = await db.collection('cart').where({ userId }).get();
        const cartItems = await Promise.all(cartResult.data.map(async (item) => {
          try {
            const product = await db.collection('products').doc(item.productId).get();
            return {
              cartId: item._id,
              productId: item.productId,
              quantity: item.quantity,
              product: product.data[0] || null
            };
          } catch (e) {
            return { cartId: item._id, productId: item.productId, quantity: item.quantity, product: null };
          }
        }));
        return { statusCode: 200, headers, body: JSON.stringify({ code: 0, message: 'success', data: { list: cartItems } }) };
      }

      if (method === 'POST') {
        const { productId, quantity = 1 } = body;
        if (!productId) {
          return { statusCode: 400, headers, body: JSON.stringify({ code: 1001, message: '商品ID不能为空' }) };
        }
        const result = await db.collection('cart').add({
          data: { userId, productId, quantity, createTime: db.serverDate() }
        });
        return { statusCode: 200, headers, body: JSON.stringify({ code: 0, message: 'success', data: { cartId: result._id } }) };
      }
    }

    const result = { code: 1001, message: '不支持的操作', data: {} };
    if (isHttpCall) return { statusCode: 405, headers, body: JSON.stringify(result) };
    return result;

  } catch (err) {
    console.error('购物车操作失败:', err);
    const errorResult = { code: 2001, message: '服务器错误', data: { error: err.message } };
    if (isHttpCall) return { statusCode: 500, headers, body: JSON.stringify(errorResult) };
    return errorResult;
  }
};
