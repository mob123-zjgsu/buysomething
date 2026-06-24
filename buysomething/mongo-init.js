// MongoDB 初始化脚本
// 此文件在 MongoDB 容器首次启动时自动执行

print('===== 初始化 buysomething 数据库 =====');

// 创建 users 集合并插入示例数据
db.createCollection('users');
db.users.insertMany([
  {
    _id: 'user-001',
    nickname: '测试用户1',
    phone: '13800138001',
    avatar: '/images/default-avatar.png',
    points: 100,
    level: 1,
    createTime: new Date()
  },
  {
    _id: 'user-002',
    nickname: '测试用户2',
    phone: '13800138002',
    avatar: '/images/default-avatar.png',
    points: 50,
    level: 1,
    createTime: new Date()
  }
]);
print('users 集合初始化完成');

// 创建 products 集合并插入示例数据
db.createCollection('products');
db.products.insertMany([
  {
    _id: 'prod-001',
    name: '夏季新款纯棉T恤',
    price: 99,
    originalPrice: 199,
    image: '/images/product1.jpg',
    categoryId: 'cat-001',
    stock: 500,
    sales: 1000,
    rating: 4.8,
    specs: {
      colors: ['红色', '黑色', '白色', '蓝色'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL']
    },
    createTime: new Date()
  },
  {
    _id: 'prod-002',
    name: 'AirPods Pro',
    price: 1899,
    originalPrice: 2299,
    image: '/images/product2.jpg',
    categoryId: 'cat-002',
    stock: 200,
    sales: 2300,
    rating: 4.8,
    createTime: new Date()
  },
  {
    _id: 'prod-003',
    name: '小米14 Pro',
    price: 4499,
    originalPrice: 4999,
    image: '/images/product3.jpg',
    categoryId: 'cat-003',
    stock: 100,
    sales: 890,
    rating: 4.7,
    createTime: new Date()
  }
]);
print('products 集合初始化完成');

// 创建 orders 集合
db.createCollection('orders');
print('orders 集合创建完成');

// 创建 cart 集合
db.createCollection('cart');
print('cart 集合创建完成');

print('===== buysomething 数据库初始化完成 =====');
