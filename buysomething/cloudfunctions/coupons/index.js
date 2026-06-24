const cloud = require('wx-server-sdk');
cloud.init({ env: 'buysomething-6gbmbtpxff05be35' });
const db = cloud.database();

/**
 * 优惠券管理 API（模拟）
 * 支持: list, receive, use
 */
exports.main = async (event, context) => {
  const { action, couponId } = event;
  const userId = event.userId || 'test-user-001';

  // 模拟优惠券池
  const mockCouponPool = [
    { id: 'cp001', type: '满减券', name: '满100减10', value: 10, minAmount: 100, expireDays: 7 },
    { id: 'cp002', type: '满减券', name: '满200减30', value: 30, minAmount: 200, expireDays: 7 },
    { id: 'cp003', type: '折扣券', name: '9折券', value: 0.9, minAmount: 50, expireDays: 3 },
    { id: 'cp004', type: '免邮券', name: '免邮费券', value: 10, minAmount: 0, expireDays: 30 },
    { id: 'cp005', type: '品牌券', name: '优选自营专享', value: 15, minAmount: 150, expireDays: 5 }
  ];

  try {
    switch (action) {
    case 'list':
      // 获取用户已领取的优惠券
      const userCoupons = await db.collection('coupons')
        .where({ userId })
        .orderBy('receiveTime', 'desc')
        .get();

      return { code: 0, message: 'success', data: { userCoupons: userCoupons.data, available: mockCouponPool } };

    case 'receive':
      // 领取优惠券
      if (!couponId) {
        return { code: 1001, message: '缺少优惠券ID' };
      }
      const coupon = mockCouponPool.find(c => c.id === couponId);
      if (!coupon) {
        return { code: 1002, message: '优惠券不存在' };
      }
      // 检查是否已领取过
      const existCoupon = await db.collection('coupons')
        .where({ userId, couponId })
        .get();
      if (existCoupon.data.length > 0) {
        return { code: 0, message: '已领取过该优惠券', data: { couponId } };
      }

      const expireTime = new Date(Date.now() + coupon.expireDays * 24 * 60 * 60 * 1000);
      await db.collection('coupons').add({
        data: {
          userId,
          couponId: coupon.id,
          ...coupon,
          status: 'unused',
          receiveTime: db.serverDate(),
          expireTime
        }
      });

      return { code: 0, message: '领取成功', data: { couponId, ...coupon } };

    case 'use':
      // 使用优惠券（标记为已使用）
      if (!couponId) {
        return { code: 1001, message: '缺少优惠券ID' };
      }
      const useResult = await db.collection('coupons')
        .where({ userId, couponId, status: 'unused' })
        .get();
      if (useResult.data.length === 0) {
        return { code: 1003, message: '优惠券无效或已过期' };
      }
      await db.collection('coupons').doc(useResult.data[0]._id).update({
        data: { status: 'used', useTime: db.serverDate() }
      });
      return { code: 0, message: '优惠券已使用' };

    default:
      return { code: 4001, message: '未知操作' };
    }
  } catch (err) {
    console.error('优惠券操作失败:', err);
    return { code: 5001, message: '操作失败', data: { error: err.message } };
  }
};
