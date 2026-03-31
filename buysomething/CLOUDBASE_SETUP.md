# CloudBase 连接指南

## 快速开始

### ✅ 已完成
1. CloudBase 规则文件已下载
2. CloudBase 配置文件已创建
3. 示例云函数已准备

### 📋 下一步操作

#### 1. 创建 CloudBase 环境

1. 访问 [腾讯云 CloudBase 控制台](https://console.cloud.tencent.com/tcb)
2. 点击"新建环境"
3. 填写信息:
   - **环境名称**: `buysomething`
   - **付费方式**: 按量计费(有免费额度)
4. 等待环境初始化(约1-2分钟)
5. 记录**环境 ID** (格式: `buysomething-xxxxx`)

#### 2. 配置小程序

**修改 `project.config.json`:**

```json
{
  "cloudfunctionRoot": "cloudfunctions/",
  "cloudbaseRoot": "cloudbase/"
}
```

**修改 `app.js`:**

```javascript
App({
  onLaunch() {
    // 初始化 CloudBase
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'your-env-id', // 替换为你的环境 ID
        traceUser: true
      })
      console.log('CloudBase 初始化成功')
    }
    
    // 获取数据库实例
    this.globalData.db = wx.cloud.database()
    this.globalData._ = this.globalData.db.command
  },
  
  globalData: {
    userInfo: null,
    db: null,
    _ : null
  }
})
```

#### 3. 创建数据库集合

在 CloudBase 控制台的**云数据库**中创建以下集合:

| 集合名称 | 用途 | 权限 |
|---------|------|------|
| `products` | 商品信息 | 所有用户可读,仅创建者可写 |
| `categories` | 商品分类 | 所有用户可读,仅管理员可写 |
| `orders` | 订单信息 | 仅创建者可读写 |
| `cart` | 购物车 | 仅创建者可读写 |
| `users` | 用户信息 | 仅创建者可读写 |
| `addresses` | 收货地址 | 仅创建者可读写 |

#### 4. 部署云函数

**使用 CLI 部署:**

```bash
# 安装 CLI
npm install -g @cloudbase/cli

# 登录
tcb login

# 部署云函数
tcb functions:deploy getOpenId
```

**或使用微信开发者工具部署:**
1. 右键 `cloudfunctions/getOpenId` 目录
2. 选择"上传并部署:云端安装依赖"

#### 5. 配置云存储

1. 在 CloudBase 控制台进入**云存储**
2. 点击"新建文件夹" → `products` (商品图片)
3. 上传你的商品图片到相应文件夹

#### 6. 配置安全规则

**数据库安全规则示例:**

```json
{
  "products": {
    "read": true,
    "write": "auth.openid == doc.openid"
  },
  "orders": {
    "read": "auth.openid == doc.openid",
    "write": "auth.openid == doc.openid"
  },
  "cart": {
    "read": "auth.openid == doc.openid",
    "write": "auth.openid == doc.openid"
  }
}
```

### 🔍 使用 CloudBase API

#### 数据库操作

```javascript
// 在页面中使用
const app = getApp()
const db = app.globalData.db

// 查询商品
db.collection('products').get().then(res => {
  console.log(res.data)
})

// 添加商品
db.collection('products').add({
  data: {
    name: '商品名称',
    price: 199,
    image: 'cloud://xxx.jpg',
    createTime: db.serverDate()
  }
})

// 更新商品
db.collection('products').doc('xxx').update({
  data: {
    price: 179
  }
})
```

#### 云函数调用

```javascript
// 获取用户 OpenID
wx.cloud.callFunction({
  name: 'getOpenId',
  data: {},
  success: res => {
    console.log('OpenID:', res.result.openid)
  }
})
```

#### 云存储上传

```javascript
wx.cloud.uploadFile({
  cloudPath: `products/${Date.now()}.jpg`,
  filePath: tempFilePath,
  success: res => {
    console.log('上传成功,文件ID:', res.fileID)
  }
})
```

### 🎯 常见场景

#### 商品数据示例

```javascript
// 添加商品到数据库
const products = [
  {
    _id: 'product-001',
    name: '时尚T恤',
    price: 99,
    originalPrice: 199,
    image: 'cloud://buysomething-xxx/products/product-001.jpg',
    images: [
      'cloud://buysomething-xxx/products/detail-1.jpg',
      'cloud://buysomething-xxx/products/detail-2.jpg',
      'cloud://buysomething-xxx/products/detail-3.jpg'
    ],
    category: 'clothing',
    specs: {
      color: ['白色', '黑色', '红色'],
      size: ['S', 'M', 'L', 'XL']
    },
    sales: 1000,
    rating: 4.8,
    createTime: db.serverDate()
  }
]

// 批量插入
products.forEach(product => {
  db.collection('products').add({ data: product })
})
```

#### 购物车操作

```javascript
// 添加到购物车
db.collection('cart').add({
  data: {
    _openid: '{openid}', // 自动填充
    productId: 'product-001',
    quantity: 1,
    spec: { color: '白色', size: 'M' },
    createTime: db.serverDate()
  }
})

// 查询购物车
db.collection('cart').where({
  _openid: '{openid}' // 自动填充
}).get()
```

### 📚 参考文档

- [微信小程序云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
- [CloudBase 控制台](https://console.cloud.tencent.com/tcb)
- [CloudBase CLI](https://docs.cloudbase.net/cli-v1/intro.html)

### ⚠️ 注意事项

1. **环境 ID**: 必须在 `app.js` 中正确配置
2. **免费额度**: CloudBase 提供免费额度,超出后按量计费
3. **权限管理**: 合理配置数据库安全规则,保护数据安全
4. **上传限制**: 云存储单个文件最大 20MB
5. **云函数**: 免费额度内云函数调用有次数限制

### 🚀 推荐流程

1. 先创建 CloudBase 环境
2. 配置环境 ID 到 `app.js`
3. 创建数据库集合
4. 上传测试数据到数据库
5. 测试数据库读写
6. 部署云函数
7. 测试完整流程

祝你开发顺利! 🎉
