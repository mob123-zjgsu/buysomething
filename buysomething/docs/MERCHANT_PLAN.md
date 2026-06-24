# 商户端规划文档

> 创建时间：2026-04-13  
> 状态：规划中  
> 优先级：中（可在简化版小程序完成后开发）

---

## 一、需求概述

### 1.1 功能目标

在现有个人用户端的基础上，增加商户登录入口，实现商户端的商品管理功能。商户可以：
- 上架新商品
- 下架已有商品
- 编辑商品信息
- 查看销售数据

### 1.2 用户角色

| 角色 | 描述 | 登录入口 |
|------|------|----------|
| 个人用户 | 普通消费者，购买商品 | 用户端登录 |
| 商户 | 卖家，管理自己的商品 | 商户端登录 |

### 1.3 设计原则

- **复用性**：商户端界面在用户端基础上稍作修改
- **简洁性**：只实现核心的上下架功能
- **独立性**：商户有独立的登录入口和数据隔离

---

## 二、商户端页面规划

### 2.1 页面结构

```
merchant/                      # 商户端页面目录
├── merchant-login/           # 商户登录页
│   ├── merchant-login.js
│   ├── merchant-login.wxml
│   ├── merchant-login.wxss
│   └── merchant-login.json
├── merchant-home/             # 商户首页（商品管理）
│   ├── merchant-home.js
│   ├── merchant-home.wxml
│   ├── merchant-home.wxss
│   └── merchant-home.json
├── merchant-product-add/     # 添加商品
│   ├── merchant-product-add.js
│   ├── merchant-product-add.wxml
│   ├── merchant-product-add.wxss
│   └── merchant-product-add.json
└── merchant-product-edit/    # 编辑商品
    ├── merchant-product-edit.js
    ├── merchant-product-edit.wxml
    ├── merchant-product-edit.wxss
    └── merchant-product-edit.json
```

### 2.2 页面功能

#### 2.2.1 商户登录页 (`merchant-login`)

**功能**：
- 商户手机号 + 密码登录
- 商户注册入口
- 返回用户端登录入口

**与用户登录页的区别**：
- 页面标题改为"商户登录"
- 去掉第三方登录选项
- 去掉"验证码登录"选项（简化）
- 添加"我是用户，返回用户端"链接

#### 2.2.2 商户首页 (`merchant-home`)

**功能**：
- 商户信息展示（店铺名称、认证状态）
- 商品管理列表
  - 显示商品图片、名称、价格、库存、状态
  - 上下架开关
  - 编辑、删除按钮
- 添加商品按钮
- 统计数据（待发货、已售出等）

**布局**：
- 顶部：商户信息卡片
- 中部：商品列表（类似用户端的商品列表页）
- 底部：添加商品按钮

#### 2.2.3 添加商品页 (`merchant-product-add`)

**功能**：
- 商品基本信息
  - 商品名称
  - 商品分类（下拉选择）
  - 商品图片（最多9张）
  - 商品描述
- 价格信息
  - 售价
  - 原价
  - 库存
- 规格设置（可选）
  - 颜色、尺码等
- 提交保存

**布局**：
- 表单式布局
- 图片上传区域（类似商品详情页）
- 底部：保存按钮

#### 2.2.4 编辑商品页 (`merchant-product-edit`)

**功能**：
- 与添加商品页相同
- 预填充已有数据
- 额外功能：删除商品

---

## 三、商户端云函数规划

### 3.1 新增云函数

| 云函数名 | 功能 | 说明 |
|----------|------|------|
| `merchant-login` | 商户登录 | 验证商户身份，返回商户信息 |
| `merchant-products` | 商户商品列表 | 获取当前商户的商品列表 |
| `merchant-product-add` | 添加商品 | 创建新商品 |
| `merchant-product-update` | 更新商品 | 修改商品信息 |
| `merchant-product-delete` | 删除商品 | 删除商品 |
| `merchant-product-toggle` | 切换上下架 | 上架/下架商品 |

### 3.2 云函数数据结构

#### 3.2.1 商户信息 (`merchants` 集合)

```javascript
{
  _id: "merchant_id",
  merchantId: "M20240001",           // 商户编号
  phone: "13800138001",              // 登录手机号
  password: "md5_hash",              // 密码（MD5加密）
  merchantName: "优选旗舰店",          // 商户名称
  merchantLogo: "/images/logo.png",   // 商户Logo
  status: 1,                          // 1=正常, 0=禁用
  createTime: Date,
  updateTime: Date
}
```

#### 3.2.2 商户商品 (`merchant_products` 集合)

```javascript
{
  _id: "product_id",
  merchantId: "M20240001",           // 所属商户ID
  name: "夏季新款纯棉T恤",
  categoryId: "category_001",
  images: ["/images/p1.jpg", ...],
  description: "商品详细描述...",
  price: 99,
  originalPrice: 199,
  stock: 100,
  specs: [
    { color: "红色", sizes: ["S", "M", "L"] },
    { color: "蓝色", sizes: ["M", "L", "XL"] }
  ],
  status: 1,                          // 1=上架, 0=下架
  sales: 0,
  rating: 5,
  createTime: Date,
  updateTime: Date
}
```

### 3.3 用户端商品兼容

为了简化，用户端的商品列表可以直接查询 `merchant_products` 集合：
- 筛选条件：`status = 1`（只显示上架商品）
- 排序：按 `sales`（销量）降序

---

## 四、商户端与用户端的关系

### 4.1 共同点

| 模块 | 用户端 | 商户端 |
|------|--------|--------|
| 商品展示 | 使用 `merchant_products` | 管理 `merchant_products` |
| 登录页面 | 登录页 | 登录页（稍作修改） |
| 商品详情 | 商品详情页 | 可复用 |

### 4.2 差异点

| 模块 | 用户端 | 商户端 |
|------|--------|--------|
| 登录验证 | `users` 集合 | `merchants` 集合 |
| 用户ID | `_openid` | `merchantId` |
| 数据隔离 | 用户级 | 商户级 |
| 核心功能 | 浏览、购买 | 上架、下架、编辑 |

### 4.3 页面复用策略

商户端可以在用户端页面基础上修改：

```javascript
// 复用策略示例

// 商品详情页
pages/product-detail/product-detail.js

// 商户端复用：
// 1. 复制为 pages/merchant-product-edit/merchant-product-edit.js
// 2. 添加"编辑模式"标识
// 3. 添加商户专属功能（删除、上架/下架）
// 4. 保留用户端查看功能

// 首页
pages/home/home.js

// 商户端复用：
// 1. 复制为 pages/merchant-home/merchant-home.js
// 2. 替换为商户信息展示
// 3. 替换为商品管理列表
// 4. 添加操作按钮
```

---

## 五、开发优先级

### 5.1 第一阶段：商户基础功能

1. 创建商户登录页
2. 创建商户首页
3. 创建 `merchants` 集合
4. 创建商户登录云函数

### 5.2 第二阶段：商品管理功能

1. 创建添加商品页
2. 创建编辑商品页
3. 创建商品管理云函数
4. 实现上下架功能

### 5.3 第三阶段：完善与优化

1. 统计数据展示
2. 订单管理（商户视角）
3. 消息通知

---

## 六、技术实现要点

### 6.1 登录状态管理

```javascript
// app.js
globalData: {
  // 用户端
  isLogin: false,
  userInfo: null,
  userType: 'user',  // 'user' 或 'merchant'
  
  // 商户端
  merchantInfo: null,
  merchantId: null
}
```

### 6.2 登录流程

#### 用户登录流程
```
用户输入手机号+密码 
→ 调用 login 云函数
→ 验证通过，保存 userInfo
→ 跳转到个人中心
```

#### 商户登录流程
```
商户输入手机号+密码
→ 调用 merchant-login 云函数
→ 验证通过，保存 merchantInfo
→ 跳转到商户首页
```

### 6.3 数据权限

| 资源 | 用户权限 | 商户权限 |
|------|----------|----------|
| 商品列表 | 读取（仅上架） | 读写（自己上架的） |
| 订单列表 | 读取（自己的） | 读取（自己店铺的） |
| 商户信息 | 无 | 读写（自己的） |

---

## 七、数据库设计

### 7.1 集合清单

| 集合名 | 用途 | 操作 |
|--------|------|------|
| `users` | 个人用户 | 增删改查 |
| `merchants` | 商户信息 | 增删改查 |
| `products` | 个人商品（保留） | 增删改查 |
| `merchant_products` | 商户商品 | 增删改查 |
| `orders` | 订单 | 读写 |
| `cart` | 购物车 | 读写 |

### 7.2 安全规则建议

```javascript
// merchants 集合安全规则
{
  "read": "doc.merchantId == auth.merchantId",
  "write": "doc.merchantId == auth.merchantId"
}

// merchant_products 集合安全规则
{
  "read": "doc.status == 1",  // 用户端只能读取上架商品
  "write": "doc.merchantId == auth.merchantId"  // 商户只能操作自己的商品
}
```

---

## 八、预计工作量

| 功能模块 | 页面数量 | 云函数数量 | 预计工时 |
|----------|----------|------------|----------|
| 商户登录 | 1 | 1 | 0.5天 |
| 商户首页 | 1 | 1 | 0.5天 |
| 商品管理 | 2 | 4 | 1.5天 |
| 数据库配置 | - | - | 0.5天 |
| 测试与修复 | - | - | 0.5天 |
| **总计** | **4** | **6** | **3.5天** |

---

## 九、后续扩展方向

### 9.1 商户端扩展

- 商户入驻申请流程
- 商户资质审核
- 商户等级体系
- 商户佣金结算

### 9.2 功能扩展

- 订单管理（发货、物流）
- 售后服务（退款、退货）
- 数据统计与分析
- 营销工具（优惠券、活动）

### 9.3 独立商户端

长期来看，可以将商户端拆分为独立小程序：
- 用户端小程序：面向消费者
- 商户端小程序：面向卖家

---

## 十、注意事项

1. **数据隔离**：确保商户只能操作自己的商品和订单
2. **安全验证**：商户登录要进行严格的身份验证
3. **状态同步**：商品上下架状态变化要及时同步
4. **异常处理**：网络异常、登录过期等情况的处理

---

## 附录：商户端入口设计

### 入口位置

在用户端的个人中心页面，添加"我是商家"入口：

```xml
<!-- pages/profile/profile.wxml 末尾添加 -->

<navigator url="/pages/merchant-login/merchant-login" class="merchant-entry">
  <text>我是商家</text>
  <text class="icon">></text>
</navigator>
```

### 商户端入口样式

```css
/* 添加样式 */
.merchant-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  background: #FFF8E6;  /* 淡黄色背景 */
  margin-top: 20rpx;
  border-radius: 16rpx;
}
```

---

**文档版本**：V1.0  
**下次更新**：商户端开发启动时
