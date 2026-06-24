Page({
  data: { name: '', price: '', description: '', image: '', stock: '' },

  onNameInput(e) { this.setData({ name: e.detail.value }); },
  onPriceInput(e) { this.setData({ price: e.detail.value }); },
  onDescInput(e) { this.setData({ description: e.detail.value }); },
  onImageInput(e) { this.setData({ image: e.detail.value }); },
  onStockInput(e) { this.setData({ stock: e.detail.value }); },

  onSubmit() {
    const { name, price, description, image, stock } = this.data;
    if (!name || !price) {
      wx.showToast({ title: '请填写必填项', icon: 'none' }); return;
    }
    const merchantInfo = wx.getStorageSync('merchantInfo');
    wx.showLoading({ title: '提交中...' });
    wx.cloud.callFunction({
      name: 'add-product',
      data: { name, price: Number(price), description, image, stock: Number(stock) || 0, merchantId: merchantInfo.merchantId },
      success: (res) => {
        wx.hideLoading();
        if (res.result && res.result.code === 0) {
          wx.showToast({ title: '提交成功，等待审核', icon: 'success' });
          setTimeout(() => wx.navigateBack(), 1500);
        } else {
          wx.showToast({ title: res.result?.message || '提交失败', icon: 'none' });
        }
      },
      fail: () => { wx.hideLoading(); wx.showToast({ title: '网络错误', icon: 'none' }); }
    });
  }
});