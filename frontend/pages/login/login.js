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

    wx.showLoading({ title: '发送中...' })

    // 调用云函数发送验证码
    wx.cloud.callFunction({
      name: 'sendSmsCode',
      data: {
        phone: phone
      },
      success: (res) => {
        wx.hideLoading()
        console.log('发送验证码结果:', res)

        if (res.result && res.result.success) {
          // 测试环境显示验证码
          if (res.result.code) {
            wx.showToast({
              title: '验证码: ' + res.result.code,
              icon: 'none',
              duration: 3000
            })
          } else {
            wx.showToast({
              title: '验证码已发送',
              icon: 'success'
            })
          }
          this.startCountdown()
        } else {
          wx.showToast({
            title: res.result?.message || '发送失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('发送验证码失败:', err)
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      }
    })
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

    // 调用云函数进行登录
    wx.cloud.callFunction({
      name: 'login',
      data: {
        phone: phone,
        password: password
      },
      success: (res) => {
        wx.hideLoading()
        console.log('登录结果:', res)

        if (res.result && res.result.code === 0) {
          // 登录成功，保存用户信息
          const userInfo = res.result.data.userInfo
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
        } else {
          // 登录失败
          wx.showToast({
            title: res.result?.message || '登录失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('登录失败:', err)
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      }
    })
  },

  codeLogin() {
    const { phone, code } = this.data

    if (!phone || code.length !== 6) {
      wx.showToast({
        title: '请输入正确的手机号和验证码',
        icon: 'none'
      })
      return
    }

    wx.showLoading({ title: '登录中...' })

    // 调用云函数进行登录（验证码登录模式）
    wx.cloud.callFunction({
      name: 'login',
      data: {
        phone: phone,
        password: '',  // 验证码登录不需要密码
        code: code
      },
      success: (res) => {
        wx.hideLoading()
        console.log('登录结果:', res)

        if (res.result && res.result.code === 0) {
          // 登录成功，保存用户信息
          const userInfo = res.result.data.userInfo
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
        } else {
          // 登录失败
          wx.showToast({
            title: res.result?.message || '登录失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('登录失败:', err)
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      }
    })
  },

  saveUserInfo(userInfo) {
    const app = getApp()
    app.globalData.isLogin = true
    app.globalData.userInfo = userInfo

    // 保存用户信息
    wx.setStorageSync('userInfo', userInfo)
    wx.setStorageSync('isLogin', true)

    // 如果有token也保存
    if (userInfo.token) {
      wx.setStorageSync('token', userInfo.token)
    }

    // 保存手机号（用于后续查询）
    if (userInfo.phone) {
      wx.setStorageSync('phone', userInfo.phone)
    }
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

  goToMerchantLogin() {
    wx.navigateTo({
      url: '/pages/merchant-login/merchant-login'
    })
  },

  goToAdminLogin() {
    wx.navigateTo({
      url: '/pages/admin-login/admin-login'
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
