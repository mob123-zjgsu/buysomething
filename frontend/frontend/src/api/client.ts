/**
 * HTTP 客户端配置
 * 优选购物小程序 - API 客户端
 */

// 基础配置
const CONFIG = {
  // CloudBase HTTP API 基础路径
  baseURL: 'https://buysomething-6gbmbtpxff05be35.service.tcloudbase.com',
  
  // 请求超时时间（毫秒）
  timeout: 10000,
  
  // 测试模式（使用 Mock 数据）
  useMock: true,
  
  // 测试用户 ID
  testUserId: 'test-user-001'
};

/**
 * 获取 token
 */
export function getToken(): string {
  try {
    return wx.getStorageSync('auth_token') || '';
  } catch (e) {
    return '';
  }
}

/**
 * 设置 token
 */
export function setToken(token: string): void {
  try {
    wx.setStorageSync('auth_token', token);
  } catch (e) {
    console.error('保存 token 失败:', e);
  }
}

/**
 * 清除 token
 */
export function clearToken(): void {
  try {
    wx.removeStorageSync('auth_token');
  } catch (e) {
    console.error('清除 token 失败:', e);
  }
}

/**
 * 获取请求头
 */
export function getHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * 统一的请求方法
 * @param url 请求地址
 * @param options 请求选项
 */
export async function request<T = any>(
  url: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: any;
    headers?: Record<string, string>;
  } = {}
): Promise<{
  code: number;
  message: string;
  data: T;
}> {
  const { method = 'GET', data = {}, headers = {} } = options;
  
  // 如果是测试模式，返回 Mock 数据
  if (CONFIG.useMock) {
    console.log(`[Mock] ${method} ${url}`, data);
    return getMockData(url, method, data);
  }
  
  const requestHeaders = { ...getHeaders(), ...headers };
  
  try {
    const startTime = Date.now();
    
    const response = await wx.request({
      url: `${CONFIG.baseURL}${url}`,
      method,
      data,
      header: requestHeaders,
      timeout: CONFIG.timeout
    });
    
    const endTime = Date.now();
    console.log(`[API] ${method} ${url} - ${endTime - startTime}ms`, response.data);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return response.data;
    } else {
      // 处理错误状态码
      return {
        code: response.statusCode,
        message: `请求失败: ${response.statusCode}`,
        data: null as any
      };
    }
  } catch (error: any) {
    console.error(`[API Error] ${method} ${url}`, error);
    
    return {
      code: -1,
      message: error.message || '网络请求失败',
      data: null as any
    };
  }
}

/**
 * GET 请求
 */
export function get<T = any>(url: string, data?: any): Promise<{ code: number; message: string; data: T }> {
  const queryString = data ? '?' + Object.entries(data)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&') : '';
  
  return request<T>(url + queryString, { method: 'GET' });
}

/**
 * POST 请求
 */
export function post<T = any>(url: string, data?: any): Promise<{ code: number; message: string; data: T }> {
  return request<T>(url, { method: 'POST', data });
}

/**
 * PUT 请求
 */
export function put<T = any>(url: string, data?: any): Promise<{ code: number; message: string; data: T }> {
  return request<T>(url, { method: 'PUT', data });
}

/**
 * DELETE 请求
 */
export function del<T = any>(url: string, data?: any): Promise<{ code: number; message: string; data: T }> {
  return request<T>(url, { method: 'DELETE', data });
}

// ==================== Mock 数据 ====================

import { MOCK_PRODUCTS, MOCK_CART_ITEMS, MOCK_ORDERS } from './mocks/data';

/**
 * 获取 Mock 数据
 */
function getMockData(url: string, method: string, data: any): any {
  const path = url.split('?')[0];
  
  // 登录
  if (path === '/login' && method === 'POST') {
    if (data.phone === '13800138001' && data.password === '123456') {
      return {
        code: 0,
        message: 'success',
        data: {
          token: 'dGVzdC11c2VyLTAwMToxMzgwMDEzODAwMQ==',
          userInfo: {
            userId: 'test-user-001',
            phone: data.phone,
            nickname: '测试用户',
            avatar: '',
            points: 5000,
            level: 2,
            balance: 1000.00
          }
        }
      };
    }
    return {
      code: 1002,
      message: '手机号或密码错误',
      data: {}
    };
  }
  
  // 商品列表
  if (path === '/products' && method === 'GET') {
    let list = [...MOCK_PRODUCTS];
    
    // 分类筛选
    if (data.categoryId) {
      list = list.filter(p => p.categoryId === data.categoryId);
    }
    
    // 关键词搜索
    if (data.keyword) {
      const keyword = data.keyword.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(keyword));
    }
    
    // 排序
    if (data.sort === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (data.sort === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (data.sort === 'sales') {
      list.sort((a, b) => b.sales - a.sales);
    }
    
    // 分页
    const page = parseInt(data.page) || 1;
    const pageSize = parseInt(data.pageSize) || 20;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
      code: 0,
      message: 'success',
      data: {
        list: list.slice(start, end),
        total: list.length,
        page,
        pageSize
      }
    };
  }
  
  // 商品详情
  if (path === '/product-detail' && method === 'GET') {
    const product = MOCK_PRODUCTS.find(p => p.productId === data.productId);
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
      data: {}
    };
  }
  
  // 购物车列表
  if (path === '/cart' && method === 'GET') {
    const items = MOCK_CART_ITEMS.map(item => ({
      ...item,
      product: MOCK_PRODUCTS.find(p => p.productId === item.productId)
    }));
    return {
      code: 0,
      message: 'success',
      data: {
        list: items,
        total: items.length
      }
    };
  }
  
  // 添加购物车
  if (path === '/cart' && method === 'POST') {
    return {
      code: 0,
      message: 'success',
      data: {
        cartId: `cart-${Date.now()}`
      }
    };
  }
  
  // 更新购物车
  if (path === '/cart' && method === 'PUT') {
    return {
      code: 0,
      message: 'success',
      data: {
        cartId: data.cartId
      }
    };
  }
  
  // 删除购物车
  if (path === '/cart' && method === 'DELETE') {
    return {
      code: 0,
      message: 'success',
      data: {}
    };
  }
  
  // 订单列表
  if (path === '/orders' && method === 'GET') {
    return {
      code: 0,
      message: 'success',
      data: {
        list: MOCK_ORDERS,
        total: MOCK_ORDERS.length,
        page: 1,
        pageSize: 20
      }
    };
  }
  
  // 创建订单
  if (path === '/orders' && method === 'POST') {
    return {
      code: 0,
      message: 'success',
      data: {
        orderId: `order-${Date.now()}`,
        orderNo: `ORD${Date.now()}`,
        totalAmount: 299.00,
        payAmount: 299.00
      }
    };
  }
  
  // 更新订单状态
  if (path === '/orders' && method === 'PUT') {
    return {
      code: 0,
      message: 'success',
      data: {
        orderId: data.orderId,
        status: data.status
      }
    };
  }
  
  // 默认返回
  return {
    code: 0,
    message: 'success',
    data: {}
  };
}

export default {
  CONFIG,
  getToken,
  setToken,
  clearToken,
  getHeaders,
  request,
  get,
  post,
  put,
  del
};
