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
    products: [
      { id: 1, name: '夏季新款纯棉T恤', price: 99, originalPrice: 199, sales: 1000, image: '/images/product1.jpg' },
      { id: 2, name: '时尚休闲运动鞋', price: 299, originalPrice: 499, sales: 800, image: '/images/product2.jpg' },
      { id: 3, name: '轻薄透气防晒外套', price: 159, originalPrice: 299, sales: 600, image: '/images/product3.jpg' },
      { id: 4, name: '简约百搭牛仔裤', price: 129, originalPrice: 259, sales: 1200, image: '/images/product4.jpg' },
      { id: 5, name: '舒适棉质居家服', price: 89, originalPrice: 159, sales: 500, image: '/images/product5.jpg' },
      { id: 6, name: '潮流运动背包', price: 199, originalPrice: 399, sales: 700, image: '/images/product6.jpg' }
    ],
    hasMore: true
  },

  onLoad(options) {
    this.loadMoreProducts()
  },

  onPullDownRefresh() {
    wx.showLoading({ title: '刷新中...' })
    setTimeout(() => {
      wx.hideLoading()
      wx.stopPullDownRefresh()
      wx.showToast({ title: '刷新成功', icon: 'success' })
    }, 1000)
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.loadMoreProducts()
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
  },

  loadMoreProducts() {
    // 模拟加载更多
    const newProducts = [
      { id: 7, name: '时尚百搭连衣裙', price: 179, originalPrice: 329, sales: 400, image: '/images/product7.jpg' },
      { id: 8, name: '休闲百搭卫衣', price: 149, originalPrice: 279, sales: 900, image: '/images/product8.jpg' }
    ]

    this.setData({
      products: [...this.data.products, ...newProducts],
      hasMore: false
    })
  }
})
