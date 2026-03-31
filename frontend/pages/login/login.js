Page({
  data: {
    loginType: 'password', // password 或 code
    phone: '',
    password: '',
    code: '',
    showPassword: false,
    countdown: 0,
    canLogin: false,
    canCodeLogin: false
  },

  onLoad(options) {
    // 检查是否已登录
    const app = getApp()
    if (app.globalData.isLogin) {
      wx.navigateBack()
    }
  },

  onPhoneInput(e) {
    const phone = e.detail.value
    this.setData({ phone })
    this.checkCanLogin()
  },

  onPasswordInput(e) {
    const password = e.detail.value
    this.setData({ password })
    this.checkCanLogin()
  },

  onCodeInput(e) {
    const code = e.detail.value
    this.setData({ code })
    this.checkCanLogin()
  },

  togglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    })
  },

  checkCanLogin() {
    const { loginType, phone, password, code } = this.data
    const phoneReg = /^1[3-9]\d{9}$/

    if (loginType === 'password') {
      this.setData({
        canLogin: phoneReg.test(phone) && password.length >= 6
      })
    } else {
      this.setData({
        canCodeLogin: phoneReg.test(phone) && code.length === 6
      })
    }
  },

  switchLoginType() {
    const newType = this.data.loginType === 'password' ? 'code' : 'password'
    this.setData({
      loginType: newType,
      phone: '',
      password: '',
      code: ''
    })
  },

  sendCode() {
    const { phone, countdown } = this.data
    if (countdown > 0) return

    const phoneReg = /^1[3-9]\d{9}$/
    if (!phoneReg.test(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return
    }

    // 发送验证码
    wx.showLoading({ title: '发送中...' })

    // 模拟发送验证码
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '验证码已发送',
        icon: 'success'
      })

      // 开始倒计时
      this.startCountdown()
    }, 1000)
  },

  startCountdown() {
    let countdown = 60
    this.setData({ countdown })

    // 清除之前的定时器
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
    }

    this.countdownTimer = setInterval(() => {
      countdown--
      this.setData({ countdown })

      if (countdown <= 0) {
        clearInterval(this.countdownTimer)
        this.countdownTimer = null
      }
    }, 1000)
  },

  // 页面卸载时清除定时器
  onUnload() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
      this.countdownTimer = null
    }
  },

  passwordLogin() {
    const { phone, password } = this.data

    wx.showLoading({ title: '登录中...' })

    // 模拟登录
    setTimeout(() => {
      wx.hideLoading()

      // 保存用户信息
      const userInfo = {
        nickName: '用户' + phone.substring(7),
        avatarUrl: '/images/default-avatar.png',
        memberLevel: '普通会员'
      }

      this.saveUserInfo(userInfo)

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })

      setTimeout(() => {
        wx.switchTab({
          url: '/pages/profile/profile',
          fail: () => {
            wx.navigateBack()
          }
        })
      }, 1500)
    }, 1500)
  },

  codeLogin() {
    const { phone, code } = this.data

    // 验证验证码
    if (code !== '123456') {
      wx.showToast({
        title: '验证码错误',
        icon: 'none'
      })
      return
    }

    wx.showLoading({ title: '登录中...' })

    // 模拟登录
    setTimeout(() => {
      wx.hideLoading()

      // 保存用户信息
      const userInfo = {
        nickName: '用户' + phone.substring(7),
        avatarUrl: '/images/default-avatar.png',
        memberLevel: '普通会员'
      }

      this.saveUserInfo(userInfo)

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })

      setTimeout(() => {
        wx.switchTab({
          url: '/pages/profile/profile',
          fail: () => {
            wx.navigateBack()
          }
        })
      }, 1500)
    }, 1500)
  },

  saveUserInfo(userInfo) {
    const app = getApp()
    app.globalData.isLogin = true
    app.globalData.userInfo = userInfo

    wx.setStorageSync('userInfo', userInfo)
    wx.setStorageSync('token', 'mock_token_' + Date.now())
  },

  forgetPassword() {
    wx.showToast({
      title: '找回密码功能',
      icon: 'none'
    })
  },

  goToRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    })
  },

  wechatLogin() {
    // 微信登录
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        console.log('微信登录成功:', res)
        const userInfo = {
          nickName: res.userInfo.nickName,
          avatarUrl: res.userInfo.avatarUrl,
          memberLevel: '普通会员'
        }
        this.saveUserInfo(userInfo)

        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })

        setTimeout(() => {
          wx.switchTab({
            url: '/pages/profile/profile'
          })
        }, 1500)
      },
      fail: () => {
        wx.showToast({
          title: '授权失败',
          icon: 'none'
        })
      }
    })
  },

  qqLogin() {
    wx.showToast({
      title: 'QQ登录',
      icon: 'none'
    })
  },

  weiboLogin() {
    wx.showToast({
      title: '微博登录',
      icon: 'none'
    })
  },

  viewAgreement() {
    wx.showToast({
      title: '用户协议',
      icon: 'none'
    })
  },

  viewPrivacy() {
    wx.showToast({
      title: '隐私政策',
      icon: 'none'
    })
  },

  goBack() {
    wx.navigateBack({
      fail: () => {
        wx.switchTab({
          url: '/pages/home/home'
        })
      }
    })
  }
})
