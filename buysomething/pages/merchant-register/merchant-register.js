Page({
  data: {
    merchantName: '',
    mainProducts: '',
    contactPerson: '',
    phone: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    canRegister: false
  },

  onMerchantNameInput(e) {
    this.setData({ merchantName: e.detail.value });
    this.checkCanRegister();
  },

  onMainProductsInput(e) {
    this.setData({ mainProducts: e.detail.value });
    this.checkCanRegister();
  },

  onContactPersonInput(e) {
    this.setData({ contactPerson: e.detail.value });
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
    this.checkCanRegister();
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
    this.checkCanRegister();
  },

  onConfirmPasswordInput(e) {
    this.setData({ confirmPassword: e.detail.value });
    this.checkCanRegister();
  },

  togglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    });
  },

  checkCanRegister() {
    const { merchantName, mainProducts, phone, password, confirmPassword } = this.data;
    const phoneReg = /^1[3-9]\d{9}$/;

    const valid = merchantName.trim() !== '' &&
                  mainProducts.trim() !== '' &&
                  phoneReg.test(phone) &&
                  password.length >= 6 &&
                  password === confirmPassword;

    this.setData({ canRegister: valid });
  },

  doRegister() {
    const { merchantName, mainProducts, contactPerson, phone, password } = this.data;

    wx.showLoading({ title: '提交中...' });

    wx.cloud.callFunction({
      name: 'merchant-register',
      data: { merchantName, mainProducts, contactPerson, phone, password },
      success: (res) => {
        wx.hideLoading();
        console.log('商家注册结果:', res);

        if (res.result && res.result.code === 0) {
          wx.showModal({
            title: '注册成功',
            content: '您的商家账号已提交，请等待管理员审核。审核通过后即可登录。',
            showCancel: false,
            success: () => {
              wx.redirectTo({
                url: '/pages/merchant-login/merchant-login'
              });
            }
          });
        } else {
          wx.showToast({
            title: res.result?.message || '注册失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('商家注册失败:', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },

  goBack() {
    wx.navigateBack();
  }
});