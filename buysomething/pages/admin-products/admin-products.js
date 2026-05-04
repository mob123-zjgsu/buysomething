Page({
  data: { tab: 'pending', list: [] },
  onLoad() { this.load(); },
  switchTab(e) {
    this.setData({ tab: e.currentTarget.dataset.tab });
    this.load();
  },
  load() {
    const action = this.data.tab === 'pending' ? 'getPendingProducts' : 'getAllProducts';
    wx.cloud.callFunction({
      name: 'admin-dashboard',
      data: { action },
      success: (res) => { if (res.result) this.setData({ list: res.result.data || [] }); }
    });
  },
  approve(e) {
    wx.cloud.callFunction({ name: 'admin-dashboard', data: { action: 'approveProduct', productId: e.currentTarget.dataset.id },
      success: (res) => { wx.showToast({ title: '已通过', icon: 'success' }); this.load(); } });
  },
  reject(e) {
    wx.cloud.callFunction({ name: 'admin-dashboard', data: { action: 'rejectProduct', productId: e.currentTarget.dataset.id },
      success: (res) => { wx.showToast({ title: '已拒绝', icon: 'success' }); this.load(); } });
  },
  deleteProduct(e) {
    wx.cloud.callFunction({ name: 'admin-dashboard', data: { action: 'deleteProduct', productId: e.currentTarget.dataset.id },
      success: (res) => { wx.showToast({ title: '已删除', icon: 'success' }); this.load(); } });
  }
});