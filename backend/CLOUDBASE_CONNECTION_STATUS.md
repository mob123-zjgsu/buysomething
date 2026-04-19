# CloudBase连接状态

## ✅ 连接状态

**项目已成功连接到CloudBase环境！**

---

## 环境信息

| 项目 | 信息 |
|------|------|
| **环境ID** | `buysomething-6gbmbtpxff05be35` |
| **环境别名** | `buysomething` |
| **状态** | ✅ NORMAL (正常运行） |
| **区域** | ap-shanghai (上海） |
| **创建时间** | 2026-03-24 22:18:49 |
| **更新时间** | 2026-03-24 22:18:53 |
| **套餐类型** | 体验版 |
| **付费模式** | 预付费 |

---

## 服务状态

### 1. 云数据库 ✅

**状态**: RUNNING (运行中）

| 实例ID | 状态 | 区域 |
|---------|------|------|
| tnt-2qky3x71y | RUNNING | ap-shanghai |

**数据库集合列表** (共10个）:

| 集合名称 | 记录数 | 大小 | 索引数 |
|---------|--------|------|--------|
| addresses | 0 | 0 | 2 |
| banners | 0 | 0 | 2 |
| cart | 0 | 0 | 2 |
| categories | 0 | 0 | 2 |
| coupons | 0 | 0 | 2 |
| favorites | 0 | 0 | 2 |
| order_items | 0 | 0 | 2 |
| orders | 0 | 0 | 2 |
| products | 0 | 0 | 2 |
| users | 0 | 0 | 2 |

**总计**: 10个集合，0条记录，0字节大小

---

### 2. 云存储 ✅

**状态**: 已开通

| 配置项 | 值 |
|--------|---|
| **存储桶** | 6275-buysomething-6gbmbtpxff05be35-1383007216 |
| **CDN域名** | 6275-buysomething-6gbmbtpxff05be35-1383007216.tcb.qcloud.la |
| **区域** | ap-shanghai |
| **域名类型** | CDN |

**静态托管域名**:
```
buysomething-6gbmbtpxff05be35-1383007216.tcloudbaseapp.com
```

---

### 3. 云函数 ✅

**状态**: 已开通 (Region: ap-shanghai)

**已部署函数列表** (共1个）:

| 函数名称 | 函数ID | 运行时 | 状态 | 部署时间 |
|---------|---------|--------|------|---------|
| register | lam-alejr9fz | Nodejs16.13 | Active | 2026-03-24 23:03:49 |

---

### 4. 静态托管 ✅

**状态**: online (在线）

| 配置项 | 值 |
|--------|---|
| **静态域名** | buysomething-6gbmbtpxff05be35-1383007216.tcloudbaseapp.com |
| **状态** | online |
| **区域** | ap-shanghai |
| **存储桶** | 81a6-static-buysomething-6gbmbtpxff05be35-1383007216 |

---

## 项目配置

### app.js 配置

```javascript
// CloudBase初始化配置
wx.cloud.init({
  env: 'buysomething-6gbmbtpxff05be35',  // ✅ 环境ID正确
  traceUser: true
})
```

### project.config.json 配置

```json
{
  "compileType": "miniprogram",
  "libVersion": "2.19.4",
  "appid": "wx942dc8388afdf947",  // ✅ AppID正确
  "projectname": "buysomething"
}
```

---

## 连接验证

### 1. CloudBase登录 ✅

```
✅ 登录成功，当前环境: buysomething-6gbmbtpxff05be35
```

### 2. 数据库连接 ✅

```
✅ 获取 NoSQL 数据库集合列表成功
✅ 共10个集合，全部正常
```

### 3. 云函数部署 ✅

```
✅ register 云函数已部署
✅ 状态: Active
✅ 运行时: Nodejs16.13
```

---

## 控制台链接

### CloudBase主控制台
[https://tcb.cloud.tencent.com/dev?envId=buysomething-6gbmbtpxff05be35](https://tcb.cloud.tencent.com/dev?envId=buysomething-6gbmbtpxff05be35)

### 数据库管理
[https://tcb.cloud.tencent.com/dev?envId=buysomething-6gbmbtpxff05be35#/db/doc](https://tcb.cloud.tencent.com/dev?envId=buysomething-6gbmbtpxff05be35#/db/doc)

### 云函数管理
[https://tcb.cloud.tencent.com/dev?envId=buysomething-6gbmbtpxff05be35#/scf](https://tcb.cloud.tencent.com/dev?envId=buysomething-6gbmbtpxff05be35#/scf)

### 云存储管理
[https://tcb.cloud.tencent.com/dev?envId=buysomething-6gbmbtpxff05be35#/storage](https://tcb.cloud.tencent.com/dev?envId=buysomething-6gbmbtpxff05be35#/storage)

### 静态托管管理
[https://tcb.cloud.tencent.com/dev?envId=buysomething-6gbmbtpxff05be35#/static-hosting](https://tcb.cloud.tencent.com/dev?envId=buysomething-6gbmbtpxff05be35#/static-hosting)

### 云开发日志
[https://tcb.cloud.tencent.com/dev?envId=buysomething-6gbmbtpxff05be35#/devops/log](https://tcb.cloud.tencent.com/dev?envId=buysomething-6gbmbtpxff05be35#/devops/log)

### 环境设置
[https://tcb.cloud.tencent.com/dev?envId=buysomething-6gbmbtpxff05be35#/env](https://tcb.cloud.tencent.com/dev?envId=buysomething-6gbmbtpxff05be35#/env)

---

## 快速测试

### 测试数据库连接

```javascript
// 在小程序控制台中运行
const db = wx.cloud.database()

db.collection('users')
  .count()
  .then(res => {
    console.log('数据库连接成功，用户数量:', res.total)
  })
  .catch(err => {
    console.error('数据库连接失败:', err)
  })
```

### 测试云函数调用

```javascript
// 在小程序控制台中运行
wx.cloud.callFunction({
  name: 'register',
  data: {
    phone: '13800138000',
    code: '123456',
    password: '123456'
  },
  success: (res) => {
    console.log('云函数调用成功:', res.result)
  },
  fail: (err) => {
    console.error('云函数调用失败:', err)
  }
})
```

### 测试云存储上传

```javascript
// 在小程序控制台中运行
wx.cloud.uploadFile({
  cloudPath: 'test/test.jpg',
  filePath: '/images/tab-home.png',  // 本地路径
  success: (res) => {
    console.log('云存储上传成功:', res.fileID)
  },
  fail: (err) => {
    console.error('云存储上传失败:', err)
  }
})
```

---

## 常用操作

### 1. 查看数据库集合

```
CloudBase控制台 → 数据库 → 选择集合
```

### 2. 添加数据到数据库

```
CloudBase控制台 → 数据库 → 选择集合 → 添加记录
```

### 3. 部署云函数

```bash
# 使用微信开发者工具
右键 cloudfunctions/函数名 → 上传并部署

# 或使用命令行
tcb functions:deploy 函数名
```

### 4. 上传文件到云存储

```
CloudBase控制台 → 云存储 → 文件管理 → 上传文件
```

### 5. 查看云函数日志

```
CloudBase控制台 → 云函数 → 选择函数 → 日志
```

---

## 下一步操作

### 1. 测试注册功能

参考 [快速开始指南](../QUICKSTART.md) 进行注册功能测试。

### 2. 添加初始数据

- 商品分类数据
- Banner轮播图
- 测试商品数据
- 优惠券模板

### 3. 部署其他云函数

- getOpenId - 获取用户OpenID
- sendSmsCode - 发送验证码
- product - 商品管理
- order - 订单管理
- cart - 购物车管理

### 4. 配置数据库安全规则

在数据库控制台中设置集合的安全规则，保护用户数据。

---

## 故障排查

### 问题1: CloudBase初始化失败

**错误信息:**
```
请使用 2.2.3 或以上的基础库以使用云能力
```

**解决方案:**
1. 更新微信开发者工具到最新版本
2. 更新基础库版本到2.19.4或更高
3. 检查 `app.js` 中的环境ID是否正确

### 问题2: 数据库连接失败

**错误信息:**
```
Error: cloud database command failed: Error: Permission denied
```

**解决方案:**
1. 检查数据库安全规则
2. 确保用户已登录（需要OpenID）
3. 检查环境ID是否正确

### 问题3: 云函数调用失败

**错误信息:**
```
Error: cloud.callFunction:fail Error: errCode: -501000
```

**解决方案:**
1. 确认云函数已部署
2. 检查函数名称是否正确
3. 查看云函数日志，排查错误

---

## 资源限制

### 体验版套餐限制

| 资源类型 | 限制 |
|---------|------|
| **数据库存储** | 2GB |
| **数据库读操作** | 5万次/天 |
| **数据库写操作** | 3万次/天 |
| **云存储容量** | 5GB |
| **CDN流量** | 5GB/月 |
| **云函数调用** | 20万次/月 |
| **云函数运行时间** | 40万GBs/月 |

**注意**: 体验版有使用限制，生产环境建议升级到付费套餐。

---

## 监控与日志

### 实时监控

访问 [CloudBase监控页面](https://tcb.cloud.tencent.com/dev?envId=buysomething-6gbmbtpxff05be35#/overview) 查看：

- 数据库读写次数
- 云函数调用次数
- 存储空间使用
- CDN流量使用

### 日志查询

访问 [CloudBase日志页面](https://tcb.cloud.tencent.com/dev?envId=buysomething-6gbmbtpxff05be35#/devops/log) 查看：

- 云函数日志
- 数据库操作日志
- 错误日志

---

## 总结

### ✅ 已完成

1. **CloudBase登录** - 成功登录到环境
2. **数据库连接** - 10个集合已创建并正常运行
3. **云函数部署** - register函数已部署并处于活跃状态
4. **云存储开通** - 存储桶和CDN已配置
5. **静态托管** - 托管服务已在线

### ⏳ 待完成

1. **添加初始数据** - 导入商品、分类、Banner等数据
2. **部署更多云函数** - 完善业务逻辑
3. **配置安全规则** - 保护数据库访问
4. **配置CDN域名** - 优化图片加载速度

---

**文档更新时间**: 2026-03-24
**环境ID**: buysomething-6gbmbtpxff05be35
**状态**: ✅ 已连接并正常运行
