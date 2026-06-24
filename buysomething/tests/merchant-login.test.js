/**
 * 商家登录逻辑测试
 */

// 模拟商家登录状态检查
function checkMerchantStatus(status) {
  if (status === 'pending') {
    return { code: 4003, message: '您的商家账号正在审核中，请耐心等待' }
  }
  if (status === 'rejected') {
    return { code: 4004, message: '您的商家账号审核未通过，请联系管理员' }
  }
  if (status === 'approved') {
    return { code: 0, message: '登录成功' }
  }
  return { code: 4005, message: '未知状态' }
}

describe('merchant-login 状态检查测试', () => {
  test('待审核状态应返回审核提示', () => {
    const result = checkMerchantStatus('pending')
    expect(result.code).toBe(4003)
    expect(result.message).toContain('审核中')
  })
  
  test('已拒绝状态应返回拒绝提示', () => {
    const result = checkMerchantStatus('rejected')
    expect(result.code).toBe(4004)
    expect(result.message).toContain('未通过')
  })
  
  test('已通过状态应登录成功', () => {
    const result = checkMerchantStatus('approved')
    expect(result.code).toBe(0)
    expect(result.message).toBe('登录成功')
  })
  
  test('未知状态应返回错误', () => {
    const result = checkMerchantStatus('unknown')
    expect(result.code).toBe(4005)
  })
})
