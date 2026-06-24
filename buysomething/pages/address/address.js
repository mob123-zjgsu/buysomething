Page({
  data: {
    addresses: [],
    isSelectMode: false
  },

  onLoad(options) {
    const isSelectMode = options.from === 'order';
    this.setData({ isSelectMode });
    this.loadAddresses();
  },

  onShow() {
    this.loadAddresses();
  },

  async loadAddresses() {
    try {
      wx.showLoading({ title: '加载中...' });
      const res = await wx.cloud.callFunction({
        name: 'address',
        data: { action: 'list' }
      });
      wx.hideLoading();

      if (res.result && res.result.code === 0) {
        const list = (res.result.data || []).map(addr => ({
          id: addr._id,
          name: addr.name,
          phone: addr.phone,
          province: addr.province,
          city: addr.city,
          district: addr.district,
          detail: addr.detail,
          tag: addr.tag || '家',
          isDefault: addr.isDefault || false
        }));
        this.setData({ addresses: list });
      }
    } catch (err) {
      wx.hideLoading();
      console.error('加载地址失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  addAddress() {
    wx.navigateTo({
      url: '/pages/address-edit/address-edit'
    });
  },

  onAddressTap(e) {
    const id = e.currentTarget.dataset.id;
    if (this.data.isSelectMode) {
      const addr = this.data.addresses.find(a => a.id === id);
      if (addr) {
        wx.setStorageSync('selectedOrderAddress', addr);
        wx.navigateBack();
      }
    } else {
      this.editAddress(id);
    }
  },

  editAddress(idOrEvent) {
    const id = typeof idOrEvent === 'string' ? idOrEvent : idOrEvent.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/address-edit/address-edit?id=${id}`
    });
  },

  async deleteAddress(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个地址吗?',
      success: async (res) => {
        if (res.confirm) {
          try {
            await wx.cloud.callFunction({
              name: 'address',
              data: { action: 'delete', addressId: id }
            });
            wx.showToast({ title: '删除成功', icon: 'success' });
            this.loadAddresses();
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  },

  async setDefault(e) {
    const id = e.currentTarget.dataset.id;
    try {
      await wx.cloud.callFunction({
        name: 'address',
        data: { action: 'setDefault', addressId: id }
      });
      wx.showToast({ title: '已设为默认地址', icon: 'success' });
      this.loadAddresses();
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  }
});
