/**
 * API 路由配置
 * 优选购物小程序 - HTTP 云函数路由
 * 
 * 本文件用于管理所有 HTTP 云函数的配置和路由映射
 */

// 云函数基础路径
const CLOUDBASE_BASE_URL = 'https://buysomething-6gbmbtpxff05be35.service.tcloudbase.com';

/**
 * API 路由表
 */
export const routes = {
  // 用户模块
  '/login': {
    functionName: 'login',
    method: 'POST',
    description: '用户登录'
  },
  '/register': {
    functionName: 'register',
    method: 'POST',
    description: '用户注册'
  },
  '/sendSmsCode': {
    functionName: 'sendSmsCode',
    method: 'POST',
    description: '发送短信验证码'
  },
  
  // 商品模块
  '/products': {
    functionName: 'products',
    method: 'GET',
    description: '获取商品列表'
  },
  '/product-detail': {
    functionName: 'product-detail',
    method: 'GET',
    description: '获取商品详情'
  },
  '/categories': {
    functionName: 'categories',
    method: 'GET',
    description: '获取商品分类'
  },
  
  // 购物车模块
  '/cart': {
    functionName: 'cart',
    method: 'GET,POST,PUT,DELETE',
    description: '购物车 CRUD 操作'
  },
  
  // 订单模块
  '/orders': {
    functionName: 'orders',
    method: 'GET,POST,PUT',
    description: '订单 CRUD 操作'
  },
  
  // 地址模块
  '/addresses': {
    functionName: 'addresses',
    method: 'GET,POST,PUT,DELETE',
    description: '地址 CRUD 操作'
  }
};

/**
 * 获取云函数完整 URL
 * @param path API 路径
 */
export function getFunctionUrl(path) {
  const route = routes[path];
  if (!route) {
    return null;
  }
  return `${CLOUDBASE_BASE_URL}/${route.functionName}`;
}

/**
 * 获取所有 API 列表
 */
export function getApiList() {
  return Object.entries(routes).map(([path, config]) => ({
    path,
    ...config,
    url: getFunctionUrl(path)
  }));
}

export default {
  routes,
  getFunctionUrl,
  getApiList
};
