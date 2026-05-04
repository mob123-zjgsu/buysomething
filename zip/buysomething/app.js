App({
  onLaunch(options) {
    // 小程序启动
    console.log('小程序启动', options)

    // 初始化CloudBase
    if (wx.cloud) {
      wx.cloud.init({
        env: 'buysomething-6gbmbtpxff05be35',
        traceUser: true
      })
      console.log('CloudBase 初始化成功')
    } else {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    }

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
    const isLogin = wx.getStorageSync('isLogin')
    
    if (userInfo && isLogin) {
      this.globalData.isLogin = true
      this.globalData.userInfo = userInfo
      console.log('用户已登录:', userInfo)
    } else {
      this.globalData.isLogin = false
      this.globalData.userInfo = null
    }
  },

  // 登录方法
  login(userInfo) {
    this.globalData.isLogin = true
    this.globalData.userInfo = userInfo
    wx.setStorageSync('userInfo', userInfo)
    wx.setStorageSync('isLogin', true)
  },

  // 登出方法
  logout() {
    this.globalData.isLogin = false
    this.globalData.userInfo = null
    wx.removeStorageSync('userInfo')
    wx.removeStorageSync('isLogin')
  },

  // 获取数据库实例
  getDB() {
    if (wx.cloud) {
      return wx.cloud.database()
    }
    return null
  },

  globalData: {
    isLogin: false,
    userInfo: null,
    cartCount: 0,
    primaryColor: '#FF6B6B',
    secondaryColor: '#4ECDC4'
  }
})
