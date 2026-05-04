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
    this.checkLoginStatus()
  },

  onShow() {
    this.checkLoginStatus()
    if (this.data.isLogin) {
      this.loadUserData()
    }
  },

  checkLoginStatus() {
    const app = getApp()
    const isLogin = app.globalData.isLogin
    const userInfo = app.globalData.userInfo || {}

    this.setData({
      isLogin,
      userInfo
    })
  },

  loadUserData() {
    // 加载用户数据
    wx.showLoading({ title: '加载中...' })

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
      })
      wx.hideLoading()
    }, 500)
  },

  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  // 跳转到测试页面
  goToTest() {
    wx.navigateTo({
      url: '/pages/test/test'
    })
  },

  // 跳转到 API 交互测试页面
  goToApiTest() {
    wx.navigateTo({
      url: '/pages/api-test/api-test'
    })
  },

  editProfile() {
    wx.showToast({ title: '编辑资料', icon: 'none' })
  },

  editAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        // 上传头像
        this.setData({
          'userInfo.avatarUrl': tempFilePath
        })
        wx.showToast({ title: '头像已更新', icon: 'success' })
      }
    })
  },

  goToFavorites() {
    wx.showToast({ title: '我的收藏', icon: 'none' })
  },

  goToFollows() {
    wx.showToast({ title: '我的关注', icon: 'none' })
  },

  goToFans() {
    wx.showToast({ title: '我的粉丝', icon: 'none' })
  },

  goToOrders(e) {
    const status = e.currentTarget.dataset.status
    let url = '/pages/order-list/order-list'
    if (status) {
      url += `?status=${status}`
    }
    wx.navigateTo({ url })
  },

  goToCoupons() {
    wx.showToast({ title: '我的优惠券', icon: 'none' })
  },

  goToAddress() {
    wx.navigateTo({
      url: '/pages/address/address'
    })
  },

  goToContact() {
    wx.showModal({
      title: '联系客服',
      content: '确定要联系客服吗?',
      success(res) {
        if (res.confirm) {
          wx.showToast({ title: '正在连接客服...', icon: 'loading' })
        }
      }
    })
  },

  goToSettings() {
    wx.showToast({ title: '设置', icon: 'none' })
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗?',
      success: (res) => {
        if (res.confirm) {
          // 清除登录状态
          const app = getApp()
          app.globalData.isLogin = false
          app.globalData.userInfo = null

          // 清除本地存储
          wx.removeStorageSync('userInfo')
          wx.removeStorageSync('token')

          this.setData({
            isLogin: false,
            userInfo: {}
          })

          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      }
    })
  }
})
