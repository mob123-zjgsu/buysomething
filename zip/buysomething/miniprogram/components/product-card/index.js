// components/product-card/index.js
Component({
  properties: {
    // 商品数据
    product: {
      type: Object,
      value: {}
    },
    // 是否显示原价
    showOriginalPrice: {
      type: Boolean,
      value: true
    },
    // 是否显示折扣标签
    showDiscount: {
      type: Boolean,
      value: true
    },
    // 是否显示销量
    showSales: {
      type: Boolean,
      value: true
    }
  },

  methods: {
    // 点击商品卡片
    onTap() {
      const productId = this.data.product.productId
      if (productId) {
        wx.navigateTo({
          url: `/pages/product-detail/product-detail?id=${productId}`
        })
      }
    },

    // 添加到购物车
    onAddCart(e) {
      e.stopPropagation()
      this.triggerEvent('addcart', this.data.product)
    },

    // 收藏/取消收藏
    onFavorite(e) {
      e.stopPropagation()
      this.triggerEvent('favorite', this.data.product)
    }
  }
})
