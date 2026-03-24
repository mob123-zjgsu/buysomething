Page({
  data: {
    addresses: []
  },

  onLoad(options) {
    this.loadAddresses()
  },

  loadAddresses() {
    // 模拟加载地址列表
    const mockAddresses = [
      {
        id: '1',
        name: '张三',
        phone: '138****1234',
        province: '上海市',
        city: '上海市',
        district: '浦东新区',
        detail: '南京路100号',
        tag: '家',
        isDefault: true
      },
      {
        id: '2',
        name: '张三',
        phone: '138****1234',
        province: '上海市',
        city: '上海市',
        district: '黄浦区',
        detail: '人民广场200号',
        tag: '公司',
        isDefault: false
      }
    ]

    this.setData({ addresses: mockAddresses })
  },

  addAddress() {
    wx.showToast({
      title: '添加地址',
      icon: 'none'
    })
  },

  editAddress(e) {
    const id = e.currentTarget.dataset.id
    wx.showToast({
      title: '编辑地址',
      icon: 'none'
    })
  },

  deleteAddress(e) {
    const id = e.currentTarget.dataset.id

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个地址吗?',
      success: (res) => {
        if (res.confirm) {
          const addresses = this.data.addresses.filter(addr => addr.id !== id)
          this.setData({ addresses })
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  setDefault(e) {
    const id = e.currentTarget.dataset.id
    const addresses = this.data.addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    }))
    this.setData({ addresses })
    wx.showToast({
      title: '已设为默认地址',
      icon: 'success'
    })
  }
})
