Page({
  data: { tab: 'pending', list: [], showDetail: false, detail: {} },
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
  async viewDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.showLoading({ title: '加载中...' });
    try {
      const res = await wx.cloud.callFunction({
        name: 'admin-dashboard',
        data: { action: 'getProductDetail', productId: id }
      });
      wx.hideLoading();
      if (res.result && res.result.code === 0) {
        this.setData({ showDetail: true, detail: res.result.data });
      }
    } catch (err) {
      wx.hideLoading();
      console.error(err);
    }
  },
  closeDetail() {
    this.setData({ showDetail: false, detail: {} });
  },
  approve(e) {
    const id = e.currentTarget.dataset.id;
    wx.cloud.callFunction({ name: 'admin-dashboard', data: { action: 'approveProduct', productId: id },
      success: (res) => { wx.showToast({ title: '已通过', icon: 'success' }); this.load(); } });
  },
  reject(e) {
    const id = e.currentTarget.dataset.id;
    wx.cloud.callFunction({ name: 'admin-dashboard', data: { action: 'rejectProduct', productId: id },
      success: (res) => { wx.showToast({ title: '已拒绝', icon: 'success' }); this.load(); } });
  },
  deleteProduct(e) {
    const id = e.currentTarget.dataset.id;
    wx.cloud.callFunction({ name: 'admin-dashboard', data: { action: 'deleteProduct', productId: id },
      success: (res) => { wx.showToast({ title: '已删除', icon: 'success' }); this.load(); } });
  }
});