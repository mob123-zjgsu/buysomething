// pages/review-list/review-list.js
Page({
  data: {
    reviews: [],
    productId: ''
  },

  onLoad(options) {
    this.setData({ productId: options.productId || '' });
    this.loadReviews();
  },

  async loadReviews() {
    if (!this.data.productId) return;
    wx.showLoading({ title: '加载中...' });
    try {
      const res = await wx.cloud.callFunction({
        name: 'reviews',
        data: {
          action: 'list',
          productId: this.data.productId
        }
      });
      if (res.result && res.result.code === 0) {
        const reviews = (res.result.data || []).map(item => ({
          ...item,
          timeStr: item.createTime ? this.formatTime(item.createTime) : ''
        }));
        this.setData({ reviews });
      }
    } catch (err) {
      console.error('加载评价失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  formatTime(time) {
    if (!time) return '';
    const d = new Date(time);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  }
});
