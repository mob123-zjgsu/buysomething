Page({
  data: {
    loginType: 'password', // password 或 code
    phone: '',
    password: '',
    code: '',
    showPassword: false,
    countdown: 0,
    canLogin: false,
    canCodeLogin: false,
    displayCode: '' // 用于显示验证码
  },

  onPhoneInput(e) {
    const phone = e.detail.value;
    this.setData({ phone });
    this.checkCanLogin();
  },

  onPasswordInput(e) {
    const password = e.detail.value;
    this.setData({ password });
    this.checkCanLogin();
  },

  onCodeInput(e) {
    const code = e.detail.value;
    this.setData({ code });
    this.checkCanLogin();
  },

  togglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    });
  },

  switchLoginType() {
    const newType = this.data.loginType === 'password' ? 'code' : 'password';
    this.setData({
      loginType: newType,
      phone: '',
      password: '',
      code: '',
      displayCode: ''
    });
  },

  checkCanLogin() {
    const { loginType, phone, password, code } = this.data;
    const phoneReg = /^1[3-9]\d{9}$/;

    if (loginType === 'password') {
      this.setData({
        canLogin: phoneReg.test(phone) && password.length >= 6
      });
    } else {
      this.setData({
        canCodeLogin: phoneReg.test(phone) && code.length === 6
      });
    }
  },

  sendCode() {
    const { phone, countdown } = this.data;
    if (countdown > 0) return;

    const phoneReg = /^1[3-9]\d{9}$/;
    if (!phoneReg.test(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '发送中...' });

    wx.cloud.callFunction({
      name: 'sendSmsCode',
      data: { phone },
      success: (res) => {
        wx.hideLoading();
        console.log('发送验证码结果:', res);

        if (res.result && res.result.success) {
          // 测试环境显示验证码
          if (res.result.code) {
            this.setData({ displayCode: res.result.code });
            wx.showToast({
              title: '验证码: ' + res.result.code,
              icon: 'none',
              duration: 3000
            });
          } else {
            wx.showToast({
              title: '验证码已发送',
              icon: 'success'
            });
          }
          this.startCountdown();
        } else {
          wx.showToast({
            title: res.result?.message || '发送失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('发送验证码失败:', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },

  startCountdown() {
    let countdown = 60;
    this.setData({ countdown });

    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }

    this.countdownTimer = setInterval(() => {
      countdown--;
      this.setData({ countdown });

      if (countdown <= 0) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
      }
    }, 1000);
  },

  onUnload() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  },

  passwordLogin() {
    const { phone, password } = this.data;

    wx.showLoading({ title: '登录中...' });

    wx.cloud.callFunction({
      name: 'merchant-login',
      data: { phone, password },
      success: (res) => {
        wx.hideLoading();
        console.log('商家登录结果:', res);

        if (res.result && res.result.code === 0) {
          const merchantInfo = res.result.data;
          
          // 保存商家信息
          const app = getApp();
          app.globalData.isMerchantLogin = true;
          app.globalData.merchantInfo = merchantInfo;
          wx.setStorageSync('merchantInfo', merchantInfo);
          wx.setStorageSync('isMerchantLogin', true);

          wx.showToast({
            title: '登录成功',
            icon: 'success'
          });

          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/merchant-home/merchant-home'
            });
          }, 1500);
        } else {
          wx.showToast({
            title: res.result?.message || '登录失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('商家登录失败:', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },

  codeLogin() {
    const { phone, code } = this.data;

    if (!phone || code.length !== 6) {
      wx.showToast({
        title: '请输入正确的手机号和验证码',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '登录中...' });

    wx.cloud.callFunction({
      name: 'merchant-login',
      data: { phone, code },
      success: (res) => {
        wx.hideLoading();
        console.log('商家登录结果:', res);

        if (res.result && res.result.code === 0) {
          const merchantInfo = res.result.data;
          
          // 保存商家信息
          const app = getApp();
          app.globalData.isMerchantLogin = true;
          app.globalData.merchantInfo = merchantInfo;
          wx.setStorageSync('merchantInfo', merchantInfo);
          wx.setStorageSync('isMerchantLogin', true);

          wx.showToast({
            title: '登录成功',
            icon: 'success'
          });

          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/merchant-home/merchant-home'
            });
          }, 1500);
        } else {
          wx.showToast({
            title: res.result?.message || '登录失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('商家登录失败:', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },

  goToRegister() {
    wx.navigateTo({
      url: '/pages/merchant-register/merchant-register'
    });
  },

  switchToUser() {
    wx.navigateBack();
  },

  goBack() {
    wx.navigateBack();
  }
});