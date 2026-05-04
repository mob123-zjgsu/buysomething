/**
 * Mock 数据
 * 用于前端开发时模拟后端响应
 */

// 商品 Mock 数据
export const MOCK_PRODUCTS = [
  {
    productId: 'product-001',
    name: '时尚T恤男纯棉简约',
    price: 99.00,
    originalPrice: 199.00,
    image: 'https://img.yzcdn.cn/vant/ipad.jpeg',
    images: [
      'https://img.yzcdn.cn/vant/ipad.jpeg',
      'https://img.yzcdn.cn/vant/cat.jpeg',
      'https://img.yzcdn.cn/vant/apple-1.jpeg'
    ],
    categoryId: 'clothing',
    description: '时尚简约T恤，采用纯棉面料，舒适透气',
    specs: {
      color: ['白色', '黑色', '灰色'],
      size: ['S', 'M', 'L', 'XL']
    },
    sales: 1234,
    rating: 4.8,
    stock: 100,
    status: 1
  },
  {
    productId: 'product-002',
    name: '运动休闲裤男',
    price: 159.00,
    originalPrice: 299.00,
    image: 'https://img.yzcdn.cn/vant/cat.jpeg',
    images: [
      'https://img.yzcdn.cn/vant/cat.jpeg'
    ],
    categoryId: 'clothing',
    description: '运动休闲裤，弹力面料，舒适百搭',
    specs: {
      color: ['黑色', '深蓝'],
      size: ['M', 'L', 'XL', 'XXL']
    },
    sales: 856,
    rating: 4.6,
    stock: 50,
    status: 1
  },
  {
    productId: 'product-003',
    name: '无线蓝牙耳机',
    price: 299.00,
    originalPrice: 499.00,
    image: 'https://img.yzcdn.cn/vant/apple-1.jpeg',
    images: [
      'https://img.yzcdn.cn/vant/apple-1.jpeg'
    ],
    categoryId: 'electronics',
    description: '真无线蓝牙耳机，降噪功能，超长续航',
    specs: {
      color: ['白色', '黑色']
    },
    sales: 2341,
    rating: 4.9,
    stock: 200,
    status: 1
  },
  {
    productId: 'product-004',
    name: '智能手环Pro',
    price: 199.00,
    originalPrice: 399.00,
    image: 'https://img.yzcdn.cn/vant/apple-2.jpeg',
    images: [
      'https://img.yzcdn.cn/vant/apple-2.jpeg'
    ],
    categoryId: 'electronics',
    description: '智能手环，心率监测，睡眠分析，防水设计',
    specs: {
      color: ['黑色', '粉色', '蓝色']
    },
    sales: 1567,
    rating: 4.7,
    stock: 150,
    status: 1
  },
  {
    productId: 'product-005',
    name: '休闲帆布鞋',
    price: 129.00,
    originalPrice: 259.00,
    image: 'https://img.yzcdn.cn/vant/cat.jpeg',
    images: [
      'https://img.yzcdn.cn/vant/cat.jpeg'
    ],
    categoryId: 'shoes',
    description: '经典帆布鞋，透气舒适，时尚百搭',
    specs: {
      color: ['白色', '黑色', '红色'],
      size: ['38', '39', '40', '41', '42', '43']
    },
    sales: 2345,
    rating: 4.5,
    stock: 80,
    status: 1
  }
];

// 购物车 Mock 数据
export const MOCK_CART_ITEMS = [
  {
    cartId: 'cart-001',
    productId: 'product-001',
    quantity: 2,
    spec: { color: '白色', size: 'M' }
  },
  {
    cartId: 'cart-002',
    productId: 'product-003',
    quantity: 1,
    spec: { color: '白色' }
  }
];

// 订单 Mock 数据
export const MOCK_ORDERS = [
  {
    orderId: 'order-001',
    orderNo: 'ORD202603240001',
    status: 0, // 待付款
    totalAmount: 299.00,
    payAmount: 299.00,
    productCount: 2,
    createTime: { '$date': '2026-03-24T10:00:00.000Z' }
  },
  {
    orderId: 'order-002',
    orderNo: 'ORD202603230002',
    status: 2, // 待收货
    totalAmount: 498.00,
    payAmount: 498.00,
    productCount: 1,
    createTime: { '$date': '2026-03-23T15:30:00.000Z' }
  },
  {
    orderId: 'order-003',
    orderNo: 'ORD202603200003',
    status: 4, // 已完成
    totalAmount: 199.00,
    payAmount: 179.00, // 优惠了20元
    productCount: 1,
    createTime: { '$date': '2026-03-20T09:00:00.000Z' }
  }
];

// 地址 Mock 数据
export const MOCK_ADDRESSES = [
  {
    addressId: 'address-001',
    name: '张三',
    phone: '13800138001',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    detail: '科技园路88号',
    isDefault: true
  },
  {
    addressId: 'address-002',
    name: '李四',
    phone: '13800138002',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detail: '建国路100号',
    isDefault: false
  }
];

// 用户 Mock 数据
export const MOCK_USER = {
  userId: 'test-user-001',
  phone: '13800138001',
  nickname: '测试用户',
  avatar: '',
  points: 5000,
  level: 2,
  balance: 1000.00,
  gender: 1,
  city: '深圳',
  province: '广东'
};
