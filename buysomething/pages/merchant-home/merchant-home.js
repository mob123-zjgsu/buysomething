const app = getApp();

Page({
  data: {
    merchantName: '',
    merchantId: '',
    products: [],
    unreadCount: 0
  },

  onLoad() {
    this.checkLogin();
  },

  onShow() {
    this.checkLogin();
    this.loadProducts();
    this.loadUnreadCount();
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

  onAfterSale() {
    wx.navigateTo({
      url: '/pages/merchant-aftersale/merchant-aftersale'
    });
  },

  onChatMessages() {
    wx.navigateTo({
      url: '/pages/merchant-chat/merchant-chat'
    });
  },

  async loadUnreadCount() {
    const merchantInfo = wx.getStorageSync('merchantInfo') || {};
    if (!merchantInfo.merchantId) return;
    try {
      const res = await wx.cloud.callFunction({
        name: 'chat',
        data: {
          action: 'merchantConversations',
          merchantId: merchantInfo.merchantId
        }
      });
      if (res.result && res.result.code === 0) {
        const count = (res.result.data || []).filter(c => c.unreadByMerchant).length;
        this.setData({ unreadCount: count });
      }
    } catch (err) {
      console.error('加载未读数失败:', err);
    }
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