// pages/merchant-products/merchant-products.js
Page({
  data: {
    products: []
  },

  onShow() {
    this.loadProducts();
  },

  async loadProducts() {
    wx.showLoading({ title: '加载中...' });
    try {
      const res = await wx.cloud.callFunction({
        name: 'products',
        data: { page: 1, pageSize: 50 }
      });
      wx.hideLoading();

      if (res.result && res.result.code === 0) {
        this.setData({ products: res.result.data.list || [] });
      }
    } catch (err) {
      wx.hideLoading();
      console.error(err);
    }
  },

  goToAddProduct() {
    wx.navigateTo({ url: '/pages/add-product/add-product' });
  },

  editProduct(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/add-product/add-product?id=${id}` });
  },

  async deleteProduct(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认下架',
      content: '确定要下架该商品吗?',
      success: async (res) => {
        if (res.confirm) {
          try {
            await wx.cloud.callFunction({
              name: 'products',
              data: { action: 'delete', productId: id }
            });
            wx.showToast({ title: '已下架', icon: 'success' });
            this.loadProducts();
          } catch (err) {
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  goToProductDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/product-detail/product-detail?id=${id}` });
  }
});
