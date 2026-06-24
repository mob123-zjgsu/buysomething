// pages/coupons/coupons.js
Page({
  data: {
    userCoupons: [],
    available: [],
    activeTab: 'mine'
  },

  onShow() {
    this.loadCoupons();
  },

  async loadCoupons() {
    wx.showLoading({ title: '加载中...' });
    try {
      const res = await wx.cloud.callFunction({
        name: 'coupons',
        data: { action: 'list' }
      });
      wx.hideLoading();

      if (res.result && res.result.code === 0) {
        this.setData({
          userCoupons: res.result.data.userCoupons || [],
          available: res.result.data.available || []
        });
      }
    } catch (err) {
      wx.hideLoading();
      console.error(err);
    }
  },

  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
  },

  async receiveCoupon(e) {
    const couponId = e.currentTarget.dataset.id;
    wx.showLoading({ title: '领取中...' });
    try {
      const res = await wx.cloud.callFunction({
        name: 'coupons',
        data: { action: 'receive', couponId }
      });
      wx.hideLoading();

      if (res.result && res.result.code === 0) {
        wx.showToast({ title: '领取成功！', icon: 'success' });
        this.loadCoupons();
      } else {
        wx.showToast({ title: res.result.message || '领取失败', icon: 'none' });
      }
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '领取失败', icon: 'none' });
    }
  }
});
