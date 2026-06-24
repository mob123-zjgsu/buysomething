const cloud = require('wx-server-sdk');
cloud.init({ env: 'buysomething-6gbmbtpxff05be35' });
const db = cloud.database();

/**
 * 评价管理 API
 * 支持: list, add, delete
 */
exports.main = async (event, context) => {
  const { action, productId, orderId, rating, content, images = [], reviewId } = event;
  const userId = event.userId || 'test-user-001';

  try {
    switch (action) {
    case 'list':
      // 获取评价列表（按商品）
      const where = {};
      if (productId) where.productId = productId;
      if (userId) where.userId = userId;
      const result = await db.collection('reviews')
        .where(where)
        .orderBy('createTime', 'desc')
        .get();
      return { code: 0, message: 'success', data: result.data };

    case 'add':
      // 添加评价
      if (!productId || !rating) {
        return { code: 1001, message: '评价信息不完整' };
      }
      const reviewData = {
        userId,
        productId,
        orderId: orderId || '',
        rating: parseInt(rating),
        content: content || '',
        images,
        createTime: db.serverDate()
      };
      const addResult = await db.collection('reviews').add({ data: reviewData });

      // 更新商品平均评分
      const reviewsResult = await db.collection('reviews')
        .where({ productId })
        .get();
      const totalRating = reviewsResult.data.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = Math.round((totalRating / reviewsResult.data.length) * 10) / 10;

      await db.collection('products').doc(productId).update({
        data: {
          rating: avgRating,
          reviewCount: reviewsResult.data.length
        }
      });

      return { code: 0, message: '评价成功', data: { reviewId: addResult._id } };

    case 'delete':
      // 删除评价
      if (!reviewId) {
        return { code: 1001, message: '缺少评价ID' };
      }
      await db.collection('reviews').doc(reviewId).remove();
      return { code: 0, message: '删除成功' };

    default:
      return { code: 4001, message: '未知操作' };
    }
  } catch (err) {
    console.error('评价操作失败:', err);
    return { code: 5001, message: '操作失败', data: { error: err.message } };
  }
};
