// pages/merchant-chat/merchant-chat.js
Page({
  data: {
    conversations: [],
    merchantId: ''
  },

  onShow() {
    const merchantInfo = wx.getStorageSync('merchantInfo') || {};
    this.setData({ merchantId: merchantInfo.merchantId });
    if (merchantInfo.merchantId) {
      this.loadConversations();
    }
  },

  async loadConversations() {
    wx.showLoading({ title: '加载中...' });
    try {
      const res = await wx.cloud.callFunction({
        name: 'chat',
        data: {
          action: 'merchantConversations',
          merchantId: this.data.merchantId
        }
      });
      if (res.result && res.result.code === 0) {
        const conversations = (res.result.data || []).map(item => ({
          ...item,
          timeStr: item.lastTime ? this.formatTime(item.lastTime) : ''
        }));
        this.setData({ conversations });
      }
    } catch (err) {
      console.error('加载会话列表失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  openChat(e) {
    const index = e.currentTarget.dataset.index;
    const conv = this.data.conversations[index];
    wx.navigateTo({
      url: `/pages/merchant-chat-detail/merchant-chat-detail?conversationId=${conv.conversationId}&userName=${encodeURIComponent(conv.userName || '用户')}&productName=${encodeURIComponent(conv.productName || '')}`
    });
  },

  formatTime(time) {
    if (!time) return '';
    const d = new Date(time);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  }
});
