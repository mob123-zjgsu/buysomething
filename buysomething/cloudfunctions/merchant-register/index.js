const cloud = require('wx-server-sdk');
const crypto = require('crypto');

cloud.init({
  env: 'buysomething-6gbmbtpxff05be35'
});

const db = cloud.database();

// 简单的密码哈希函数
function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

function hashPassword(password, salt) {
  let hash = password + salt;
  for (let i = 0; i < 1000; i++) {
    hash = md5(hash);
  }
  return hash;
}

exports.main = async (event, context) => {
  const { phone, password, merchantName, mainProducts, contactPerson } = event;

  // 参数验证
  if (!phone || !password || !merchantName || !mainProducts) {
    return {
      code: 4001,
      message: '缺少必填参数'
    };
  }

  // 手机号格式验证
  const phoneReg = /^1[3-9]\d{9}$/;
  if (!phoneReg.test(phone)) {
    return {
      code: 4002,
      message: '手机号格式不正确'
    };
  }

  // 密码长度验证
  if (password.length < 6) {
    return {
      code: 4003,
      message: '密码长度不能少于6位'
    };
  }

  try {
    // 检查手机号是否已注册（用户或商家）
    const existUser = await db.collection('users').where({
      phone: phone
    }).count();

    const existMerchant = await db.collection('merchants').where({
      phone: phone
    }).count();

    if (existUser.total > 0 || existMerchant.total > 0) {
      return {
        code: 4004,
        message: '该手机号已被注册'
      };
    }

    // 生成密码盐值并哈希
    const salt = md5(phone + Date.now().toString());
    const hashedPassword = hashPassword(password, salt);

    // 创建商家记录（待审核状态）
    const merchantData = {
      phone: phone,
      password: hashedPassword,
      passwordSalt: salt,
      merchantName: merchantName,
      mainProducts: mainProducts,
      contactPerson: contactPerson || '',
      status: 'pending',
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    };

    const addResult = await db.collection('merchants').add({
      data: merchantData
    });

    return {
      code: 0,
      message: '注册成功，请等待管理员审核',
      data: {
        merchantId: addResult._id,
        status: 'pending'
      }
    };

  } catch (err) {
    console.error('商家注册失败:', err);
    // 安全修复：不再返回内部错误信息
    return {
      code: 5001,
      message: '注册失败，请稍后重试'
    };
  }
};
