// pages/admin-aftersale/admin-aftersale.js
Page({
  data: {
    list: [],
    activeTab: 'disputed'
  },

  onShow() {
    this.loadList();
  },

  async loadList() {
    wx.showLoading({ title: '加载中...' });
    try {
      // 加载有争议的（商家拒绝的）售后
      const disputedRes = await wx.cloud.callFunction({
        name: 'aftersale',
        data: { action: 'adminList', filter: 'pending' }
      });

      // 加载全部售后
      const allRes = await wx.cloud.callFunction({
        name: 'aftersale',
        data: { action: 'adminList', filter: 'all' }
      });

      wx.hideLoading();

      let disputedList = [];
      let allList = [];

      if (disputedRes.result && disputedRes.result.code === 0) {
        disputedList = disputedRes.result.data;
      }
      if (allRes.result && allRes.result.code === 0) {
        allList = allRes.result.data;
      }

      // 合并去重
      const disputedIds = new Set(disputedList.map(i => i._id));
      const onlyAll = allList.filter(i => !disputedIds.has(i._id));
      const fullList = [...disputedList, ...onlyAll];

      this.setData({
        list: fullList.map(item => ({
          ...item,
          id: item._id,
          statusText: this.getStatusText(item.status),
          createTimeStr: item.createTime ? new Date(item.createTime).toLocaleString() : ''
        }))
      });
    } catch (err) {
      wx.hideLoading();
      console.error('加载售后列表失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  getStatusText(status) {
    const map = {
      'pending': '待商家审核',
      'approved': '商家已同意',
      'rejected': '商家拒绝-待裁定',
      'admin_approved': '已裁定：同意',
      'admin_rejected': '已裁定：驳回'
    };
    return map[status] || status;
  },

  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
  },

  adminApprove(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '裁定：同意售后',
      editable: true,
      placeholderText: '请输入裁定理由（选填）',
      confirmText: '确认同意',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          try {
            await wx.cloud.callFunction({
              name: 'aftersale',
              data: {
                action: 'adminReview',
                aftersaleId: id,
                approved: true,
                adminReply: res.content || '管理员裁定同意售后'
              }
            });
            wx.hideLoading();
            wx.showToast({ title: '已裁定同意', icon: 'success' });
            this.loadList();
          } catch (err) {
            wx.hideLoading();
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  adminReject(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '裁定：驳回售后',
      editable: true,
      placeholderText: '请输入驳回理由',
      confirmText: '确认驳回',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          try {
            await wx.cloud.callFunction({
              name: 'aftersale',
              data: {
                action: 'adminReview',
                aftersaleId: id,
                approved: false,
                adminReply: res.content || '管理员驳回售后申请'
              }
            });
            wx.hideLoading();
            wx.showToast({ title: '已裁定驳回', icon: 'success' });
            this.loadList();
          } catch (err) {
            wx.hideLoading();
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  }
});
