const cloud = require('wx-server-sdk')

cloud.init({
  env: 'buysomething-6gbmbtpxff05be35'
})

const db = cloud.database()

// 预设管理员账号（实际应存储在环境变量或数据库）
const ADMIN_ACCOUNTS = [
  {
    phone: '13800000001',
    password: 'admin123456',
    name: '超级管理员'
  }
]

exports.main = async (event, context) => {
  const { phone, password } = event

  if (!phone || !password) {
    return {
      code: 4001,
      message: '请输入账号和密码'
    }
  }

  // 验证管理员账号
  const admin = ADMIN_ACCOUNTS.find(a => a.phone === phone && a.password === password)

  if (!admin) {
    return {
      code: 4002,
      message: '账号或密码错误'
    }
  }

  // 登录成功
  return {
    code: 0,
    message: '登录成功',
    data: {
      adminId: 'admin_' + phone,
      name: admin.name,
      phone: admin.phone,
      role: 'admin'
    }
  }
}