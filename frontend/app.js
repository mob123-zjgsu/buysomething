App({
  onLaunch(options) {
    // 小程序启动
    console.log('小程序启动', options)
    this.checkLoginStatus()
  },

  onShow(options) {
    // 小程序显示
  },

  onHide() {
    // 小程序隐藏
  },

  checkLoginStatus() {
    // 检查登录状态
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.globalData.isLogin = true
      this.globalData.userInfo = userInfo
    }
  },

  globalData: {
    isLogin: false,
    userInfo: null,
    cartCount: 0,
    primaryColor: '#FF6B6B',
    secondaryColor: '#4ECDC4'
  }
})
