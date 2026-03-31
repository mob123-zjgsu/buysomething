# 优选购物小程序

基于微信小程序 + 腾讯云 CloudBase 的购物应用

## 项目简介

- **应用名称**: 优选购物
- **目标用户**: 普通消费者
- **设计风格**: 简洁、清爽、圆角、渐变点缀
- **主色调**: #FF6B6B (珊瑚红) / #4ECDC4 (薄荷绿)

## 技术栈

- **前端**: 微信小程序
- **后端**: 腾讯云 CloudBase (云开发)
  - 云数据库: 存储商品、订单、用户数据
  - 云函数: 处理业务逻辑
  - 云存储: 存储商品图片
  - 云接入: HTTP API 接入

## 项目结构

```
buysomething/
├── pages/                 # 小程序页面
│   ├── splash/            # 启动页
│   ├── home/              # 首页
│   ├── category/          # 分类页
│   ├── product-list/      # 商品列表
│   ├── product-detail/    # 商品详情
│   ├── cart/              # 购物车
│   ├── login/             # 登录/注册
│   ├── profile/           # 个人中心
│   ├── order-list/        # 订单列表
│   ├── order-detail/      # 订单详情
│   └── address/           # 地址管理
├── images/                 # 图片资源
├── cloudfunctions/        # 云函数
│   └── getOpenId/         # 获取 OpenID
├── app.js                  # 小程序入口
├── app.json                # 小程序配置
├── app.wxss                # 全局样式
├── project.config.json     # 项目配置
└── README.md               # 说明文档
```

## 快速开始

### 1. 准备工作

- 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- 注册 [微信小程序账号](https://mp.weixin.qq.com/)
- 申请 [腾讯云 CloudBase](https://console.cloud.tencent.com/tcb)

### 2. 连接 CloudBase

详细步骤请查看 [CloudBase 连接指南](./CLOUDBASE_SETUP.md)

### 3. 配置小程序

1. 使用微信开发者工具打开项目
2. 在 `project.config.json` 中配置 `appid`
3. 修改 `app.js` 中的 CloudBase 环境 ID
4. 点击"编译"运行项目

### 4. 调试与预览

- 真机调试: 点击"真机调试"按钮
- 预览: 点击"预览"按钮,微信扫码查看

## 页面说明

### 核心页面

1. **启动页** (`pages/splash`)
   - 显示应用 Logo 和欢迎语
   - 2秒后自动跳转到首页

2. **首页** (`pages/home`)
   - 定位、搜索框、消息通知
   - Banner 轮播图
   - 功能入口(限时秒杀、今日特价等)
   - 商品瀑布流推荐

3. **商品列表页** (`pages/product-list`)
   - 筛选功能(综合、销量、价格)
   - 商品瀑布流展示
   - 上拉加载更多

4. **商品详情页** (`pages/product-detail`)
   - 商品大图轮播
   - 商品信息(名称、价格、销量)
   - 规格选择
   - 图文详情
   - 底部操作按钮

5. **购物车页** (`pages/cart`)
   - 购物车商品列表
   - 商品选择、数量修改
   - 结算功能

6. **个人中心页** (`pages/profile`)
   - 用户信息展示
   - 订单状态入口
   - 功能列表(优惠券、地址、设置等)

### 次级页面

7. **分类页** (`pages/category`)
   - 左侧分类导航
   - 右侧商品列表

8. **登录/注册页** (`pages/login`)
   - 账号密码登录
   - 验证码登录
   - 第三方登录

9. **订单列表页** (`pages/order-list`)
   - 订单状态筛选
   - 订单列表展示

10. **订单详情页** (`pages/order-detail`)
    - 订单信息
    - 价格明细
    - 物流信息

11. **地址管理页** (`pages/address`)
    - 地址列表
    - 新增/编辑/删除地址

## 设计规范

### 颜色规范

```yaml
primary: "#FF6B6B"       # 主色调(珊瑚红)
secondary: "#4ECDC4"    # 辅助色(薄荷绿)
warning: "#FFB347"      # 警告色(橙色)
success: "#4CAF50"      # 成功色(绿色)
text_primary: "#333333"  # 主要文字
text_secondary: "#999999" # 次要文字
background: "#FFFFFF"   # 背景色
divider: "#EEEEEE"      # 分隔线
```

### 尺寸规范

```yaml
border_radius_small: 4px
border_radius_medium: 8px
border_radius_large: 12px
border_radius_xl: 20px

font_size_small: 12px
font_size_medium: 14px
font_size_large: 16px
font_size_xl: 18px
font_size_xxl: 20px
font_size_title: 24px
```

### 间距规范

```yaml
spacing_xs: 4px
spacing_sm: 8px
spacing_md: 12px
spacing_lg: 16px
spacing_xl: 20px
spacing_xxl: 24px
```

## CloudBase 集成

### 数据库集合

| 集合名称 | 用途 |
|---------|------|
| `products` | 商品信息 |
| `categories` | 商品分类 |
| `orders` | 订单信息 |
| `cart` | 购物车 |
| `users` | 用户信息 |
| `addresses` | 收货地址 |

### 云函数

| 函数名 | 功能 | 状态 |
|-------|------|------|
| `register` | 用户注册 | ✅ 已部署 |
| `getOpenId` | 获取用户 OpenID | ⏳ 待部署 |

### 部署状态

- ✅ 数据库集合: 10个集合已创建
- ✅ 云函数: register已部署
- ✅ 测试数据: 5个测试用户已添加
- ✅ 注册页面: 已完成
- ⏳ 登录功能: 待实现

### 测试数据

已添加5个测试用户到 `users` 集合，详细说明请查看 [TEST_DATA.md](./docs/TEST_DATA.md)

**测试账号:**
- 所有用户密码均为: `123456`
- 可用手机号: `13800138001` ~ `13800138005`

**用户分布:**
- 覆盖不同用户等级(1-5)
- 覆盖不同VIP等级(0-4)
- 覆盖不同性别(男/女/未知)
- 积分范围: 1,000 ~ 25,000
- 余额范围: ¥500 ~ ¥8,000

### 云存储

| 文件夹 | 用途 |
|-------|------|
| `products/` | 商品图片 |
| `avatars/` | 用户头像 |
| `banners/` | Banner 图片 |

## 开发指南

### 添加新页面

1. 在 `pages/` 目录下创建页面文件夹
2. 创建 4 个文件: `.js`, `.json`, `.wxml`, `.wxss`
3. 在 `app.json` 的 `pages` 数组中注册页面

### 添加云函数

1. 在 `cloudfunctions/` 目录下创建函数文件夹
2. 创建 `index.js` 和 `package.json`
3. 右键文件夹 → 上传并部署

### 调试技巧

- 使用 `console.log()` 输出调试信息
- 在微信开发者工具的"调试器"中查看日志
- 使用 `wx.cloud.init({ traceUser: true })` 追踪用户行为

## 部署上线

1. 在微信开发者工具中点击"上传"
2. 登录 [微信小程序后台](https://mp.weixin.qq.com/)
3. 提交审核
4. 审核通过后发布

## 常见问题

### Q: 图片无法显示?

A: 检查图片路径是否正确,或确认 CloudBase 云存储权限配置。

### Q: 数据库读取失败?

A: 确认 CloudBase 环境 ID 配置正确,检查数据库安全规则。

### Q: 云函数调用失败?

A: 确认云函数已部署成功,检查函数名称和参数。

## 参考资源

- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [CloudBase 云开发文档](https://docs.cloudbase.net/)
- [CloudBase 连接指南](./CLOUDBASE_SETUP.md)

## License

MIT

## 支持

如有问题,欢迎提 Issue 或联系开发者。

---

**祝开发顺利! 🎉**
