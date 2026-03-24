Page({
  data: {
    categoryName: '',
    activeFilter: 'all',
    priceSort: 'desc',
    products: [
      { id: 1, name: '夏季新款纯棉T恤', price: 99, originalPrice: 199, sales: 1000, rating: 4.8, tags: ['新品', '热销'], image: '/images/product1.jpg' },
      { id: 2, name: '时尚休闲运动鞋', price: 299, originalPrice: 499, sales: 800, rating: 4.9, tags: ['包邮'], image: '/images/product2.jpg' },
      { id: 3, name: '轻薄透气防晒外套', price: 159, originalPrice: 299, sales: 600, rating: 4.7, tags: [], image: '/images/product3.jpg' },
      { id: 4, name: '简约百搭牛仔裤', price: 129, originalPrice: 259, sales: 1200, rating: 4.6, tags: ['热销'], image: '/images/product4.jpg' },
      { id: 5, name: '舒适棉质居家服', price: 89, originalPrice: 159, sales: 500, rating: 4.5, tags: [], image: '/images/product5.jpg' },
      { id: 6, name: '潮流运动背包', price: 199, originalPrice: 399, sales: 700, rating: 4.8, tags: ['包邮'], image: '/images/product6.jpg' }
    ],
    hasMore: true,
    showFilter: false,
    minPrice: '',
    maxPrice: '',
    brands: ['耐克', '阿迪达斯', '李宁', '安踏', '彪马', '匡威'],
    selectedBrands: [],
    selectedRating: 0
  },

  onLoad(options) {
    if (options.category) {
      this.setData({ categoryName: options.category })
    }
    this.sortProducts()
  },

  goBack() {
    wx.navigateBack()
  },

  goToSearch() {
    wx.showToast({ title: '搜索功能', icon: 'none' })
  },

  showMenu() {
    wx.showToast({ title: '更多选项', icon: 'none' })
  },

  selectFilter(e) {
    const type = e.currentTarget.dataset.type
    if (type === 'price') {
      // 切换价格排序
      const newSort = this.data.priceSort === 'desc' ? 'asc' : 'desc'
      this.setData({
        activeFilter: type,
        priceSort: newSort
      })
      this.sortProducts()
    } else {
      this.setData({ activeFilter: type })
      this.sortProducts()
    }
  },

  sortProducts() {
    let products = [...this.data.products]
    const { activeFilter, priceSort } = this.data

    switch(activeFilter) {
      case 'sales':
        products.sort((a, b) => b.sales - a.sales)
        break
      case 'price':
        products.sort((a, b) => {
          return priceSort === 'asc' ? a.price - b.price : b.price - a.price
        })
        break
      case 'all':
        // 默认排序
        products.sort((a, b) => b.sales - a.sales)
        break
    }

    this.setData({ products })
  },

  openFilterDrawer() {
    this.setData({ showFilter: true })
  },

  closeFilterDrawer() {
    this.setData({ showFilter: false })
  },

  onMinPriceChange(e) {
    this.setData({ minPrice: e.detail.value })
  },

  onMaxPriceChange(e) {
    this.setData({ maxPrice: e.detail.value })
  },

  toggleBrand(e) {
    const brand = e.currentTarget.dataset.brand
    let selectedBrands = [...this.data.selectedBrands]
    const index = selectedBrands.indexOf(brand)
    if (index > -1) {
      selectedBrands.splice(index, 1)
    } else {
      selectedBrands.push(brand)
    }
    this.setData({ selectedBrands })
  },

  selectRating(e) {
    const rating = e.currentTarget.dataset.rating
    this.setData({
      selectedRating: this.data.selectedRating === rating ? 0 : rating
    })
  },

  resetFilter() {
    this.setData({
      minPrice: '',
      maxPrice: '',
      selectedBrands: [],
      selectedRating: 0
    })
  },

  applyFilter() {
    this.closeFilterDrawer()
    this.applyFilters()
    wx.showToast({ title: '筛选已应用', icon: 'success' })
  },

  applyFilters() {
    let products = [...this.data.products]

    // 价格筛选
    if (this.data.minPrice) {
      products = products.filter(p => p.price >= parseFloat(this.data.minPrice))
    }
    if (this.data.maxPrice) {
      products = products.filter(p => p.price <= parseFloat(this.data.maxPrice))
    }

    // 评分筛选
    if (this.data.selectedRating > 0) {
      products = products.filter(p => p.rating >= this.data.selectedRating)
    }

    this.setData({ products })
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.loadMoreProducts()
    }
  },

  loadMoreProducts() {
    // 模拟加载更多
    wx.showToast({ title: '加载中...', icon: 'loading' })
    setTimeout(() => {
      const newProducts = [
        { id: 7, name: '时尚百搭连衣裙', price: 179, originalPrice: 329, sales: 400, rating: 4.9, tags: ['新品'], image: '/images/product7.jpg' },
        { id: 8, name: '休闲百搭卫衣', price: 149, originalPrice: 279, sales: 900, rating: 4.7, tags: [], image: '/images/product8.jpg' }
      ]
      this.setData({
        products: [...this.data.products, ...newProducts],
        hasMore: false
      })
    }, 1000)
  },

  goToProductDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${id}`
    })
  }
})
