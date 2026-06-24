// pages/search/search.js
Page({
  data: {
    keyword: '',
    history: [],
    results: [],
    searched: false
  },

  onLoad() {
    const h = wx.getStorageSync('searchHistory') || [];
    this.setData({ history: h.slice(0, 10) });
  },

  onInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onClear() {
    this.setData({ keyword: '', results: [], searched: false });
  },

  async onSearch(e) {
    const kw = (e.detail.value || this.data.keyword).trim();
    if (!kw) {
      wx.showToast({ title: '请输入搜索关键词', icon: 'none' });
      return;
    }

    // 保存搜索历史
    let history = this.data.history.filter(h => h !== kw);
    history.unshift(kw);
    if (history.length > 10) history = history.slice(0, 10);
    wx.setStorageSync('searchHistory', history);
    this.setData({ history });

    wx.showLoading({ title: '搜索中...' });
    try {
      const res = await wx.cloud.callFunction({
        name: 'products',
        data: { keyword: kw, page: 1, pageSize: 20 }
      });
      wx.hideLoading();

      if (res.result && res.result.code === 0) {
        const list = res.result.data.list || [];
        this.setData({ results: list, searched: true });
        if (list.length === 0) {
          wx.showToast({ title: '未找到相关商品', icon: 'none' });
        }
      }
    } catch (err) {
      wx.hideLoading();
      console.error('搜索失败:', err);
      wx.showToast({ title: '搜索失败', icon: 'none' });
    }
  },

  tapHistory(e) {
    const kw = e.currentTarget.dataset.kw;
    this.setData({ keyword: kw });
    this.onSearch({ detail: { value: kw } });
  },

  clearHistory() {
    this.setData({ history: [] });
    wx.removeStorageSync('searchHistory');
  },

  goToProduct(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/product-detail/product-detail?id=${id}` });
  }
});
