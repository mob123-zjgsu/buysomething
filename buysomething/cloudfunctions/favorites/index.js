const cloud = require('wx-server-sdk');
cloud.init({ env: 'buysomething-6gbmbtpxff05be35' });
const db = cloud.database();

/**
 * 收藏管理 API
 * 支持: list, add, remove, check
 */
exports.main = async (event, context) => {
  const { action, productId } = event;
  const userId = event.userId || 'test-user-001';

  try {
    switch (action) {
    case 'list':
      // 获取收藏列表
      const result = await db.collection('favorites')
        .where({ userId })
        .orderBy('createTime', 'desc')
        .get();
      return { code: 0, message: 'success', data: result.data };

    case 'add':
      // 添加收藏
      if (!productId) {
        return { code: 1001, message: '缺少商品ID' };
      }
      // 检查是否已收藏
      const existResult = await db.collection('favorites')
        .where({ userId, productId })
        .get();
      if (existResult.data.length > 0) {
        return { code: 0, message: '已收藏', data: { isFavorite: true } };
      }
      await db.collection('favorites').add({
        data: {
          userId,
          productId,
          createTime: db.serverDate()
        }
      });
      return { code: 0, message: '收藏成功', data: { isFavorite: true } };

    case 'remove':
      // 取消收藏
      if (!productId) {
        return { code: 1001, message: '缺少商品ID' };
      }
      const removeResult = await db.collection('favorites')
        .where({ userId, productId })
        .get();
      if (removeResult.data.length > 0) {
        for (const item of removeResult.data) {
          await db.collection('favorites').doc(item._id).remove();
        }
      }
      return { code: 0, message: '已取消收藏', data: { isFavorite: false } };

    case 'check':
      // 检查是否已收藏
      if (!productId) {
        return { code: 1001, message: '缺少商品ID' };
      }
      const checkResult = await db.collection('favorites')
        .where({ userId, productId })
        .get();
      return { code: 0, data: { isFavorite: checkResult.data.length > 0 } };

    default:
      return { code: 4001, message: '未知操作' };
    }
  } catch (err) {
    console.error('收藏操作失败:', err);
    return { code: 5001, message: '操作失败', data: { error: err.message } };
  }
};
