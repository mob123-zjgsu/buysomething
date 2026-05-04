Page({
  data: {
    order: {
      id: '1',
      orderNo: '2024032412345678',
      status: 'pending',
      statusText: '待付款',
      statusTip: '请在30分钟内完成支付',
      products: [],
      totalPrice: 198.00,
      freight: 0,
      discount: 0,
      finalPrice: 198.00,
      createTime: '2024-03-24 12:34:56'
    },
    address: {
      name: '张三',
      phone: '138****1234',
      detail: '上海市浦东新区南京路100号'
    }
  },

  onLoad(options) {
    const id = options.id;
    const from = options.from;

    if (from === 'buyNow' || from === 'cart') {
      // 从购物车或立即购买创建订单
      this.createOrder(from);
    } else {
      // 查看订单详情
      this.loadOrderDetail(id);
    }
  },

  createOrder(from) {
    // 模拟创建订单
    const pendingOrder = wx.getStorageSync('pendingOrder') || [];

    if (pendingOrder.length === 0) {
      wx.showToast({
        title: '订单为空',
        icon: 'none'
      });
      return;
    }

    // 模拟创建订单
    wx.showLoading({ title: '创建订单中...' });

    setTimeout(() => {
      wx.hideLoading();

      // 清空购物车中的已选商品
      if (from === 'cart') {
        const cart = wx.getStorageSync('cart') || [];
        const newCart = cart.filter(item => !item.selected);
        wx.setStorageSync('cart', newCart);

        // 更新购物车数量
        const app = getApp();
        let cartCount = 0;
        newCart.forEach(item => {
          cartCount += item.quantity;
        });
        app.globalData.cartCount = cartCount;
      }

      // 设置订单数据
      this.setData({
        'order.products': pendingOrder,
        'order.statusText': '待付款',
        'order.statusTip': '请在30分钟内完成支付',
        'order.totalPrice': pendingOrder.reduce((sum, p) => sum + p.price * p.quantity, 0),
        'order.finalPrice': pendingOrder.reduce((sum, p) => sum + p.price * p.quantity, 0)
      });

      wx.showToast({
        title: '订单创建成功',
        icon: 'success'
      });

      // 清空待提交订单
      wx.removeStorageSync('pendingOrder');
    }, 1500);
  },

  loadOrderDetail(id) {
    // 模拟加载订单详情
    wx.showLoading({ title: '加载中...' });

    setTimeout(() => {
      wx.hideLoading();

      const mockOrder = {
        id: id,
        orderNo: '2024032412345678',
        status: 'received',
        statusText: '待收货',
        statusTip: '商品已发货，请耐心等待',
        products: [
          {
            uniqueId: '1',
            name: '夏季新款纯棉T恤',
            spec: '红色 / M',
            price: 99,
            quantity: 2,
            image: '/images/product1.jpg'
          }
        ],
        totalPrice: 198.00,
        freight: 0,
        discount: 0,
        finalPrice: 198.00,
        createTime: '2024-03-24 12:34:56'
      };

      this.setData({ order: mockOrder });
    }, 500);
  },

  copyOrderNo() {
    wx.setClipboardData({
      data: this.data.order.orderNo,
      success: () => {
        wx.showToast({
          title: '已复制订单号',
          icon: 'success'
        });
      }
    });
  },

  contactService() {
    wx.showModal({
      title: '联系客服',
      content: '确定要联系客服吗?',
      success(res) {
        if (res.confirm) {
          wx.showToast({
            title: '正在连接客服...',
            icon: 'loading'
          });
        }
      }
    });
  },

  payOrder() {
    wx.showToast({
      title: '正在调起支付...',
      icon: 'loading'
    });

    setTimeout(() => {
      wx.showToast({
        title: '支付成功',
        icon: 'success'
      });

      // 更新订单状态
      this.setData({
        'order.status': 'shipped',
        'order.statusText': '待发货',
        'order.statusTip': '商家正在处理您的订单'
      });
    }, 2000);
  },

  confirmOrder() {
    wx.showModal({
      title: '确认收货',
      content: '确定已收到商品吗?',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '已确认收货',
            icon: 'success'
          });

          // 更新订单状态
          this.setData({
            'order.status': 'completed',
            'order.statusText': '已完成',
            'order.statusTip': '感谢您的购买'
          });
        }
      }
    });
  },

  buyAgain() {
    wx.showToast({
      title: '再次购买',
      icon: 'none'
    });
  }
});
