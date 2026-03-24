# 优选购物 - 微信小程序

一个简洁美观的购物类微信小程序。

## 项目介绍

优选购物是一款面向普通消费者的购物小程序,采用简洁清爽的设计风格,主色调为珊瑚红(#FF6B6B)和薄荷绿(#4ECDC4)。

## 功能特性

### 核心页面
- ✅ 启动页 - 欢迎页面,自动跳转
- ✅ 首页 - 商品推荐、轮播图、功能入口、商品瀑布流
- ✅ 商品列表页 - 商品浏览、筛选、排序
- ✅ 商品详情页 - 商品信息、规格选择、图片预览
- ✅ 购物车页 - 商品管理、结算、删除
- ✅ 个人中心页 - 用户信息、订单入口、功能菜单

### 次级页面
- ✅ 登录/注册页 - 账号密码登录、验证码登录、第三方登录
- ✅ 订单列表页 - 订单状态筛选、订单操作
- ✅ 订单详情页 - 订单信息、商品信息、价格明细
- ✅ 收货地址页 - 地址管理、设为默认
- ✅ 分类页 - 分类浏览、商品筛选

## 设计规范

### 颜色规范
```yaml
primary: "#FF6B6B"      # 主色调(珊瑚红)
secondary: "#4ECDC4"     # 辅助色(薄荷绿)
warning: "#FFB347"       # 警告色(橙色)
success: "#4CAF50"       # 成功色(绿色)
text_primary: "#333333"  # 主要文字
text_secondary: "#999999"# 次要文字
background: "#FFFFFF"    # 背景色
divider: "#EEEEEE"       # 分隔线
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

## 项目结构

```
buysomething/
├── pages/                  # 页面目录
│   ├── splash/            # 启动页
│   ├── home/              # 首页
│   ├── product-list/      # 商品列表页
│   ├── product-detail/    # 商品详情页
│   ├── cart/              # 购物车页
│   ├── profile/           # 个人中心页
│   ├── login/             # 登录页
│   ├── category/          # 分类页
│   ├── order-list/        # 订单列表页
│   ├── order-detail/      # 订单详情页
│   └── address/           # 地址管理页
├── images/                # 图片资源
├── app.js                 # 小程序逻辑
├── app.json               # 小程序配置
├── app.wxss               # 全局样式
├── sitemap.json           # 站点地图配置
└── project.config.json    # 项目配置
```

## 快速开始

### 开发工具
使用[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)打开项目。

### 配置步骤
1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择本项目目录
4. 填写AppID(测试可使用测试号)
5. 点击"导入"

### 运行项目
点击微信开发者工具的"编译"按钮即可运行项目。

## 图片资源

项目需要以下图片资源,请参考 `images/README.md` 文件:

- 应用Logo
- Tab栏图标
- Banner轮播图
- 商品图片
- 商品详情图
- 默认头像
- 空状态图标
- 分类图标

**注意**: 目前代码中使用的是占位路径,实际使用时需要替换为真实图片。

## 主要功能说明

### 购物车功能
- 添加商品到购物车
- 选择/取消选择商品
- 修改商品数量
- 删除商品
- 结算下单

### 订单流程
1. 浏览商品 → 加入购物车
2. 购物车管理 → 选择商品
3. 结算订单 → 填写收货地址
4. 确认订单 → 在线支付
5. 查看订单 → 确认收货

### 用户系统
- 微信一键登录
- 手机号登录
- 个人信息管理
- 收货地址管理

## 开发说明

### 数据存储
- 使用 `wx.setStorageSync` 和 `wx.getStorageSync` 进行本地数据存储
- 购物车数据存储在本地
- 用户信息存储在全局 globalData

### 接口对接
当前项目使用模拟数据,实际开发时需要:
1. 替换 `loadXXX` 方法中的模拟数据
2. 调用后端API接口
3. 处理接口返回数据
4. 添加错误处理

### 待开发功能
- [ ] 真实接口对接
- [ ] 支付功能集成
- [ ] 消息推送
- [ ] 优惠券功能
- [ ] 积分系统
- [ ] 评价功能
- [ ] 搜索功能
- [ ] 分享功能

## 注意事项

1. 本项目使用的是微信小程序原生开发框架
2. 所有页面使用 rpx 单位,适配不同屏幕尺寸
3. 图片资源需要自行准备或使用占位图
4. 测试时可以使用测试AppID
5. 正式上线需要申请正式AppID并配置服务器域名

## 版本信息

- 版本: 1.0.0
- 更新时间: 2024-03-24

## 联系方式

如有问题或建议,请联系开发者。

## License

MIT License
