# 代码说明文档目录

本文档用于帮助理解小程序的整体架构和代码逻辑，适合答辩展示。

## 文件列表

### 1. app.js说明.txt
- 小程序入口文件
- CloudBase 初始化
- 全局状态管理
- 登录状态检查

### 2. pages-home-home说明.txt
- 首页功能
- 轮播图/分类/商品列表
- 调用 products 云函数

### 3. pages-login-login说明.txt
- 用户登录页面
- 手机号+密码登录
- 调用 login 云函数
- 登录状态保存

### 4. pages-register-register说明.txt
- 用户注册页面
- 验证码发送与验证
- 调用 register 云函数
- 表单验证逻辑

### 5. pages-product-detail-product-detail说明.txt
- 商品详情页
- 调用 product-detail 云函数
- 添加购物车逻辑
- 规格选择功能

### 6. pages-cart-cart说明.txt
- 购物车页面
- 本地存储操作
- 商品选择/数量修改
- 结算流程

### 7. cloudfunctions-云函数说明.txt
- 所有云函数详细说明
- 输入输出参数
- 数据库操作
- 安全机制

### 8. 代码架构总结.txt
- 整体架构图
- 数据流向
- 前后端交互模式
- 答辩问题回答

---

## 快速阅读顺序（建议答辩时）

1. **代码架构总结.txt** - 先看整体架构，脑中形成框架
2. **app.js说明.txt** - 理解入口和初始化
3. **cloudfunctions-云函数说明.txt** - 理解后端逻辑
4. **各页面说明.txt** - 理解具体功能实现

---

## 答辩时可以说的亮点

### 技术亮点
1. 使用 CloudBase 云开发，无需自建服务器
2. 微信 OpenID 自动认证，安全可靠
3. 本地存储 + 云端存储混合使用，优化性能
4. 可复用组件封装，提高代码复用性

### 架构亮点
1. 云函数统一处理业务逻辑
2. 分层清晰：前端页面 → 云函数 → 数据库
3. 参数验证 + 统一错误处理
4. 安全规则保护用户数据

### 功能亮点
1. 完整的用户注册登录流程
2. 商品浏览 + 筛选 + 详情
3. 购物车本地化管理
4. 订单流程（可选实现）

---

## 核心代码位置速查

| 功能 | 代码文件 | 关键行数 |
|------|---------|---------|
| CloudBase初始化 | app.js | 7-15行 |
| 登录验证 | pages/login/login.js | 35-130行 |
| 注册逻辑 | pages/register/register.js | 82-200行 |
| 商品列表 | cloudfunctions/products/index.js | 全文 |
| 商品详情 | cloudfunctions/product-detail/index.js | 全文 |
| 购物车存储 | pages/cart/cart.js | 19-24行 |

---

最后更新：2026-04-14
