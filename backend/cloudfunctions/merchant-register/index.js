const cloud = require('wx-server-sdk')

cloud.init({
  env: 'buysomething-6gbmbtpxff05be35'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { phone, password, merchantName, mainProducts, contactPerson } = event

  // 参数验证
  if (!phone || !password || !merchantName || !mainProducts) {
    return {
      code: 4001,
      message: '缺少必填参数'
    }
  }

  // 手机号格式验证
  const phoneReg = /^1[3-9]\d{9}$/
  if (!phoneReg.test(phone)) {
    return {
      code: 4002,
      message: '手机号格式不正确'
    }
  }

  // 密码长度验证
  if (password.length < 6) {
    return {
      code: 4003,
      message: '密码长度不能少于6位'
    }
  }

  try {
    // 检查手机号是否已注册（用户或商家）
    const existUser = await db.collection('users').where({
      phone: phone
    }).count()

    const existMerchant = await db.collection('merchants').where({
      phone: phone
    }).count()

    if (existUser.total > 0 || existMerchant.total > 0) {
      return {
        code: 4004,
        message: '该手机号已被注册'
      }
    }

    // 创建商家记录（待审核状态）
    const merchantData = {
      phone: phone,
      password: password, // 实际应该加密存储
      merchantName: merchantName,
      mainProducts: mainProducts,
      contactPerson: contactPerson || '',
      status: 'pending', // pending=待审核, approved=审核通过, rejected=审核拒绝
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    }

    const addResult = await db.collection('merchants').add({
      data: merchantData
    })

    return {
      code: 0,
      message: '注册成功，请等待管理员审核',
      data: {
        merchantId: addResult._id,
        status: 'pending'
      }
    }

  } catch (err) {
    console.error('商家注册失败:', err)
    return {
      code: 5001,
      message: '注册失败，请稍后重试'
    }
  }
}