/**
 * 优选购物小程序 - 前端演示服务器
 * 提供 API Mock 服务和静态文件托管
 */

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Mock 数据
const MOCK_PRODUCTS = [
  {
    id: 'product-001',
    name: '时尚休闲运动鞋',
    price: 299,
    originalPrice: 499,
    image: '/images/product1.jpg',
    description: '时尚休闲设计，舒适缓震，适合日常和运动',
    sales: 800,
    rating: 4.9
  },
  {
    id: 'product-002',
    name: '潮流纯棉短袖T恤',
    price: 89,
    originalPrice: 199,
    image: '/images/product2.jpg',
    description: '纯棉面料，透气舒适，休闲百搭',
    sales: 1200,
    rating: 4.7
  }
];

// API 路由
app.get('/api/products', (req, res) => {
  res.json({
    code: 0,
    message: 'success',
    data: MOCK_PRODUCTS
  });
});

app.get('/api/product/:id', (req, res) => {
  const product = MOCK_PRODUCTS.find(p => p.id === req.params.id);
  if (product) {
    res.json({ code: 0, message: 'success', data: product });
  } else {
    res.status(404).json({ code: 404, message: '商品不存在' });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 首页
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>优选购物 - API 演示站</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
        h1 { color: #FF6B6B; margin-bottom: 20px; }
        .card { background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .api-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #eee; }
        .api-item:last-child { border-bottom: none; }
        .method { background: #4ECDC4; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .endpoint { color: #333; font-family: monospace; }
        .status { color: #4CAF50; font-weight: 500; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🏪 优选购物 - API 演示站</h1>
        
        <div class="card">
          <h2 style="margin-bottom: 15px;">📡 可用 API 接口</h2>
          <div class="api-item">
            <span class="method">GET</span>
            <span class="endpoint">/api/products</span>
            <span class="status">✅ 运行中</span>
          </div>
          <div class="api-item">
            <span class="method">GET</span>
            <span class="endpoint">/api/product/:id</span>
            <span class="status">✅ 运行中</span>
          </div>
          <div class="api-item">
            <span class="method">GET</span>
            <span class="endpoint">/health</span>
            <span class="status">✅ 健康</span>
          </div>
        </div>
        
        <div class="card">
          <h2 style="margin-bottom: 15px;">📋 服务信息</h2>
          <p><strong>版本：</strong> 1.0.0</p>
          <p><strong>环境：</strong> ${process.env.NODE_ENV || 'development'}</p>
          <p><strong>运行时间：</strong> <span id="uptime">-</span></p>
        </div>
      </div>
      
      <script>
        // 显示运行时间
        fetch('/health').then(r => r.json()).then(data => {
          document.getElementById('uptime').textContent = new Date(data.timestamp).toLocaleString('zh-CN');
        });
      </script>
    </body>
    </html>
  `);
});

// 本地开发时启动服务器
// Vercel 环境下不启动（使用 serverless 函数导出）
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🏪 优选购物 - 前端演示服务                           ║
║                                                       ║
║   ✅ 服务已启动                                       ║
║   🌐 http://localhost:${PORT}                            ║
║   💚 健康检查: http://localhost:${PORT}/health          ║
║                                                       ║
║   技术栈: Node.js + Express + Docker                 ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);
  });
}

// Vercel Serverless 函数导出
export default app;
