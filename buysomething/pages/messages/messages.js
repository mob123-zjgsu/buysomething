// pages/messages/messages.js
Page({
  data: {
    messages: [],
    unreadCount: 0
  },

  onLoad() {
    this.loadMessages();
  },

  onShow() {
    this.loadMessages();
  },

  async loadMessages() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'notifications',
        data: { action: 'list' }
      });
      if (res.result && res.result.code === 0) {
        const list = (res.result.data || []).map(m => ({
          ...m,
          time: m.createTime ? new Date(m.createTime).toLocaleString() : ''
        }));
        const unread = list.filter(m => !m.isRead).length;
        this.setData({ messages: list, unreadCount: unread });
      }
    } catch (err) {
      console.error('加载消息失败:', err);
    }
  },

  async markRead(e) {
    const id = e.currentTarget.dataset.id;
    try {
      await wx.cloud.callFunction({
        name: 'notifications',
        data: { action: 'read', notificationId: id }
      });
      this.loadMessages();
    } catch (err) {
      console.error(err);
    }
  },

  async markAllRead() {
    try {
      await wx.cloud.callFunction({
        name: 'notifications',
        data: { action: 'readAll' }
      });
      this.loadMessages();
    } catch (err) {
      console.error(err);
    }
  }
});
