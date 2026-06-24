Page({
  data: {
    isLogin: false,
    userInfo: {},
    stats: {
      favorites: 0,
      follows: 0,
      fans: 0
    },
    orderCounts: {
      pending: 0,
      shipped: 0,
      received: 0,
      commented: 0,
      refund: 0
    },
    couponCount: 3
  },

  onLoad(options) {
    this.checkLoginStatus();
  },

  onShow() {
    this.checkLoginStatus();
    if (this.data.isLogin) {
      this.loadUserData();
    }
  },

  checkLoginStatus() {
    const app = getApp();
    const isLogin = app.globalData.isLogin;
    const userInfo = app.globalData.userInfo || {};

    this.setData({
      isLogin,
      userInfo
    });
  },

  loadUserData() {
    // 加载用户数据
    wx.showLoading({ title: '加载中...' });

    // 模拟数据
    setTimeout(() => {
      this.setData({
        stats: {
          favorites: 12,
          follows: 28,
          fans: 56
        },
        orderCounts: {
          pending: 2,
          shipped: 0,
          received: 1,
          commented: 3,
          refund: 0
        },
        couponCount: 5
      });
      wx.hideLoading();
    }, 500);
  },

  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  // 跳转到测试页面
  goToTest() {
    wx.navigateTo({
      url: '/pages/test/test'
    });
  },

  // 跳转到 API 交互测试页面
  goToApiTest() {
    wx.navigateTo({
      url: '/pages/api-test/api-test'
    });
  },

  editProfile() {
    wx.showToast({ title: '编辑资料', icon: 'none' });
  },

  editAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        // 上传头像
        this.setData({
          'userInfo.avatarUrl': tempFilePath
        });
        wx.showToast({ title: '头像已更新', icon: 'success' });
      }
    });
  },

  goToFavorites() {
    wx.navigateTo({ url: '/pages/favorites/favorites' });
  },

  goToFollows() {
    wx.navigateTo({ url: '/pages/messages/messages' });
  },

  goToFans() {
    wx.navigateTo({ url: '/pages/signin/signin' });
  },

  goToOrders(e) {
    const status = e.currentTarget.dataset.status;
    let url = '/pages/order-list/order-list';
    if (status) {
      url += `?status=${status}`;
    }
    wx.navigateTo({ url });
  },

  goToCoupons() {
    wx.navigateTo({ url: '/pages/coupons/coupons' });
  },

  goToAddress() {
    wx.navigateTo({
      url: '/pages/address/address'
    });
  },

  goToContact() {
    wx.navigateTo({
      url: '/pages/chat/chat'
    });
  },

  goToSettings() {
    wx.showToast({ title: '设置', icon: 'none' });
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗?',
      success: (res) => {
        if (res.confirm) {
          // 清除登录状态
          const app = getApp();
          app.globalData.isLogin = false;
          app.globalData.userInfo = null;

          // 清除本地存储
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('token');

          this.setData({
            isLogin: false,
            userInfo: {}
          });

          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
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
  },

  // 快速切换到管理员端（自动绑定管理员账号，免登录）
  switchToAdmin() {
    const app = getApp();
    // 如果管理员端未登录，自动初始化
    if (!app.globalData.isAdminLogin || !wx.getStorageSync('adminInfo')) {
      const testAdmin = {
        adminId: 'admin_13800000001',
        name: '超级管理员',
        phone: '13800000001',
        role: 'admin'
      };
      app.globalData.isAdminLogin = true;
      app.globalData.adminInfo = testAdmin;
      wx.setStorageSync('isAdminLogin', true);
      wx.setStorageSync('adminInfo', testAdmin);
    }
    wx.redirectTo({
      url: '/pages/admin-home/admin-home'
    });
  }
});
