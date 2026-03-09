\# 后端模块详细说明



\## 一、模块功能



\### 1. 用户模块

\- 注册：POST /api/user/register

\- 登录：POST /api/user/login

\- 个人信息：GET /api/user/info



\### 2. 商品模块

\- 获取商品列表：GET /api/products

\- 获取商品详情：GET /api/products/:id

\- 搜索商品：GET /api/products/search?keyword=



\### 3. 购物车模块

\- 获取购物车：GET /api/cart

\- 添加商品：POST /api/cart

\- 更新数量：PUT /api/cart/:id

\- 删除商品：DELETE /api/cart/:id



\### 4. 订单模块

\- 创建订单：POST /api/orders

\- 获取订单列表：GET /api/orders

\- 获取订单详情：GET /api/orders/:id



\## 二、技术选型

\- 运行环境：Node.js

\- 框架：Express

\- 数据库：MySQL 8.0

\- ORM：Sequelize

\- 认证：JWT

\- 密码加密：bcrypt



\## 三、目录结构
backend/

├── routes/

│ ├── userRoutes.js

│ ├── productRoutes.js

│ ├── cartRoutes.js

│ └── orderRoutes.js

├── controllers/

│ ├── userController.js

│ ├── productController.js

│ ├── cartController.js

│ └── orderController.js

├── models/

│ ├── User.js

│ ├── Product.js

│ ├── Cart.js

│ └── Order.js

├── middleware/

│ └── auth.js # JWT验证中间件

├── config/

│ └── database.js # 数据库配置

├── utils/

│ └── logger.js # 日志工具

├── app.js # 应用入口

├── package.json

└── .env # 环境变量

