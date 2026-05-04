const cloud = require('wx-server-sdk')

cloud.init({ env: 'buysomething-6gbmbtpxff05be35' })
const db = cloud.database()

/**
 * 订单 API
 * 支持小程序 callFunction 和 HTTP 两种调用方式
 * 小程序调用: action 参数指定操作 (list/create/update)
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
    let body, query;
    if (isHttpCall) {
      query = event.queryStringParameters || {};
      body = event.body ? JSON.parse(event.body) : {};
    } else {
      body = event;
      query = event;
    }

    // 获取 userId
    const userId = body.userId || query.userId || 'test-user-001';
    const action = body.action || query.action;

    // list - 获取订单列表
    if (!isHttpCall && (action === 'list' || action === undefined)) {
      const status = body.status || query.status;
      let whereCondition = { userId: userId };
      
      if (status !== undefined && status !== '') {
        whereCondition.status = parseInt(status);
      }

      const page = parseInt(body.page || query.page) || 1;
      const pageSize = parseInt(body.pageSize || query.pageSize) || 20;
      const skip = (page - 1) * pageSize;

      const result = await db.collection('orders')
        .where(whereCondition)
        .orderBy('createTime', 'desc')
        .skip(skip)
        .limit(pageSize)
        .get();

      const countResult = await db.collection('orders').where(whereCondition).count();

      const orders = result.data.map(order => ({
        orderId: order._id,
        orderNo: order.orderNo,
        status: order.status,
        totalAmount: order.totalAmount,
        payAmount: order.payAmount,
        createTime: order.createTime
      }));

      const responseData = { code: 0, message: 'success', data: { list: orders, total: countResult.total, page, pageSize } };
      if (isHttpCall) return { statusCode: 200, headers, body: JSON.stringify(responseData) };
      return responseData;
    }

    // create - 创建订单
    if (!isHttpCall && action === 'create') {
      const { addressId, items = [], remark = '' } = body;

      if (!addressId || items.length === 0) {
        const result = { code: 1001, message: '参数不完整 (需要 addressId 和 items)', data: {} };
        if (isHttpCall) return { statusCode: 400, headers, body: JSON.stringify(result) };
        return result;
      }

      // 计算订单金额
      let totalAmount = 0;
      const orderProducts = [];

      for (const item of items) {
        try {
          const product = await db.collection('products').doc(item.productId).get();
          if (product.data.length === 0) continue;
          
          const p = product.data[0];
          const itemAmount = p.price * item.quantity;
          totalAmount += itemAmount;

          orderProducts.push({
            productId: item.productId,
            productName: p.name,
            productImage: p.image,
            price: p.price,
            quantity: item.quantity
          });
        } catch (e) {
          console.error('商品查询失败:', e);
        }
      }

      if (totalAmount === 0) {
        const result = { code: 1001, message: '商品信息无效', data: {} };
        if (isHttpCall) return { statusCode: 400, headers, body: JSON.stringify(result) };
        return result;
      }

      // 生成订单号
      const orderNo = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

      // 创建订单
      const orderResult = await db.collection('orders').add({
        data: {
          userId: userId,
          orderNo: orderNo,
          status: 0,
          totalAmount: totalAmount,
          discountAmount: 0,
          payAmount: totalAmount,
          remark: remark,
          createTime: db.serverDate()
        }
      });

      const responseData = { code: 0, message: 'success', data: { orderId: orderResult._id, orderNo, totalAmount, payAmount: totalAmount } };
      if (isHttpCall) return { statusCode: 200, headers, body: JSON.stringify(responseData) };
      return responseData;
    }

    // update - 更新订单状态
    if (!isHttpCall && action === 'update') {
      const { orderId, status } = body;

      if (!orderId || status === undefined) {
        const result = { code: 1001, message: '参数不完整', data: {} };
        if (isHttpCall) return { statusCode: 400, headers, body: JSON.stringify(result) };
        return result;
      }

      const updateData = { status: parseInt(status) };
      await db.collection('orders').doc(orderId).update({ data: updateData });

      const responseData = { code: 0, message: 'success', data: { orderId, status } };
      if (isHttpCall) return { statusCode: 200, headers, body: JSON.stringify(responseData) };
      return responseData;
    }

    const result = { code: 1001, message: '不支持的操作', data: {} };
    if (isHttpCall) return { statusCode: 405, headers, body: JSON.stringify(result) };
    return result;

  } catch (err) {
    console.error('订单操作失败:', err);
    const errorResult = { code: 2001, message: '服务器错误', data: { error: err.message } };
    if (isHttpCall) return { statusCode: 500, headers, body: JSON.stringify(errorResult) };
    return errorResult;
  }
};
