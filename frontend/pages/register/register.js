Page({
  data: {
    phone: '',
    code: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false,
    countdown: 0,
    canRegister: false,
    agreed: false,
    strength: 0,
    strengthText: '',
    strengthClass: ''
  },

  onLoad(options) {
    console.log('注册页面加载')
  },

  onPhoneInput(e) {
    const phone = e.detail.value
    this.setData({ phone })
    this.checkCanRegister()
  },

  onCodeInput(e) {
    const code = e.detail.value
    this.setData({ code })
    this.checkCanRegister()
  },

  onPasswordInput(e) {
    const password = e.detail.value
    this.setData({ password })
    this.checkPasswordStrength(password)
    this.checkCanRegister()
  },

  onConfirmPasswordInput(e) {
    const confirmPassword = e.detail.value
    this.setData({ confirmPassword })
    this.checkCanRegister()
  },

  togglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    })
  },

  toggleConfirmPassword() {
    this.setData({
      showConfirmPassword: !this.data.showConfirmPassword
    })
  },

  checkPasswordStrength(password) {
    let strength = 0
    let strengthText = ''
    let strengthClass = ''

    if (password.length < 6) {
      strength = 0
      strengthText = '密码过短'
      strengthClass = 'weak'
    } else if (password.length < 8) {
      strength = 1
      strengthText = '弱'
      strengthClass = 'weak'
    } else {
      // 检查密码复杂度
      let hasLower = /[a-z]/.test(password)
      let hasUpper = /[A-Z]/.test(password)
      let hasNumber = /[0-9]/.test(password)
      let hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

      if (hasNumber && (hasLower || hasUpper)) {
        strength = 2
        strengthText = '中'
        strengthClass = 'medium'
      }

      if (hasNumber && hasLower && hasUpper) {
        strength = 3
        strengthText = '强'
        strengthClass = 'strong'
      }

      if (hasNumber && hasLower && hasUpper && hasSpecial) {
        strength = 3
        strengthText = '很强'
        strengthClass = 'strong'
      }
    }

    this.setData({ strength, strengthText, strengthClass })
  },

  checkCanRegister() {
    const { phone, code, password, confirmPassword, agreed } = this.data
    const phoneReg = /^1[3-9]\d{9}$/

    const isPhoneValid = phoneReg.test(phone)
    const isCodeValid = code.length === 6
    const isPasswordValid = password.length >= 6 && password.length <= 20
    const isPasswordMatch = password === confirmPassword && password !== ''
    const isAgreed = agreed

    this.setData({
      canRegister: isPhoneValid && isCodeValid && isPasswordValid && isPasswordMatch && isAgreed
    })
  },

  toggleAgreement() {
    this.setData({
      agreed: !this.data.agreed
    })
    this.checkCanRegister()
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

    // 测试环境: 不调用云函数,直接提示使用固定验证码
    wx.showToast({
      title: '请输入验证码 123456',
      icon: 'none',
      duration: 2000
    })

    // 开始倒计时
    this.startCountdown()
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

  register() {
    const { phone, code, password } = this.data

    wx.showLoading({ title: '注册中...' })

    // 调用云函数进行注册
    wx.cloud.callFunction({
      name: 'register',
      data: {
        phone: phone,
        code: code,
        password: password
      },
      success: (res) => {
        wx.hideLoading()
        
        if (res.result.success) {
          wx.showToast({
            title: '注册成功',
            icon: 'success',
            duration: 2000
          })

          // 保存用户信息
          this.saveUserInfo(res.result.userInfo)

          setTimeout(() => {
            wx.navigateBack()
          }, 2000)
        } else {
          wx.showToast({
            title: res.result.message || '注册失败',
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('注册失败:', err)
        wx.showToast({
          title: '注册失败,请稍后重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  saveUserInfo(userInfo) {
    const app = getApp()
    app.globalData.isLogin = true
    app.globalData.userInfo = userInfo

    wx.setStorageSync('userInfo', userInfo)
    wx.setStorageSync('isLogin', true)
  },

  goToLogin() {
    wx.navigateBack()
  },

  viewAgreement() {
    wx.showModal({
      title: '用户协议',
      content: '欢迎使用优选购物小程序!\n\n1. 用户注册即表示同意本协议\n2. 用户应遵守法律法规\n3. 保护个人信息安全\n4. 享受优质购物体验\n\n详细条款请访问官网查看',
      showCancel: false
    })
  },

  viewPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '我们非常重视您的隐私保护!\n\n1. 收集必要信息提供服务\n2. 不泄露用户个人信息\n3. 数据加密存储\n4. 严格遵守相关法律法规\n\n详细政策请访问官网查看',
      showCancel: false
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
