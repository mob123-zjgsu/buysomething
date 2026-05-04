const app = getApp();

Page({
  data: {
    merchantName: '',
    merchantId: '',
    products: []
  },

  onLoad() {
    this.checkLogin();
  },

  onShow() {
    this.checkLogin();
    this.loadProducts();
  },

  checkLogin() {
    const merchantInfo = wx.getStorageSync('merchantInfo');
    if (!merchantInfo) {
      wx.redirectTo({
        url: '/pages/merchant-login/merchant-login'
      });
      return;
    }
    this.setData({
      merchantName: merchantInfo.merchantName,
      merchantId: merchantInfo.merchantId
    });
  },

  loadProducts() {
    wx.cloud.callFunction({
      name: 'products',
      data: {
        merchantId: this.data.merchantId,
        page: 1,
        pageSize: 10
      },
      success: (res) => {
        if (res.result && res.result.code === 0) {
          this.setData({
            products: res.result.data.list || []
          });
        }
      },
      fail: (err) => {
        console.error('加载商品失败:', err);
      }
    });
  },

  onAddProduct() {
    wx.navigateTo({
      url: '/pages/add-product/add-product'
    });
  },

  onMyProducts() {
    wx.navigateTo({
      url: '/pages/merchant-products/merchant-products'
    });
  },

  onOrderList() {
    wx.navigateTo({
      url: '/pages/merchant-orders/merchant-orders'
    });
  },

  onStatistics() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  onEditProduct(e) {
    const productId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/add-product/add-product?productId=${productId}`
    });
  },

  onLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出商家账号吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          app.globalData.isMerchantLogin = false;
          app.globalData.merchantInfo = null;
          wx.removeStorageSync('merchantInfo');
          wx.removeStorageSync('isMerchantLogin');
          
          wx.redirectTo({
            url: '/pages/merchant-login/merchant-login'
          });
        }
      }
    });
  }
});