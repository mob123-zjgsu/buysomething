const STATUS_TEXT = ['待付款', '待发货', '待收货', '待评价', '已完成'];
const STATUS_TIP = ['请在30分钟内完成支付', '商家正在处理您的订单', '商品已发货，请耐心等待', '请对商品进行评价', '感谢您的购买'];
const STATUS_KEY = ['pending', 'shipped', 'received', 'commented', 'completed'];

Page({
  data: {
    order: {
      id: '',
      orderNo: '',
      status: 'pending',
      statusText: '待付款',
      statusTip: '请在30分钟内完成支付',
      products: [],
      totalPrice: 0,
      freight: 0,
      discount: 0,
      finalPrice: 0,
      createTime: ''
    },
    address: {
      name: '收货人',
      phone: '138****0000',
      detail: '请选择收货地址'
    }
  },

  onLoad(options) {
    const id = options.id;
    const from = options.from;

    if (from === 'buyNow' || from === 'cart') {
      this.createOrder(from);
    } else {
      this.loadOrderDetail(id);
    }
  },

  onShow() {
    // 检查是否有从地址页返回的选中地址
    const selectedAddress = wx.getStorageSync('selectedOrderAddress');
    if (selectedAddress) {
      const orderId = this.data.order.id;
      this.setData({
        address: {
          name: selectedAddress.name,
          phone: selectedAddress.phone,
          detail: `${selectedAddress.province}${selectedAddress.city}${selectedAddress.district}${selectedAddress.detail}`,
          _id: selectedAddress._id
        }
      });
      wx.removeStorageSync('selectedOrderAddress');

      // 同步更新数据库中订单的收货地址（仅待付款状态可修改）
      if (orderId && this.data.order.status === 'pending') {
        wx.cloud.callFunction({
          name: 'orders',
          data: {
            action: 'updateAddress',
            orderId: orderId,
            addressId: selectedAddress._id,
            address: {
              name: selectedAddress.name,
              phone: selectedAddress.phone,
              province: selectedAddress.province,
              city: selectedAddress.city,
              district: selectedAddress.district,
              detail: selectedAddress.detail,
              fullAddress: `${selectedAddress.province}${selectedAddress.city}${selectedAddress.district}${selectedAddress.detail}`
            }
          }
        }).then(() => {
          console.log('订单地址已同步更新');
        }).catch(err => {
          console.error('更新订单地址失败:', err);
          wx.showToast({ title: '地址同步失败，请重新选择', icon: 'none' });
        });
      }
    }
  },

  selectAddress() {
    if (this.data.order.status !== 'pending') {
      wx.showToast({ title: '订单已提交，不可修改地址', icon: 'none' });
      return;
    }
    wx.navigateTo({
      url: '/pages/address/address?from=order'
    });
  },

  async loadOrderDetail(id) {
    if (!id) return;
    wx.showLoading({ title: '加载中...' });
    try {
      const res = await wx.cloud.callFunction({
        name: 'orders',
        data: { action: 'detail', orderId: id }
      });
      wx.hideLoading();

      if (res.result && res.result.code === 0) {
        const data = res.result.data;
        const status = data.status || 0;
        const statusIdx = Math.min(Math.max(status, 0), 4);

        // 读取订单中保存的地址
        const savedAddr = data.address || {};
        const addressDisplay = savedAddr.name ? {
          name: savedAddr.name,
          phone: savedAddr.phone,
          detail: savedAddr.fullAddress || `${savedAddr.province || ''}${savedAddr.city || ''}${savedAddr.district || ''}${savedAddr.detail || ''}`,
          _id: data.addressId || ''
        } : this.data.address;

        this.setData({
          order: {
            id: data.orderId,
            orderNo: data.orderNo,
            status: STATUS_KEY[statusIdx] || 'pending',
            statusText: STATUS_TEXT[statusIdx],
            statusTip: STATUS_TIP[statusIdx],
            products: (data.products || []).map(p => ({
              uniqueId: p.productId,
              name: p.productName,
              spec: '',
              price: p.price,
              quantity: p.quantity,
              image: p.productImage || '/images/product1.jpg'
            })),
            totalPrice: (data.totalAmount || 0).toFixed(2),
            freight: '0.00',
            discount: (data.discountAmount || 0).toFixed(2),
            finalPrice: (data.payAmount || data.totalAmount || 0).toFixed(2),
            createTime: data.createTime ? new Date(data.createTime).toLocaleString() : ''
          },
          address: addressDisplay
        });
      } else {
        wx.showToast({ title: '订单不存在', icon: 'none' });
      }
    } catch (err) {
      wx.hideLoading();
      console.error('加载订单详情失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  async createOrder(from) {
    const pendingOrder = wx.getStorageSync('pendingOrder') || [];
    if (pendingOrder.length === 0) {
      wx.showToast({ title: '订单为空', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '创建订单中...' });
    try {
      // 获取地址列表
      const addrRes = await wx.cloud.callFunction({
        name: 'address',
        data: { action: 'list' }
      });

      // 优先使用用户在结算页选择的地址，其次使用默认地址
      const preSelected = wx.getStorageSync('selectedOrderAddress');
      wx.removeStorageSync('selectedOrderAddress');

      let selectedAddr = null;
      if (preSelected && preSelected._id) {
        // 确保选择的地址仍在地址列表中
        selectedAddr = (addrRes.result && addrRes.result.data)
          ? addrRes.result.data.find(a => a._id === preSelected._id)
          : null;
      }
      if (!selectedAddr) {
        selectedAddr = addrRes.result && addrRes.result.data
          ? addrRes.result.data.find(a => a.isDefault) || addrRes.result.data[0]
          : null;
      }

      // 没有地址则提示去添加
      if (!selectedAddr) {
        wx.hideLoading();
        wx.showModal({
          title: '缺少收货地址',
          content: '您还没有设置收货地址，请先添加',
          confirmText: '去添加',
          success: (res) => {
            if (res.confirm) {
              wx.navigateTo({ url: '/pages/address-edit/address-edit' });
            }
          }
        });
        return;
      }

      const items = pendingOrder.map(p => ({
        productId: p.productId || p.id,
        quantity: p.quantity
      }));

      const res = await wx.cloud.callFunction({
        name: 'orders',
        data: {
          action: 'create',
          addressId: selectedAddr._id,
          items,
          remark: ''
        }
      });
      wx.hideLoading();

      if (res.result && res.result.code === 0) {
        // 清空购物车中的已选商品
        if (from === 'cart') {
          const cart = wx.getStorageSync('cart') || [];
          const newCart = cart.filter(item => !item.selected);
          wx.setStorageSync('cart', newCart);
          const app = getApp();
          let cartCount = 0;
          newCart.forEach(item => { cartCount += item.quantity; });
          app.globalData.cartCount = cartCount;
        }

        const orderId = res.result.data.orderId;
        const total = pendingOrder.reduce((sum, p) => sum + p.price * p.quantity, 0);

        this.setData({
          order: {
            id: orderId,
            orderNo: res.result.data.orderNo,
            status: 'pending',
            statusText: '待付款',
            statusTip: '请在30分钟内完成支付',
            products: pendingOrder,
            totalPrice: total.toFixed(2),
            freight: '0.00',
            discount: '0.00',
            finalPrice: total.toFixed(2),
            createTime: new Date().toLocaleString()
          },
          address: {
            name: selectedAddr.name,
            phone: selectedAddr.phone,
            detail: `${selectedAddr.province}${selectedAddr.city}${selectedAddr.district}${selectedAddr.detail}`,
            _id: selectedAddr._id
          }
        });

        wx.showToast({ title: '订单创建成功', icon: 'success' });
        wx.removeStorageSync('pendingOrder');
      } else {
        wx.showToast({ title: res.result.message || '创建失败', icon: 'none' });
      }
    } catch (err) {
      wx.hideLoading();
      console.error('创建订单失败:', err);
      wx.showToast({ title: '创建失败', icon: 'none' });
    }
  },

  copyOrderNo() {
    wx.setClipboardData({
      data: this.data.order.orderNo,
      success: () => {
        wx.showToast({ title: '已复制订单号', icon: 'success' });
      }
    });
  },

  contactService() {
    wx.showModal({
      title: '联系客服',
      content: '确定要联系客服吗?',
      success(res) {
        if (res.confirm) {
          wx.showToast({ title: '正在连接客服...', icon: 'loading' });
        }
      }
    });
  },

  async   payOrder() {
    const products = encodeURIComponent(JSON.stringify(this.data.order.products));
    wx.navigateTo({
      url: `/pages/payment/payment?orderId=${this.data.order.id}&orderNo=${this.data.order.orderNo}&amount=${this.data.order.finalPrice}&products=${products}`
    });
  },

  confirmOrder() {
    wx.showModal({
      title: '确认收货',
      content: '确定已收到商品吗?',
      success: async (res) => {
        if (res.confirm) {
          try {
            await wx.cloud.callFunction({
              name: 'orders',
              data: { action: 'update', orderId: this.data.order.id, status: 3 }
            });
            wx.showToast({ title: '已确认收货', icon: 'success' });

            const statusIdx = 3;
            this.setData({
              'order.status': STATUS_KEY[statusIdx],
              'order.statusText': STATUS_TEXT[statusIdx],
              'order.statusTip': STATUS_TIP[statusIdx]
            });
          } catch (err) {
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  buyAgain() {
    wx.showToast({ title: '再次购买', icon: 'none' });
  }
});
