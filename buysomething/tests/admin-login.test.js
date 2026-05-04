/**
 * 后端云函数测试
 */

// 模拟 admin-login 的账号验证逻辑
function validateAdminLogin(phone, password) {
  const ADMIN_ACCOUNTS = [
    { phone: '13800000001', password: 'admin123456', name: '超级管理员' }
  ]
  
  if (!phone || !password) {
    return { code: 4001, message: '请输入账号和密码' }
  }
  
  const admin = ADMIN_ACCOUNTS.find(a => a.phone === phone && a.password === password)
  
  if (!admin) {
    return { code: 4002, message: '账号或密码错误' }
  }
  
  return { code: 0, message: '登录成功', data: { name: admin.name } }
}

// 测试
describe('admin-login 逻辑测试', () => {
  test('正确账号密码应登录成功', () => {
    const result = validateAdminLogin('13800000001', 'admin123456')
    expect(result.code).toBe(0)
    expect(result.message).toBe('登录成功')
  })
  
  test('错误密码应返回错误', () => {
    const result = validateAdminLogin('13800000001', 'wrongpassword')
    expect(result.code).toBe(4002)
  })
  
  test('空账号应返回错误', () => {
    const result = validateAdminLogin('', 'password')
    expect(result.code).toBe(4001)
  })
  
  test('空密码应返回错误', () => {
    const result = validateAdminLogin('13800000001', '')
    expect(result.code).toBe(4001)
  })
  
  test('不存在的账号应返回错误', () => {
    const result = validateAdminLogin('13900000000', 'password')
    expect(result.code).toBe(4002)
  })
})
