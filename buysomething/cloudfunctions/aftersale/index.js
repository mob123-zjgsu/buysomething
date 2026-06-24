const cloud = require('wx-server-sdk');
cloud.init({ env: 'buysomething-6gbmbtpxff05be35' });
const db = cloud.database();

// 默认商家ID（优品服饰）
const DEFAULT_MERCHANT_ID = '97b16bdb69fde9ea018468c710a9a009';

/**
 * 售后 API
 * 流程：用户申请 → 商家审核(同意/反对) → 如反对则管理员裁定
 * status: pending(待商家审核) / approved(商家同意) / rejected(商家反对,待管理员) / admin_approved(管理员同意) / admin_rejected(管理员驳回)
 */
exports.main = async (event, context) => {
  try {
    const action = event.action;

    // 用户申请售后
    if (action === 'apply') {
      const { orderId, orderNo, type, reason, detail } = event;
      if (!reason) {
        return { code: 1001, message: '请填写申请理由' };
      }

      // TODO: 演示期间所有售后统一发到优品服饰，演示后改回动态查询
      let merchantId = DEFAULT_MERCHANT_ID;
      // 演示后恢复以下代码：
      // if (orderId && orderId !== 'demo-order') {
      //   try {
      //     const orderRes = await db.collection('orders').doc(orderId).get();
      //     if (orderRes.data) {
      //       const products = orderRes.data.products || [];
      //       if (products.length > 0 && products[0].merchantId) {
      //         merchantId = products[0].merchantId;
      //       }
      //     }
      //   } catch (e) {
      //     console.log('查询订单商家失败，使用默认商家:', e.message);
      //   }
      // }

      const record = {
        orderId: orderId || 'demo-order',
        orderNo: orderNo || `ORD${Date.now()}`,
        userId: event.userId || 'test-user-001',
        merchantId: merchantId,
        type: type || '退货退款',
        reason,
        detail: detail || '',
        status: 'pending',
        merchantReply: '',
        merchantEvidence: '',
        adminReply: '',
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      };

      const result = await db.collection('aftersales').add({ data: record });
      return { code: 0, message: '售后申请已提交', data: { aftersaleId: result._id } };
    }

    // 商家获取售后列表（按merchantId过滤）
    if (action === 'merchantList') {
      const merchantId = event.merchantId || DEFAULT_MERCHANT_ID;
      const result = await db.collection('aftersales')
        .where({ merchantId })
        .orderBy('createTime', 'desc')
        .limit(50)
        .get();

      return { code: 0, message: 'success', data: result.data };
    }

    // 商家审核（同意/反对）
    if (action === 'merchantReview') {
      const { aftersaleId, approved, merchantReply, merchantEvidence } = event;
      if (!aftersaleId) {
        return { code: 1001, message: '缺少售后ID' };
      }

      const status = approved ? 'approved' : 'rejected';
      const updateData = {
        status,
        merchantReply: merchantReply || '',
        merchantEvidence: merchantEvidence || '',
        updateTime: db.serverDate()
      };

      await db.collection('aftersales').doc(aftersaleId).update({ data: updateData });
      return { code: 0, message: approved ? '已同意售后申请' : '已拒绝售后申请，等待管理员裁定', data: { status } };
    }

    // 管理员获取待裁定的售后列表（商家反对的）
    if (action === 'adminList') {
      const { filter } = event;
      let whereCondition = {};
      if (filter === 'pending') {
        whereCondition = { status: 'rejected' };
      }

      const result = await db.collection('aftersales')
        .where(whereCondition)
        .orderBy('createTime', 'desc')
        .limit(50)
        .get();

      return { code: 0, message: 'success', data: result.data };
    }

    // 管理员裁定
    if (action === 'adminReview') {
      const { aftersaleId, approved, adminReply } = event;
      if (!aftersaleId) {
        return { code: 1001, message: '缺少售后ID' };
      }

      const status = approved ? 'admin_approved' : 'admin_rejected';
      const updateData = {
        status,
        adminReply: adminReply || '',
        updateTime: db.serverDate()
      };

      await db.collection('aftersales').doc(aftersaleId).update({ data: updateData });
      return { code: 0, message: approved ? '管理员裁定：同意售后' : '管理员裁定：驳回售后', data: { status } };
    }

    // 用户查看自己的售后记录
    if (action === 'myList') {
      const userId = event.userId || 'test-user-001';
      const result = await db.collection('aftersales')
        .where({ userId })
        .orderBy('createTime', 'desc')
        .limit(20)
        .get();

      return { code: 0, message: 'success', data: result.data };
    }

    return { code: 4001, message: '未知操作' };
  } catch (err) {
    console.error('售后操作失败:', err);
    return { code: 5001, message: '服务器错误', data: { error: err.message } };
  }
};
