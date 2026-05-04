/**
 * 商品添加逻辑测试
 */

// 模拟商品验证
function validateProduct(name, price) {
  if (!name || name.trim() === '') {
    return { code: 4001, message: '请填写商品名称' }
  }
  if (!price || isNaN(Number(price)) || Number(price) <= 0) {
    return { code: 4002, message: '请填写正确的价格' }
  }
  return { code: 0, message: '验证通过' }
}

describe('add-product 验证测试', () => {
  test('正确参数应验证通过', () => {
    const result = validateProduct('iPhone 15', 7999)
    expect(result.code).toBe(0)
  })
  
  test('空名称应返回错误', () => {
    const result = validateProduct('', 100)
    expect(result.code).toBe(4001)
  })
  
  test('空格名称应返回错误', () => {
    const result = validateProduct('   ', 100)
    expect(result.code).toBe(4001)
  })
  
  test('空价格应返回错误', () => {
    const result = validateProduct('商品', '')
    expect(result.code).toBe(4002)
  })
  
  test('零价格应返回错误', () => {
    const result = validateProduct('商品', 0)
    expect(result.code).toBe(4002)
  })
  
  test('负价格应返回错误', () => {
    const result = validateProduct('商品', -100)
    expect(result.code).toBe(4002)
  })
  
  test('字符串价格应返回错误', () => {
    const result = validateProduct('商品', 'abc')
    expect(result.code).toBe(4002)
  })
  
  test('小数价格应验证通过', () => {
    const result = validateProduct('商品', 99.99)
    expect(result.code).toBe(0)
  })
})
