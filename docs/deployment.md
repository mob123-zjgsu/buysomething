# 🚀 云服务部署说明

## 概述

本项目（优选购物小程序）采用**混合部署架构**：
- **后端 API**：CloudBase 云函数（Serverless，自动伸缩）
- **前端演示站**：Docker 容器化 + Vercel 托管
- **数据库**：CloudBase NoSQL 文档数据库
- **存储**：CloudBase 云存储
- **静态资源**：CloudBase 静态网站托管

---

## 1. 平台选择

| 服务 | 平台 | 说明 |
|------|------|------|
| 云函数（后端） | **腾讯云 CloudBase** | 17 个云函数，自动部署 |
| 前端演示站 | **Vercel** + **Docker/GHCR** | 双平台支持 |
| 数据库 | **CloudBase NoSQL** | 10 个集合 |
| 静态托管 | **CloudBase 静态网站托管** | 小程序资源 |

选择理由：
- **CloudBase**：与微信小程序深度集成，免运维 Serverless，按量付费
- **Vercel**：免费层足够，自动 HTTPS，Git 推送自动部署
- **Docker**：前端演示站容器化，环境一致性，便于迁移

---

## 2. 部署配置

### 2.1 CloudBase 云函数（后端）

部署配置文件：`.github/workflows/cloudbase-deploy.yml`

```yaml
# 触发条件：推送 main 分支的 cloudfunctions/ 目录
on:
  push:
    branches: [main]
  workflow_dispatch:

# 使用 CloudBase CLI 自动部署所有云函数
jobs:
  deploy-functions:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install CloudBase CLI
        run: npm install -g @cloudbase/cli@latest
      - name: Deploy to CloudBase
        env:
          TCB_SECRET_ID: ${{ secrets.TCB_SECRET_ID }}
          TCB_SECRET_KEY: ${{ secrets.TCB_SECRET_KEY }}
          TCB_ENV_ID: ${{ secrets.TCB_ENV_ID }}
        run: |
          tcb login --apiKeyId $TCB_SECRET_ID --apiKey $TCB_SECRET_KEY
          cd cloudfunctions
          tcb fn deploy --all --envId $TCB_ENV_ID --force
```

### 2.2 前端演示站（Docker + Vercel）

**Docker 配置**：`frontend/Dockerfile`

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

FROM node:20-alpine AS production
RUN addgroup -g 1001 -S nodejs && adduser -S nodeapp -u 1001 -G nodejs
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.js .
USER nodeapp
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', ...)"
CMD ["node", "server.js"]
```

**Vercel 配置**：`vercel.json`

```json
{
  "version": 2,
  "builds": [{ "src": "frontend/**", "use": "@vercel/node" }],
  "routes": [
    { "src": "/health", "dest": "/frontend/server.js" },
    { "src": "/api/(.*)", "dest": "/frontend/server.js" }
  ]
}
```

### 2.3 GitHub Actions CI/CD

| 工作流 | 文件 | 功能 |
|--------|------|------|
| 云函数部署 | `cloudbase-deploy.yml` | 推送 main 时自动部署云函数 |
| 前端 Docker | `docker-frontend.yml` | 构建 Docker 镜像并推送 GHCR |
| 代码检查 | `ci.yml` | ESLint 静态分析 |
| 安全扫描 | `security.yml` | 密钥泄露 + 依赖漏洞扫描 |

---

## 3. 环境变量配置

### 3.1 GitHub Secrets（必需）

在 GitHub 仓库 `Settings → Secrets and variables → Actions` 中配置：

| Secret 名称 | 说明 | 示例 |
|-------------|------|------|
| `TCB_SECRET_ID` | 腾讯云 API 密钥 ID | `AKIDxxxxx` |
| `TCB_SECRET_KEY` | 腾讯云 API 密钥 Key | `xxxxx` |
| `TCB_ENV_ID` | CloudBase 环境 ID | `buysomething-6gbmbtpxff05be35` |

### 3.2 云函数环境变量

| 变量名 | 说明 | 配置位置 |
|--------|------|----------|
| `DEEPSEEK_API_KEY` | AI 客服 API 密钥 | 云函数环境变量 |
| `ADMIN_PHONE` | 管理员手机号 | `admin-login` 云函数 |
| `ADMIN_PASSWORD` | 管理员密码 | `admin-login` 云函数 |

---

## 4. 自动部署流程

```
开发者推送代码到 main 分支
        │
        ▼
GitHub Actions 检测变更
        │
        ├── cloudfunctions/ 变更 → cloudbase-deploy.yml → 云函数部署到 CloudBase
        ├── frontend/ 变更 → docker-frontend.yml → Docker 镜像构建 → 推送 GHCR
        └── 全量变更 → ci.yml + security.yml → 代码检查 + 安全扫描
```

**部署耗时**：
- 云函数部署：~2-3 分钟
- Docker 构建：~3-5 分钟
- 代码检查：~1 分钟

---

## 5. 线上访问地址

| 服务 | 地址 |
|------|------|
| **静态托管** | `https://buysomething-6gbmbtpxff05be35-1383007216.tcloudbaseapp.com` |
| **Docker 镜像** | `ghcr.io/[username]/buysomething-frontend:latest` |
| **Vercel** | `https://buysomething.vercel.app` |
| **健康检查** | `GET /health` → `{"status":"healthy","timestamp":"...","version":"1.0.0"}` |

---

## 6. 部署检查清单

- [x] CloudBase 环境已创建（环境 ID: `buysomething-6gbmbtpxff05be35`）
- [x] 云函数自动部署工作流已配置
- [x] Docker 镜像自动构建已配置
- [x] GitHub Secrets 已配置
- [x] CORS 和安全域名已配置
- [x] 健康检查端点已实现（`/health`）
- [x] 非 root 用户运行容器
- [x] HTTPS 已启用（CloudBase 默认提供）

---

## 7. 常见问题

### Q: 部署失败怎么办？
1. 检查 GitHub Actions 日志
2. 确认 Secrets 配置正确
3. 本地测试 CloudBase CLI：`tcb fn deploy --all --envId buysomething-6gbmbtpxff05be35`

### Q: 如何回滚？
- CloudBase 云函数支持版本管理，可在控制台回滚到上一版本
- Docker 镜像通过 Git tag 管理版本
