Page({
  data: { tab: 'pending', list: [] },
  onLoad() { this.load() },
  switchTab(e) {
    this.setData({ tab: e.currentTarget.dataset.tab })
    this.load()
  },
  load() {
    const status = this.data.tab === 'pending' ? 'pending' : 'approved'
    wx.cloud.callFunction({
      name: 'admin-dashboard',
      data: { action: 'getMerchantsByStatus', status },
      success: (res) => { if (res.result) this.setData({ list: res.result.data || [] }) }
    })
  },
  approve(e) {
    wx.cloud.callFunction({ name: 'admin-dashboard', data: { action: 'approveMerchant', merchantId: e.currentTarget.dataset.id },
      success: (res) => { wx.showToast({ title: '已通过', icon: 'success' }); this.load() } })
  },
  reject(e) {
    wx.cloud.callFunction({ name: 'admin-dashboard', data: { action: 'rejectMerchant', merchantId: e.currentTarget.dataset.id },
      success: (res) => { wx.showToast({ title: '已拒绝', icon: 'success' }); this.load() } })
  },
  deleteMerchant(e) {
    wx.cloud.callFunction({ name: 'admin-dashboard', data: { action: 'deleteMerchant', merchantId: e.currentTarget.dataset.id },
      success: (res) => { wx.showToast({ title: '已删除', icon: 'success' }); this.load() } })
  }
})