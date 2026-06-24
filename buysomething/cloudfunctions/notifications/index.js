const cloud = require('wx-server-sdk');
cloud.init({ env: 'buysomething-6gbmbtpxff05be35' });
const db = cloud.database();

/**
 * 消息通知 API
 * 支持: list, read, readAll, count
 */
exports.main = async (event, context) => {
  const { action, notificationId } = event;
  const userId = event.userId || 'test-user-001';

  try {
    switch (action) {
    case 'list':
      // 获取通知列表
      const result = await db.collection('notifications')
        .where({ userId })
        .orderBy('createTime', 'desc')
        .limit(50)
        .get();
      return { code: 0, message: 'success', data: result.data };

    case 'read':
      // 标记单条已读
      if (!notificationId) {
        return { code: 1001, message: '缺少通知ID' };
      }
      await db.collection('notifications').doc(notificationId).update({
        data: { isRead: true, readTime: db.serverDate() }
      });
      return { code: 0, message: '已标记已读' };

    case 'readAll':
      // 全部标记已读
      await db.collection('notifications')
        .where({ userId, isRead: false })
        .update({ data: { isRead: true, readTime: db.serverDate() } });
      return { code: 0, message: '全部已读' };

    case 'count':
      // 获取未读数量
      const countResult = await db.collection('notifications')
        .where({ userId, isRead: false })
        .count();
      return { code: 0, data: { unreadCount: countResult.total } };

    default:
      return { code: 4001, message: '未知操作' };
    }
  } catch (err) {
    console.error('通知操作失败:', err);
    return { code: 5001, message: '操作失败', data: { error: err.message } };
  }
};
