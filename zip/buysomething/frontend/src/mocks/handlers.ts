/**
 * Mock Handlers
 * 用于配置 Mock 响应行为
 */

import { MOCK_PRODUCTS, MOCK_CART_ITEMS, MOCK_ORDERS, MOCK_ADDRESSES, MOCK_USER } from './data';

/**
 * Mock 处理器配置
 */
export const mockHandlers = {
  /**
   * 延迟响应（模拟网络延迟）
   */
  delay: 300, // ms
  
  /**
   * 是否启用 Mock
   */
  enabled: true,
  
  /**
   * 模拟错误概率 (0-1)
   */
  errorRate: 0
};

/**
 * 生成随机错误
 */
export function maybeThrowError(): void {
  if (Math.random() < mockHandlers.errorRate) {
    throw new Error('模拟的网络错误');
  }
}

/**
 * 获取响应
 */
export function getMockResponse(path: string, method: string, params: any): any {
  maybeThrowError();
  
  const queryString = params._query || '';
  
  // 登录
  if (path === '/api/login' && method === 'POST') {
    const { phone, password } = params;
    if (phone === '13800138001' && password === '123456') {
      return {
        code: 0,
        message: 'success',
        data: {
          token: 'mock-token-' + Date.now(),
          userInfo: MOCK_USER
        }
      };
    }
    return {
      code: 1002,
      message: '手机号或密码错误',
      data: null
    };
  }
  
  // 商品列表
  if (path === '/api/products' && method === 'GET') {
    let list = [...MOCK_PRODUCTS];
    
    // 筛选
    if (params.categoryId) {
      list = list.filter(p => p.categoryId === params.categoryId);
    }
    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(kw));
    }
    
    // 排序
    if (params.sort === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (params.sort === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (params.sort === 'sales') {
      list.sort((a, b) => b.sales - a.sales);
    }
    
    // 分页
    const page = parseInt(params.page) || 1;
    const pageSize = parseInt(params.pageSize) || 20;
    const start = (page - 1) * pageSize;
    
    return {
      code: 0,
      message: 'success',
      data: {
        list: list.slice(start, start + pageSize),
        total: list.length,
        page,
        pageSize
      }
    };
  }
  
  // 商品详情
  if (path === '/api/product-detail' && method === 'GET') {
    const product = MOCK_PRODUCTS.find(p => p.productId === params.productId);
    if (product) {
      return {
        code: 0,
        message: 'success',
        data: product
      };
    }
    return {
      code: 1004,
      message: '商品不存在',
      data: null
    };
  }
  
  // 购物车列表
  if (path === '/api/cart' && method === 'GET') {
    return {
      code: 0,
      message: 'success',
      data: {
        list: MOCK_CART_ITEMS.map(item => ({
          ...item,
          product: MOCK_PRODUCTS.find(p => p.productId === item.productId)
        })),
        total: MOCK_CART_ITEMS.length
      }
    };
  }
  
  // 添加购物车
  if (path === '/api/cart' && method === 'POST') {
    return {
      code: 0,
      message: 'success',
      data: {
        cartId: 'cart-' + Date.now()
      }
    };
  }
  
  // 订单列表
  if (path === '/api/orders' && method === 'GET') {
    let list = MOCK_ORDERS;
    if (params.status !== undefined && params.status !== '') {
      list = list.filter(o => o.status === parseInt(params.status));
    }
    
    return {
      code: 0,
      message: 'success',
      data: {
        list,
        total: list.length,
        page: parseInt(params.page) || 1,
        pageSize: parseInt(params.pageSize) || 20
      }
    };
  }
  
  // 创建订单
  if (path === '/api/orders' && method === 'POST') {
    return {
      code: 0,
      message: 'success',
      data: {
        orderId: 'order-' + Date.now(),
        orderNo: 'ORD' + Date.now(),
        totalAmount: params.items?.reduce((sum: number, item: any) => {
          const product = MOCK_PRODUCTS.find(p => p.productId === item.productId);
          return sum + (product ? product.price * item.quantity : 0);
        }, 0) || 0,
        payAmount: params.items?.reduce((sum: number, item: any) => {
          const product = MOCK_PRODUCTS.find(p => p.productId === item.productId);
          return sum + (product ? product.price * item.quantity : 0);
        }, 0) || 0
      }
    };
  }
  
  // 地址列表
  if (path === '/api/addresses' && method === 'GET') {
    return {
      code: 0,
      message: 'success',
      data: {
        list: MOCK_ADDRESSES,
        total: MOCK_ADDRESSES.length
      }
    };
  }
  
  // 默认响应
  return {
    code: 0,
    message: 'success',
    data: {}
  };
}

export default mockHandlers;
