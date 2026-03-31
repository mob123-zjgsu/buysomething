# API 使用说明

## 概述

本项目提供微信小程序购物商城的完整 API，支持：
- 用户登录注册
- 商品浏览、搜索、筛选
- 购物车管理
- 订单创建与查询

## API 列表

### 1. 用户登录

**云函数**: `login`

**请求方式**: 
- 小程序: `wx.cloud.callFunction({ name: 'login', data: {...} })`
- HTTP: `POST /login`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 是 | 手机号 |
| password | string | 是 | 密码（MD5加密） |
| code | string | 否 | 验证码（测试阶段可用0000） |

**返回示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "xxx",
    "userInfo": {
      "userId": "xxx",
      "phone": "13800138001",
      "nickname": "测试用户"
    }
  }
}
```

---

### 2. 商品列表

**云函数**: `products`

**请求方式**: 
- 小程序: `wx.cloud.callFunction({ name: 'products', data: {...} })`
- HTTP: `GET /products`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码（默认1） |
| pageSize | number | 否 | 每页数量（默认20） |
| categoryId | string | 否 | 分类ID |
| keyword | string | 否 | 搜索关键词 |
| sort | string | 否 | 排序：price_asc/price_desc/sales |

**返回示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "productId": "xxx",
        "name": "iPhone 15 Pro",
        "price": 7999,
        "image": "https://..."
      }
    ],
    "total": 5,
    "page": 1
  }
}
```

---

### 3. 商品详情

**云函数**: `product-detail`

**请求方式**: 
- 小程序: `wx.cloud.callFunction({ name: 'product-detail', data: {...} })`
- HTTP: `GET /product-detail?productId=xxx`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| productId | string | 是 | 商品ID |

**返回示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "productId": "xxx",
    "name": "iPhone 15 Pro",
    "price": 7999,
    "description": "最新款智能手机",
    "stock": 50
  }
}
```

---

### 4. 购物车

**云函数**: `cart`

**请求方式**: `wx.cloud.callFunction({ name: 'cart', data: {...} })`

#### 4.1 获取购物车列表
```javascript
{
  action: 'list',
  userId: 'user-xxx'
}
```

#### 4.2 添加商品到购物车
```javascript
{
  action: 'add',
  userId: 'user-xxx',
  productId: 'product-xxx',
  quantity: 1
}
```

#### 4.3 更新购物车商品数量
```javascript
{
  action: 'update',
  userId: 'user-xxx',
  cartId: 'cart-xxx',
  quantity: 2
}
```

#### 4.4 删除购物车商品
```javascript
{
  action: 'delete',
  userId: 'user-xxx',
  cartId: 'cart-xxx'
}
```

---

### 5. 订单

**云函数**: `orders`

**请求方式**: `wx.cloud.callFunction({ name: 'orders', data: {...} })`

#### 5.1 获取订单列表
```javascript
{
  action: 'list',
  userId: 'user-xxx',
  status: 0  // 订单状态：0待支付/1已支付/2已完成/3已取消
}
```

#### 5.2 创建订单
```javascript
{
  action: 'create',
  userId: 'user-xxx',
  addressId: 'addr-xxx',
  items: [
    { productId: 'product-xxx', quantity: 2 }
  ],
  remark: '订单备注'
}
```

#### 5.3 更新订单状态
```javascript
{
  action: 'update',
  userId: 'user-xxx',
  orderId: 'order-xxx',
  status: 1
}
```

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 1001 | 参数错误 |
| 1002 | 业务错误（如用户不存在、密码错误） |
| 1004 | 资源不存在 |
| 2001 | 服务器错误 |

---

## 测试账号

| 手机号 | 密码 | 说明 |
|--------|------|------|
| 13800138001 | 123456 | 测试用户001 |
| 13800138002 | 123456 | 测试用户002 |

---

## 环境信息

- **环境ID**: buysomething-6gbmbtpxff05be35
- **云函数入口**: https://buysomething-6gbmbtpxff05be35.service.tcloudbase.com