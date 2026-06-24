// pages/review/review.js
Page({
  data: {
    orderId: '',
    productId: '',
    rating: 5,
    content: '',
    images: []
  },

  onLoad(options) {
    this.setData({
      orderId: options.orderId || '',
      productId: options.productId || ''
    });
  },

  setRating(e) {
    this.setData({ rating: parseInt(e.currentTarget.dataset.rating) });
  },

  onInput(e) {
    this.setData({ content: e.detail.value });
  },

  chooseImage() {
    const limit = 6 - this.data.images.length;
    wx.chooseImage({
      count: limit,
      success: (res) => {
        this.setData({ images: [...this.data.images, ...res.tempFilePaths] });
      }
    });
  },

  removeImage(e) {
    const idx = e.currentTarget.dataset.index;
    const images = [...this.data.images];
    images.splice(idx, 1);
    this.setData({ images });
  },

  async submitReview() {
    if (!this.data.content.trim()) {
      wx.showToast({ title: '请输入评价内容', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '提交中...' });
    try {
      // 上传图片
      const cloudImageIds = [];
      for (const img of this.data.images) {
        const cloudRes = await wx.cloud.uploadFile({
          cloudPath: `reviews/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`,
          filePath: img
        });
        cloudImageIds.push(cloudRes.fileID);
      }

      const res = await wx.cloud.callFunction({
        name: 'reviews',
        data: {
          action: 'add',
          productId: this.data.productId,
          orderId: this.data.orderId,
          rating: this.data.rating,
          content: this.data.content,
          images: cloudImageIds
        }
      });
      wx.hideLoading();

      if (res.result && res.result.code === 0) {
        wx.showToast({ title: '评价成功', icon: 'success' });
        setTimeout(() => wx.navigateBack(), 1200);
      } else {
        wx.showToast({ title: '评价失败', icon: 'none' });
      }
    } catch (err) {
      wx.hideLoading();
      console.error(err);
      wx.showToast({ title: '评价失败', icon: 'none' });
    }
  }
});
