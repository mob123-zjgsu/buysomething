Page({
  data: {
    adminName: '',
    stats: {
      totalMerchants: 0,
      totalProducts: 0,
      totalUsers: 0
    },
    pendingMerchants: 0,
    pendingProducts: 0
  },

  onLoad() {
    this.checkLogin();
  },

  onShow() {
    this.checkLogin();
    this.loadStats();
    this.loadPendingCounts();
  },

  checkLogin() {
    const adminInfo = wx.getStorageSync('adminInfo');
    if (!adminInfo) {
      wx.redirectTo({
        url: '/pages/admin-login/admin-login'
      });
      return;
    }
    this.setData({
      adminName: adminInfo.name || '管理员'
    });
  },

  loadStats() {
    wx.cloud.callFunction({
      name: 'admin-dashboard',
      data: { action: 'getStats' },
      success: (res) => {
        if (res.result && res.result.code === 0) {
          this.setData({
            stats: res.result.data
          });
        }
      }
    });
  },

  loadPendingCounts() {
    // 获取待审核商家数
    wx.cloud.callFunction({
      name: 'admin-dashboard',
      data: { action: 'getPendingMerchants' },
      success: (res) => {
        if (res.result && res.result.code === 0) {
          this.setData({
            pendingMerchants: res.result.data.length
          });
        }
      }
    });

    // 获取待审核商品数
    wx.cloud.callFunction({
      name: 'admin-dashboard',
      data: { action: 'getPendingProducts' },
      success: (res) => {
        if (res.result && res.result.code === 0) {
          this.setData({
            pendingProducts: res.result.data.length
          });
        }
      }
    });
  },

  onReviewMerchants() {
    wx.navigateTo({
      url: '/pages/admin-merchants/admin-merchants'
    });
  },

  onReviewProducts() {
    wx.navigateTo({
      url: '/pages/admin-products/admin-products'
    });
  },

  onAllMerchants() {
    wx.navigateTo({
      url: '/pages/admin-merchants/admin-merchants?type=all'
    });
  },

  onAllProducts() {
    wx.navigateTo({
      url: '/pages/admin-products/admin-products?type=all'
    });
  },

  onAllOrders() {
    wx.navigateTo({
      url: '/pages/admin-aftersale/admin-aftersale'
    });
  },

  onLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出管理后台吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          app.globalData.isAdminLogin = false;
          app.globalData.adminInfo = null;
          wx.removeStorageSync('adminInfo');
          wx.removeStorageSync('isAdminLogin');
          
          wx.redirectTo({
            url: '/pages/admin-login/admin-login'
          });
        }
      }
    });
  },

  // 快速切换到用户端（自动绑定测试用户账号，免登录）
  switchToUser() {
    const app = getApp();
    // 如果用户端未登录，自动初始化测试用户
    if (!app.globalData.isLogin || !wx.getStorageSync('userInfo')) {
      const testUser = {
        nickName: '测试用户001',
        avatarUrl: '/images/avatar-default.png',
        phone: '13800138001',
        memberLevel: '普通会员',
        userId: 'da3d566169c2ad56016a86eb4ea94c3e'
      };
      app.globalData.isLogin = true;
      app.globalData.userInfo = testUser;
      wx.setStorageSync('isLogin', true);
      wx.setStorageSync('userInfo', testUser);
      wx.setStorageSync('phone', testUser.phone);
    }
    wx.switchTab({
      url: '/pages/profile/profile'
    });
  },

  // 快速切换到商家端（自动绑定测试商家账号，免登录）
  switchToMerchant() {
    const app = getApp();
    // 如果商家端未登录，自动初始化测试商家
    if (!app.globalData.isMerchantLogin || !wx.getStorageSync('merchantInfo')) {
      const testMerchant = {
        merchantId: '97b16bdb69fde9ea018468c710a9a009',
        merchantName: '优品服饰',
        phone: '13900001111',
        contactPerson: '张三'
      };
      app.globalData.isMerchantLogin = true;
      app.globalData.merchantInfo = testMerchant;
      wx.setStorageSync('isMerchantLogin', true);
      wx.setStorageSync('merchantInfo', testMerchant);
    }
    wx.redirectTo({
      url: '/pages/merchant-home/merchant-home'
    });
  }
});