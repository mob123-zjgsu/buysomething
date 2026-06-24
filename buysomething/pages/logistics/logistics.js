// pages/logistics/logistics.js

// 中国主要城市坐标库（用于地址解析）
const CITY_HUBS = {
  '上海': { lat: 31.2304, lng: 121.4737 },
  '南京': { lat: 32.0603, lng: 118.7969 },
  '杭州': { lat: 30.2741, lng: 120.1551 },
  '合肥': { lat: 31.8206, lng: 117.2272 },
  '北京': { lat: 39.9042, lng: 116.4074 },
  '天津': { lat: 39.0842, lng: 117.2010 },
  '石家庄': { lat: 38.0428, lng: 114.5149 },
  '济南': { lat: 36.6512, lng: 116.9972 },
  '武汉': { lat: 30.5928, lng: 114.3055 },
  '郑州': { lat: 34.7466, lng: 113.6253 },
  '长沙': { lat: 28.2282, lng: 112.9388 },
  '南昌': { lat: 28.6820, lng: 115.8579 },
  '广州': { lat: 23.1291, lng: 113.2644 },
  '深圳': { lat: 22.5431, lng: 114.0579 },
  '福州': { lat: 26.0745, lng: 119.2965 },
  '成都': { lat: 30.5728, lng: 104.0668 },
  '重庆': { lat: 29.4316, lng: 106.9123 },
  '昆明': { lat: 25.0389, lng: 102.7183 },
  '贵阳': { lat: 26.6470, lng: 106.6302 },
  '西安': { lat: 34.3416, lng: 108.9398 },
  '兰州': { lat: 36.0611, lng: 103.8343 },
  '沈阳': { lat: 41.8057, lng: 123.4315 },
  '哈尔滨': { lat: 45.8038, lng: 126.5350 },
  '长春': { lat: 43.8171, lng: 125.3235 },
  '徐州': { lat: 34.2616, lng: 117.1845 },
  '太原': { lat: 37.8706, lng: 112.5489 },
  '厦门': { lat: 24.4798, lng: 118.0894 },
  '青岛': { lat: 36.0671, lng: 120.3826 },
  '大连': { lat: 38.9140, lng: 121.6147 },
  '南宁': { lat: 22.8170, lng: 108.3665 },
  '海口': { lat: 20.0440, lng: 110.1999 },
  '呼和浩特': { lat: 40.8414, lng: 111.7519 },
  '乌鲁木齐': { lat: 43.8256, lng: 87.6168 },
  '拉萨': { lat: 29.6500, lng: 91.1000 },
  '银川': { lat: 38.4872, lng: 106.2309 },
  '西宁': { lat: 36.6171, lng: 101.7782 }
};

// 根据城市名获取坐标
function resolveCityCoords(cityName) {
  if (!cityName) return null;
  const short = cityName.replace(/市$/, '');
  if (CITY_HUBS[short]) return CITY_HUBS[short];
  for (const key in CITY_HUBS) {
    if (cityName.includes(key) || key.includes(short)) return CITY_HUBS[key];
  }
  return null;
}

/**
 * 中国主要水域的粗略边界（经纬度矩形）
 * 如果直线段穿过这些区域，需要绕行
 * 格式: [最小纬度, 最小经度, 最大纬度, 最大经度, 绕行方向('west'或'east')]
 */
const WATER_ZONES = [
  // 渤海（绕行点改为保定西南侧，避免子线段仍穿海）
  { minLat: 37.0, minLng: 117.5, maxLat: 41.0, maxLng: 122.0, detour: 'west', waypoint: { lat: 38.5, lng: 115.0 } },
  // 黄海（中国沿岸）
  { minLat: 31.0, minLng: 121.5, maxLat: 37.0, maxLng: 125.0, detour: 'west', waypoint: { lat: 34.0, lng: 117.0 } },
  // 东海（中国沿岸）
  { minLat: 24.0, minLng: 119.5, maxLat: 31.0, maxLng: 125.0, detour: 'west', waypoint: { lat: 28.0, lng: 116.0 } },
  // 南海（中国沿岸）
  { minLat: 18.0, minLng: 109.0, maxLat: 24.0, maxLng: 118.0, detour: 'west', waypoint: { lat: 23.0, lng: 113.3 } },
  // 台湾海峡
  { minLat: 22.0, minLng: 118.0, maxLat: 26.0, maxLng: 121.0, detour: 'west', waypoint: { lat: 24.5, lng: 117.5 } },
  // 琼州海峡
  { minLat: 19.5, minLng: 108.5, maxLat: 21.0, maxLng: 111.0, detour: 'north', waypoint: { lat: 21.5, lng: 110.0 } },
  // 太湖（大致）
  { minLat: 30.9, minLng: 119.8, maxLat: 31.4, maxLng: 120.5, detour: 'west', waypoint: { lat: 31.2, lng: 119.5 } },
  // 鄱阳湖
  { minLat: 28.8, minLng: 115.8, maxLat: 29.7, maxLng: 116.5, detour: 'west', waypoint: { lat: 29.0, lng: 115.5 } },
  // 洞庭湖
  { minLat: 28.8, minLng: 112.0, maxLat: 29.5, maxLng: 113.2, detour: 'east', waypoint: { lat: 28.6, lng: 113.0 } },
];

// 判断线段是否穿过某个矩形区域
function lineIntersectsRect(lat1, lng1, lat2, lng2, rect) {
  // 使用参数化线段与矩形相交检测
  const dx = lat2 - lat1;
  const dy = lng2 - lng1;
  let tMin = 0, tMax = 1;

  // 纬度方向
  if (Math.abs(dx) > 1e-10) {
    let t1 = (rect.minLat - lat1) / dx;
    let t2 = (rect.maxLat - lat1) / dx;
    if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
  } else {
    if (lat1 < rect.minLat || lat1 > rect.maxLat) return false;
  }

  // 经度方向
  if (Math.abs(dy) > 1e-10) {
    let t1 = (rect.minLng - lng1) / dy;
    let t2 = (rect.maxLng - lng1) / dy;
    if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
  } else {
    if (lng1 < rect.minLng || lng1 > rect.maxLng) return false;
  }

  return tMin <= tMax && tMax >= 0 && tMin <= 1;
}

/**
 * 生成避水路线：直线 + 自动绕开水域
 * 核心思路：起点→终点画直线，检测是否穿过水域，如果穿过则插入绕行点
 */
function generateRoute(originLat, originLng, destLat, destLng, originCity, destCity) {
  const result = [
    { lat: originLat, lng: originLng, city: originCity || '发货地', name: (originCity || '发货地') + '集散中心' }
  ];

  // 收集所有需要绕行的水域，按起点距离排序
  const crossings = [];
  for (const zone of WATER_ZONES) {
    // 如果起点或终点本身就在水域区域内，跳过（无法绕行起点/终点）
    const originInZone = originLat >= zone.minLat && originLat <= zone.maxLat &&
                         originLng >= zone.minLng && originLng <= zone.maxLng;
    const destInZone = destLat >= zone.minLat && destLat <= zone.maxLat &&
                       destLng >= zone.minLng && destLng <= zone.maxLng;
    if (originInZone || destInZone) continue;

    if (lineIntersectsRect(originLat, originLng, destLat, destLng, zone)) {
      // 计算绕行点到起点的距离（用于排序）
      const wp = zone.waypoint;
      const dist = Math.pow(wp.lat - originLat, 2) + Math.pow(wp.lng - originLng, 2);
      crossings.push({ zone, dist });
    }
  }

  // 按距离起点的远近排序
  crossings.sort((a, b) => a.dist - b.dist);

  // 插入绕行点
  for (const { zone } of crossings) {
    const wp = zone.waypoint;
    // 避免重复
    const exists = result.some(r => Math.abs(r.lat - wp.lat) < 0.5 && Math.abs(r.lng - wp.lng) < 0.5);
    if (!exists) {
      result.push({
        lat: wp.lat,
        lng: wp.lng,
        city: getNearestCityName(wp.lat, wp.lng),
        name: getNearestCityName(wp.lat, wp.lng) + '中转站'
      });
    }
  }

  result.push({ lat: destLat, lng: destLng, city: destCity || '收货地', name: (destCity || '收货地') + '目的地' });

  return result;
}

// 根据坐标找最近的城市名
function getNearestCityName(lat, lng) {
  let minDist = Infinity;
  let name = '中转站';
  for (const [city, coord] of Object.entries(CITY_HUBS)) {
    const dist = Math.pow(coord.lat - lat, 2) + Math.pow(coord.lng - lng, 2);
    if (dist < minDist) {
      minDist = dist;
      name = city;
    }
  }
  return name;
}

// 根据路线生成段权重
function generateSegmentWeights(count) {
  const weights = [];
  for (let i = 0; i < count; i++) {
    weights.push(15 + Math.floor(Math.random() * 15));
  }
  return weights;
}

// 根据路线生成阶段事件
function generateStageInfo(waypoints) {
  if (waypoints.length <= 2) {
    const originCity = waypoints[0].city || '发货地';
    const destCity = waypoints[waypoints.length - 1].city || '收货地';
    return [
      { status: 'shipping', text: '运输中', event: `包裹已从${originCity}发出` },
      { status: 'shipping', text: '运输中', event: `包裹正在运往${destCity}` },
      { status: 'delivering', text: '派送中', event: `包裹已到达${destCity}附近配送站，正在派送` },
      { status: 'delivered', text: '已送达', event: `包裹已送达${waypoints[waypoints.length - 1].name}` }
    ];
  }
  const statuses = ['shipping', 'shipping', 'transit', 'shipping', 'delivering'];
  const texts = ['运输中', '运输中', '到达中转站', '运输中', '派送中'];
  return waypoints.slice(0, -1).map((wp, i) => {
    const isLast = i === waypoints.length - 2;
    if (isLast) {
      return { status: 'delivering', text: '派送中', event: `包裹已到达${wp.city}附近配送站，正在派送` };
    }
    const status = statuses[i % statuses.length];
    const text = texts[i % texts.length];
    const action = i === 0 ? '已从' : '已到达';
    return { status, text, event: `包裹${action}${wp.name}` };
  }).concat([
    { status: 'delivered', text: '已送达', event: `包裹已送达${waypoints[waypoints.length - 1].name}` }
  ]);
}

Page({
  data: {
    orderId: '',
    logistics: {
      company: '优选物流',
      trackingNo: '',
      origin: { city: '上海市', address: '上海集散中心', lat: 31.2304, lng: 121.4737 },
      destination: { city: '北京市', address: '北京市目的地', lat: 39.9042, lng: 116.4074 },
      status: 'processing',
      events: [],
      estimatedArrival: ''
    },
    currentPosition: { lat: 31.2304, lng: 121.4737 },
    progress: 0,
    statusText: '等待发货',
    dayOffset: 0,
    markers: [],
    polyline: [],
    hasComplained: false,
    waypoints: [],
    segmentWeights: [],
    stageInfo: []
  },

  onLoad(options) {
    const orderId = options.orderId;
    if (orderId) {
      this.setData({ orderId });
      this.loadLogistics();
    } else {
      // 无订单时默认展示：上海→北京
      this.setupRoute(31.2304, 121.4737, '上海', 39.9042, 116.4074, '北京');
      this.updateMap();
    }
  },

  async loadLogistics() {
    wx.showLoading({ title: '加载物流...' });
    try {
      const res = await wx.cloud.callFunction({
        name: 'orders',
        data: { action: 'logistics', orderId: this.data.orderId }
      });
      wx.hideLoading();

      if (res.result && res.result.code === 0) {
        const resultData = res.result.data;
        const logisticsData = resultData.logistics;
        const orderAddress = resultData.address || {};
        const origin = logisticsData.origin || {};
        const dest = logisticsData.destination || {};

        const originCoords = (origin.lat && origin.lng)
          ? { lat: origin.lat, lng: origin.lng }
          : (resolveCityCoords(origin.city) || { lat: 31.2304, lng: 121.4737 });
        const destCoords = (dest.lat && dest.lng)
          ? { lat: dest.lat, lng: dest.lng }
          : (resolveCityCoords(dest.city) || resolveCityCoords(orderAddress.city) || { lat: 39.9042, lng: 116.4074 });

        this.setData({
          logistics: logisticsData,
          currentPosition: logisticsData.currentPosition || { lat: originCoords.lat, lng: originCoords.lng },
          progress: logisticsData.progress || 0,
          statusText: this.getStatusText(logisticsData.status)
        });

        this.setupRoute(
          originCoords.lat, originCoords.lng, origin.city || '上海',
          destCoords.lat, destCoords.lng, dest.city || orderAddress.city || '北京'
        );
      }
    } catch (err) {
      wx.hideLoading();
      console.error('加载物流失败:', err);
      // 失败时默认上海→北京
      this.setupRoute(31.2304, 121.4737, '上海', 39.9042, 116.4074, '北京');
    }
    this.updateMap();
  },

  setupRoute(originLat, originLng, originCity, destLat, destLng, destCity) {
    const waypoints = generateRoute(originLat, originLng, destLat, destLng, originCity, destCity);
    const segmentWeights = generateSegmentWeights(waypoints.length - 1);
    const stageInfo = generateStageInfo(waypoints);

    this.setData({
      waypoints,
      segmentWeights,
      stageInfo,
      currentPosition: { lat: originLat, lng: originLng },
      'logistics.origin': { city: originCity, address: waypoints[0].name, lat: originLat, lng: originLng },
      'logistics.destination': { city: destCity, address: waypoints[waypoints.length - 1].name, lat: destLat, lng: destLng }
    });
  },

  getPositionAtProgress(progress) {
    const weights = this.data.segmentWeights;
    const waypoints = this.data.waypoints;
    if (!weights.length || !waypoints.length) return this.data.currentPosition;

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let accumulated = 0;

    for (let i = 0; i < weights.length; i++) {
      const segPercent = weights[i] / totalWeight * 100;
      if (progress <= accumulated + segPercent) {
        const localProgress = (progress - accumulated) / segPercent;
        const from = waypoints[i];
        const to = waypoints[i + 1];
        return {
          lat: from.lat + (to.lat - from.lat) * localProgress,
          lng: from.lng + (to.lng - from.lng) * localProgress
        };
      }
      accumulated += segPercent;
    }
    const last = waypoints[waypoints.length - 1];
    return { lat: last.lat, lng: last.lng };
  },

  getCurrentStageIndex(progress) {
    const weights = this.data.segmentWeights;
    if (!weights.length) return 0;
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let accumulated = 0;
    for (let i = 0; i < weights.length; i++) {
      accumulated += weights[i] / totalWeight * 100;
      if (progress < accumulated) return i;
    }
    return weights.length;
  },

  getStatusText(status) {
    const map = {
      'processing': '等待发货',
      'shipping': '运输中',
      'transit': '到达中转站',
      'delivering': '派送中',
      'delivered': '已签收',
      'delay': '运输延迟',
      'exception': '包裹异常'
    };
    return map[status] || '运输中';
  },

  // ======== 时间模拟系统 ========
  advanceDays(e) {
    const days = Number(e.currentTarget.dataset.days);
    if (!days) return;
    if (this.data.logistics.status === 'delivered') {
      wx.showToast({ title: '订单已完成', icon: 'none' });
      return;
    }
    if (this.data.progress >= 100 && this.data.logistics.status === 'delivering') {
      wx.showToast({ title: '包裹已到达，请确认收货', icon: 'none' });
      return;
    }

    let newProgress = this.data.progress + days * (10 + Math.random() * 4);
    if (newProgress > 100) newProgress = 100;

    const newPos = this.getPositionAtProgress(newProgress);
    const stageIdx = this.getCurrentStageIndex(newProgress);
    const stageInfo = this.data.stageInfo[Math.min(stageIdx, this.data.stageInfo.length - 1)] || { status: 'shipping', text: '运输中', event: '包裹正在运输中' };

    const events = [...this.data.logistics.events];
    const newDayOffset = this.data.dayOffset + days;

    const oldStageIdx = this.getCurrentStageIndex(this.data.progress);
    for (let i = oldStageIdx; i <= stageIdx && i < this.data.stageInfo.length; i++) {
      events.unshift({
        time: this.getSimulatedTime(newDayOffset - (stageIdx - i)),
        desc: this.data.stageInfo[i].event,
        type: this.data.stageInfo[i].status
      });
    }

    const isArrived = newProgress >= 100;
    // 到达后状态为 delivering（待签收），只有用户确认收货后才变为 delivered
    const finalStatus = isArrived ? 'delivering' : stageInfo.status;

    this.setData({
      progress: Math.round(newProgress),
      currentPosition: newPos,
      dayOffset: newDayOffset,
      'logistics.status': finalStatus,
      'logistics.events': events,
      statusText: isArrived ? '待签收' : stageInfo.text
    });

    this.updateMap();

    if (isArrived) {
      events.unshift({
        time: this.getSimulatedTime(newDayOffset),
        desc: '包裹已到达目的地附近配送站，请确认签收',
        type: 'delivering'
      });
      this.setData({ 'logistics.events': events });
      wx.showToast({ title: '包裹已到达，请确认签收！', icon: 'none', duration: 2000 });
    } else {
      wx.showToast({ title: `时间快进 ${days} 天`, icon: 'none' });
    }
  },

  getSimulatedTime(dayOffset) {
    const base = new Date();
    base.setDate(base.getDate() + (dayOffset || 0));
    const m = (base.getMonth() + 1).toString().padStart(2, '0');
    const d = base.getDate().toString().padStart(2, '0');
    const h = (8 + Math.floor(Math.random() * 12)).toString().padStart(2, '0');
    const min = Math.floor(Math.random() * 60).toString().padStart(2, '0');
    return `${m}-${d} ${h}:${min}`;
  },

  // ======== 地图更新 ========
  updateMap() {
    const origin = this.data.logistics.origin;
    const dest = this.data.logistics.destination;
    const pos = this.data.currentPosition;
    const waypoints = this.data.waypoints;

    const markers = [
      {
        id: 1,
        latitude: origin.lat,
        longitude: origin.lng,
        title: '📤 发货地',
        width: 30,
        height: 30,
        label: { content: '发货', color: '#2e7d32', fontSize: 12, borderWidth: 1, borderColor: '#2e7d32', borderRadius: 6, bgColor: '#e8f5e9', padding: 4, anchorX: 0.5, anchorY: -0.2 },
        callout: { content: '📤 发货地\n' + (origin.city || '') + ' ' + (origin.address || ''), color: '#2e7d32', fontSize: 13, borderRadius: 8, padding: 10, display: 'ALWAYS', bgColor: '#e8f5e9', borderWidth: 1, borderColor: '#a5d6a7' }
      },
      {
        id: 2,
        latitude: dest.lat,
        longitude: dest.lng,
        title: '📥 收货地',
        width: 30,
        height: 30,
        label: { content: '收货', color: '#c62828', fontSize: 12, borderWidth: 1, borderColor: '#c62828', borderRadius: 6, bgColor: '#ffebee', padding: 4, anchorX: 0.5, anchorY: -0.2 },
        callout: { content: '📥 收货地\n' + (dest.city || '') + ' ' + (dest.address || ''), color: '#c62828', fontSize: 13, borderRadius: 8, padding: 10, display: 'ALWAYS', bgColor: '#ffebee', borderWidth: 1, borderColor: '#ef9a9a' }
      },
      {
        id: 3,
        latitude: pos.lat,
        longitude: pos.lng,
        title: '📦 货物',
        width: 36,
        height: 36,
        anchor: { x: 0.5, y: 0.5 },
        label: { content: '📦', fontSize: 14, anchorX: 0.5, anchorY: -0.6 },
        callout: { content: '📦 货物位置', color: '#fff', fontSize: 13, borderRadius: 8, padding: 10, display: 'ALWAYS', bgColor: '#FF6F00', borderWidth: 1, borderColor: '#FFB300' }
      }
    ];

    // 沿途经点画折线（已走过+未走过）
    const polyline = [];
    const routePoints = waypoints.map(wp => ({ latitude: wp.lat, longitude: wp.lng }));

    if (routePoints.length >= 2) {
      // 找到货物当前位置最接近的线段位置
      const splitInfo = this.findSplitPosition(routePoints, pos);

      // 已走过的路径
      const passed = routePoints.slice(0, splitInfo.segmentIdx + 1);
      passed.push({ latitude: pos.lat, longitude: pos.lng });

      // 未走过的路径
      const remaining = routePoints.slice(splitInfo.segmentIdx + 1);

      if (passed.length >= 2) {
        polyline.push({
          points: passed,
          color: '#667eea',
          width: 5,
          dottedLine: false
        });
      }
      if (remaining.length > 0) {
        polyline.push({
          points: [{ latitude: pos.lat, longitude: pos.lng }, ...remaining],
          color: '#aab2ff',
          width: 4,
          dottedLine: true
        });
      }
    } else {
      polyline.push(
        { points: [{ latitude: origin.lat, longitude: origin.lng }, { latitude: pos.lat, longitude: pos.lng }], color: '#667eea', width: 5, dottedLine: false },
        { points: [{ latitude: pos.lat, longitude: pos.lng }, { latitude: dest.lat, longitude: dest.lng }], color: '#aab2ff', width: 4, dottedLine: true }
      );
    }

    this.setData({ markers, polyline });
  },

  // 找到当前位置在路线中的位置（哪个线段上）
  findSplitPosition(routePoints, pos) {
    let minDist = Infinity;
    let segmentIdx = 0;

    for (let i = 0; i < routePoints.length - 1; i++) {
      const a = routePoints[i];
      const b = routePoints[i + 1];
      // 点到线段的垂直距离
      const dist = this.pointToSegmentDist(pos.lat, pos.lng, a.latitude, a.longitude, b.latitude, b.longitude);
      if (dist < minDist) {
        minDist = dist;
        segmentIdx = i;
      }
    }

    return { segmentIdx, dist: minDist };
  },

  // 点到线段的距离
  pointToSegmentDist(px, py, ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    if (lenSq < 1e-10) return Math.sqrt((px - ax) * (px - ax) + (py - ay) * (py - ay));
    let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const projX = ax + t * dx;
    const projY = ay + t * dy;
    return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY));
  },

  // ======== 操作按钮 ========
  confirmReceive() {
    wx.showModal({
      title: '确认收货',
      content: '确定已收到商品吗？确认后订单将完成。',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          try {
            const result = await wx.cloud.callFunction({
              name: 'orders',
              data: { action: 'update', orderId: this.data.orderId, status: 3 }
            });
            wx.hideLoading();
            if (result.result && result.result.code === 0) {
              wx.showToast({ title: '收货成功', icon: 'success' });
            }
          } catch (err) {
            wx.hideLoading();
          }
          const events = [...this.data.logistics.events];
          events.unshift({
            time: this.formatTime(new Date()),
            desc: '包裹已签收，感谢您的购买！',
            type: 'delivered'
          });
          this.setData({
            'logistics.events': events,
            'logistics.status': 'delivered',
            progress: 100,
            statusText: '已收货',
            currentPosition: this.data.logistics.destination
          });
          this.updateMap();
        }
      }
    });
  },

  urgeOrder() {
    wx.showModal({
      title: '催单提醒',
      content: '确定要催促商家尽快发货吗？',
      success: (res) => {
        if (res.confirm) {
          const events = [...this.data.logistics.events];
          events.unshift({
            time: this.formatTime(new Date()),
            desc: '您已催单，商家将优先处理您的订单',
            type: 'urge'
          });
          this.setData({ 'logistics.events': events });
          wx.showToast({ title: '催单成功，已通知商家', icon: 'success' });
        }
      }
    });
  },

  refreshPosition() {
    wx.showLoading({ title: '刷新位置...' });
    if (this.data.orderId) {
      this.loadLogistics();
    } else {
      setTimeout(() => {
        wx.hideLoading();
        this.updateMap();
        wx.showToast({ title: '位置已刷新', icon: 'success' });
      }, 800);
    }
  },

  applyAfterSale() {
    wx.navigateTo({
      url: `/pages/aftersale-apply/aftersale-apply?orderId=${this.data.orderId || ''}&orderNo=${this.data.logistics.trackingNo || ''}`
    });
  },

  complainLogistics() {
    if (this.data.hasComplained) {
      wx.showToast({ title: '您已提交过投诉', icon: 'none' });
      return;
    }
    wx.showModal({
      title: '物流投诉',
      editable: true,
      placeholderText: '请输入投诉原因（如：配送延迟、包裹破损等）',
      confirmText: '提交投诉',
      success: (res) => {
        if (res.confirm) {
          const reason = res.content || '未填写原因';
          const events = [...this.data.logistics.events];
          events.unshift({
            time: this.formatTime(new Date()),
            desc: '物流投诉已提交：' + reason,
            type: 'complaint'
          });
          this.setData({
            'logistics.events': events,
            hasComplained: true
          });
          wx.showToast({ title: '投诉已提交', icon: 'success' });
        }
      }
    });
  },

  formatTime(date) {
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    const h = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    return `${m}-${d} ${h}:${min}`;
  }
});
