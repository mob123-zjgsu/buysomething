# 优选购物小程序 - 快速开始指南

## 📋 目录

1. [环境准备](#环境准备)
2. [项目初始化](#项目初始化)
3. [CloudBase配置](#cloudbase配置)
4. [部署云函数](#部署云函数)
5. [测试注册功能](#测试注册功能)
6. [常见问题](#常见问题)

---

## 环境准备

### 1. 安装必要工具

- ✅ 微信开发者工具 [下载地址](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- ✅ 微信小程序账号 [注册地址](https://mp.weixin.qq.com/)

### 2. 获取必要信息

- **AppID**: `wx942dc8388afdf947`
- **环境ID**: `buysomething-6gbmbtpxff05be35`

---

## 项目初始化

### 1. 打开项目

1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择目录: `f:/code/buysomething`
4. 填写AppID: `wx942dc8388afdf947`
5. 点击"导入"

### 2. 验证项目结构

```
buysomething/
├── app.js              ✅ 小程序入口
├── app.json            ✅ 全局配置
├── pages/              ✅ 页面目录
│   ├── register/       ✅ 注册页面
│   └── login/          ✅ 登录页面
├── cloudfunctions/     ✅ 云函数目录
│   └── register/       ✅ 注册云函数
└── docs/               ✅ 文档目录
```

---

## CloudBase配置

### 1. 检查CloudBase初始化

打开 `app.js`，确认以下配置：

```javascript
wx.cloud.init({
  env: 'buysomething-6gbmbtpxff05be35',  // ✅ 环境ID
  traceUser: true
})
```

### 2. 检查数据库集合

访问 [CloudBase数据库控制台](https://tcb.cloud.tencent.com/dev?envId=buysomething-6gbmbtpxff05be35#/db/doc)

确认以下集合已创建：

| 集合名称 | 状态 |
|---------|------|
| users | ✅ 已创建 |
| products | ✅ 已创建 |
| categories | ✅ 已创建 |
| cart | ✅ 已创建 |
| orders | ✅ 已创建 |
| order_items | ✅ 已创建 |
| addresses | ✅ 已创建 |
| coupons | ✅ 已创建 |
| favorites | ✅ 已创建 |
| banners | ✅ 已创建 |

---

## 部署云函数

### 方式一: 使用微信开发者工具（推荐）

1. 在微信开发者工具中
2. 找到 `cloudfunctions/register` 文件夹
3. 右键点击该文件夹
4. 选择"上传并部署:云端安装依赖"
5. 等待部署完成

**当前状态:**
✅ `register` 云函数已部署（2026-03-24 23:03:49）

### 方式二: 使用命令行

```bash
# 进入项目目录
cd f:/code/buysomething

# 部署云函数
tcb functions:deploy register
```

### 验证云函数部署

访问 [CloudBase云函数控制台](https://tcb.cloud.tencent.com/dev?envId=buysomething-6gbmbtpxff05be35#/scf)

确认 `register` 函数状态为 **Active**

---

## 测试注册功能

### 测试步骤

1. **启动小程序**
   - 在微信开发者工具中点击"编译"
   - 小程序将在模拟器中启动

2. **进入登录页面**
   - 点击底部Tab "我的"
   - 点击"登录/注册"按钮

3. **进入注册页面**
   - 点击"立即注册"

4. **填写注册信息**

   | 字段 | 值 | 说明 |
   |------|---|------|
   | 手机号 | `13800138000` | 任意11位手机号 |
   | 验证码 | `123456` | 点击"获取验证码"后输入 |
   | 密码 | `123456` | 6-20位 |
   | 确认密码 | `123456` | 与密码一致 |
   | 用户协议 | ✅ 勾选 | 必须勾选 |

5. **完成注册**
   - 点击"立即注册"
   - 等待注册成功提示
   - 自动返回登录页

### 预期结果

✅ **注册成功**
- 显示"注册成功"提示
- 自动跳转到登录页
- 用户信息已保存到数据库

---

## 常见问题

### Q1: 提示"FunctionName parameter could not be found"

**原因:** 云函数未部署

**解决方案:**

1. 确认 `register` 云函数已部署
2. 查看云函数控制台: [CloudBase云函数](https://tcb.cloud.tencent.com/dev?envId=buysomething-6gbmbtpxff05be35#/scf)
3. 如果未部署，请参考[部署云函数](#部署云函数)

**当前状态:** ✅ 云函数已部署

---

### Q2: 提示"请输入验证码 123456"

**说明:** 这是正常提示，不是错误

**解决方案:**

1. 在验证码输入框中输入 `123456`
2. 这个是测试环境的固定验证码

---

### Q3: 提示"该手机号已注册"

**原因:** 手机号已被使用

**解决方案:**

1. 使用其他手机号测试
2. 或在数据库中删除已注册的记录

---

### Q4: 提示"验证码错误"

**原因:** 验证码输入错误

**解决方案:**

确保输入 `123456`（六个字符）

---

### Q5: 注册成功后无法登录

**原因:** 登录功能尚未实现

**说明:** 目前只实现了注册功能，登录功能正在开发中

**临时解决方案:**

注册成功后，可以通过以下方式验证：

1. 查看数据库中的用户记录
2. 访问 [CloudBase数据库](https://tcb.cloud.tencent.com/dev?envId=buysomething-6gbmbtpxff05be35#/db/doc)
3. 选择 `users` 集合
4. 查看新注册的用户

---

## 开发调试

### 查看云函数日志

```
CloudBase控制台 → 云函数 → register → 日志
```

### 查看数据库记录

```
CloudBase控制台 → 数据库 → users → 查看记录
```

### 前端调试

在微信开发者工具中：

1. 打开调试器（Ctrl/Cmd + B）
2. 在Console中查看日志
3. 在Network中查看API请求
4. 在Sources中设置断点

---

## 下一步

注册功能完成后，可以继续开发：

1. **完善登录功能** - 实现密码登录和验证码登录
2. **个人中心** - 显示用户信息和积分
3. **订单系统** - 实现订单创建和管理
4. **购物车** - 保存用户购物车数据
5. **地址管理** - 管理收货地址

---

## 相关文档

- [架构设计文档](docs/01-架构设计文档.md)
- [数据库设计文档](docs/02-数据库设计文档.md)
- [API设计文档](docs/03-API设计文档.md)
- [技术选型与环境搭建](docs/07-技术选型与环境搭建.md)
- [常见错误排查指南](docs/08-常见错误排查指南.md)
- [云函数部署状态](docs/CLOUD_FUNCTIONS_STATUS.md)

---

## 技术支持

### 遇到问题？

1. 查看[常见错误排查指南](docs/08-常见错误排查指南.md)
2. 查看[云函数部署状态](docs/CLOUD_FUNCTIONS_STATUS.md)
3. 查看微信开发者工具Console中的错误日志

### 需要帮助？

- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [CloudBase云开发文档](https://docs.cloudbase.net/)
- [错误码查询](https://docs.cloudbase.net/error-code)

---

**最后更新:** 2026-03-24
**版本:** v1.0.0
