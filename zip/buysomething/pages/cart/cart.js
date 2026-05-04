Page({
  data: {
    cartItems: [],
    groupedCart: [],
    isEditMode: false,
    allSelected: false,
    totalPrice: 0,
    selectedCount: 0
  },

  onLoad(options) {
    this.loadCart()
  },

  onShow() {
    this.loadCart()
  },

  loadCart() {
    const cart = wx.getStorageSync('cart') || []
    console.log('购物车页面加载，读取到的数据:', cart)
    this.setData({ cartItems: cart })
    this.groupCartByShop()
    this.calculateTotal()
  },

  groupCartByShop() {
    console.log('groupCartByShop 开始执行，cartItems:', this.data.cartItems)
    
    // 模拟按店铺分组
    const grouped = [
      {
        shopId: '1',
        shopName: '优选自营',
        allSelected: false,
        products: this.data.cartItems.map((item, index) => ({
          ...item,
          uniqueId: `${item.productId}_${item.color}_${item.size}`,
          selected: item.selected || false
        }))
      }
    ]
    
    console.log('分组后的商品:', grouped[0]?.products)

    // 检查每个店铺是否全选
    grouped.forEach(shop => {
      shop.allSelected = shop.products.every(p => p.selected)
    })

    // 检查是否全选
    const allSelected = grouped.every(shop => shop.allSelected)

    this.setData({ groupedCart: grouped, allSelected })
  },

  toggleEditMode() {
    this.setData({
      isEditMode: !this.data.isEditMode
    })
  },

  toggleShopSelect(e) {
    const shopId = e.currentTarget.dataset.shopId
    const groupedCart = [...this.data.groupedCart]
    const shopIndex = groupedCart.findIndex(s => s.shopId === shopId)

    if (shopIndex > -1) {
      const newSelected = !groupedCart[shopIndex].allSelected
      groupedCart[shopIndex].allSelected = newSelected
      groupedCart[shopIndex].products.forEach(p => {
        p.selected = newSelected
      })

      // 更新所有店铺的全选状态
      const allSelected = groupedCart.every(s => s.allSelected)

      this.setData({ groupedCart, allSelected })
      this.updateCartStorage()
      this.calculateTotal()
    }
  },

  toggleItemSelect(e) {
    const shopId = e.currentTarget.dataset.shopId
    const productId = e.currentTarget.dataset.productId
    const groupedCart = [...this.data.groupedCart]

    const shopIndex = groupedCart.findIndex(s => s.shopId === shopId)
    if (shopIndex > -1) {
      const productIndex = groupedCart[shopIndex].products.findIndex(p => p.uniqueId === productId)
      if (productIndex > -1) {
        groupedCart[shopIndex].products[productIndex].selected = !groupedCart[shopIndex].products[productIndex].selected

        // 更新店铺全选状态
        groupedCart[shopIndex].allSelected = groupedCart[shopIndex].products.every(p => p.selected)

        // 更新全局全选状态
        const allSelected = groupedCart.every(s => s.allSelected)

        this.setData({ groupedCart, allSelected })
        this.updateCartStorage()
        this.calculateTotal()
      }
    }
  },

  toggleSelectAll() {
    const newSelected = !this.data.allSelected
    const groupedCart = [...this.data.groupedCart]

    groupedCart.forEach(shop => {
      shop.allSelected = newSelected
      shop.products.forEach(p => {
        p.selected = newSelected
      })
    })

    this.setData({ groupedCart, allSelected: newSelected })
    this.updateCartStorage()
    this.calculateTotal()
  },

  decreaseQuantity(e) {
    const shopId = e.currentTarget.dataset.shopId
    const productId = e.currentTarget.dataset.productId
    const groupedCart = [...this.data.groupedCart]

    const shopIndex = groupedCart.findIndex(s => s.shopId === shopId)
    if (shopIndex > -1) {
      const productIndex = groupedCart[shopIndex].products.findIndex(p => p.uniqueId === productId)
      if (productIndex > -1) {
        const product = groupedCart[shopIndex].products[productIndex]
        if (product.quantity > 1) {
          product.quantity--
          this.setData({ groupedCart })
          this.updateCartStorage()
          this.calculateTotal()
        }
      }
    }
  },

  increaseQuantity(e) {
    const shopId = e.currentTarget.dataset.shopId
    const productId = e.currentTarget.dataset.productId
    const groupedCart = [...this.data.groupedCart]

    const shopIndex = groupedCart.findIndex(s => s.shopId === shopId)
    if (shopIndex > -1) {
      const productIndex = groupedCart[shopIndex].products.findIndex(p => p.uniqueId === productId)
      if (productIndex > -1) {
        const product = groupedCart[shopIndex].products[productIndex]
        product.quantity++
        this.setData({ groupedCart })
        this.updateCartStorage()
        this.calculateTotal()
      }
    }
  },

  updateCartStorage() {
    // 将分组后的数据展平并保存
    const cartItems = []
    this.data.groupedCart.forEach(shop => {
      shop.products.forEach(product => {
        cartItems.push({
          productId: product.productId,
          name: product.name,
          price: product.price,
          image: product.image,
          color: product.color,
          size: product.size,
          quantity: product.quantity,
          selected: product.selected
        })
      })
    })
    this.setData({ cartItems })
    wx.setStorageSync('cart', cartItems)
  },

  calculateTotal() {
    let totalPrice = 0
    let selectedCount = 0

    this.data.groupedCart.forEach(shop => {
      shop.products.forEach(product => {
        if (product.selected) {
          totalPrice += product.price * product.quantity
          selectedCount += product.quantity
        }
      })
    })

    this.setData({
      totalPrice: totalPrice.toFixed(2),
      selectedCount
    })
  },

  goToShopping() {
    wx.switchTab({
      url: '/pages/home/home'
    })
  },

  goToProductDetail(e) {
    const id = e.currentTarget.dataset.id
    console.log('点击商品，ID:', id)
    if (!id) {
      wx.showToast({ title: '商品信息不完整', icon: 'none' })
      return
    }
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${id}`
    })
  },

  handleCheckout() {
    if (this.data.selectedCount === 0) {
      wx.showToast({
        title: '请先选择商品',
        icon: 'none'
      })
      return
    }

    if (this.data.isEditMode) {
      // 删除选中的商品
      wx.showModal({
        title: '确认删除',
        content: `确定要删除选中的${this.data.selectedCount}件商品吗?`,
        success: (res) => {
          if (res.confirm) {
            this.deleteSelectedItems()
          }
        }
      })
    } else {
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

      // 结算
      const selectedProducts = []
      this.data.groupedCart.forEach(shop => {
        shop.products.forEach(product => {
          if (product.selected) {
            selectedProducts.push(product)
          }
        })
      })

      wx.setStorageSync('pendingOrder', selectedProducts)

      wx.navigateTo({
        url: '/pages/order-detail/order-detail?from=cart'
      })
    }
  },

  deleteSelectedItems() {
    const groupedCart = [...this.data.groupedCart]

    groupedCart.forEach(shop => {
      shop.products = shop.products.filter(p => !p.selected)
    })

    // 移除空店铺
    const filteredCart = groupedCart.filter(shop => shop.products.length > 0)

    this.setData({ groupedCart: filteredCart })
    this.updateCartStorage()
    this.calculateTotal()
    this.groupCartByShop()

    // 更新购物车数量
    const app = getApp()
    let cartCount = 0
    filteredCart.forEach(shop => {
      shop.products.forEach(p => {
        cartCount += p.quantity
      })
    })
    app.globalData.cartCount = cartCount

    wx.showToast({
      title: '删除成功',
      icon: 'success'
    })
  }
})
