// pages/signin/signin.js
Page({
  data: {
    todaySigned: false,
    signCount: 0,
    signDays: [],
    reward: 0
  },

  onLoad() {
    this.loadSignData();
  },

  loadSignData() {
    const records = wx.getStorageSync('signin_records') || [];
    const today = new Date().toDateString();
    const todaySigned = records.some(r => r.date === today);
    this.setData({ todaySigned, signCount: records.length, signDays: records });
  },

  async doSignIn() {
    if (this.data.todaySigned) {
      wx.showToast({ title: '今日已签到', icon: 'none' });
      return;
    }

    // 模拟奖励计算
    const rewards = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 5.0];
    const idx = this.data.signCount % rewards.length;
    const reward = rewards[idx];

    const records = wx.getStorageSync('signin_records') || [];
    records.unshift({ date: new Date().toDateString(), reward });
    wx.setStorageSync('signin_records', records);

    this.setData({
      todaySigned: true,
      signCount: this.data.signCount + 1,
      signDays: records,
      reward
    });

    wx.showToast({ title: `签到成功！获得 ¥${reward} 红包`, icon: 'success' });
  }
});
