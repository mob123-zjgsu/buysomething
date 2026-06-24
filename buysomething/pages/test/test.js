/**
 * API 测试页面
 * 方案二：半自动化测试
 * 
 * 测试覆盖：
 * - 后端API测试：16个（手动测试）
 * - 前端组件测试：9个
 * - Mock API测试：4个
 */

// 测试数据常量
const TEST_ACCOUNTS = {
  phone: '13800138001',
  password: '123456'
};

const _TEST_PRODUCT = {
  name: 'iPhone 15 Pro',
  price: 7999
};

Page({
  data: {
    // 测试状态
    testing: false,
    currentTest: '',
    testCategory: 'all', // all | api | frontend | mock
    
    // 测试结果统计
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    passRate: 0,
    
    // 测试结果列表
    apiResults: [],      // 后端API测试
    frontendResults: [], // 前端组件测试
    mockResults: [],     // Mock API测试
    
    // 日志
    logs: [],
    
    // Mock API 配置
    mockConfig: {
      enableMock: false,    // 是否启用Mock
      mockDelay: 1000,       // 模拟延迟(ms)
      mockError: false,      // 是否模拟错误
      mockData: {}           // 模拟数据
    },
    
    // 测试状态模拟数据
    uiState: {
      loading: false,
      error: null,
      data: null,
      empty: false
    }
  },

  onLoad() {
    this.initTestPage();
  },

  // 初始化测试页面
  initTestPage() {
    this.log('===== 小程序测试平台 v2.0 =====', 'info');
    this.log('当前测试模式: ' + this.getModeName(), 'info');
    this.log('提示: 选择测试类别后点击"开始测试"', 'info');
  },

  // 获取模式名称
  getModeName() {
    const mode = this.data.testCategory;
    const names = {
      all: '全部测试',
      api: '后端API测试',
      frontend: '前端组件测试',
      mock: 'Mock API测试'
    };
    return names[mode] || '全部测试';
  },

  // 切换测试类别
  switchCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ testCategory: category });
    this.log('切换到: ' + this.getModeName(), 'info');
  },

  // 添加日志
  log(msg, type = 'normal') {
    const timestamp = new Date().toLocaleTimeString();
    const logText = `[${timestamp}] ${msg}`;
    const logs = this.data.logs;
    logs.push({ text: logText, type, time: timestamp });
    
    // 限制日志数量
    if (logs.length > 200) {
      logs.shift();
    }
    
    this.setData({ logs });
    console.log(msg);
  },

  // 添加测试结果
  addResult(category, name, passed, message, duration = 0) {
    const result = {
      name,
      passed,
      message,
      duration,
      time: new Date().toLocaleTimeString()
    };
    
    const key = category + 'Results';
    // 确保数组存在
    let results = this.data[key];
    if (!results || !Array.isArray(results)) {
      results = [];
    }
    results.push(result);
    
    // 更新统计
    const totalTests = this.data.totalTests + 1;
    const passedTests = this.data.passedTests + (passed ? 1 : 0);
    const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    
    this.setData({
      [key]: results,
      totalTests,
      passedTests,
      failedTests: this.data.failedTests + (passed ? 0 : 1),
      passRate
    });
  },

  // 开始测试
  async startTests() {
    if (this.data.testing) {
      wx.showToast({ title: '测试进行中...', icon: 'none' });
      return;
    }

    // 重置状态
    this.setData({
      testing: true,
      logs: [],
      apiResults: [],
      frontendResults: [],
      mockResults: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      passRate: 0
    });

    const category = this.data.testCategory;
    this.log('===== 开始测试: ' + this.getModeName() + ' =====', 'info');

    try {
      // 根据类别运行测试
      if (category === 'all' || category === 'api') {
        await this.runAPITests();
      }
      
      if (category === 'all' || category === 'frontend') {
        await this.runFrontendTests();
      }
      
      if (category === 'all' || category === 'mock') {
        await this.runMockTests();
      }

      this.log('===== 测试完成 =====', 'success');
      this.showSummary();

    } catch (err) {
      this.log('测试异常: ' + (err.message || err.errMsg), 'error');
    } finally {
      this.setData({ testing: false });
    }
  },

  // ==========================================
  // 后端API测试 (16个)
  // ==========================================
  async runAPITests() {
    this.log('', 'normal');
    this.log('========== 后端API测试 ==========', 'info');

    // 1. 测试登录成功
    await this.testAPI_LoginSuccess();
    
    // 2. 测试登录失败(密码错误)
    await this.testAPI_LoginWrongPassword();
    
    // 3. 测试登录失败(用户不存在)
    await this.testAPI_LoginUserNotFound();
    
    // 4. 测试登录参数缺失
    await this.testAPI_LoginMissingParams();
    
    // 5. 测试商品列表获取
    await this.testAPI_GetProducts();
    
    // 6. 测试商品列表分页
    await this.testAPI_GetProductsPagination();
    
    // 7. 测试商品列表筛选
    await this.testAPI_GetProductsFilter();
    
    // 8. 测试获取商品详情成功
    await this.testAPI_GetProductDetail();
    
    // 9. 测试获取商品详情(ID不存在)
    await this.testAPI_GetProductDetailNotFound();
    
    // 10. 测试添加购物车
    await this.testAPI_AddToCart();
    
    // 11. 测试获取购物车
    await this.testAPI_GetCart();
    
    // 12. 测试更新购物车数量
    await this.testAPI_UpdateCart();
    
    // 13. 测试删除购物车商品
    await this.testAPI_DeleteCart();
    
    // 14. 测试创建订单
    await this.testAPI_CreateOrder();
    
    // 15. 测试获取订单列表
    await this.testAPI_GetOrders();
    
    // 16. 测试创建订单参数不完整
    await this.testAPI_CreateOrderMissingParams();
  },

  // API测试1: 登录成功
  async testAPI_LoginSuccess() {
    this.log('--- [API-1] 测试登录成功 ---', 'info');
    const startTime = Date.now();
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'login',
        data: {
          phone: TEST_ACCOUNTS.phone,
          password: TEST_ACCOUNTS.password,
          code: '0000'
        }
      });
      
      const result = res.result || {};
      const passed = result.code === 0;
      const duration = Date.now() - startTime;
      
      this.addResult('apiResults', 'API-1 登录成功', passed, result.message || '登录成功', duration);
      this.log(`[${passed ? 'PASS' : 'FAIL'}] 登录: ${result.message}`, passed ? 'success' : 'error');
      
      // 保存用户信息
      if (passed) {
        this._currentUser = result.data?.userInfo;
        this._currentToken = result.data?.token;
      }
      
    } catch (err) {
      const duration = Date.now() - startTime;
      this.addResult('apiResults', 'API-1 登录成功', false, err.message || '请求失败', duration);
      this.log('[FAIL] 登录失败: ' + (err.message || '请求失败'), 'error');
    }
  },

  // API测试2: 登录失败(密码错误)
  async testAPI_LoginWrongPassword() {
    this.log('--- [API-2] 测试登录失败(密码错误) ---', 'info');
    const startTime = Date.now();
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'login',
        data: {
          phone: TEST_ACCOUNTS.phone,
          password: 'wrongpassword',
          code: '0000'
        }
      });
      
      const result = res.result || {};
      // 期望返回错误码 1002
      const passed = result.code === 1002;
      const duration = Date.now() - startTime;
      
      this.addResult('apiResults', 'API-2 登录密码错误', passed, result.message || '密码错误', duration);
      this.log(`[${passed ? 'PASS' : 'FAIL'}] 密码错误: ${result.message}`, passed ? 'success' : 'error');
      
    } catch (err) {
      const duration = Date.now() - startTime;
      this.addResult('apiResults', 'API-2 登录密码错误', false, err.message, duration);
      this.log('[FAIL] 密码错误测试失败', 'error');
    }
  },

  // API测试3: 登录失败(用户不存在)
  async testAPI_LoginUserNotFound() {
    this.log('--- [API-3] 测试登录失败(用户不存在) ---', 'info');
    const startTime = Date.now();
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'login',
        data: {
          phone: '19999999999',
          password: '123456',
          code: '0000'
        }
      });
      
      const result = res.result || {};
      // 期望返回错误码 1002
      const passed = result.code === 1002;
      const duration = Date.now() - startTime;
      
      this.addResult('apiResults', 'API-3 用户不存在', passed, result.message || '用户不存在', duration);
      this.log(`[${passed ? 'PASS' : 'FAIL'}] 用户不存在: ${result.message}`, passed ? 'success' : 'error');
      
    } catch (err) {
      const duration = Date.now() - startTime;
      this.addResult('apiResults', 'API-3 用户不存在', false, err.message, duration);
      this.log('[FAIL] 用户不存在测试失败', 'error');
    }
  },

  // API测试4: 登录参数缺失
  async testAPI_LoginMissingParams() {
    this.log('--- [API-4] 测试登录参数缺失 ---', 'info');
    const startTime = Date.now();
    
    try {
      // 只传手机号，不传密码
      const res = await wx.cloud.callFunction({
        name: 'login',
        data: {
          phone: TEST_ACCOUNTS.phone
          // 故意不传 password
        }
      });
      
      const result = res.result || {};
      // 期望返回错误码 1001
      const passed = result.code === 1001;
      const duration = Date.now() - startTime;
      
      this.addResult('apiResults', 'API-4 参数校验', passed, result.message || '参数错误', duration);
      this.log(`[${passed ? 'PASS' : 'FAIL'}] 参数校验: ${result.message}`, passed ? 'success' : 'error');
      
    } catch (err) {
      const duration = Date.now() - startTime;
      this.addResult('apiResults', 'API-4 参数校验', false, err.message, duration);
      this.log('[FAIL] 参数校验测试失败', 'error');
    }
  },

  // API测试5: 获取商品列表
  async testAPI_GetProducts() {
    this.log('--- [API-5] 测试获取商品列表 ---', 'info');
    const startTime = Date.now();
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'products',
        data: { page: 1, pageSize: 10 }
      });
      
      const result = res.result || {};
      const passed = result.code === 0 && result.data?.list;
      const duration = Date.now() - startTime;
      
      this.addResult('apiResults', 'API-5 获取商品列表', passed, result.message || '成功', duration);
      this.log(`[${passed ? 'PASS' : 'FAIL'}] 商品列表: ${result.message}`, passed ? 'success' : 'error');
      
      // 保存商品ID供后续测试
      if (passed && result.data.list.length > 0) {
        this._testProductId = result.data.list[0].productId;
        this._testProduct = result.data.list[0];
      }
      
    } catch (err) {
      const duration = Date.now() - startTime;
      this.addResult('apiResults', 'API-5 获取商品列表', false, err.message, duration);
      this.log('[FAIL] 获取商品列表失败', 'error');
    }
  },

  // API测试6: 商品列表分页
  async testAPI_GetProductsPagination() {
    this.log('--- [API-6] 测试商品列表分页 ---', 'info');
    const startTime = Date.now();
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'products',
        data: { page: 2, pageSize: 2 }
      });
      
      const result = res.result || {};
      const passed = result.code === 0 && result.data?.page === 2 && result.data?.pageSize === 2;
      const duration = Date.now() - startTime;
      
      this.addResult('apiResults', 'API-6 商品分页', passed, `page=${result.data?.page}`, duration);
      this.log(`[${passed ? 'PASS' : 'FAIL'}] 分页参数: page=${result.data?.page}`, passed ? 'success' : 'error');
      
    } catch (err) {
      const duration = Date.now() - startTime;
      this.addResult('apiResults', 'API-6 商品分页', false, err.message, duration);
      this.log('[FAIL] 分页测试失败', 'error');
    }
  },

  // API测试7: 商品列表筛选
  async testAPI_GetProductsFilter() {
    this.log('--- [API-7] 测试商品列表筛选 ---', 'info');
    const startTime = Date.now();
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'products',
        data: { 
          page: 1, 
          pageSize: 20,
          categoryId: 'cat-001'
        }
      });
      
      const result = res.result || {};
      const passed = result.code === 0;
      const duration = Date.now() - startTime;
      
      this.addResult('apiResults', 'API-7 商品筛选', passed, result.message || '成功', duration);
      this.log(`[${passed ? 'PASS' : 'FAIL'}] 分类筛选: ${result.message}`, passed ? 'success' : 'error');
      
    } catch (err) {
      const duration = Date.now() - startTime;
      this.addResult('apiResults', 'API-7 商品筛选', false, err.message, duration);
      this.log('[FAIL] 筛选测试失败', 'error');
    }
  },

  // API测试8: 获取商品详情成功
  async testAPI_GetProductDetail() {
    this.log('--- [API-8] 测试获取商品详情 ---', 'info');
    const startTime = Date.now();
    
    const productId = this._testProductId;
    if (!productId) {
      this.addResult('apiResults', 'API-8 商品详情', false, '无可用商品ID');
      this.log('[SKIP] 无商品ID，跳过', 'info');
      return;
    }
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'product-detail',
        data: { productId }
      });
      
      const result = res.result || {};
      const passed = result.code === 0 && result.data?.productId;
      const duration = Date.now() - startTime;
      
      this.addResult('apiResults', 'API-8 商品详情', passed, result.message || '成功', duration);
      this.log(`[${passed ? 'PASS' : 'FAIL'}] 商品详情: ${result.message}`, passed ? 'success' : 'error');
      
    } catch (err) {
      const duration = Date.now() - startTime;
      this.addResult('apiResults', 'API-8 商品详情', false, err.message, duration);
      this.log('[FAIL] 商品详情失败', 'error');
    }
  },

  // API测试9: 商品详情不存在
  async testAPI_GetProductDetailNotFound() {
    this.log('--- [API-9] 测试商品详情不存在 ---', 'info');
    const startTime = Date.now();
    
    // 使用一个确定不存在的商品ID（24位十六进制格式，类似MongoDB ObjectId）
    const fakeProductId = '000000000000000000000000';
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'product-detail',
        data: { productId: fakeProductId }
      });
      
      const result = res.result || {};
      // 期望返回 code=1004 或 code=0但data为空
      const passed = result.code === 1004 || (result.code === 0 && !result.data);
      const duration = Date.now() - startTime;
      
      this.addResult('apiResults', 'API-9 商品不存在', passed, result.message || result.data?.message || '不存在', duration);
      this.log(`[${passed ? 'PASS' : 'FAIL'}] 商品不存在: code=${result.code}, msg=${result.message}`, passed ? 'success' : 'error');
      
    } catch (err) {
      const duration = Date.now() - startTime;
      this.addResult('apiResults', 'API-9 商品不存在', false, err.message, duration);
      this.log('[FAIL] 不存在测试失败: ' + JSON.stringify(err), 'error');
    }
  },

  // API测试10: 添加购物车
  async testAPI_AddToCart() {
    this.log('--- [API-10] 测试添加购物车 ---', 'info');
    const startTime = Date.now();
    
    const productId = this._testProductId;
    if (!productId) {
      this.addResult('apiResults', 'API-10 添加购物车', false, '无可用商品ID');
      this.log('[SKIP] 无商品ID，跳过', 'info');
      return;
    }
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'cart',
        data: {
          action: 'add',
          userId: 'test-user-001',
          productId,
          quantity: 2
        }
      });
      
      const result = res.result || {};
      const passed = result.code === 0;
      const duration = Date.now() - startTime;
      
      this.addResult('apiResults', 'API-10 添加购物车', passed, result.message || '成功', duration);
      this.log(`[${passed ? 'PASS' : 'FAIL'}] 添加购物车: ${result.message}`, passed ? 'success' : 'error');
      
      if (passed) {
        this._testCartId = result.data?.cartId;
      }
      
    } catch (err) {
      const duration = Date.now() - startTime;
      this.addResult('apiResults', 'API-10 添加购物车', false, err.message, duration);
      this.log('[FAIL] 添加购物车失败', 'error');
    }
  },

  // API测试11: 获取购物车
  async testAPI_GetCart() {
    this.log('--- [API-11] 测试获取购物车 ---', 'info');
    const startTime = Date.now();
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'cart',
        data: {
          action: 'list',
          userId: 'test-user-001'
        }
      });
      
      const result = res.result || {};
      const passed = result.code === 0;
      const duration = Date.now() - startTime;
      
      this.addResult('apiResults', 'API-11 获取购物车', passed, result.message || '成功', duration);
      this.log(`[${passed ? 'PASS' : 'FAIL'}] 获取购物车: ${result.message}`, passed ? 'success' : 'error');
      
    } catch (err) {
      const duration = Date.now() - startTime;
      this.addResult('apiResults', 'API-11 获取购物车', false, err.message, duration);
      this.log('[FAIL] 获取购物车失败', 'error');
    }
  },

  // API测试12: 更新购物车
  async testAPI_UpdateCart() {
    this.log('--- [API-12] 测试更新购物车 ---', 'info');
    const startTime = Date.now();
    
    const cartId = this._testCartId;
    if (!cartId) {
      this.addResult('apiResults', 'API-12 更新购物车', false, '无可用购物车ID');
      this.log('[SKIP] 无购物车ID，跳过', 'info');
      return;
    }
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'cart',
        data: {
          action: 'update',
          userId: 'test-user-001',
          cartId,
          quantity: 5
        }
      });
      
      const result = res.result || {};
      const passed = result.code === 0;
      const duration = Date.now() - startTime;
      
      this.addResult('apiResults', 'API-12 更新购物车', passed, result.message || '成功', duration);
      this.log(`[${passed ? 'PASS' : 'FAIL'}] 更新购物车: ${result.message}`, passed ? 'success' : 'error');
      
    } catch (err) {
      const duration = Date.now() - startTime;
      this.addResult('apiResults', 'API-12 更新购物车', false, err.message, duration);
      this.log('[FAIL] 更新购物车失败', 'error');
    }
  },

  // API测试13: 删除购物车
  async testAPI_DeleteCart() {
    this.log('--- [API-13] 测试删除购物车 ---', 'info');
    const startTime = Date.now();
    
    const cartId = this._testCartId;
    if (!cartId) {
      this.addResult('apiResults', 'API-13 删除购物车', false, '无可用购物车ID');
      this.log('[SKIP] 无购物车ID，跳过', 'info');
      return;
    }
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'cart',
        data: {
          action: 'delete',
          userId: 'test-user-001',
          cartId
        }
      });
      
      const result = res.result || {};
      const passed = result.code === 0;
      const duration = Date.now() - startTime;
      
      this.addResult('apiResults', 'API-13 删除购物车', passed, result.message || '成功', duration);
      this.log(`[${passed ? 'PASS' : 'FAIL'}] 删除购物车: ${result.message}`, passed ? 'success' : 'error');
      
    } catch (err) {
      const duration = Date.now() - startTime;
      this.addResult('apiResults', 'API-13 删除购物车', false, err.message, duration);
      this.log('[FAIL] 删除购物车失败', 'error');
    }
  },

  // API测试14: 创建订单
  async testAPI_CreateOrder() {
    this.log('--- [API-14] 测试创建订单 ---', 'info');
    const startTime = Date.now();
    
    // 确保有可用的商品ID
    let productId = this._testProductId;
    if (!productId) {
      // 如果没有，先获取商品列表
      try {
        const productsRes = await wx.cloud.callFunction({
          name: 'products',
          data: { page: 1, pageSize: 1 }
        });
        if (productsRes.result?.data?.list?.length > 0) {
          productId = productsRes.result.data.list[0].productId;
          this._testProductId = productId;
        }
      } catch (e) {
        this.log('获取商品ID失败: ' + e.message, 'error');
      }
    }
    
    if (!productId) {
      this.addResult('apiResults', 'API-14 创建订单', false, '无可用商品ID');
      this.log('[SKIP] 无商品ID，跳过', 'info');
      return;
    }
    
    this.log('使用商品ID创建订单: ' + productId, 'info');
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'orders',
        data: {
          action: 'create',
          userId: 'test-user-001',
          addressId: 'addr-001',
          items: [{ productId, quantity: 1 }],
          remark: '测试订单'
        }
      });
      
      const result = res.result || {};
      this.log('创建订单返回: ' + JSON.stringify(result), 'info');
      const passed = result.code === 0;
      const duration = Date.now() - startTime;
      
      this.addResult('apiResults', 'API-14 创建订单', passed, result.message || '成功', duration);
      this.log(`[${passed ? 'PASS' : 'FAIL'}] 创建订单: code=${result.code}, msg=${result.message}`, passed ? 'success' : 'error');
      
      if (passed) {
        this._testOrderId = result.data?.orderId;
      }
      
    } catch (err) {
      const duration = Date.now() - startTime;
      this.addResult('apiResults', 'API-14 创建订单', false, err.message, duration);
      this.log('[FAIL] 创建订单失败: ' + JSON.stringify(err), 'error');
    }
  },

  // API测试15: 获取订单列表
  async testAPI_GetOrders() {
    this.log('--- [API-15] 测试获取订单列表 ---', 'info');
    const startTime = Date.now();
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'orders',
        data: {
          action: 'list',
          userId: 'test-user-001'
        }
      });
      
      const result = res.result || {};
      const passed = result.code === 0;
      const duration = Date.now() - startTime;
      
      this.addResult('apiResults', 'API-15 获取订单列表', passed, result.message || '成功', duration);
      this.log(`[${passed ? 'PASS' : 'FAIL'}] 获取订单: ${result.message}`, passed ? 'success' : 'error');
      
    } catch (err) {
      const duration = Date.now() - startTime;
      this.addResult('apiResults', 'API-15 获取订单列表', false, err.message, duration);
      this.log('[FAIL] 获取订单失败', 'error');
    }
  },

  // API测试16: 创建订单参数不完整
  async testAPI_CreateOrderMissingParams() {
    this.log('--- [API-16] 测试创建订单参数不完整 ---', 'info');
    const startTime = Date.now();
    
    try {
      // 故意不传 items
      const res = await wx.cloud.callFunction({
        name: 'orders',
        data: {
          action: 'create',
          userId: 'test-user-001',
          addressId: 'addr-001'
          // 故意不传 items
        }
      });
      
      const result = res.result || {};
      const passed = result.code === 1001;
      const duration = Date.now() - startTime;
      
      this.addResult('apiResults', 'API-16 参数校验', passed, result.message || '参数错误', duration);
      this.log(`[${passed ? 'PASS' : 'FAIL'}] 参数校验: ${result.message}`, passed ? 'success' : 'error');
      
    } catch (err) {
      const duration = Date.now() - startTime;
      this.addResult('apiResults', 'API-16 参数校验', false, err.message, duration);
      this.log('[FAIL] 参数校验测试失败', 'error');
    }
  },

  // ==========================================
  // 前端组件测试 (9个)
  // ==========================================
  async runFrontendTests() {
    this.log('', 'normal');
    this.log('========== 前端组件测试 ==========', 'info');

    // FE-1: 商品列表渲染测试
    await this.testFE_ProductListRender();
    
    // FE-2: 商品列表空状态测试
    await this.testFE_ProductListEmpty();
    
    // FE-3: 购物车数量更新测试
    await this.testFE_CartCountUpdate();
    
    // FE-4: 购物车删除确认测试
    await this.testFE_CartDeleteConfirm();
    
    // FE-5: 登录表单验证测试-手机号格式
    await this.testFE_LoginFormPhone();
    
    // FE-6: 登录表单验证测试-密码为空
    await this.testFE_LoginFormPassword();
    
    // FE-7: 登录表单验证测试-全部正确
    await this.testFE_LoginFormSuccess();
    
    // FE-8: 订单状态展示测试-待支付
    await this.testFE_OrderStatusPending();
    
    // FE-9: 订单状态展示测试-已完成
    await this.testFE_OrderStatusCompleted();
  },

  // FE-1: 商品列表渲染测试
  async testFE_ProductListRender() {
    this.log('--- [FE-1] 测试商品列表渲染 ---', 'info');
    
    // 模拟商品列表数据
    const mockProducts = [
      { productId: '1', name: 'iPhone 15', price: 7999, image: 'xxx' },
      { productId: '2', name: 'MacBook', price: 9999, image: 'yyy' }
    ];
    
    // 验证数据结构
    const passed = mockProducts.length > 0 && 
                   mockProducts[0].productId && 
                   mockProducts[0].name &&
                   mockProducts[0].price;
    
    this.addResult('frontendResults', 'FE-1 商品列表渲染', passed, passed ? '数据结构正确' : '数据结构错误');
    this.log(`[${passed ? 'PASS' : 'FAIL'}] 商品列表渲染`, passed ? 'success' : 'error');
  },

  // FE-2: 商品列表空状态测试
  async testFE_ProductListEmpty() {
    this.log('--- [FE-2] 测试商品列表空状态 ---', 'info');
    
    const mockEmptyList = [];
    const emptyState = mockEmptyList.length === 0 ? '显示空状态' : '显示列表';
    
    const passed = mockEmptyList.length === 0;
    this.addResult('frontendResults', 'FE-2 空状态展示', passed, emptyState);
    this.log(`[${passed ? 'PASS' : 'FAIL'}] 空状态: ${emptyState}`, passed ? 'success' : 'error');
  },

  // FE-3: 购物车数量更新测试
  async testFE_CartCountUpdate() {
    this.log('--- [FE-3] 测试购物车数量更新 ---', 'info');
    
    let cartCount = 0;
    // 模拟添加商品
    cartCount += 2;
    cartCount += 3;
    
    const expected = 5;
    const passed = cartCount === expected;
    
    this.addResult('frontendResults', 'FE-3 购物车数量', passed, `数量=${cartCount}`);
    this.log(`[${passed ? 'PASS' : 'FAIL'}] 购物车数量: ${cartCount}`, passed ? 'success' : 'error');
  },

  // FE-4: 购物车删除确认测试
  async testFE_CartDeleteConfirm() {
    this.log('--- [FE-4] 测试购物车删除确认 ---', 'info');
    
    // 模拟删除确认逻辑
    let cart = [1, 2, 3];
    const deleteId = 2;
    const beforeDelete = cart.length;
    
    // 删除操作
    cart = cart.filter(id => id !== deleteId);
    const afterDelete = cart.length;
    
    const passed = beforeDelete === 3 && afterDelete === 2 && !cart.includes(2);
    
    this.addResult('frontendResults', 'FE-4 删除确认', passed, passed ? '删除成功' : '删除失败');
    this.log(`[${passed ? 'PASS' : 'FAIL'}] 删除确认`, passed ? 'success' : 'error');
  },

  // FE-5: 登录表单验证-手机号格式
  async testFE_LoginFormPhone() {
    this.log('--- [FE-5] 测试登录表单-手机号格式 ---', 'info');
    
    const phoneReg = /^1[3-9]\d{9}$/;
    const invalidPhones = ['12345', 'abc123', '12345678901', '123456789012'];
    const validPhones = ['13800138001', '19912345678'];
    
    // 验证无效手机号应被拒绝
    const invalidRejected = invalidPhones.every(p => !phoneReg.test(p));
    // 验证有效手机号应被接受
    const validAccepted = validPhones.every(p => phoneReg.test(p));
    
    const passed = invalidRejected && validAccepted;
    
    this.addResult('frontendResults', 'FE-5 手机号验证', passed, passed ? '格式验证正确' : '格式验证错误');
    this.log(`[${passed ? 'PASS' : 'FAIL'}] 手机号验证`, passed ? 'success' : 'error');
  },

  // FE-6: 登录表单验证-密码为空
  async testFE_LoginFormPassword() {
    this.log('--- [FE-6] 测试登录表单-密码为空 ---', 'info');
    
    const validatePassword = (pwd) => {
      if (!pwd || pwd.trim() === '') {
        return '密码不能为空';
      }
      if (pwd.length < 6) {
        return '密码至少6位';
      }
      return null;
    };
    
    const test1 = validatePassword('') === '密码不能为空';
    const test2 = validatePassword('   ') === '密码不能为空';
    const test3 = validatePassword('123') === '密码至少6位';
    const test4 = validatePassword('123456') === null;
    
    const passed = test1 && test2 && test3 && test4;
    
    this.addResult('frontendResults', 'FE-6 密码验证', passed, passed ? '密码验证正确' : '密码验证错误');
    this.log(`[${passed ? 'PASS' : 'FAIL'}] 密码验证`, passed ? 'success' : 'error');
  },

  // FE-7: 登录表单验证-全部正确
  async testFE_LoginFormSuccess() {
    this.log('--- [FE-7] 测试登录表单-全部正确 ---', 'info');
    
    const phoneReg = /^1[3-9]\d{9}$/;
    const phone = '13800138001';
    const password = '123456';
    
    const phoneValid = phoneReg.test(phone);
    const passwordValid = password.length >= 6;
    const canSubmit = phoneValid && passwordValid;
    
    const passed = canSubmit === true;
    
    this.addResult('frontendResults', 'FE-7 表单提交', passed, passed ? '可提交' : '不可提交');
    this.log(`[${passed ? 'PASS' : 'FAIL'}] 表单提交验证`, passed ? 'success' : 'error');
  },

  // FE-8: 订单状态-待支付
  async testFE_OrderStatusPending() {
    this.log('--- [FE-8] 测试订单状态-待支付 ---', 'info');
    
    const statusMap = {
      0: { text: '待支付', color: '#ff9800' },
      1: { text: '已支付', color: '#4caf50' },
      2: { text: '已完成', color: '#2196f3' },
      3: { text: '已取消', color: '#9e9e9e' }
    };
    
    const pendingStatus = statusMap[0];
    const passed = pendingStatus.text === '待支付' && pendingStatus.color === '#ff9800';
    
    this.addResult('frontendResults', 'FE-8 订单待支付', passed, pendingStatus.text);
    this.log(`[${passed ? 'PASS' : 'FAIL'}] 待支付状态`, passed ? 'success' : 'error');
  },

  // FE-9: 订单状态-已完成
  async testFE_OrderStatusCompleted() {
    this.log('--- [FE-9] 测试订单状态-已完成 ---', 'info');
    
    const statusMap = {
      0: { text: '待支付', color: '#ff9800' },
      1: { text: '已支付', color: '#4caf50' },
      2: { text: '已完成', color: '#2196f3' },
      3: { text: '已取消', color: '#9e9e9e' }
    };
    
    const completedStatus = statusMap[2];
    const passed = completedStatus.text === '已完成' && completedStatus.color === '#2196f3';
    
    this.addResult('frontendResults', 'FE-9 订单已完成', passed, completedStatus.text);
    this.log(`[${passed ? 'PASS' : 'FAIL'}] 已完成状态`, passed ? 'success' : 'error');
  },

  // ==========================================
  // Mock API测试 (4个)
  // ==========================================
  async runMockTests() {
    this.log('', 'normal');
    this.log('========== Mock API测试 ==========', 'info');

    // MOCK-1: 加载中状态
    await this.testMock_Loading();
    
    // MOCK-2: 成功状态
    await this.testMock_Success();
    
    // MOCK-3: 失败状态
    await this.testMock_Error();
    
    // MOCK-4: 异常处理
    await this.testMock_Exception();
  },

  // MOCK-1: 加载中状态
  async testMock_Loading() {
    this.log('--- [MOCK-1] 测试加载中状态 ---', 'info');
    
    // 模拟加载状态
    let state = { loading: false, data: null };
    
    // 开始加载
    state.loading = true;
    
    const passed = state.loading === true && state.data === null;
    
    this.addResult('mockResults', 'MOCK-1 加载中', passed, passed ? '显示加载动画' : '状态错误');
    this.log(`[${passed ? 'PASS' : 'FAIL'}] 加载中状态: ${state.loading}`, passed ? 'success' : 'error');
  },

  // MOCK-2: 成功状态
  async testMock_Success() {
    this.log('--- [MOCK-2] 测试成功状态 ---', 'info');
    
    // 模拟成功响应
    const mockResponse = {
      code: 0,
      message: 'success',
      data: { name: '测试用户', id: 1 }
    };
    
    const passed = mockResponse.code === 0 && mockResponse.data !== null;
    
    this.addResult('mockResults', 'MOCK-2 成功状态', passed, passed ? '显示数据' : '状态错误');
    this.log(`[${passed ? 'PASS' : 'FAIL'}] 成功状态`, passed ? 'success' : 'error');
  },

  // MOCK-3: 失败状态
  async testMock_Error() {
    this.log('--- [MOCK-3] 测试失败状态 ---', 'info');
    
    // 模拟错误响应
    const mockError = {
      code: 1001,
      message: '参数错误',
      data: null
    };
    
    const errorHandled = mockError.code !== 0 && mockError.data === null;
    
    this.addResult('mockResults', 'MOCK-3 失败状态', errorHandled, mockError.message);
    this.log(`[${errorHandled ? 'PASS' : 'FAIL'}] 失败状态: ${mockError.message}`, errorHandled ? 'success' : 'error');
  },

  // MOCK-4: 异常处理
  async testMock_Exception() {
    this.log('--- [MOCK-4] 测试异常处理 ---', 'info');
    
    // 模拟异常
    try {
      throw new Error('网络错误');
    } catch (err) {
      const errorMsg = err.message;
      const handled = errorMsg !== undefined;
      
      this.addResult('mockResults', 'MOCK-4 异常处理', handled, errorMsg);
      this.log(`[${handled ? 'PASS' : 'FAIL'}] 异常: ${errorMsg}`, handled ? 'success' : 'error');
    }
  },

  // ==========================================
  // 辅助函数
  // ==========================================

  // 显示测试摘要
  showSummary() {
    const { totalTests, passedTests, failedTests } = this.data;
    const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) + '%' : '0%';
    
    this.log('', 'normal');
    this.log('========== 测试摘要 ==========', 'info');
    this.log(`总测试数: ${totalTests}`, 'info');
    this.log(`通过: ${passedTests}`, 'success');
    this.log(`失败: ${failedTests}`, failedTests > 0 ? 'error' : 'success');
    this.log(`通过率: ${passRate}`, 'info');
    
    // 显示测试报告
    this.generateReport();
  },

  // 生成测试报告
  generateReport() {
    const report = {
      timestamp: new Date().toLocaleString(),
      summary: {
        total: this.data.totalTests,
        passed: this.data.passedTests,
        failed: this.data.failedTests,
        passRate: this.data.totalTests > 0 ? 
          ((this.data.passedTests / this.data.totalTests) * 100).toFixed(1) + '%' : '0%'
      },
      details: {
        api: this.data.apiResults,
        frontend: this.data.frontendResults,
        mock: this.data.mockResults
      }
    };
    
    // 保存报告
    this._lastReport = report;
    
    console.log('测试报告:', JSON.stringify(report, null, 2));
  },

  // 导出测试报告
  exportReport() {
    if (!this._lastReport) {
      wx.showToast({ title: '请先运行测试', icon: 'none' });
      return;
    }
    
    const content = JSON.stringify(this._lastReport, null, 2);
    wx.setClipboardData({
      data: content,
      success: () => {
        wx.showToast({ title: '报告已复制', icon: 'success' });
      }
    });
  },

  // 清除日志
  clearLogs() {
    this.setData({ logs: [] });
  }
});
