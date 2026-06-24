// 纯 Node.js handler，零依赖，Vercel 最稳定模式
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const url = req.url.split('?')[0];

  // 健康检查
  if (url === '/health') {
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }));
  }

  // API - 商品列表
  if (url === '/api/products') {
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      code: 0,
      message: 'success',
      data: [
        { id: 'product-001', name: '时尚休闲运动鞋', price: 299, originalPrice: 499, sales: 800, rating: 4.9 },
        { id: 'product-002', name: '潮流纯棉短袖T恤', price: 89, originalPrice: 199, sales: 1200, rating: 4.7 }
      ]
    }));
  }

  // API - 商品详情
  if (url.startsWith('/api/product/')) {
    const id = url.split('/api/product/')[1];
    const products = {
      'product-001': { id: 'product-001', name: '时尚休闲运动鞋', price: 299, description: '时尚休闲设计，舒适缓震' },
      'product-002': { id: 'product-002', name: '潮流纯棉短袖T恤', price: 89, description: '纯棉面料，透气舒适' }
    };
    res.setHeader('Content-Type', 'application/json');
    if (products[id]) {
      return res.end(JSON.stringify({ code: 0, message: 'success', data: products[id] }));
    }
    res.statusCode = 404;
    return res.end(JSON.stringify({ code: 404, message: '商品不存在' }));
  }

  // 首页
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end('<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>优选购物 - 前端演示站</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC",sans-serif;background:linear-gradient(135deg,#FFF5F5,#F0FFFE);min-height:100vh;display:flex;align-items:center;justify-content:center}.card{background:#fff;border-radius:20px;padding:50px 40px;text-align:center;box-shadow:0 10px 40px rgba(255,107,107,.12);max-width:500px;width:90%}.icon{font-size:64px;margin-bottom:16px}h1{color:#FF6B6B;font-size:28px;margin-bottom:8px}.subtitle{color:#888;font-size:14px;margin-bottom:24px}.status{display:inline-block;background:#E8F8F5;color:#4ECDC4;padding:8px 20px;border-radius:20px;font-size:14px;font-weight:500;margin-bottom:20px}.divider{width:60px;height:3px;background:#FF6B6B;margin:20px auto;border-radius:2px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;text-align:left}.item{background:#F8F9FA;border-radius:10px;padding:14px}.label{font-size:11px;color:#999}.value{font-size:15px;font-weight:600;color:#333;margin-top:2px}.footer{margin-top:20px;font-size:11px;color:#bbb}</style></head><body><div class="card"><div class="icon">🛒</div><h1>优选购物</h1><p class="subtitle">微信小程序 · CloudBase + Vercel 全栈部署</p><div class="status">✅ 前端演示站运行中</div><div class="divider"></div><div class="grid"><div class="item"><div class="label">部署平台</div><div class="value">Vercel</div></div><div class="item"><div class="label">后端</div><div class="value">CloudBase</div></div><div class="item"><div class="label">技术栈</div><div class="value">Node.js</div></div><div class="item"><div class="label">健康检查</div><div class="value"><span style="color:#4ECDC4">/health</span></div></div></div><div class="footer">CloudBase + Vercel · HTTPS 已启用</div></div></body></html>');
};
