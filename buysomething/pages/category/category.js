Page({
  data: {
    activeIndex: 0,
    categories: [
      { id: 1, name: '推荐' },
      { id: 2, name: '女装' },
      { id: 3, name: '男装' },
      { id: 4, name: '内衣' },
      { id: 5, name: '母婴' },
      { id: 6, name: '美妆' },
      { id: 7, name: '鞋靴' },
      { id: 8, name: '箱包' },
      { id: 9, name: '运动' },
      { id: 10, name: '家居' }
    ],
    subcategories: [
      {
        name: '热门分类',
        items: [
          { id: 1, name: 'T恤', image: '/images/category1.jpg' },
          { id: 2, name: '连衣裙', image: '/images/category2.jpg' },
          { id: 3, name: '运动鞋', image: '/images/category3.jpg' },
          { id: 4, name: '休闲裤', image: '/images/category4.jpg' },
          { id: 5, name: '外套', image: '/images/category5.jpg' },
          { id: 6, name: '卫衣', image: '/images/category6.jpg' }
        ]
      },
      {
        name: '全部商品',
        items: [
          { id: 7, name: '上衣', image: '/images/category7.jpg' },
          { id: 8, name: '裤子', image: '/images/category8.jpg' },
          { id: 9, name: '裙子', image: '/images/category9.jpg' }
        ]
      }
    ]
  },

  selectCategory(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ activeIndex: index });
  },

  goToProductList(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/product-list/product-list?categoryId=${id}`
    });
  }
});
