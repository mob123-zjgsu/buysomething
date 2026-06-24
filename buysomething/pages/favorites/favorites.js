// pages/favorites/favorites.js
Page({
  data: {
    favorites: [],
    products: []
  },

  onShow() {
    this.loadFavorites();
  },

  async loadFavorites() {
    wx.showLoading({ title: '加载中...' });
    try {
      const res = await wx.cloud.callFunction({
        name: 'favorites',
        data: { action: 'list' }
      });
      wx.hideLoading();

      if (res.result && res.result.code === 0) {
        const favs = res.result.data || [];
        this.setData({ favorites: favs });

        // 获取商品详情
        const productIds = favs.map(f => f.productId);
        if (productIds.length > 0) {
          const products = [];
          for (const pid of productIds) {
            try {
              const pRes = await wx.cloud.callFunction({
                name: 'products',
                data: { productId: pid }
              });
              if (pRes.result && pRes.result.data) {
                products.push(pRes.result.data);
              }
            } catch (e) { /* skip */ }
          }
          this.setData({ products });
        }
      }
    } catch (err) {
      wx.hideLoading();
      console.error(err);
    }
  },

  async removeFav(e) {
    const productId = e.currentTarget.dataset.id;
    try {
      await wx.cloud.callFunction({
        name: 'favorites',
        data: { action: 'remove', productId }
      });
      wx.showToast({ title: '已取消收藏', icon: 'success' });
      this.loadFavorites();
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  goToProduct(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/product-detail/product-detail?id=${id}` });
  }
});
