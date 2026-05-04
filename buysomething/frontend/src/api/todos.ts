/**
 * Todo API 调用
 * 优选购物小程序 - API 接口封装
 * 
 * 本文件展示 API 调用的使用方法
 * 实际项目中应根据业务需求添加更多接口
 */

import { get, post, put, del } from './client';

/**
 * 用户模块 API
 */
export const userApi = {
  /**
   * 用户登录
   * @param phone 手机号
   * @param password 密码
   * @param code 验证码（可选，测试阶段可用0000跳过）
   */
  login: (phone: string, password: string, code?: string) => {
    return post('/login', { phone, password, code });
  },
  
  /**
   * 用户注册
   * @param phone 手机号
   * @param password 密码
   * @param code 验证码
   */
  register: (phone: string, password: string, code: string) => {
    return post('/register', { phone, password, code });
  },
  
  /**
   * 获取用户信息
   */
  getUserInfo: () => {
    return get('/user/info');
  },
  
  /**
   * 更新用户信息
   * @param data 用户信息
   */
  updateUserInfo: (data: any) => {
    return put('/user/info', data);
  }
};

/**
 * 商品模块 API
 */
export const productApi = {
  /**
   * 获取商品列表
   * @param params 查询参数
   */
  getList: (params: {
    page?: number;
    pageSize?: number;
    categoryId?: string;
    keyword?: string;
    sort?: 'price_asc' | 'price_desc' | 'sales';
  } = {}) => {
    return get('/products', params);
  },
  
  /**
   * 获取商品详情
   * @param productId 商品ID
   */
  getDetail: (productId: string) => {
    return get('/product-detail', { productId });
  },
  
  /**
   * 获取商品分类
   */
  getCategories: () => {
    return get('/categories');
  }
};

/**
 * 购物车模块 API
 */
export const cartApi = {
  /**
   * 获取购物车列表
   * @param userId 用户ID（测试用）
   */
  getList: (userId?: string) => {
    return get('/cart', { userId });
  },
  
  /**
   * 添加商品到购物车
   * @param productId 商品ID
   * @param quantity 数量
   * @param spec 规格
   * @param userId 用户ID（测试用）
   */
  add: (productId: string, quantity: number = 1, spec?: any, userId?: string) => {
    return post('/cart', { productId, quantity, spec, userId });
  },
  
  /**
   * 更新购物车商品数量
   * @param cartId 购物车ID
   * @param quantity 数量（0表示删除）
   */
  update: (cartId: string, quantity: number) => {
    return put('/cart', { cartId, quantity });
  },
  
  /**
   * 删除购物车商品
   * @param cartId 购物车ID
   */
  delete: (cartId: string) => {
    return del('/cart', { cartId });
  },
  
  /**
   * 清空购物车
   * @param userId 用户ID（测试用）
   */
  clear: (userId?: string) => {
    return del('/cart/clear', { userId });
  }
};

/**
 * 订单模块 API
 */
export const orderApi = {
  /**
   * 获取订单列表
   * @param params 查询参数
   */
  getList: (params: {
    userId?: string;
    status?: number;
    page?: number;
    pageSize?: number;
  } = {}) => {
    return get('/orders', params);
  },
  
  /**
   * 获取订单详情
   * @param orderId 订单ID
   */
  getDetail: (orderId: string) => {
    return get('/orders', { orderId });
  },
  
  /**
   * 创建订单
   * @param addressId 地址ID
   * @param items 商品列表
   * @param remark 备注
   * @param userId 用户ID（测试用）
   */
  create: (addressId: string, items: Array<{
    productId: string;
    quantity: number;
    spec?: any;
  }>, remark?: string, userId?: string) => {
    return post('/orders', { addressId, items, remark, userId });
  },
  
  /**
   * 更新订单状态
   * @param orderId 订单ID
   * @param status 订单状态
   */
  updateStatus: (orderId: string, status: number) => {
    return put('/orders', { orderId, status });
  },
  
  /**
   * 取消订单
   * @param orderId 订单ID
   */
  cancel: (orderId: string) => {
    return put('/orders', { orderId, status: 5 });
  },
  
  /**
   * 确认收货
   * @param orderId 订单ID
   */
  confirmReceive: (orderId: string) => {
    return put('/orders', { orderId, status: 4 });
  }
};

/**
 * 地址模块 API
 */
export const addressApi = {
  /**
   * 获取地址列表
   * @param userId 用户ID（测试用）
   */
  getList: (userId?: string) => {
    return get('/addresses', { userId });
  },
  
  /**
   * 获取地址详情
   * @param addressId 地址ID
   */
  getDetail: (addressId: string) => {
    return get('/addresses', { addressId });
  },
  
  /**
   * 添加地址
   * @param data 地址信息
   * @param userId 用户ID（测试用）
   */
  add: (data: {
    name: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    detail: string;
    isDefault?: boolean;
  }, userId?: string) => {
    return post('/addresses', { ...data, userId });
  },
  
  /**
   * 更新地址
   * @param addressId 地址ID
   * @param data 地址信息
   */
  update: (addressId: string, data: any) => {
    return put('/addresses', { addressId, ...data });
  },
  
  /**
   * 删除地址
   * @param addressId 地址ID
   */
  delete: (addressId: string) => {
    return del('/addresses', { addressId });
  },
  
  /**
   * 设置默认地址
   * @param addressId 地址ID
   */
  setDefault: (addressId: string) => {
    return put('/addresses', { addressId, isDefault: true });
  }
};

// 导出所有 API
export default {
  user: userApi,
  product: productApi,
  cart: cartApi,
  order: orderApi,
  address: addressApi
};
