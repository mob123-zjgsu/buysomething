const cloud = require('wx-server-sdk');
const crypto = require('crypto');

// 初始化 CloudBase
cloud.init({
  env: 'buysomething-6gbmbtpxff05be35'
});

const db = cloud.database();

// MD5 哈希函数
function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

// 密码验证函数（兼容新旧两种存储方式）
function verifyPassword(inputPassword, storedPassword, salt) {
  // 1. 新方式：使用 salt 的哈希
  if (salt) {
    let hash = inputPassword + salt;
    for (let i = 0; i < 1000; i++) {
      hash = md5(hash);
    }
    return hash === storedPassword;
  }
  
  // 2. 旧方式：纯 MD5（兼容旧数据）
  const inputMd5 = md5(inputPassword);
  if (inputMd5 === storedPassword) {
    return true;
  }
  
  // 3. 测试环境：明文密码兼容（如 123456）
  if (inputPassword === storedPassword) {
    return true;
  }
  
  return false;
}

/**
 * 用户登录 API
 * 支持小程序 callFunction 和 HTTP 两种调用方式
 */
exports.main = async (event, context) => {
  // 小程序调用时，event 直接是参数对象
  // HTTP 调用时，event 包含 httpMethod, body 等
  const isHttpCall = event.httpMethod !== undefined;
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Content-Type': 'application/json'
  };

  // 处理 OPTIONS 预检请求
  if (isHttpCall && event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // 解析请求参数
    let body;
    if (isHttpCall && event.body) {
      body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } else {
      // 小程序调用：event 直接是数据
      body = event;
    }

    const { phone, password, code } = body || {};

    console.log('登录请求:', { phone });

    // 参数验证
    if (!phone || !password) {
      const result = { code: 1001, message: '手机号和密码不能为空', data: {} };
      if (isHttpCall) return { statusCode: 400, headers, body: JSON.stringify(result) };
      return result;
    }

    // 验证手机号格式
    const phoneReg = /^1[3-9]\d{9}$/;
    if (!phoneReg.test(phone)) {
      const result = { code: 1001, message: '手机号格式不正确', data: {} };
      if (isHttpCall) return { statusCode: 400, headers, body: JSON.stringify(result) };
      return result;
    }

    // 查询用户
    const userResult = await db.collection('users').where({
      phone: phone
    }).get();

    if (userResult.data.length === 0) {
      const result = { code: 1002, message: '用户不存在，请先注册', data: {} };
      if (isHttpCall) return { statusCode: 404, headers, body: JSON.stringify(result) };
      return result;
    }

    const user = userResult.data[0];

    // 验证密码（支持新旧两种验证方式）
    const isValidPassword = verifyPassword(password, user.password, user.passwordSalt);
    if (!isValidPassword) {
      const result = { code: 1002, message: '密码错误', data: {} };
      if (isHttpCall) return { statusCode: 401, headers, body: JSON.stringify(result) };
      return result;
    }

    // 验证码验证（测试阶段允许0000跳过）
    if (code && code !== '0000') {
      const codeResult = await db.collection('sms_codes').where({
        phone: phone,
        expiresAt: db.command.gt(new Date())
      }).orderBy('createTime', 'desc').limit(1).get();

      if (codeResult.data.length === 0 || codeResult.data[0].code !== code) {
        const result = { code: 1009, message: '验证码错误或已过期', data: {} };
        if (isHttpCall) return { statusCode: 400, headers, body: JSON.stringify(result) };
        return result;
      }
    }

    // 生成 token（包含过期时间）
    const tokenData = {
      userId: user._id,
      phone: user.phone,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 天过期
    };
    const token = Buffer.from(JSON.stringify(tokenData)).toString('base64');

    // 返回用户信息（过滤敏感信息）
    const userInfo = {
      userId: user._id,
      phone: user.phone,
      nickname: user.nickname,
      avatar: user.avatar,
      points: user.points,
      level: user.level,
      balance: user.balance || 0
    };

    const result = {
      code: 0,
      message: 'success',
      data: {
        token,
        userInfo
      }
    };

    // 小程序调用直接返回对象，HTTP 调用返回 HTTP 格式
    if (isHttpCall) {
      return { statusCode: 200, headers, body: JSON.stringify(result) };
    }
    return result;

  } catch (err) {
    console.error('登录失败:', err);
    // 安全修复：不再返回内部错误信息
    const errorResult = {
      code: 2001,
      message: '服务器错误',
      data: null
    };
    
    if (isHttpCall) {
      return { statusCode: 500, headers, body: JSON.stringify(errorResult) };
    }
    return errorResult;
  }
};
