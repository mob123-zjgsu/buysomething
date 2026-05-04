// components/empty-state/index.js
Component({
  properties: {
    // 图标类型: cart / order / search / network / error / custom
    type: {
      type: String,
      value: 'cart'
    },
    // 自定义图片
    image: {
      type: String,
      value: ''
    },
    // 标题文字
    title: {
      type: String,
      value: ''
    },
    // 描述文字
    description: {
      type: String,
      value: ''
    },
    // 按钮文字
    buttonText: {
      type: String,
      value: ''
    }
  },

  data: {
    // 默认图标映射
    defaultImages: {
      cart: '/images/empty-cart.png',
      order: '/images/empty-order.png',
      search: '/images/empty-search.png',
      network: '/images/network-error.png',
      error: '/images/error.png'
    }
  },

  methods: {
    // 点击按钮
    onButtonTap() {
      this.triggerEvent('buttontap')
    }
  }
})
