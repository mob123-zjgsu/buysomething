const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { phone, code, password } = event;

  console.log('注册请求:', { phone, code });

  try {
    // 获取用户OpenID
    const { OPENID } = cloud.getWXContext();

    // 验证手机号格式
    const phoneReg = /^1[3-9]\d{9}$/;
    if (!phoneReg.test(phone)) {
      return {
        success: false,
        message: '手机号格式不正确'
      };
    }

    // 验证密码长度
    if (password.length < 6 || password.length > 20) {
      return {
        success: false,
        message: '密码长度应为6-20位'
      };
    }

    // 测试环境: 验证码固定为123456
    if (code !== '123456') {
      return {
        success: false,
        message: '验证码错误,请输入 123456'
      };
    }

    // 检查手机号是否已注册
    const checkResult = await db.collection('users').where({
      phone: phone
    }).get();

    if (checkResult.data.length > 0) {
      return {
        success: false,
        message: '该手机号已注册'
      };
    }

    // 检查OpenID是否已注册
    const openidCheck = await db.collection('users').where({
      _openid: OPENID
    }).get();

    if (openidCheck.data.length > 0) {
      // 用户已存在,更新信息
      await db.collection('users').doc(openidCheck.data[0]._id).update({
        data: {
          phone: phone,
          password: password,
          updateTime: db.serverDate()
        }
      });

      const userInfo = {
        _id: openidCheck.data[0]._id,
        _openid: OPENID,
        nickname: openidCheck.data[0].nickname || '用户' + phone.substring(7),
        avatar: openidCheck.data[0].avatar || '/images/default-avatar.png',
        phone: phone,
        points: openidCheck.data[0].points || 0,
        level: openidCheck.data[0].level || 1
      };

      return {
        success: true,
        message: '注册成功',
        userInfo: userInfo
      };
    }

    // 创建新用户
    const now = new Date();
    const result = await db.collection('users').add({
      data: {
        _openid: OPENID,
        phone: phone,
        password: password,
        nickname: '用户' + phone.substring(7),
        avatar: '/images/default-avatar.png',
        gender: 0,
        city: '',
        province: '',
        points: 0,
        level: 1,
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    });

    const userInfo = {
      _id: result._id,
      _openid: OPENID,
      nickname: '用户' + phone.substring(7),
      avatar: '/images/default-avatar.png',
      phone: phone,
      points: 0,
      level: 1
    };

    return {
      success: true,
      message: '注册成功',
      userInfo: userInfo
    };

  } catch (err) {
    console.error('注册失败:', err);
    return {
      success: false,
      message: '注册失败,请稍后重试'
    };
  }
};
