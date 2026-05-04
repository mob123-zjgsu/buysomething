Page({
  data: {
    location: '上海·南京路',
    messageCount: 3,
    banners: [
      { id: 1, image: '/images/banner1.jpg' },
      { id: 2, image: '/images/banner2.jpg' },
      { id: 3, image: '/images/banner3.jpg' }
    ],
    functions: [
      { id: 1, name: '限时秒杀', icon: '⚡', type: 'seckill', bgColor: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)' },
      { id: 2, name: '今日特价', icon: '🏷️', type: 'discount', bgColor: 'linear-gradient(135deg, #4ECDC4 0%, #6EE7DE 100%)' },
      { id: 3, name: '新品上市', icon: '✨', type: 'new', bgColor: 'linear-gradient(135deg, #FFB347 0%, #FFD080 100%)' },
      { id: 4, name: '品牌好货', icon: '🎯', type: 'brand', bgColor: 'linear-gradient(135deg, #A855F7 0%, #C084FC 100%)' },
      { id: 5, name: '领券中心', icon: '🎫', type: 'coupon', bgColor: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)' },
      { id: 6, name: '签到有礼', icon: '🎁', type: 'checkin', bgColor: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)' }
    ],
    products: [],
    hasMore: true,
    page: 1,
    loading: false
  },

  onLoad(options) {
    console.log('首页加载，商品数量:', this.data.products.length)
    this.loadProducts()
  },

  onShow() {
    // 每次显示页面时刷新数据（仅第一页）
    if (this.data.page === 1) {
      this.loadProducts()
    }
  },

  // 加载商品列表
  async loadProducts() {
    if (this.data.loading) {
      console.log('正在加载中，跳过')
      return
    }
    
    this.setData({ loading: true })
    
    try {
      console.log('开始加载商品，页码:', this.data.page)
      
      const res = await wx.cloud.callFunction({
        name: 'products',
        data: {
          page: this.data.page,
          pageSize: 10
        }
      })
      
      console.log('商品加载结果:', res.result)
      
      if (res.result && res.result.code === 0) {
        const newProducts = res.result.data.list || []
        console.log('获取到商品数量:', newProducts.length)
        
        // 如果是第一页，直接设置；否则追加
        if (this.data.page === 1) {
          this.setData({ products: newProducts })
        } else {
          this.setData({ products: [...this.data.products, ...newProducts] })
        }
        
        // 判断是否还有更多
        const total = res.result.data.total || 0
        this.setData({ 
          hasMore: this.data.products.length < total 
        })
        
        console.log('当前商品总数:', this.data.products.length, '总商品数:', total)
      } else {
        console.error('获取商品列表失败:', res.result)
        wx.showToast({
          title: '加载失败，请下拉刷新',
          icon: 'none'
        })
      }
    } catch (err) {
      console.error('获取商品列表失败:', err)
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
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

  chooseLocation() {
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        console.log('当前位置:', res)
        wx.showToast({ title: '定位成功', icon: 'success' })
      },
      fail: () => {
        wx.showToast({ title: '定位失败', icon: 'none' })
      }
    })
  },

  goToSearch() {
    wx.showToast({ title: '搜索功能', icon: 'none' })
  },

  goToMessage() {
    wx.showToast({ title: '消息中心', icon: 'none' })
  },

  handleFunctionClick(e) {
    const type = e.currentTarget.dataset.type
    switch(type) {
      case 'seckill':
        wx.showToast({ title: '限时秒杀', icon: 'none' })
        break
      case 'discount':
        wx.showToast({ title: '今日特价', icon: 'none' })
        break
      case 'new':
        wx.showToast({ title: '新品上市', icon: 'none' })
        break
      case 'brand':
        wx.showToast({ title: '品牌好货', icon: 'none' })
        break
      case 'coupon':
        wx.showToast({ title: '领券中心', icon: 'none' })
        break
      case 'checkin':
        wx.showToast({ title: '签到有礼', icon: 'none' })
        break
    }
  },

  viewMore() {
    wx.navigateTo({
      url: '/pages/product-list/product-list?sort=hot'
    })
  },

  goToProductDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${id}`
    })
  }
})
