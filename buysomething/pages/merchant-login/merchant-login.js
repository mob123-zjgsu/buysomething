Page({
  data: {
    phone: '',
    password: '',
    showPassword: false,
    canLogin: false
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

  togglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    });
  },

  checkCanLogin() {
    const { phone, password } = this.data;
    const phoneReg = /^1[3-9]\d{9}$/;
    this.setData({
      canLogin: phoneReg.test(phone) && password.length >= 6
    });
  },

  doLogin() {
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