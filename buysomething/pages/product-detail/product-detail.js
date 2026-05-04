Page({
  data: {
    product: {
      name: '商品',
      price: 0,
      originalPrice: 0,
      images: ['/images/product1.jpg'],
      colors: [],
      sizes: []
    },
    selectedColor: '',
    selectedSize: '',
    selectedSpec: '',
    quantity: 1,
    showSpecModal: false,
    isFavorite: false,
    loading: true
  },

  onLoad(options) {
    const id = options.id;
    console.log('商品详情页加载，商品ID:', id);
    
    if (!id) {
      console.error('商品ID为空');
      wx.showToast({
        title: '商品不存在',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }
    
    this.loadProductDetail(id);
  },

  // 加载商品详情
  async loadProductDetail(productId) {
    this.setData({ loading: true });
    
    try {
      console.log('开始加载商品详情，ID:', productId);
      
      const res = await wx.cloud.callFunction({
        name: 'product-detail',
        data: {
          productId: productId
        }
      });
      
      console.log('商品详情加载结果:', res.result);
      
      if (res.result && res.result.code === 0) {
        const product = res.result.data;
        
        console.log('商品数据:', product.name, '规格:', product.specs);
        
        // 设置商品数据
        this.setData({
          product: {
            productId: product.productId,
            name: product.name,
            subtitle: product.description || '',
            price: product.price,
            originalPrice: product.originalPrice || 0,
            discount: product.originalPrice 
              ? (product.price / product.originalPrice * 10).toFixed(1) + '折'
              : '',
            sales: product.sales || 0,
            rating: product.rating || 5,
            reviewCount: product.reviewCount || 0,
            image: product.image || (product.images && product.images[0]) || '/images/product1.jpg',
            images: product.images && product.images.length > 0 ? product.images : [product.image || '/images/product1.jpg'],
            detailImages: product.detailImages || [],
            colors: product.specs?.colors || [],
            sizes: product.specs?.sizes || [],
            stock: product.stock || 0
          },
          selectedColor: '',
          selectedSize: '',
          selectedSpec: '',
          quantity: 1
        });
        
        console.log('商品数据已设置，规格:', this.data.product.colors, this.data.product.sizes);
      } else {
        console.error('获取商品详情失败:', res.result);
        wx.showToast({
          title: res.result?.message || '商品不存在',
          icon: 'none'
        });
      }
    } catch (err) {
      console.error('获取商品详情失败:', err);
      wx.showToast({
        title: '加载失败，请返回重试',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  previewImage(e) {
    const index = e.currentTarget.dataset.index;
    wx.previewImage({
      current: this.data.product.images[index],
      urls: this.data.product.images
    });
  },

  openSpecSelector() {
    this.setData({ showSpecModal: true });
  },

  closeSpecSelector() {
    this.setData({ showSpecModal: false });
  },

  selectColor(e) {
    const color = e.currentTarget.dataset.color;
    this.setData({ selectedColor: color });
    this.updateSelectedSpec();
  },

  selectSize(e) {
    const size = e.currentTarget.dataset.size;
    this.setData({ selectedSize: size });
    this.updateSelectedSpec();
  },

  updateSelectedSpec() {
    const { selectedColor, selectedSize } = this.data;
    let selectedSpec = [];
    if (selectedColor) selectedSpec.push(selectedColor);
    if (selectedSize) selectedSpec.push(selectedSize);
    this.setData({ selectedSpec: selectedSpec.join(' ') });
  },

  decreaseQuantity() {
    if (this.data.quantity > 1) {
      this.setData({ quantity: this.data.quantity - 1 });
    }
  },

  increaseQuantity() {
    this.setData({ quantity: this.data.quantity + 1 });
  },

  confirmSpec() {
    const { selectedColor, selectedSize, product } = this.data;
    
    // 检查是否需要选择规格
    const hasColors = product.colors && product.colors.length > 0;
    const hasSizes = product.sizes && product.sizes.length > 0;
    
    // 如果有颜色选项但未选择
    if (hasColors && !selectedColor) {
      wx.showToast({
        title: '请选择颜色',
        icon: 'none'
      });
      return;
    }
    
    // 如果有尺寸选项但未选择
    if (hasSizes && !selectedSize) {
      wx.showToast({
        title: '请选择尺寸',
        icon: 'none'
      });
      return;
    }
    
    this.closeSpecSelector();
  },

  contactService() {
    // 跳转到智能客服页面，携带商品信息
    const productInfo = {
      name: this.data.product.name,
      price: this.data.product.price,
      image: this.data.product.image,
      colors: this.data.product.colors,
      sizes: this.data.product.sizes,
      subtitle: this.data.product.subtitle
    };
    
    wx.navigateTo({
      url: `/pages/chat/chat?productInfo=${encodeURIComponent(JSON.stringify(productInfo))}`
    });
  },

  toggleFavorite() {
    this.setData({
      isFavorite: !this.data.isFavorite
    });
    wx.showToast({
      title: this.data.isFavorite ? '已收藏' : '已取消收藏',
      icon: 'success'
    });
  },

  addToCart() {
    const { selectedColor, selectedSize, product, quantity } = this.data;
    
    console.log('addToCart 开始执行，商品数据:', product);
    
    // 检查是否需要选择规格
    const hasColors = product.colors && product.colors.length > 0;
    const hasSizes = product.sizes && product.sizes.length > 0;
    
    // 如果有颜色选项但未选择，自动选择第一个
    if (hasColors && !selectedColor) {
      this.setData({ selectedColor: product.colors[0] });
    }
    
    // 如果有尺寸选项但未选择，自动选择第一个
    if (hasSizes && !selectedSize) {
      this.setData({ selectedSize: product.sizes[0] });
    }

    const app = getApp();
    const cartCount = app.globalData.cartCount + quantity;
    app.globalData.cartCount = cartCount;

    // 保存购物车数据到本地存储
    let cart = wx.getStorageSync('cart') || [];
    // 使用转换后的 image 字段，避免使用外部图片链接
    const cartItem = {
      productId: product.productId,
      name: product.name,
      price: product.price,
      image: product.image || product.images[0] || '/images/product1.jpg',
      color: selectedColor || '',
      size: selectedSize || '',
      quantity: quantity,
      selected: true
    };
    
    console.log('购物车商品项:', cartItem);

    // 检查是否已存在相同规格的商品
    const existingIndex = cart.findIndex(item =>
      item.productId === cartItem.productId &&
      item.color === cartItem.color &&
      item.size === cartItem.size
    );

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push(cartItem);
    }

    wx.setStorageSync('cart', cart);
    console.log('购物车已保存，当前购物车:', cart);
    
    wx.showToast({
      title: `已添加${quantity}件商品到购物车`,
      icon: 'success'
    });
  },

  buyNow() {
    const { selectedColor, selectedSize, product, quantity } = this.data;
    
    // 检查是否需要选择规格
    const hasColors = product.colors && product.colors.length > 0;
    const hasSizes = product.sizes && product.sizes.length > 0;
    
    // 如果有颜色选项但未选择
    if (hasColors && !selectedColor) {
      this.openSpecSelector();
      wx.showToast({
        title: '请选择颜色',
        icon: 'none'
      });
      return;
    }
    
    // 如果有尺寸选项但未选择
    if (hasSizes && !selectedSize) {
      this.openSpecSelector();
      wx.showToast({
        title: '请选择尺寸',
        icon: 'none'
      });
      return;
    }

    // 检查登录状态
    const app = getApp();
    if (!app.globalData.isLogin) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login'
        });
      }, 1000);
      return;
    }

    // 创建订单
    const orderItem = {
      productId: product.productId,
      name: product.name,
      price: product.price,
      image: product.image || product.images[0] || '/images/product1.jpg',
      color: selectedColor || '',
      size: selectedSize || '',
      quantity: quantity
    };

    // 保存订单信息
    wx.setStorageSync('pendingOrder', [orderItem]);

    wx.navigateTo({
      url: '/pages/order-detail/order-detail?from=buyNow'
    });
  }
});
