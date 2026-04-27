Page({
  data: {
    phone: '',
    password: '',
    canLogin: false
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value })
    this.checkCanLogin()
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value })
    this.checkCanLogin()
  },

  checkCanLogin() {
    const { phone, password } = this.data
    this.setData({
      canLogin: phone.length > 0 && password.length >= 6
    })
  },

  doLogin() {
    const { phone, password } = this.data

    wx.showLoading({ title: '登录中...' })

    wx.cloud.callFunction({
      name: 'admin-login',
      data: { phone, password },
      success: (res) => {
        wx.hideLoading()
        console.log('管理员登录结果:', res)

        if (res.result && res.result.code === 0) {
          const adminInfo = res.result.data
          
          const app = getApp()
          app.globalData.isAdminLogin = true
          app.globalData.adminInfo = adminInfo
          wx.setStorageSync('adminInfo', adminInfo)
          wx.setStorageSync('isAdminLogin', true)

          wx.showToast({
            title: '登录成功',
            icon: 'success'
          })

          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/admin-home/admin-home'
            })
          }, 1500)
        } else {
          wx.showToast({
            title: res.result?.message || '登录失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('管理员登录失败:', err)
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    })
  }
})