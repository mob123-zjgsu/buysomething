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

  selectTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    this.loadOrders();
  },

  loadOrders() {
    // 模拟加载订单数据
    const mockOrders = [
      {
        id: '1',
        shopName: '优选自营',
        status: 'pending',
        statusText: '待付款',
        totalCount: 2,
        totalPrice: 198.00,
        products: [
          { id: 1, name: '夏季新款纯棉T恤', spec: '红色 / M', price: 99, quantity: 1, image: '/images/product1.jpg' },
          { id: 2, name: '舒适棉质居家服', spec: '白色 / L', price: 89, quantity: 1, image: '/images/product5.jpg' }
        ]
      },
      {
        id: '2',
        shopName: '优选自营',
        status: 'received',
        statusText: '待收货',
        totalCount: 1,
        totalPrice: 299.00,
        products: [
          { id: 3, name: '时尚休闲运动鞋', spec: '黑色 / 42', price: 299, quantity: 1, image: '/images/product2.jpg' }
        ]
      }
    ];

    // 根据标签筛选
    let filteredOrders = mockOrders;
    if (this.data.activeTab !== 'all') {
      filteredOrders = mockOrders.filter(order => order.status === this.data.activeTab);
    }

    this.setData({ orders: filteredOrders });
  },

  goToOrderDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?id=${id}`
    });
  },

  cancelOrder(e) {
    e.stopPropagation();
    wx.showModal({
      title: '取消订单',
      content: '确定要取消这个订单吗?',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '订单已取消',
            icon: 'success'
          });
          this.loadOrders();
        }
      }
    });
  },

  payOrder(e) {
    e.stopPropagation();
    wx.showToast({
      title: '正在调起支付...',
      icon: 'loading'
    });
    setTimeout(() => {
      wx.showToast({
        title: '支付成功',
        icon: 'success'
      });
      this.loadOrders();
    }, 2000);
  },

  confirmOrder(e) {
    e.stopPropagation();
    wx.showModal({
      title: '确认收货',
      content: '确定已收到商品吗?',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '已确认收货',
            icon: 'success'
          });
          this.loadOrders();
        }
      }
    });
  },

  commentOrder(e) {
    e.stopPropagation();
    wx.showToast({
      title: '评价功能',
      icon: 'none'
    });
  }
});
