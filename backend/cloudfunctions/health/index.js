const cloud = require('wx-server-sdk');

cloud.init({ env: 'buysomething-6gbmbtpxff05be35' });
const db = cloud.database();

// 云函数版本号
const VERSION = '1.0.0';
const START_TIME = Date.now();

/**
 * 结构化日志工具
 */
function log(level, message, data = {}) {
  const entry = {
    time: new Date().toISOString(),
    level,
    message,
    module: 'health',
    ...data
  };
  console.log(JSON.stringify(entry));
}

/**
 * 健康检查云函数
 * 支持 HTTP 和小程序 callFunction 两种调用方式
 * 
 * HTTP 调用: GET /health
 * 小程序调用: wx.cloud.callFunction({ name: 'health' })
 */
exports.main = async (event, context) => {
  const isHttpCall = event.httpMethod !== undefined;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Content-Type': 'application/json'
  };

  // 处理 OPTIONS 预检请求
  if (isHttpCall && event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const startTime = Date.now();
  const checks = {};

  try {
    // 1. 数据库连接检查
    try {
      const dbStart = Date.now();
      const dbResult = await db.collection('products').count();
      checks.database = {
        status: 'healthy',
        responseTime: Date.now() - dbStart,
        collections: dbResult.total
      };
      log('INFO', '数据库健康检查通过', { responseTime: checks.database.responseTime });
    } catch (dbErr) {
      checks.database = {
        status: 'unhealthy',
        error: dbErr.message
      };
      log('ERROR', '数据库健康检查失败', { error: dbErr.message });
    }

    // 2. 环境信息
    const envInfo = {
      envId: 'buysomething-6gbmbtpxff05be35',
      region: 'ap-shanghai',
      runtime: 'Node.js'
    };

    // 3. 构建响应
    const healthResult = {
      status: checks.database?.status === 'unhealthy' ? 'degraded' : 'healthy',
      timestamp: new Date().toISOString(),
      version: VERSION,
      uptime: Math.floor((Date.now() - START_TIME) / 1000),
      responseTime: Date.now() - startTime,
      environment: envInfo,
      checks
    };

    log('INFO', '健康检查完成', {
      status: healthResult.status,
      responseTime: healthResult.responseTime
    });

    const response = {
      code: 0,
      message: 'success',
      data: healthResult
    };

    if (isHttpCall) {
      const statusCode = healthResult.status === 'degraded' ? 503 : 200;
      return { statusCode, headers, body: JSON.stringify(response) };
    }
    return response;

  } catch (err) {
    log('ERROR', '健康检查异常', { error: err.message, stack: err.stack });

    const errorResult = {
      code: 5001,
      message: '健康检查失败',
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: err.message
      }
    };

    if (isHttpCall) {
      return { statusCode: 500, headers, body: JSON.stringify(errorResult) };
    }
    return errorResult;
  }
};
