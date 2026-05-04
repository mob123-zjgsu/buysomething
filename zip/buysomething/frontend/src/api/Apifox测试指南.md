# Apifox 测试指南

本文档帮助你使用 Apifox 测试优选购物小程序 API。

## 目录
1. [导入 API 文档](#导入-api-文档)
2. [配置环境](#配置环境)
3. [测试接口](#测试接口)
4. [常见问题](#常见问题)

---

## 导入 API 文档

### 方式一：导入 api.yaml 文件
1. 打开 Apifox
2. 点击「导入」按钮
3. 选择「导入 OpenAPI / Swagger」
4. 选择 `api.yaml` 文件
5. 点击确认导入

### 方式二：手动创建
1. 新建项目「优选购物小程序 API」
2. 按照下方接口列表逐个添加

---

## 配置环境

### 1. 创建测试环境
- 环境名称：`测试环境`
- 变量配置：

| 变量名 | 初始值 | 备注 |
|--------|--------|------|
| baseUrl | `https://buysomething-6gbmbtpxff05be35.service.tcloudbase.com` | API 基础路径 |
| testUserId | `test-user-001` | 测试用户ID |

---

## 测试接口

### 用户模块

#### 1. 用户登录
- **URL**: `{{baseUrl}}/login`
- **方法**: POST
- **Headers**:
  ```
  Content-Type: application/json
  ```
- **Body (JSON)**:
```json
{
  "phone": "13800138001",
  "password": "123456",
  "code": "0000"
}
```
- **预期响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "dGVzdC11c2VyLTAwMToxMzgwMDEzODAwMQ==",
    "userInfo": {
      "userId": "test-user-001",
      "phone": "13800138001",
      "nickname": "测试用户",
      "points": 5000,
      "level": 2,
      "balance": 1000
    }
  }
}
```

#### 测试账号
| 手机号 | 密码 | 说明 |
|--------|------|------|
| 13800138001 | 123456 | 测试用户1 |
| 13800138002 | 123456 | 测试用户2 |

> **注意**：测试阶段 `code` 字段填 `0000` 可跳过验证码验证。

---

### 商品模块

#### 2. 获取商品列表
- **URL**: `{{baseUrl}}/products`
- **方法**: GET
- **Query 参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认20 |
| categoryId | string | 否 | 分类ID |
| keyword | string | 否 | 搜索关键词 |
| sort | string | 否 | 排序方式：`price_asc`、`price_desc`、`sales` |

- **示例**: `{{baseUrl}}/products?page=1&pageSize=10&sort=sales`

#### 3. 获取商品详情
- **URL**: `{{baseUrl}}/product-detail`
- **方法**: GET
- **Query 参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| productId | string | 是 | 商品ID |

- **示例**: `{{baseUrl}}/product-detail?productId=product-001`

---

### 购物车模块

#### 4. 获取购物车列表
- **URL**: `{{baseUrl}}/cart`
- **方法**: GET
- **Headers**:
  ```
  Authorization: Bearer {token}
  ```
- **Query 参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | string | 否 | 用户ID（测试用） |

#### 5. 添加商品到购物车
- **URL**: `{{baseUrl}}/cart`
- **方法**: POST
- **Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer {token}
  ```
- **Body (JSON)**:
```json
{
  "userId": "test-user-001",
  "productId": "product-001",
  "quantity": 2,
  "spec": {
    "color": "白色",
    "size": "M"
  }
}
```

#### 6. 更新购物车商品数量
- **URL**: `{{baseUrl}}/cart`
- **方法**: PUT
- **Body (JSON)**:
```json
{
  "cartId": "cart-001",
  "quantity": 3
}
```

#### 7. 删除购物车商品
- **URL**: `{{baseUrl}}/cart?cartId=cart-001`
- **方法**: DELETE
- **Headers**:
  ```
  Authorization: Bearer {token}
  ```

---

### 订单模块

#### 8. 获取订单列表
- **URL**: `{{baseUrl}}/orders`
- **方法**: GET
- **Query 参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | string | 否 | 用户ID（测试用） |
| status | number | 否 | 订单状态 |
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |

**订单状态说明**:
| 状态码 | 说明 |
|--------|------|
| 0 | 待付款 |
| 1 | 待发货 |
| 2 | 待收货 |
| 3 | 待评价 |
| 4 | 已完成 |
| 5 | 已取消 |

#### 9. 创建订单
- **URL**: `{{baseUrl}}/orders`
- **方法**: POST
- **Body (JSON)**:
```json
{
  "userId": "test-user-001",
  "addressId": "address-001",
  "items": [
    {
      "productId": "product-001",
      "quantity": 2,
      "spec": {
        "color": "白色",
        "size": "M"
      }
    }
  ],
  "remark": "请尽快发货"
}
```

#### 10. 更新订单状态
- **URL**: `{{baseUrl}}/orders`
- **方法**: PUT
- **Body (JSON)**:
```json
{
  "orderId": "order-001",
  "status": 1
}
```

---

## 响应格式规范

所有接口返回统一格式：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

### 状态码说明

| code | 说明 |
|------|------|
| 0 | 成功 |
| 1001 | 参数错误 |
| 1002 | 未登录/认证失败 |
| 1003 | 权限不足 |
| 1004 | 资源不存在 |
| 1005 | 商品已下架 |
| 1006 | 购物车为空 |
| 1007 | 订单不存在 |
| 1008 | 余额不足 |
| 1009 | 验证码错误 |
| 2001 | 数据库错误 |
| 2002 | 网络错误 |
| 2003 | 系统繁忙 |

---

## 常见问题

### Q: 请求返回 404
A: 请检查 URL 是否正确，确保云函数已部署且已配置云接入。

### Q: 请求返回 CORS 错误
A: 云函数已配置 CORS 头，如果仍有问题请检查浏览器控制台。

### Q: 登录失败
A: 
1. 检查手机号和密码是否正确
2. 测试账号: `13800138001` / `123456`
3. `code` 字段填写 `0000` 跳过验证码

### Q: 如何获取 token
A: 调用登录接口成功后，会在响应中返回 token，后续请求放在 Header 中：
```
Authorization: Bearer {token}
```

---

## 相关文档

- [API 文档 (api.yaml)](./api.yaml)
- [接口规范文档](../docs/04-接口规范文档.md)
- [CloudBase 文档](https://docs.cloudbase.net/)

---

**祝测试顺利！**
