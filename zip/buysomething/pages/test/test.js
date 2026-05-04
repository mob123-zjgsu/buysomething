Page({
  data: {
    testResults: [],
    logs: [],
    testing: false,
    finished: false,
    totalTests: 5
  },

  onLoad() {
    this.log('===== 小程序 API 测试开始 =====', 'info')
    this.log('提示: 点击"刷新测试"按钮运行测试', 'info')
  },

  // 添加日志
  log(msg, type = 'normal') {
    const timestamp = new Date().toLocaleTimeString()
    const logText = `[${timestamp}] ${msg}`
    const logs = this.data.logs
    logs.push({ text: logText, type })
    
    // 限制日志数量
    if (logs.length > 100) {
      logs.shift()
    }
    
    this.setData({ logs })
    console.log(msg)
  },

  // 刷新测试
  refreshTest() {
    if (this.data.testing) {
      wx.showToast({ title: '测试进行中...', icon: 'none' })
      return
    }

    this.setData({ 
      testResults: [], 
      logs: [],
      testing: true,
      finished: false
    })
    
    this.log('===== 重新测试开始 =====', 'info')
    this.runAllTests()
  },

  // 运行所有测试
  async runAllTests() {
    try {
      this.log('开始测试...', 'info')

      // 测试1: 获取商品列表
      await this.testGetProducts()

      // 测试2: 获取商品详情
      await this.testGetProductDetail()

      // 测试3: 用户注册
      await this.testRegister()

      // 测试4: 用户登录
      await this.testLogin()

      // 测试5: 删除商品
      await this.testDeleteProduct()

      this.log('===== 全部测试完成 =====', 'success')
      
    } catch (err) {
      this.log('测试异常: ' + (err.message || err.errMsg || JSON.stringify(err)), 'error')
      console.error('测试失败:', err)
    } finally {
      this.setData({ testing: false, finished: true })
    }
  },

  // 测试1: 获取商品列表
  async testGetProducts() {
    this.log('--- 测试1: 获取商品列表 ---', 'info')
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'products',
        data: { page: 1, pageSize: 10 }
      })
      
      const result = res.result || {}
      const success = result.code === 0
      
      this.addResult('获取商品列表', success, result.message || '获取成功')
      this.log(`商品列表结果: ${result.code === 0 ? '成功' : '失败'} - ${result.message}`, success ? 'success' : 'error')
      
      // 保存商品ID供后续测试使用
      if (success && result.data && result.data.list && result.data.list.length > 0) {
        const firstProduct = result.data.list[0]
        this._testProductId = firstProduct.productId
        this.log(`获取到商品ID: ${this._testProductId}`, 'info')
      }
      
    } catch (err) {
      this.addResult('获取商品列表', false, err.message || '请求失败')
      this.log(`获取商品列表失败: ${err.message || err.errMsg}`, 'error')
    }
  },

  // 测试2: 获取商品详情
  async testGetProductDetail() {
    this.log('--- 测试2: 获取商品详情 ---', 'info')
    
    const productId = this._testProductId
    if (!productId) {
      this.log('无可用商品ID，跳过商品详情测试', 'error')
      this.addResult('获取商品详情', false, '无可用商品ID')
      return
    }
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'product-detail',
        data: { productId }
      })
      
      const result = res.result || {}
      const success = result.code === 0
      
      this.addResult('获取商品详情', success, result.message || '获取成功')
      this.log(`商品详情结果: ${success ? '成功' : '失败'} - ${result.message}`, success ? 'success' : 'error')
      
    } catch (err) {
      this.addResult('获取商品详情', false, err.message || '请求失败')
      this.log(`获取商品详情失败: ${err.message || err.errMsg}`, 'error')
    }
  },

  // 测试3: 用户注册
  async testRegister() {
    this.log('--- 测试3: 用户注册 ---', 'info')
    
    // 使用随机手机号避免重复注册
    const phone = '139' + Math.floor(Math.random() * 90000000 + 10000000)
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'register',
        data: {
          phone: phone,
          code: '123456',
          password: 'test123456'
        }
      })
      
      const result = res.result || {}
      const success = result.success === true
      
      this.addResult('用户注册', success, result.message || (success ? '注册成功' : '注册失败'))
      this.log(`注册结果: ${success ? '成功' : '失败'} - ${result.message}`, success ? 'success' : 'error')
      
      // 保存用户信息
      if (success && result.userInfo) {
        this._testUser = result.userInfo
        this.log(`注册用户手机号: ${phone}`, 'info')
      }
      
    } catch (err) {
      this.addResult('用户注册', false, err.message || '请求失败')
      this.log(`用户注册失败: ${err.message || err.errMsg}`, 'error')
    }
  },

  // 测试4: 用户登录
  async testLogin() {
    this.log('--- 测试4: 用户登录 ---', 'info')
    
    // 使用注册的手机号或默认测试手机号
    const phone = this._testUser?.phone || '13800138000'
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'login',
        data: {
          phone: phone,
          password: '123456'
        }
      })
      
      const result = res.result || {}
      const success = result.success === true
      
      this.addResult('用户登录', success, result.message || (success ? '登录成功' : '登录失败'))
      this.log(`登录结果: ${success ? '成功' : '失败'} - ${result.message}`, success ? 'success' : 'error')
      
    } catch (err) {
      this.addResult('用户登录', false, err.message || '请求失败')
      this.log(`用户登录失败: ${err.message || err.errMsg}`, 'error')
    }
  },

  // 测试5: 删除商品
  async testDeleteProduct() {
    this.log('--- 测试5: 删除商品 ---', 'info')
    
    // 删除测试用的商品（如果有）
    const productId = this._testProductId
    if (!productId) {
      this.log('无可用商品ID，跳过删除测试', 'error')
      this.addResult('删除商品', false, '无可用商品ID')
      return
    }
    
    // 确认删除
    const confirm = await new Promise((resolve) => {
      wx.showModal({
        title: '确认删除',
        content: `确定要删除商品 ${productId} 吗？（此操作仅用于测试）`,
        success: (res) => resolve(res.confirm)
      })
    })
    
    if (!confirm) {
      this.log('用户取消删除', 'info')
      this.addResult('删除商品', false, '用户取消')
      return
    }
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'delete-product',
        data: { productId }
      })
      
      const result = res.result || {}
      const success = result.code === 0
      
      this.addResult('删除商品', success, result.message || (success ? '删除成功' : '删除失败'))
      this.log(`删除结果: ${success ? '成功' : '失败'} - ${result.message}`, success ? 'success' : 'error')
      
    } catch (err) {
      this.addResult('删除商品', false, err.message || '请求失败')
      this.log(`删除商品失败: ${err.message || err.errMsg}`, 'error')
    }
  },

  // 添加测试结果
  addResult(name, success, message) {
    const results = this.data.testResults
    results.push({ name, success, message })
    this.setData({ testResults: results })
  }
})
