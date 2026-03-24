Page({
  data: {
    product: {
      id: 1,
      name: '夏季新款纯棉T恤',
      subtitle: '轻薄透气 吸汗排湿 舒适亲肤',
      price: 99,
      originalPrice: 199,
      discount: '5.0折',
      sales: 1000,
      rating: 4.8,
      reviewCount: 200,
      images: [
        '/images/product1.jpg',
        '/images/product2.jpg',
        '/images/product3.jpg',
        '/images/product4.jpg',
        '/images/product5.jpg'
      ],
      detailImages: [
        '/images/detail1.jpg',
        '/images/detail2.jpg',
        '/images/detail3.jpg'
      ],
      colors: ['红色', '黑色', '白色', '蓝色'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL']
    },
    selectedColor: '',
    selectedSize: '',
    selectedSpec: '',
    quantity: 1,
    showSpecModal: false,
    isFavorite: false
  },

  onLoad(options) {
    const id = options.id
    // 根据id加载商品详情
    console.log('商品ID:', id)
    this.loadProductDetail(id)
  },

  loadProductDetail(id) {
    // 模拟加载商品详情
    // 实际项目中应该从接口获取
    wx.showLoading({ title: '加载中...' })
    setTimeout(() => {
      wx.hideLoading()
    }, 500)
  },

  previewImage(e) {
    const index = e.currentTarget.dataset.index
    wx.previewImage({
      current: this.data.product.images[index],
      urls: this.data.product.images
    })
  },

  openSpecSelector() {
    this.setData({ showSpecModal: true })
  },

  closeSpecSelector() {
    this.setData({ showSpecModal: false })
  },

  selectColor(e) {
    const color = e.currentTarget.dataset.color
    this.setData({ selectedColor: color })
    this.updateSelectedSpec()
  },

  selectSize(e) {
    const size = e.currentTarget.dataset.size
    this.setData({ selectedSize: size })
    this.updateSelectedSpec()
  },

  updateSelectedSpec() {
    const { selectedColor, selectedSize } = this.data
    let selectedSpec = []
    if (selectedColor) selectedSpec.push(selectedColor)
    if (selectedSize) selectedSpec.push(selectedSize)
    this.setData({ selectedSpec: selectedSpec.join(' ') })
  },

  decreaseQuantity() {
    if (this.data.quantity > 1) {
      this.setData({ quantity: this.data.quantity - 1 })
    }
  },

  increaseQuantity() {
    this.setData({ quantity: this.data.quantity + 1 })
  },

  confirmSpec() {
    const { selectedColor, selectedSize } = this.data
    if (!selectedColor || !selectedSize) {
      wx.showToast({
        title: '请选择完整的规格',
        icon: 'none'
      })
      return
    }
    this.closeSpecSelector()
  },

  contactService() {
    wx.showModal({
      title: '联系客服',
      content: '确定要联系客服吗？',
      success(res) {
        if (res.confirm) {
          wx.showToast({ title: '正在连接客服...', icon: 'loading' })
        }
      }
    })
  },

  toggleFavorite() {
    this.setData({
      isFavorite: !this.data.isFavorite
    })
    wx.showToast({
      title: this.data.isFavorite ? '已收藏' : '已取消收藏',
      icon: 'success'
    })
  },

  addToCart() {
    if (!this.data.selectedColor || !this.data.selectedSize) {
      this.openSpecSelector()
      wx.showToast({
        title: '请先选择规格',
        icon: 'none'
      })
      return
    }

    // 添加到购物车
    const app = getApp()
    const cartCount = app.globalData.cartCount + this.data.quantity
    app.globalData.cartCount = cartCount

    wx.showToast({
      title: `已添加${this.data.quantity}件商品到购物车`,
      icon: 'success'
    })

    // 保存购物车数据到本地存储
    let cart = wx.getStorageSync('cart') || []
    const cartItem = {
      productId: this.data.product.id,
      name: this.data.product.name,
      price: this.data.product.price,
      image: this.data.product.images[0],
      color: this.data.selectedColor,
      size: this.data.selectedSize,
      quantity: this.data.quantity,
      selected: true
    }

    // 检查是否已存在相同规格的商品
    const existingIndex = cart.findIndex(item =>
      item.productId === cartItem.productId &&
      item.color === cartItem.color &&
      item.size === cartItem.size
    )

    if (existingIndex > -1) {
      cart[existingIndex].quantity += this.data.quantity
    } else {
      cart.push(cartItem)
    }

    wx.setStorageSync('cart', cart)
  },

  buyNow() {
    if (!this.data.selectedColor || !this.data.selectedSize) {
      this.openSpecSelector()
      wx.showToast({
        title: '请先选择规格',
        icon: 'none'
      })
      return
    }

    // 检查登录状态
    const app = getApp()
    if (!app.globalData.isLogin) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login'
        })
      }, 1000)
      return
    }

    // 创建订单
    const orderItem = {
      productId: this.data.product.id,
      name: this.data.product.name,
      price: this.data.product.price,
      image: this.data.product.images[0],
      color: this.data.selectedColor,
      size: this.data.selectedSize,
      quantity: this.data.quantity
    }

    // 保存订单信息
    wx.setStorageSync('pendingOrder', [orderItem])

    wx.navigateTo({
      url: '/pages/order-detail/order-detail?from=buyNow'
    })
  }
})
