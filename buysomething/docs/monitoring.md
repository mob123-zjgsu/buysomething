# 📊 监控配置说明

## 概述

为优选购物小程序的后端服务（CloudBase 云函数 + 前端 Express 服务器）配置基础监控体系，实现服务可观测性。

---

## 1. 日志管理

### 1.1 结构化日志格式

所有云函数日志采用 **JSON 结构化格式** 输出，便于日志平台（如 CloudBase 日志中心）解析和检索。

日志格式规范：
```json
{
  "time": "2026-05-30T15:00:00.000Z",
  "level": "INFO|WARN|ERROR|DEBUG",
  "message": "操作描述",
  "module": "模块名称",
  "data": {}
}
```

### 1.2 日志工具模块

**文件**：`cloudfunctions/monitor-utils/index.js`

提供两个核心功能：

#### StructuredLogger（结构化日志器）
```javascript
const { logger } = require('./monitor-utils');
const log = logger('login');

log.info('用户登录成功', { phone: '138****0001', userId: 'xxx' });
// 输出: {"time":"...","level":"INFO","message":"用户登录成功","module":"login","phone":"138****0001","userId":"xxx"}

log.error('数据库连接失败', { error: err.message });
// 输出: {"time":"...","level":"ERROR","message":"数据库连接失败","module":"login","error":"Connection timeout"}
```

**特性**：
- 自动脱敏手机号（`1381234****`）
- 自动过滤密码字段
- JSON 格式输出，方便平台检索

#### MetricsCollector（指标收集器）
```javascript
const { metrics } = require('./monitor-utils');

// 记录请求
metrics.recordRequest('GET /products', 45, 200);

// 记录错误
metrics.recordError('DatabaseError', '连接超时', 'POST /login');

// 获取汇总
const summary = metrics.getSummary();
// { requestCount: 128, errorCount: 3, errorRate: '2.34%', avgResponseTime: 52 }
```

### 1.3 日志级别说明

| 级别 | 用途 | 示例 |
|------|------|------|
| `DEBUG` | 开发调试信息 | SQL 语句、参数值 |
| `INFO` | 正常业务操作 | 用户登录、订单创建 |
| `WARN` | 潜在问题 | 接近限流阈值、密码错误 |
| `ERROR` | 错误异常 | 数据库异常、第三方 API 失败 |

---

## 2. 健康检查端点

### 2.1 云函数健康检查

**文件**：`cloudfunctions/health/index.js`

**HTTP 访问**：`GET /health`（通过 CloudBase HTTP 触发器）

**响应示例**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "status": "healthy",
    "timestamp": "2026-05-30T15:00:00.000Z",
    "version": "1.0.0",
    "uptime": 86400,
    "responseTime": 23,
    "environment": {
      "envId": "buysomething-6gbmbtpxff05be35",
      "region": "ap-shanghai",
      "runtime": "Node.js"
    },
    "checks": {
      "database": {
        "status": "healthy",
        "responseTime": 12,
        "collections": 10
      }
    }
  }
}
```

**检查项**：
| 检查项 | 说明 | 异常时状态 |
|--------|------|-----------|
| 数据库连接 | 查询 products 集合计数 | `unhealthy` → 整体 `degraded` |
| 环境信息 | 返回环境 ID、区域、运行时 | - |

**状态定义**：
- `healthy`：所有检查通过（HTTP 200）
- `degraded`：部分检查失败（HTTP 503）
- `unhealthy`：健康检查本身出错（HTTP 500）

### 2.2 前端 Express 健康检查

**文件**：`frontend/server.js`

```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

**Docker 健康检查配置**：
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', ...)"
```

---

## 3. 基础指标收集

### 3.1 指标维度

| 指标 | 说明 | 收集方式 |
|------|------|----------|
| 请求计数 | 按端点统计请求数 | `MetricsCollector` 内存计数 |
| 响应时间 | 请求处理耗时（ms） | 记录 `Date.now()` 差值 |
| 错误率 | 错误请求占比 | 错误数 / 总请求数 |
| 状态码分布 | 200/400/500 比例 | 按状态码分组统计 |

### 3.2 指标输出

```javascript
// 获取指标汇总
const summary = metrics.getSummary();

// 输出:
{
  "timestamp": "2026-05-30T15:00:00.000Z",
  "requestCount": 128,
  "errorCount": 3,
  "errorRate": "2.34%",
  "avgResponseTime": 52,
  "byEndpoint": {
    "GET /products": { "count": 45, "totalTime": 2100, "errors": 0 },
    "POST /login": { "count": 30, "totalTime": 1800, "errors": 1 },
    "GET /product-detail": { "count": 53, "totalTime": 2756, "errors": 2 }
  }
}
```

### 3.3 使用 monitMiddleware

```javascript
const { metricsMiddleware } = require('./monitor-utils');

exports.main = metricsMiddleware(async (event, context) => {
  // 业务逻辑
  // 中间件自动记录请求时间、状态码
});
```

---

## 4. 监控架构图

```
┌─────────────────────────────────────────────────────────┐
│                      监控体系架构                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  云函数层                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   health    │  │ monitor-    │  │  其他云函数  │    │
│  │  健康检查   │  │  utils      │  │  (login等)   │    │
│  │             │  │  日志+指标  │  │ 引入logger  │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
│         │                │                │            │
│         ▼                ▼                ▼            │
│  ┌─────────────────────────────────────────────────┐   │
│  │         CloudBase 日志中心 / 云函数日志          │   │
│  │         (JSON 结构化日志自动采集)                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  前端层                                                 │
│  ┌─────────────┐                                       │
│  │  Express    │  /health 端点                          │
│  │  server.js  │  Docker HEALTHCHECK                    │
│  └─────────────┘                                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 5. 监控检查清单

- [x] 结构化 JSON 日志格式（`monitor-utils` 模块）
- [x] 日志级别配置（DEBUG/INFO/WARN/ERROR）
- [x] 敏感信息脱敏（手机号、密码）
- [x] 健康检查端点（云函数 `health` + Express `/health`）
- [x] 数据库连接检查
- [x] 请求计数和响应时间指标
- [x] 错误率统计
- [x] Docker 容器健康检查
- [ ] 错误追踪服务集成（可选 - Sentry）
- [ ] 告警规则配置（可选 - 服务不可用/错误率阈值）

---

## 6. 查看方式

### CloudBase 日志查询

访问 CloudBase 控制台日志中心：
`https://tcb.cloud.tencent.com/dev?envId=buysomething-6gbmbtpxff05be35#/devops/log`

可通过 JSON 字段检索：
- 按级别：`level:ERROR`
- 按模块：`module:login`
- 按消息关键词：`message:*登录*`

### 健康检查测试

```bash
# 云函数健康检查（HTTP 触发器）
curl https://你的域名/health

# 前端 Express 健康检查
curl http://localhost:3000/health
```

---

## 参考资源

- [CloudBase 日志管理](https://docs.cloudbase.net/service/log)
- [Winston 日志库](https://github.com/winstonjs/winston)
- [Sentry 错误追踪](https://sentry.io/)
- [Docker HEALTHCHECK](https://docs.docker.com/engine/reference/builder/#healthcheck)
