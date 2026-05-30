/**
 * 监控工具库 - 供其他云函数使用的结构化日志和指标收集模块
 * 
 * 使用方式:
 *   const { logger, metrics } = require('./monitor-utils');
 *   logger.info('用户登录', { phone: '138****0001' });
 *   metrics.recordRequest('login', resTime, statusCode);
 */

const VERSION = '1.0.0';

/**
 * ==================== 结构化日志 ====================
 */
class StructuredLogger {
  constructor(module) {
    this.module = module;
  }

  _log(level, message, data = {}) {
    const entry = {
      time: new Date().toISOString(),
      level,
      message,
      module: this.module,
      ...data
    };
    // 确保敏感信息被脱敏
    if (entry.phone) {
      entry.phone = entry.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    }
    if (entry.password) {
      entry.password = '***';
    }
    // 输出 JSON 格式，方便日志平台解析
    console.log(JSON.stringify(entry));
    return entry;
  }

  info(message, data = {}) {
    return this._log('INFO', message, data);
  }

  warn(message, data = {}) {
    return this._log('WARN', message, data);
  }

  error(message, data = {}) {
    return this._log('ERROR', data.error ? { ...data, error: data.error.message || data.error } : data);
  }

  debug(message, data = {}) {
    return this._log('DEBUG', message, data);
  }
}

/**
 * ==================== 内存指标收集 ====================
 * 注意：云函数是无状态的，指标仅在单次调用中有效
 * 实际使用建议将指标写入数据库做持久化
 */
class MetricsCollector {
  constructor() {
    this.reset();
  }

  reset() {
    this.requests = [];
    this.errors = [];
  }

  /**
   * 记录一次请求
   * @param {string} endpoint - 端点名称
   * @param {number} responseTime - 响应时间(ms)
   * @param {number} statusCode - HTTP 状态码或业务 code
   */
  recordRequest(endpoint, responseTime, statusCode) {
    const record = {
      endpoint,
      responseTime,
      statusCode,
      timestamp: new Date().toISOString()
    };
    this.requests.push(record);
    return record;
  }

  /**
   * 记录一个错误
   * @param {string} type - 错误类型
   * @param {string} message - 错误信息
   * @param {string} endpoint - 发生的端点
   */
  recordError(type, message, endpoint = 'unknown') {
    const record = {
      type,
      message,
      endpoint,
      timestamp: new Date().toISOString()
    };
    this.errors.push(record);
    return record;
  }

  /**
   * 获取当前指标汇总
   */
  getSummary() {
    const now = Date.now();
    const recentRequests = this.requests.filter(r => now - new Date(r.timestamp).getTime() < 3600000);
    const recentErrors = this.errors.filter(r => now - new Date(r.timestamp).getTime() < 3600000);

    // 计算平均响应时间
    const avgResponseTime = recentRequests.length > 0
      ? Math.round(recentRequests.reduce((sum, r) => sum + r.responseTime, 0) / recentRequests.length)
      : 0;

    // 按端点统计
    const byEndpoint = {};
    recentRequests.forEach(r => {
      if (!byEndpoint[r.endpoint]) {
        byEndpoint[r.endpoint] = { count: 0, totalTime: 0, errors: 0 };
      }
      byEndpoint[r.endpoint].count++;
      byEndpoint[r.endpoint].totalTime += r.responseTime;
      if (r.statusCode >= 400 || r.statusCode === 0) {
        byEndpoint[r.endpoint].errors++;
      }
    });

    return {
      timestamp: new Date().toISOString(),
      requestCount: recentRequests.length,
      errorCount: recentErrors.length,
      errorRate: recentRequests.length > 0
        ? ((recentErrors.length / recentRequests.length) * 100).toFixed(2) + '%'
        : '0%',
      avgResponseTime,
      byEndpoint
    };
  }
}

// 单例实例
const globalMetrics = new MetricsCollector();

/**
 * 中间件：自动记录请求指标
 * 用于 HTTP 型云函数
 */
function metricsMiddleware(handler) {
  return async (event, context) => {
    const startTime = Date.now();
    const endpoint = event.httpMethod
      ? `${event.httpMethod} ${event.path || '/'}`
      : 'callFunction';

    try {
      const result = await handler(event, context);

      const statusCode = result?.statusCode || (result?.code === 0 ? 200 : 500);
      globalMetrics.recordRequest(endpoint, Date.now() - startTime, statusCode);

      return result;
    } catch (err) {
      globalMetrics.recordRequest(endpoint, Date.now() - startTime, 500);
      globalMetrics.recordError(err.name || 'Error', err.message, endpoint);
      throw err;
    }
  };
}

module.exports = {
  logger: (module) => new StructuredLogger(module),
  metrics: globalMetrics,
  metricsMiddleware,
  VERSION
};
