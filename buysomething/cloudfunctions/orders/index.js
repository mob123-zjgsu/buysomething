const cloud = require('wx-server-sdk');

cloud.init({ env: 'buysomething-6gbmbtpxff05be35' });
const db = cloud.database();

// 城市坐标映射表（根据城市名获取经纬度）
const CITY_COORDS = {
  '北京市': { lat: 39.9042, lng: 116.4074 },
  '上海市': { lat: 31.2304, lng: 121.4737 },
  '天津市': { lat: 39.0842, lng: 117.2010 },
  '重庆市': { lat: 29.4316, lng: 106.9123 },
  '广州市': { lat: 23.1291, lng: 113.2644 },
  '深圳市': { lat: 22.5431, lng: 114.0579 },
  '杭州市': { lat: 30.2741, lng: 120.1551 },
  '南京市': { lat: 32.0603, lng: 118.7969 },
  '成都市': { lat: 30.5728, lng: 104.0668 },
  '武汉市': { lat: 30.5928, lng: 114.3055 },
  '西安市': { lat: 34.3416, lng: 108.9398 },
  '郑州市': { lat: 34.7466, lng: 113.6253 },
  '长沙市': { lat: 28.2282, lng: 112.9388 },
  '沈阳市': { lat: 41.8057, lng: 123.4315 },
  '青岛市': { lat: 36.0671, lng: 120.3826 },
  '厦门市': { lat: 24.4798, lng: 118.0894 },
  '昆明市': { lat: 25.0389, lng: 102.7183 },
  '济南市': { lat: 36.6512, lng: 116.9972 },
  '石家庄市': { lat: 38.0428, lng: 114.5149 },
  '太原市': { lat: 37.8706, lng: 112.5489 },
  '福州市': { lat: 26.0745, lng: 119.2965 },
  '合肥市': { lat: 31.8206, lng: 117.2272 },
  '南昌市': { lat: 28.6820, lng: 115.8579 },
  '贵阳市': { lat: 26.6470, lng: 106.6302 },
  '兰州市': { lat: 36.0611, lng: 103.8343 },
  '哈尔滨市': { lat: 45.8038, lng: 126.5350 },
  '长春市': { lat: 43.8171, lng: 125.3235 },
  '海口市': { lat: 20.0440, lng: 110.1999 },
  '南宁市': { lat: 22.8170, lng: 108.3665 },
  '呼和浩特市': { lat: 40.8414, lng: 111.7519 },
  '乌鲁木齐市': { lat: 43.8256, lng: 87.6168 },
  '拉萨市': { lat: 29.6500, lng: 91.1000 },
  '银川市': { lat: 38.4872, lng: 106.2309 },
  '西宁市': { lat: 36.6171, lng: 101.7782 }
};

function getCityCoords(cityName) {
  if (!cityName) return { lat: 31.2304, lng: 121.4737 };
  // 精确匹配
  if (CITY_COORDS[cityName]) return CITY_COORDS[cityName];
  // 去掉"市"后缀再匹配
  const shortName = cityName.replace(/市$/, '');
  for (const key in CITY_COORDS) {
    if (key.includes(shortName)) return CITY_COORDS[key];
  }
  // 默认 fallback 到上海（集散中心常见出发地）
  return { lat: 31.2304, lng: 121.4737 };
}

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

      // 查询收货地址
      let address = null;
      try {
        const addrRes = await db.collection('addresses').doc(addressId).get();
        if (addrRes.data) address = addrRes.data;
      } catch (e) {
        console.error('查询地址失败:', e);
      }

      // 计算订单金额
      let totalAmount = 0;
      const orderProducts = [];

      for (const item of items) {
        try {
          // 使用 where 查询，避免无效 ID 格式错误
          const productResult = await db.collection('products').where({
            _id: item.productId
          }).get();

          if (!productResult.data || productResult.data.length === 0) {
            continue;
          }

          const p = productResult.data[0];
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

      // 创建订单（保存地址信息）
      const orderData = {
        userId: userId,
        orderNo: orderNo,
        status: 0,
        totalAmount: totalAmount,
        discountAmount: 0,
        payAmount: totalAmount,
        remark: remark,
        addressId: addressId,
        address: address ? {
          name: address.name,
          phone: address.phone,
          province: address.province,
          city: address.city,
          district: address.district,
          detail: address.detail,
          fullAddress: `${address.province || ''}${address.city || ''}${address.district || ''}${address.detail || ''}`
        } : null,
        products: orderProducts,
        createTime: db.serverDate()
      };

      const orderResult = await db.collection('orders').add({ data: orderData });

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

    // updateAddress - 更新订单收货地址（仅待付款状态可修改）
    if (!isHttpCall && action === 'updateAddress') {
      const { orderId, addressId, address } = body;

      if (!orderId) {
        const result = { code: 1001, message: '缺少订单ID', data: {} };
        return result;
      }

      // 检查订单状态，只允许待付款修改
      const orderCheck = await db.collection('orders').doc(orderId).get();
      if (!orderCheck.data || orderCheck.data.status !== 0) {
        return { code: 1002, message: '仅待付款订单可修改地址' };
      }

      const updateData = {};
      if (addressId) updateData.addressId = addressId;
      if (address) updateData.address = address;

      // 同步更新物流目的地（如果物流已存在）
      if (address && address.city && orderCheck.data.logistics) {
        const destCoords = getCityCoords(address.city);
        updateData['logistics.destination'] = {
          city: address.city,
          address: address.fullAddress || address.detail || '收货地址',
          lat: destCoords.lat,
          lng: destCoords.lng
        };
      }

      await db.collection('orders').doc(orderId).update({ data: updateData });

      return { code: 0, message: '地址更新成功', data: { orderId } };
    }

    // pay - 模拟支付
    if (!isHttpCall && action === 'pay') {
      const { orderId } = body;

      if (!orderId) {
        const result = { code: 1001, message: '缺少订单ID', data: {} };
        if (isHttpCall) return { statusCode: 400, headers, body: JSON.stringify(result) };
        return result;
      }

      // 获取订单信息以读取收货地址
      const orderRes = await db.collection('orders').doc(orderId).get();
      const order = orderRes.data || {};
      const address = order.address || {};

      // 如果没有保存地址，尝试从 addressId 查询（兼容旧订单）
      if (!address.city && order.addressId) {
        try {
          const addrRes = await db.collection('addresses').doc(order.addressId).get();
          if (addrRes.data) {
            address.name = addrRes.data.name;
            address.phone = addrRes.data.phone;
            address.province = addrRes.data.province;
            address.city = addrRes.data.city;
            address.district = addrRes.data.district;
            address.detail = addrRes.data.detail;
            address.fullAddress = `${addrRes.data.province || ''}${addrRes.data.city || ''}${addrRes.data.district || ''}${addrRes.data.detail || ''}`;
          }
        } catch (e) {
          console.error('查询地址失败:', e);
        }
      }

      const destCity = address.city || '北京市';
      const destAddress = address.fullAddress || address.detail || '收货地址';
      const destCoords = getCityCoords(destCity);

      // 模拟支付成功
      const payTime = new Date();
      const estimatedArrival = new Date(payTime.getTime() + 3 * 24 * 60 * 60 * 1000); // 3天后

      // 生成模拟物流（使用真实收货地址）
      const logistics = {
        company: '优选物流',
        trackingNo: `YL${Date.now()}${Math.floor(Math.random() * 100)}`,
        origin: { city: '上海市', address: '优选物流上海集散中心', lat: 31.2304, lng: 121.4737 },
        destination: { city: destCity, address: destAddress, lat: destCoords.lat, lng: destCoords.lng },
        status: 'processing',
        shipTime: payTime.toISOString(),
        events: [
          { time: payTime.toISOString(), desc: '订单已支付，等待商家发货', type: 'pay' },
          { time: new Date(payTime.getTime() + 2 * 60 * 60 * 1000).toISOString(), desc: '商家已接单，正在备货', type: 'accept' }
        ],
        estimatedArrival: estimatedArrival.toISOString()
      };

      await db.collection('orders').doc(orderId).update({
        data: {
          status: 1,
          payTime: db.serverDate(),
          payMethod: 'wechat_pay_simulated',
          logistics: logistics
        }
      });

      const responseData = {
        code: 0,
        message: '支付成功（模拟）',
        data: { orderId, status: 1, payTime: payTime.toISOString(), logistics }
      };
      if (isHttpCall) return { statusCode: 200, headers, body: JSON.stringify(responseData) };
      return responseData;
    }

    // detail - 获取订单详情
    if (!isHttpCall && action === 'detail') {
      const { orderId } = body;

      if (!orderId) {
        const result = { code: 1001, message: '缺少订单ID', data: {} };
        if (isHttpCall) return { statusCode: 400, headers, body: JSON.stringify(result) };
        return result;
      }

      const orderResult = await db.collection('orders').doc(orderId).get();
      if (!orderResult.data) {
        const result = { code: 1002, message: '订单不存在', data: {} };
        if (isHttpCall) return { statusCode: 404, headers, body: JSON.stringify(result) };
        return result;
      }

      const order = orderResult.data;
      const responseData = {
        code: 0,
        message: 'success',
        data: {
          orderId: order._id,
          orderNo: order.orderNo,
          userId: order.userId,
          status: order.status,
          totalAmount: order.totalAmount,
          discountAmount: order.discountAmount || 0,
          payAmount: order.payAmount,
          remark: order.remark || '',
          createTime: order.createTime,
          payTime: order.payTime || null,
          products: order.products || [],
          logistics: order.logistics || null,
          addressId: order.addressId || null,
          address: order.address || null
        }
      };
      if (isHttpCall) return { statusCode: 200, headers, body: JSON.stringify(responseData) };
      return responseData;
    }

    // logistics - 获取/更新物流信息
    if (!isHttpCall && action === 'logistics') {
      const { orderId, simulateEvent } = body;

      if (!orderId) {
        const result = { code: 1001, message: '缺少订单ID', data: {} };
        if (isHttpCall) return { statusCode: 400, headers, body: JSON.stringify(result) };
        return result;
      }

      const orderResult = await db.collection('orders').doc(orderId).get();
      if (!orderResult.data) {
        const result = { code: 1002, message: '订单不存在', data: {} };
        if (isHttpCall) return { statusCode: 404, headers, body: JSON.stringify(result) };
        return result;
      }

      let logistics = orderResult.data.logistics;
      let orderAddress = orderResult.data.address || {};

      // 兼容旧订单：如果订单没有 address 对象但有 addressId，查询地址库
      if (!orderAddress.city && orderResult.data.addressId) {
        try {
          const addrRes = await db.collection('addresses').doc(orderResult.data.addressId).get();
          if (addrRes.data) {
            orderAddress = {
              name: addrRes.data.name,
              phone: addrRes.data.phone,
              province: addrRes.data.province,
              city: addrRes.data.city,
              district: addrRes.data.district,
              detail: addrRes.data.detail,
              fullAddress: `${addrRes.data.province || ''}${addrRes.data.city || ''}${addrRes.data.district || ''}${addrRes.data.detail || ''}`
            };
          }
        } catch (e) {
          console.error('查询旧订单地址失败:', e);
        }
      }

      // 如果没有物流信息，根据订单收货地址初始化
      if (!logistics) {
        const destCity = orderAddress.city || '北京市';
        const destAddress = orderAddress.fullAddress || orderAddress.detail || '收货地址';
        const destCoords = getCityCoords(destCity);

        logistics = {
          company: '优选物流',
          trackingNo: `YL${Date.now()}`,
          origin: { city: '上海市', address: '上海集散中心', lat: 31.2304, lng: 121.4737 },
          destination: { city: destCity, address: destAddress, lat: destCoords.lat, lng: destCoords.lng },
          status: 'processing',
          events: [{ time: new Date().toISOString(), desc: '包裹已揽收', type: 'pickup' }],
          estimatedArrival: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        };
      } else if (orderAddress.city) {
        // 物流已存在：用订单当前地址同步物流目的地（修复地址更新后目的地不一致的问题）
        const destCoords = getCityCoords(orderAddress.city);
        const destCity = orderAddress.city;
        const destAddress = orderAddress.fullAddress || orderAddress.detail || '收货地址';
        const needsUpdate = !logistics.destination ||
          logistics.destination.city !== destCity ||
          Math.abs((logistics.destination.lat || 0) - destCoords.lat) > 0.1;

        if (needsUpdate) {
          logistics.destination = {
            city: destCity,
            address: destAddress,
            lat: destCoords.lat,
            lng: destCoords.lng
          };
          // 同步更新数据库
          await db.collection('orders').doc(orderId).update({
            data: { 'logistics.destination': logistics.destination }
          });
        }
      }

      // 模拟物流事件推进
      if (simulateEvent) {
        const eventMap = {
          'shipped': { desc: '包裹已从【{from}】发出，正在发往【{to}】', status: 'shipping', nextStatus: 2 },
          'arrived_city': { desc: '包裹已到达【{to}】中转站', status: 'transit' },
          'out_delivery': { desc: '快递员【张师傅 138****5678】正在为您派送', status: 'delivering' },
          'delivered': { desc: '包裹已签收，感谢您的购买！', status: 'delivered', nextStatus: 3 },
          'delay': { desc: '包裹因【天气原因】有所延迟，请耐心等待', status: 'delay' },
          'exception': { desc: '包裹出现异常【外包装破损】，已重新包装继续运输', status: 'exception' }
        };

        const eventInfo = eventMap[simulateEvent] || eventMap['shipped'];
        const newEvent = {
          time: new Date().toISOString(),
          desc: eventInfo.desc
            .replace('{from}', logistics.origin.city)
            .replace('{to}', logistics.destination.city),
          type: simulateEvent
        };

        logistics.events.push(newEvent);
        logistics.status = eventInfo.status;

        // 如果需要更新订单状态
        const orderUpdates = {};
        if (eventInfo.nextStatus) {
          orderUpdates.status = eventInfo.nextStatus;
        }
        orderUpdates.logistics = logistics;

        await db.collection('orders').doc(orderId).update({ data: orderUpdates });
      }

      // 15天自动确认收货检查
      if (logistics.shipTime && orderResult.data.status === 2) {
        const shipDate = new Date(logistics.shipTime);
        const now = new Date();
        const daysSinceShip = (now - shipDate) / (1000 * 60 * 60 * 24);
        if (daysSinceShip >= 15) {
          logistics.status = 'delivered';
          logistics.events.push({
            time: now.toISOString(),
            desc: '已超15天未确认收货，系统自动确认签收',
            type: 'auto_confirmed'
          });
          await db.collection('orders').doc(orderId).update({
            data: { status: 3, logistics: logistics }
          });
        }
      }

      // 计算当前位置（基于事件数量线性插值）
      const totalEvents = logistics.events.length;
      const progress = Math.min(totalEvents / 6, 1); // 6个事件 = 100%
      const currentLat = logistics.origin.lat + (logistics.destination.lat - logistics.origin.lat) * progress;
      const currentLng = logistics.origin.lng + (logistics.destination.lng - logistics.origin.lng) * progress;

      const responseData = {
        code: 0,
        message: 'success',
        data: {
          orderId,
          address: orderResult.data.address || null,
          logistics: {
            ...logistics,
            currentPosition: { lat: currentLat, lng: currentLng },
            progress: Math.round(progress * 100)
          }
        }
      };
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
