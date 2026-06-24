// pages/merchant-aftersale/merchant-aftersale.js
Page({
  data: {
    list: [],
    activeTab: 'pending',
    showRejectModal: false,
    rejectAftersaleId: '',
    rejectReason: ''
  },

  onShow() {
    this.loadList();
  },

  async loadList() {
    wx.showLoading({ title: '加载中...' });
    const merchantInfo = wx.getStorageSync('merchantInfo') || {};
    try {
      const res = await wx.cloud.callFunction({
        name: 'aftersale',
        data: {
          action: 'merchantList',
          merchantId: merchantInfo.merchantId || ''
        }
      });
      wx.hideLoading();
      if (res.result && res.result.code === 0) {
        this.setData({ list: res.result.data.map(item => ({
          ...item,
          id: item._id,
          statusText: this.getStatusText(item.status),
          createTimeStr: item.createTime ? new Date(item.createTime).toLocaleString() : ''
        }))});
      }
    } catch (err) {
      wx.hideLoading();
      console.error('加载售后列表失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  getStatusText(status) {
    const map = {
      'pending': '待审核',
      'approved': '已同意',
      'rejected': '已拒绝(待管理员)',
      'admin_approved': '管理员同意',
      'admin_rejected': '管理员驳回'
    };
    return map[status] || status;
  },

  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
  },

  approveAftersale(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '同意售后',
      editable: true,
      placeholderText: '请输入同意原因（选填）',
      confirmText: '确认同意',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          try {
            const result = await wx.cloud.callFunction({
              name: 'aftersale',
              data: {
                action: 'merchantReview',
                aftersaleId: id,
                approved: true,
                merchantReply: res.content || '商家同意售后申请'
              }
            });
            wx.hideLoading();
            wx.showToast({ title: '已同意', icon: 'success' });
            this.loadList();
          } catch (err) {
            wx.hideLoading();
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  rejectAftersale(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      showRejectModal: true,
      rejectAftersaleId: id,
      rejectReason: ''
    });
  },

  onRejectReasonInput(e) {
    this.setData({ rejectReason: e.detail.value });
  },

  closeRejectModal() {
    this.setData({ showRejectModal: false, rejectAftersaleId: '', rejectReason: '' });
  },

  async confirmReject() {
    const evidence = this.data.rejectReason.trim() || '商家拒绝该售后申请';
    const id = this.data.rejectAftersaleId;
    this.setData({ showRejectModal: false });
    wx.showLoading({ title: '处理中...' });
    try {
      const result = await wx.cloud.callFunction({
        name: 'aftersale',
        data: {
          action: 'merchantReview',
          aftersaleId: id,
          approved: false,
          merchantReply: evidence,
          merchantEvidence: evidence
        }
      });
      wx.hideLoading();
      wx.showToast({ title: '已拒绝，等待管理员裁定', icon: 'success' });
      this.loadList();
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  }
});
