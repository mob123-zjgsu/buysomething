// pages/merchant-orders/merchant-orders.js
Page({
  data: {
    orders: [],
    activeTab: 'all'
  },

  onShow() {
    this.loadOrders();
  },

  async loadOrders() {
    wx.showLoading({ title: '加载中...' });
    try {
      const res = await wx.cloud.callFunction({
        name: 'orders',
        data: { action: 'list' }
      });
      wx.hideLoading();

      if (res.result && res.result.code === 0) {
        const STATUS_TEXT = ['待付款', '待发货', '待收货', '待评价', '已完成'];
        const list = (res.result.data.list || []).map(order => ({
          ...order,
          id: order.orderId,
          statusText: STATUS_TEXT[order.status] || '未知',
          totalCount: order.products ? order.products.reduce((s, p) => s + p.quantity, 0) : 0,
          totalPrice: (order.payAmount || order.totalAmount || 0).toFixed(2)
        }));
        this.setData({ orders: list });
      }
    } catch (err) {
      wx.hideLoading();
      console.error(err);
    }
  },

  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
  },

  async shipOrder(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showLoading({ title: '发货中...' });
    try {
      await wx.cloud.callFunction({
        name: 'orders',
        data: { action: 'update', orderId, status: 2 }
      });
      wx.hideLoading();
      wx.showToast({ title: '已标记发货', icon: 'success' });
      this.loadOrders();
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  }
});
