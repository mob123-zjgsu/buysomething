# API 接口文档

## 文档目录

- [1. 基础信息]
- [2. 用户模块]
  - [2.1 用户注册]
  - [2.2 用户登录]
  - [2.3 获取用户信息
- [3. 商品模块]
  - [3.1 获取商品列表]
  - [3.2 获取商品详情]
  - [3.3 搜索商品]
- [4. 购物车模块]
  - [4.1 获取购物车]
  - [4.2 添加商品到购物车]
  - [4.3 更新购物车商品数量]
  - [4.4 删除购物车商品]
- [5. 订单模块]
  - [5.1 创建订单]
  - [5.2 获取订单列表]
  - [5.3 获取订单详情]

---

## 1. 基础信息

### 1.1 接口信息
| 项目 | 说明 |
|------|------|
| 基础URL | `http://localhost:3000/api` |
| 响应格式 | JSON |
| 字符编码 | UTF-8 |

### 1.2 认证方式
- 除登录注册接口外，其他接口需要在请求头中携带 Token
- 格式：`Authorization: Bearer <token>`

### 1.3 通用响应格式
```json
{
  "code": 200,           // 状态码，200表示成功
  "message": "success",  // 提示信息
  "data": {}            // 返回数据
}
2. 用户模块
2.1 用户注册
接口说明：新用户注册账号

请求信息

项目	说明
URL	/user/register
方法	POST
认证	不需要
请求参数

参数名	类型	必填	说明
username	string	是	用户名，3-20个字符
password	string	是	密码，6-20个字符
email	string	否	电子邮箱
请求示例

json
{
  "username": "张三",
  "password": "123456",
  "email": "zhangsan@example.com"
}
响应示例

json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "userId": 1,
    "username": "张三",
    "createTime": "2024-03-09 10:30:00"
  }
}
错误响应

json
{
  "code": 400,
  "message": "用户名已存在"
}
2.2 用户登录
接口说明：用户登录，获取访问令牌

请求信息

项目	说明
URL	/user/login
方法	POST
认证	不需要
请求参数

参数名	类型	必填	说明
username	string	是	用户名
password	string	是	密码
请求示例

json
{
  "username": "张三",
  "password": "123456"
}
响应示例

json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "userId": 1,
      "username": "张三",
      "email": "zhangsan@example.com"
    },
    "expireIn": 7200
  }
}
错误响应

json
{
  "code": 401,
  "message": "用户名或密码错误"
}
2.3 获取用户信息
接口说明：获取当前登录用户的详细信息

请求信息

项目	说明
URL	/user/info
方法	GET
认证	需要
请求头

text
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
响应示例

json
{
  "code": 200,
  "data": {
    "userId": 1,
    "username": "张三",
    "email": "zhangsan@example.com",
    "phone": "13800138000",
    "avatar": "http://example.com/avatar.jpg",
    "createTime": "2024-03-09 10:30:00"
  }
}
3. 商品模块
3.1 获取商品列表
接口说明：分页获取商品列表，支持分类筛选

请求信息

项目	说明
URL	/products
方法	GET
认证	不需要
请求参数

参数名	类型	必填	说明
page	number	否	页码，默认1
limit	number	否	每页数量，默认10
category	string	否	商品分类
sort	string	否	排序方式（price_asc/price_desc）
请求示例

text
/products?page=1&limit=10&category=电子产品&sort=price_desc
响应示例

json
{
  "code": 200,
  "data": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "list": [
      {
        "id": 1,
        "name": "华为手机",
        "price": 3999,
        "originalPrice": 4299,
        "image": "http://example.com/product1.jpg",
        "category": "电子产品",
        "sales": 1000,
        "stock": 50,
        "rating": 4.8
      },
      {
        "id": 2,
        "name": "小米平板",
        "price": 1999,
        "originalPrice": 2299,
        "image": "http://example.com/product2.jpg",
        "category": "电子产品",
        "sales": 500,
        "stock": 30,
        "rating": 4.6
      }
    ]
  }
}
3.2 获取商品详情
接口说明：获取单个商品的详细信息

请求信息

项目	说明
URL	/products/:id
方法	GET
认证	不需要
请求示例

text
/products/1
响应示例

json
{
  "code": 200,
  "data": {
    "id": 1,
    "name": "华为手机",
    "price": 3999,
    "originalPrice": 4299,
    "description": "这是一款高性能手机...",
    "images": [
      "http://example.com/product1_1.jpg",
      "http://example.com/product1_2.jpg"
    ],
    "category": "电子产品",
    "stock": 50,
    "sales": 1000,
    "rating": 4.8,
    "reviews": 200,
    "specs": {
      "brand": "华为",
      "model": "P40",
      "color": "黑色",
      "storage": "128GB"
    }
  }
}
3.3 搜索商品
接口说明：根据关键词搜索商品

请求信息

项目	说明
URL	/products/search
方法	GET
认证	不需要
请求参数

参数名	类型	必填	说明
keyword	string	是	搜索关键词
page	number	否	页码，默认1
limit	number	否	每页数量，默认10
请求示例

text
/products/search?keyword=手机&page=1&limit=10
响应示例

json
{
  "code": 200,
  "data": {
    "total": 50,
    "keyword": "手机",
    "list": [
      {
        "id": 1,
        "name": "华为手机",
        "price": 3999,
        "image": "http://example.com/product1.jpg"
      }
    ]
  }
}
4. 购物车模块
4.1 获取购物车
接口说明：获取当前用户的购物车内容

请求信息

项目	说明
URL	/cart
方法	GET
认证	需要
请求头

text
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
响应示例

json
{
  "code": 200,
  "data": {
    "items": [
      {
        "id": 1,
        "productId": 1,
        "productName": "华为手机",
        "price": 3999,
        "quantity": 1,
        "image": "http://example.com/product1.jpg",
        "stock": 50,
        "selected": true
      },
      {
        "id": 2,
        "productId": 2,
        "productName": "小米平板",
        "price": 1999,
        "quantity": 2,
        "image": "http://example.com/product2.jpg",
        "stock": 30,
        "selected": true
      }
    ],
    "totalPrice": 7997,
    "totalCount": 3,
    "selectedTotal": 7997,
    "selectedCount": 3
  }
}
4.2 添加商品到购物车
接口说明：将商品添加到购物车

请求信息

项目	说明
URL	/cart
方法	POST
认证	需要
请求头

text
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
请求参数

参数名	类型	必填	说明
productId	number	是	商品ID
quantity	number	是	数量，至少为1
请求示例

json
{
  "productId": 1,
  "quantity": 2
}
响应示例

json
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "cartItemId": 3,
    "productId": 1,
    "quantity": 2
  }
}
4.3 更新购物车商品数量
接口说明：修改购物车中商品的数量

请求信息

项目	说明
URL	/cart/:id
方法	PUT
认证	需要
请求头

text
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
请求参数

参数名	类型	必填	说明
quantity	number	是	新数量，至少为1
请求示例

text
PUT /cart/1
{
  "quantity": 3
}
响应示例

json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "quantity": 3
  }
}
4.4 删除购物车商品
接口说明：从购物车中删除商品

请求信息

项目	说明
URL	/cart/:id
方法	DELETE
认证	需要
请求头

text
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
响应示例

json
{
  "code": 200,
  "message": "删除成功"
}
5. 订单模块
5.1 创建订单
接口说明：从购物车创建新订单

请求信息

项目	说明
URL	/orders
方法	POST
认证	需要
请求头

text
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
请求参数

参数名	类型	必填	说明
address	string	是	收货地址
receiver	string	是	收货人姓名
phone	string	是	联系电话
remark	string	否	订单备注
请求示例

json
{
  "address": "北京市朝阳区xxx路xxx号",
  "receiver": "李四",
  "phone": "13800138000",
  "remark": "请尽快发货"
}
响应示例

json
{
  "code": 200,
  "message": "订单创建成功",
  "data": {
    "orderId": "20240309123456",
    "totalAmount": 7997,
    "status": "待付款",
    "createTime": "2024-03-09 10:30:00"
  }
}
5.2 获取订单列表
接口说明：获取用户的订单列表

请求信息

项目	说明
URL	/orders
方法	GET
认证	需要
请求头

text
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
请求参数

参数名	类型	必填	说明
status	string	否	订单状态（pending/paid/shipped/completed）
page	number	否	页码，默认1
limit	number	否	每页数量，默认10
响应示例

json
{
  "code": 200,
  "data": {
    "total": 5,
    "list": [
      {
        "orderId": "20240309123456",
        "totalAmount": 7997,
        "status": "待付款",
        "createTime": "2024-03-09 10:30:00",
        "items": [
          {
            "productName": "华为手机",
            "quantity": 1,
            "price": 3999,
            "image": "http://example.com/product1.jpg"
          }
        ]
      }
    ]
  }
}
5.3 获取订单详情
接口说明：获取单个订单的详细信息

请求信息

项目	说明
URL	/orders/:orderId
方法	GET
认证	需要
请求头

text
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
响应示例

json
{
  "code": 200,
  "data": {
    "orderId": "20240309123456",
    "totalAmount": 7997,
    "status": "待付款",
    "createTime": "2024-03-09 10:30:00",
    "payTime": null,
    "address": "北京市朝阳区xxx路xxx号",
    "receiver": "李四",
    "phone": "13800138000",
    "remark": "请尽快发货",
    "items": [
      {
        "productId": 1,
        "productName": "华为手机",
        "quantity": 1,
        "price": 3999,
        "image": "http://example.com/product1.jpg"
      },
      {
        "productId": 2,
        "productName": "小米平板",
        "quantity": 2,
        "price": 1999,
        "image": "http://example.com/product2.jpg"
      }
    ]
  }
}