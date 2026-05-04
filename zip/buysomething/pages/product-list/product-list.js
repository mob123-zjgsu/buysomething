Page({
  data: {
    categoryName: '',
    activeFilter: 'all',
    priceSort: 'desc',
    products: [],
    hasMore: true,
    showFilter: false,
    minPrice: '',
    maxPrice: '',
    brands: ['耐克', '阿迪达斯', '李宁', '安踏', '彪马', '匡威'],
    selectedBrands: [],
    selectedRating: 0,
    page: 1,
    pageSize: 20,
    loading: false,
    sort: ''
  },

  onLoad(options) {
    if (options.category) {
      this.setData({ categoryName: options.category })
    }
    if (options.sort) {
      this.setData({ 
        sort: options.sort,
        activeFilter: options.sort === 'hot' ? 'sales' : options.sort
      })
    }
    this.loadProducts()
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.onPullDownRefresh()
  },

  // 加载商品列表
  async loadProducts() {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'products',
        data: {
          page: this.data.page,
          pageSize: this.data.pageSize,
          categoryId: this.data.categoryId,
          keyword: this.data.keyword,
          sort: this.getSortParam()
        }
      })
      
      if (res.result && res.result.code === 0) {
        const newProducts = res.result.data.list || []
        
        if (this.data.page === 1) {
          this.setData({ products: newProducts })
        } else {
          this.setData({ products: [...this.data.products, ...newProducts] })
        }
        
        const total = res.result.data.total || 0
        this.setData({ 
          hasMore: this.data.products.length < total 
        })
      }
    } catch (err) {
      console.error('获取商品列表失败:', err)
    } finally {
      this.setData({ loading: false })
    }
  },

  // 获取排序参数
  getSortParam() {
    const { activeFilter, priceSort } = this.data
    if (activeFilter === 'price') {
      return priceSort === 'asc' ? 'price_asc' : 'price_desc'
    }
    if (activeFilter === 'sales') {
      return 'sales'
    }
    return ''
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true })
    this.loadProducts().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 })
      this.loadProducts()
    }
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
      const newSort = this.data.priceSort === 'desc' ? 'asc' : 'desc'
      this.setData({
        activeFilter: type,
        priceSort: newSort
      })
    } else {
      this.setData({ activeFilter: type })
    }
    // 重新加载商品
    this.setData({ page: 1 })
    this.loadProducts()
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
    this.setData({ page: 1 })
    this.loadProducts()
    wx.showToast({ title: '筛选已应用', icon: 'success' })
  },

  goToProductDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${id}`
    })
  }
})
