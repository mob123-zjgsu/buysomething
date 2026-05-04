Page({
  data: {
    selectedApi: '',
    loading: false,
    response: null,
    responseStr: '',
    testHistory: [],

    // 各API参数
    registerParams: {
      phone: '',
      code: '123456',
      password: ''
    },
    loginParams: {
      phone: '',
      password: ''
    },
    productsParams: {
      page: 1,
      pageSize: 10
    },
    productDetailParams: {
      productId: ''
    },
    deleteParams: {
      productId: ''
    }
  },

  onLoad() {
    // 加载测试历史
    const history = wx.getStorageSync('apiTestHistory') || [];
    this.setData({ testHistory: history });
  },

  // 选择API
  selectApi(e) {
    const api = e.currentTarget.dataset.api;
    this.setData({
      selectedApi: api,
      response: null,
      responseStr: ''
    });
  },

  // 更新参数
  updateParam(e) {
    const key = e.currentTarget.dataset.key;
    const value = e.detail.value;

    switch (this.data.selectedApi) {
    case 'register':
      this.setData({
        [`registerParams.${key}`]: value
      });
      break;
    case 'login':
      this.setData({
        [`loginParams.${key}`]: value
      });
      break;
    case 'products':
      this.setData({
        [`productsParams.${key}`]: value
      });
      break;
    case 'product-detail':
      this.setData({
        [`productDetailParams.${key}`]: value
      });
      break;
    case 'delete-product':
      this.setData({
        [`deleteParams.${key}`]: value
      });
      break;
    }
  },

  // 发送请求
  async sendRequest() {
    if (!this.data.selectedApi) {
      wx.showToast({ title: '请先选择API', icon: 'none' });
      return;
    }

    this.setData({ loading: true, response: null });

    try {
      let res, apiName, params;

      switch (this.data.selectedApi) {
      case 'register':
        apiName = '用户注册';
        params = this.data.registerParams;
        res = await wx.cloud.callFunction({
          name: 'register',
          data: params
        });
        break;

      case 'login':
        apiName = '用户登录';
        params = this.data.loginParams;
        res = await wx.cloud.callFunction({
          name: 'login',
          data: params
        });
        break;

      case 'products':
        apiName = '获取商品列表';
        params = {
          page: parseInt(this.data.productsParams.page) || 1,
          pageSize: parseInt(this.data.productsParams.pageSize) || 10
        };
        res = await wx.cloud.callFunction({
          name: 'products',
          data: params
        });
        break;

      case 'product-detail':
        apiName = '获取商品详情';
        params = {
          productId: this.data.productDetailParams.productId
        };
        res = await wx.cloud.callFunction({
          name: 'product-detail',
          data: params
        });
        break;

      case 'delete-product':
        apiName = '删除商品';
        params = {
          productId: this.data.deleteParams.productId
        };
        // 确认删除
        const confirm = await wx.showModal({
          title: '确认删除',
          content: '确定要删除此商品吗？此操作不可恢复！',
          confirmText: '删除',
          confirmColor: '#FF6B6B'
        });
        if (!confirm.confirm) {
          this.setData({ loading: false });
          return;
        }
        res = await wx.cloud.callFunction({
          name: 'delete-product',
          data: params
        });
        break;
      }

      const result = res.result || {};
      const success = result.success !== false && result.code !== undefined && result.code === 0;

      this.setData({
        response: result,
        responseStr: JSON.stringify(result, null, 2)
      });

      // 添加到历史记录
      this.addToHistory(apiName, success, result.message || result.error?.message || '');

      wx.showToast({
        title: success ? '请求成功' : '请求失败',
        icon: success ? 'success' : 'none'
      });

    } catch (err) {
      console.error('API请求失败:', err);
      const errorResult = {
        success: false,
        message: '请求失败: ' + (err.message || err.errMsg || '未知错误')
      };
      this.setData({
        response: errorResult,
        responseStr: JSON.stringify(err, null, 2)
      });
      this.addToHistory(this.getApiName(this.data.selectedApi), false, err.message || '未知错误');
    } finally {
      this.setData({ loading: false });
    }
  },

  // 获取API中文名
  getApiName(api) {
    const names = {
      'register': '用户注册',
      'login': '用户登录',
      'products': '获取商品列表',
      'product-detail': '获取商品详情',
      'delete-product': '删除商品'
    };
    return names[api] || api;
  },

  // 添加到历史记录
  addToHistory(apiName, success, message) {
    const history = this.data.testHistory;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    history.unshift({
      api: apiName,
      success: success,
      message: message || '',
      time: time
    });

    // 只保留最近20条记录
    if (history.length > 20) {
      history.pop();
    }

    this.setData({ testHistory: history });
    wx.setStorageSync('apiTestHistory', history);
  }
});
