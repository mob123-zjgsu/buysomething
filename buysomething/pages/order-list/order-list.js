const app = getApp();

// 状态映射: tab名 -> 订单status数值
const STATUS_MAP = {
  'pending': 0,    // 待付款
  'shipped': 1,    // 待发货（已支付）
  'received': 2,   // 待收货（已发货）
  'commented': 3   // 待评价（已收货）
};

const STATUS_TEXT = ['待付款', '待发货', '待收货', '待评价', '已完成'];

Page({
  data: {
    activeTab: 'all',
    orders: []
  },

  onLoad(options) {
    if (options.status) {
      this.setData({ activeTab: options.status });
    }
    this.loadOrders();
  },

  onShow() {
    this.loadOrders();
  },

  selectTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    this.loadOrders();
  },

  async loadOrders() {
    try {
      const params = {};
      const tab = this.data.activeTab;

      if (tab !== 'all' && STATUS_MAP[tab] !== undefined) {
        params.status = STATUS_MAP[tab];
      }

      wx.showLoading({ title: '加载中...' });
      const res = await wx.cloud.callFunction({
        name: 'orders',
        data: { action: 'list', ...params }
      });
      wx.hideLoading();

      if (res.result && res.result.code === 0) {
        const list = (res.result.data.list || []).map(order => ({
          id: order.orderId,
          orderNo: order.orderNo,
          shopName: '优选自营',
          status: Object.keys(STATUS_MAP).find(k => STATUS_MAP[k] === order.status) || 'pending',
          statusText: STATUS_TEXT[order.status] || '未知',
          totalCount: order.products ? order.products.reduce((s, p) => s + p.quantity, 0) : 0,
          totalPrice: (order.payAmount || order.totalAmount || 0).toFixed(2),
          products: (order.products || []).map(p => ({
            id: p.productId,
            uniqueId: p.productId,
            name: p.productName,
            spec: '',
            price: p.price,
            quantity: p.quantity,
            image: p.productImage || '/images/product1.jpg'
          }))
        }));
        this.setData({ orders: list });
      }
    } catch (err) {
      wx.hideLoading();
      console.error('加载订单失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  goToOrderDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?id=${id}`
    });
  },

  cancelOrder(e) {
    e.stopPropagation();
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '取消订单',
      content: '确定要取消这个订单吗?',
      success: async (res) => {
        if (res.confirm) {
          try {
            await wx.cloud.callFunction({
              name: 'orders',
              data: { action: 'update', orderId: id, status: -1 }
            });
            wx.showToast({ title: '订单已取消', icon: 'success' });
            this.loadOrders();
          } catch (err) {
            wx.showToast({ title: '取消失败', icon: 'none' });
          }
        }
      }
    });
  },

  async payOrder(e) {
    e.stopPropagation();
    const id = e.currentTarget.dataset.id;
    wx.showToast({ title: '正在调起支付...', icon: 'loading' });
    try {
      await wx.cloud.callFunction({
        name: 'orders',
        data: { action: 'pay', orderId: id }
      });
      wx.showToast({ title: '支付成功（模拟）', icon: 'success' });
      this.loadOrders();
    } catch (err) {
      console.error('支付失败:', err);
      wx.showToast({ title: '支付失败', icon: 'none' });
    }
  },

  confirmOrder(e) {
    e.stopPropagation();
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认收货',
      content: '确定已收到商品吗?',
      success: async (res) => {
        if (res.confirm) {
          try {
            await wx.cloud.callFunction({
              name: 'orders',
              data: { action: 'update', orderId: id, status: 3 }
            });
            wx.showToast({ title: '已确认收货', icon: 'success' });
            this.loadOrders();
          } catch (err) {
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  commentOrder(e) {
    e.stopPropagation();
    const id = e.currentTarget.dataset.id;
    // 找到该订单，取出第一个商品的 productId
    const order = this.data.orders.find(o => o.id === id);
    const productId = order && order.products && order.products[0] ? order.products[0].id : '';
    wx.navigateTo({
      url: `/pages/review/review?orderId=${id}&productId=${productId}`
    });
  }
});
