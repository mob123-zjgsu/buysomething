# 优选购物小程序 - 前端演示站

## 📋 项目说明

这是优选购物小程序的前端演示站点，使用 Docker 容器化部署。

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器（热重载）
npm run dev

# 或使用 Docker
docker compose -f compose.yaml up -d
```

### 生产部署

```bash
# 构建镜像
docker build -t buysomething-frontend .

# 运行容器
docker run -d -p 3000:3000 --name frontend buysomething-frontend

# 或使用 Docker Compose
docker compose -f compose.prod.yaml up -d
```

## 📡 API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/products` | GET | 获取商品列表 |
| `/api/product/:id` | GET | 获取商品详情 |
| `/health` | GET | 健康检查 |

## 🐳 Docker 命令

```bash
# 查看运行状态
docker compose ps

# 查看日志
docker compose logs -f

# 停止服务
docker compose down

# 重新构建
docker compose build --no-cache
```

## 📦 镜像信息

- **基础镜像**: node:20-alpine
- **镜像大小**: < 200MB
- **安全**: 非 root 用户运行
- **健康检查**: 内置

## 🔧 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | 3000 | 服务端口 |
| `NODE_ENV` | production | 运行环境 |
