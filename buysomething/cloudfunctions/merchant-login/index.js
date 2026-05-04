const cloud = require('wx-server-sdk');

cloud.init({
  env: 'buysomething-6gbmbtpxff05be35'
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { phone, password } = event;

  if (!phone || !password) {
    return {
      code: 4001,
      message: '请输入手机号和密码'
    };
  }

  try {
    // 查询商家
    const result = await db.collection('merchants').where({
      phone: phone,
      password: password
    }).get();

    if (result.data.length === 0) {
      return {
        code: 4002,
        message: '手机号或密码错误'
      };
    }

    const merchant = result.data[0];

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