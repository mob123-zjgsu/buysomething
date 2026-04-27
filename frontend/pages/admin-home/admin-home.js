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
    this.checkLogin()
  },

  onShow() {
    this.checkLogin()
    this.loadStats()
    this.loadPendingCounts()
  },

  checkLogin() {
    const adminInfo = wx.getStorageSync('adminInfo')
    if (!adminInfo) {
      wx.redirectTo({
        url: '/pages/admin-login/admin-login'
      })
      return
    }
    this.setData({
      adminName: adminInfo.name || '管理员'
    })
  },

  loadStats() {
    wx.cloud.callFunction({
      name: 'admin-dashboard',
      data: { action: 'getStats' },
      success: (res) => {
        if (res.result && res.result.code === 0) {
          this.setData({
            stats: res.result.data
          })
        }
      }
    })
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
          })
        }
      }
    })

    // 获取待审核商品数
    wx.cloud.callFunction({
      name: 'admin-dashboard',
      data: { action: 'getPendingProducts' },
      success: (res) => {
        if (res.result && res.result.code === 0) {
          this.setData({
            pendingProducts: res.result.data.length
          })
        }
      }
    })
  },

  onReviewMerchants() {
    wx.navigateTo({
      url: '/pages/admin-merchants/admin-merchants'
    })
  },

  onReviewProducts() {
    wx.navigateTo({
      url: '/pages/admin-products/admin-products'
    })
  },

  onAllMerchants() {
    wx.navigateTo({
      url: '/pages/admin-merchants/admin-merchants?type=all'
    })
  },

  onAllProducts() {
    wx.navigateTo({
      url: '/pages/admin-products/admin-products?type=all'
    })
  },

  onAllOrders() {
    wx.showToast({ title: '功能开发中', icon: 'none' })
  },

  onLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出管理后台吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp()
          app.globalData.isAdminLogin = false
          app.globalData.adminInfo = null
          wx.removeStorageSync('adminInfo')
          wx.removeStorageSync('isAdminLogin')
          
          wx.redirectTo({
            url: '/pages/admin-login/admin-login'
          })
        }
      }
    })
  }
})