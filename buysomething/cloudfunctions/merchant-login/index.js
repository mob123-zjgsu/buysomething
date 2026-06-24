const cloud = require('wx-server-sdk');

cloud.init({
  env: 'buysomething-6gbmbtpxff05be35'
});

const db = cloud.database();

// MD5 哈希函数
function md5(str) {
  return cloud.cloudDB ? str : require('crypto').createHash('md5').update(str).digest('hex');
}

// 密码验证函数
function verifyPassword(inputPassword, storedPassword, salt) {
  if (!salt) {
    return inputPassword === storedPassword;
  }
  let hash = inputPassword + salt;
  for (let i = 0; i < 1000; i++) {
    hash = md5(hash);
  }
  return hash === storedPassword;
}

exports.main = async (event, context) => {
  const { phone, password, code } = event;

  try {
    // 查询商家
    const result = await db.collection('merchants').where({
      phone: phone
    }).get();

    if (result.data.length === 0) {
      return {
        code: 4002,
        message: '商家账号不存在'
      };
    }

    const merchant = result.data[0];

    // 验证码登录模式
    if (code) {
      // 检查验证码
      const codeResult = await db.collection('sms_codes')
        .where({
          phone: phone,
          expiresAt: db.command.gt(new Date())
        })
        .orderBy('createTime', 'desc')
        .limit(1)
        .get();

      if (codeResult.data.length === 0 || codeResult.data[0].code !== code) {
        return {
          code: 4005,
          message: '验证码错误或已过期'
        };
      }
    }
    // 密码登录模式
    else if (password) {
      // 验证密码
      const isValidPassword = verifyPassword(password, merchant.password, merchant.passwordSalt);
      if (!isValidPassword) {
        return {
          code: 4002,
          message: '手机号或密码错误'
        };
      }
    } else {
      return {
        code: 4001,
        message: '请输入密码或验证码'
      };
    }

    // 检查审核状态
    if (merchant.status === 'pending') {
      return {
        code: 4003,
        message: '您的商家账号正在审核中，请耐心等待'
      };
    }

    if (merchant.status === 'rejected') {
      return {
        code: 4004,
        message: '您的商家账号审核未通过，请联系管理员'
      };
    }

    // 登录成功，返回商家信息
    return {
      code: 0,
      message: '登录成功',
      data: {
        merchantId: merchant._id,
        merchantName: merchant.merchantName,
        phone: merchant.phone,
        status: merchant.status,
        mainProducts: merchant.mainProducts
      }
    };

  } catch (err) {
    console.error('商家登录失败:', err);
    return {
      code: 5001,
      message: '登录失败，请稍后重试'
    };
  }
};