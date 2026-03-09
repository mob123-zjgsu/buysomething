\# 前端模块详细说明



\## 一、模块功能



\### 1. 用户登录页面

\- 功能：用户输入账号密码登录

\- 文件位置：`frontend/pages/login/`

\- 组件：`login.wxml`、`login.js`、`login.wxss`、`login.json`



\### 2. 商品列表页面

\- 功能：展示所有商品，支持分类筛选

\- 文件位置：`frontend/pages/products/`



\### 3. 商品详情页面

\- 功能：展示商品详细信息，支持加入购物车

\- 文件位置：`frontend/pages/product-detail/`



\### 4. 购物车页面

\- 功能：展示已加入商品，支持修改数量、删除、结算

\- 文件位置：`frontend/pages/cart/`



\### 5. 订单页面

\- 功能：展示用户订单列表和详情

\- 文件位置：`frontend/pages/orders/`



\## 二、技术选型

\- 微信小程序原生开发框架

\- 使用 wx.request 进行 API 调用

\- 使用微信开发者工具进行调试



\## 三、目录结构

frontend/

├── pages/

│ ├── login/

│ ├── products/

│ ├── product-detail/

│ ├── cart/

│ └── orders/

├── components/

│ ├── product-card/ # 商品卡片组件

│ └── cart-item/ # 购物车项组件

├── utils/

│ ├── request.js # 封装网络请求

│ └── util.js # 工具函数

├── app.js # 小程序入口

├── app.json # 全局配置

├── app.wxss # 全局样式

└── project.config.json # 项目配置

