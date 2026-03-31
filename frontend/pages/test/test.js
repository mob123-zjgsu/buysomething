Page({
  data: {
    testResults: [],
    logs: []
  },

  onLoad() {
    this.addLog('===== 小程序测试开始 =====')
    this.runAllTests()
  },

  addLog(msg) {
    const timestamp = new Date().toLocaleTimeString()
    this.setData({
      logs: [...this.data.logs, `[${timestamp}] ${msg}`]
    })
    console.log(msg)
  },

  async runAllTests() {
    try {
      this.addLog('开始测试...')
      
      // ==================== 测试1: 用户登录 ====================
      this.addLog('--- 测试1: 用户登录 ---')
      const loginRes = await wx.cloud.callFunction({
        name: 'login',
        data: {
          phone: '13800138001',
          password: '123456',
          code: '0000'
        }
      })
      this.addLog('登录结果: ' + JSON.stringify(loginRes.result))
      this.setData({ testResults: [...this.data.testResults, { name: 'login', result: loginRes.result }] })

      // ==================== 测试2: 获取商品列表 ====================
      this.addLog('--- 测试2: 获取商品列表 ---')
      const productsRes = await wx.cloud.callFunction({
        name: 'products',
        data: { page: 1, pageSize: 10 }
      })
      this.addLog('商品列表结果: ' + JSON.stringify(productsRes.result))
      this.setData({ testResults: [...this.data.testResults, { name: 'products', result: productsRes.result }] })

      // 获取第一个商品的 ID（数据库 _id）
      const firstProduct = productsRes.result?.data?.list?.[0]
      const productId = firstProduct?.productId
      this.addLog('使用商品ID: ' + productId)

      // ==================== 测试3: 获取商品详情 ====================
      if (productId) {
        this.addLog('--- 测试3: 获取商品详情 ---')
        const detailRes = await wx.cloud.callFunction({
          name: 'product-detail',
          data: { productId }
        })
        this.addLog('商品详情结果: ' + JSON.stringify(detailRes.result))
        this.setData({ testResults: [...this.data.testResults, { name: 'product-detail', result: detailRes.result }] })
      }

      // ==================== 测试4: 添加购物车 ====================
      if (productId) {
        this.addLog('--- 测试4: 添加购物车 ---')
        const cartRes = await wx.cloud.callFunction({
          name: 'cart',
          data: {
            action: 'add',
            userId: 'test-user-001',
            productId,
            quantity: 2
          }
        })
        this.addLog('添加购物车结果: ' + JSON.stringify(cartRes.result))
        this.setData({ testResults: [...this.data.testResults, { name: 'cart-add', result: cartRes.result }] })
      }

      // ==================== 测试5: 获取购物车 ====================
      this.addLog('--- 测试5: 获取购物车 ---')
      const cartListRes = await wx.cloud.callFunction({
        name: 'cart',
        data: {
          action: 'list',
          userId: 'test-user-001'
        }
      })
      this.addLog('购物车列表结果: ' + JSON.stringify(cartListRes.result))
      this.setData({ testResults: [...this.data.testResults, { name: 'cart-list', result: cartListRes.result }] })

      // ==================== 测试6: 创建订单 ====================
      if (productId) {
        this.addLog('--- 测试6: 创建订单 ---')
        const orderRes = await wx.cloud.callFunction({
          name: 'orders',
          data: {
            action: 'create',
            userId: 'test-user-001',
            addressId: 'addr-001',
            items: [{ productId, quantity: 2 }],
            remark: '测试订单'
          }
        })
      this.addLog('创建订单结果: ' + JSON.stringify(orderRes.result))
      this.setData({ testResults: [...this.data.testResults, { name: 'orders-create', result: orderRes.result }] })

      // ==================== 测试7: 获取订单列表 ====================
      this.addLog('--- 测试7: 获取订单列表 ---')
      const orderListRes = await wx.cloud.callFunction({
        name: 'orders',
        data: {
          action: 'list',
          userId: 'test-user-001'
        }
      })
      this.addLog('订单列表结果: ' + JSON.stringify(orderListRes.result))
      this.setData({ testResults: [...this.data.testResults, { name: 'orders-list', result: orderListRes.result }] })

      this.addLog('===== 全部测试完成 =====')

    } catch (err) {
      this.addLog('测试失败: ' + JSON.stringify(err))
      console.error('测试失败:', err)
    }
  },

  // 刷新测试
  refreshTest() {
    this.setData({ testResults: [], logs: [] })
    this.addLog('===== 重新测试开始 =====')
    this.runAllTests()
  }
})
