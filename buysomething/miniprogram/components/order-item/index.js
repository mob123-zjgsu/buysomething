// components/order-item/index.js
Component({
  properties: {
    // 订单数据
    order: {
      type: Object,
      value: {}
    },
    // 订单类型: normal / simple
    mode: {
      type: String,
      value: 'normal'
    }
  },

  data: {
    // 状态映射
    statusMap: {
      pending: '待付款',
      paid: '待发货',
      shipped: '待收货',
      received: '待评价',
      completed: '已完成',
      cancelled: '已取消',
      refund: '退款/售后'
    },
    // 状态颜色
    statusColorMap: {
      pending: '#FF9800',
      paid: '#4ECDC4',
      shipped: '#4ECDC4',
      received: '#FF6B6B',
      completed: '#999999',
      cancelled: '#999999',
      refund: '#FF9800'
    }
  },

  methods: {
    // 点击订单
    onTap() {
      const orderId = this.data.order.orderId
      if (orderId) {
        wx.navigateTo({
          url: `/pages/order-detail/order-detail?orderId=${orderId}`
        })
      }
      this.triggerEvent('tap', this.data.order)
    },

    // 再次购买
    onBuyAgain(e) {
      e.stopPropagation()
      this.triggerEvent('buyagain', this.data.order)
    },

    // 查看物流
    onViewLogistics(e) {
      e.stopPropagation()
      this.triggerEvent('logistics', this.data.order)
    },

    // 确认收货
    onConfirmReceive(e) {
      e.stopPropagation()
      wx.showModal({
        title: '确认收货',
        content: '确认已收到商品？',
        success: (res) => {
          if (res.confirm) {
            this.triggerEvent('confirmreceive', this.data.order)
          }
        }
      })
    },

    // 去付款
    onPay(e) {
      e.stopPropagation()
      this.triggerEvent('pay', this.data.order)
    },

    // 取消订单
    onCancel(e) {
      e.stopPropagation()
      wx.showModal({
        title: '取消订单',
        content: '确定要取消此订单？',
        success: (res) => {
          if (res.confirm) {
            this.triggerEvent('cancel', this.data.order)
          }
        }
      })
    }
  }
})
