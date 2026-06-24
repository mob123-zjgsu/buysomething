# ================================================
# 优选购物小程序 - 前端演示站 Dockerfile
# 多阶段构建，优化镜像大小
# ================================================

# ===== 阶段1: 构建阶段 =====
FROM node:20-alpine AS builder

WORKDIR /app

# 安装依赖（利用 Docker 缓存）
COPY package*.json ./
RUN npm ci --only=production --no-audit --no-fund

# 复制源代码
COPY . .

# ===== 阶段2: 生产阶段 =====
FROM node:20-alpine AS production

# 安全：创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeapp -u 1001 -G nodejs

WORKDIR /app

# 从构建阶段复制依赖
COPY --from=builder --chown=nodeapp:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodeapp:nodejs /app/server.js .

# 创建 public 目录（用于静态资源）
RUN mkdir -p public && chown -R nodeapp:nodejs public

# 切换到非 root 用户
USER nodeapp

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# 启动命令
CMD ["node", "server.js"]
