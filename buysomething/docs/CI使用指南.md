# CI 使用指南

## 一、本地测试方法

在推送代码之前，先在本地运行 CI 会执行的检查：

### 1.1 安装 ESLint

```bash
# 全局安装 ESLint
npm install -g eslint

# 或者在项目目录安装
npm install eslint --save-dev
```

### 1.2 运行 ESLint 检查

```bash
# 检查后端（云函数）
npx eslint cloudfunctions/**/*.js --max-warnings 0

# 检查前端（页面）
npx eslint pages/**/*.js --max-warnings 0

# 检查组件
npx eslint miniprogram/components/**/*.js --max-warnings 0
```

### 1.3 语法检查

```bash
# 检查所有 JS 文件语法
for file in cloudfunctions/**/*.js; do
  node --check "$file" && echo "✓ $file" || echo "✗ $file"
done
```

### 1.4 JSON 验证

```bash
# 检查 JSON 文件
for file in pages/**/*.json cloudfunctions/*/package.json; do
  node -e "JSON.parse(require('fs').readFileSync('$file'))" && echo "✓ $file"
done
```

---

## 二、一键检查脚本

创建 `check.sh` 快速检查：

```bash
#!/bin/bash
echo "===== CI Pre-check ====="

echo ""
echo "1. ESLint (cloudfunctions)..."
npx eslint cloudfunctions/**/*.js --max-warnings 0
if [ $? -eq 0 ]; then echo "✓ 后端检查通过"; else echo "✗ 后端有问题"; fi

echo ""
echo "2. ESLint (pages)..."
npx eslint pages/**/*.js --max-warnings 0
if [ $? -eq 0 ]; then echo "✓ 前端检查通过"; else echo "✗ 前端有问题"; fi

echo ""
echo "3. JSON validation..."
PASS=true
for file in pages/**/*.json; do
  node -e "JSON.parse(require('fs').readFileSync('$file'))" 2>/dev/null || { echo "✗ $file"; PASS=false; }
done
if [ "$PASS" = true ]; then echo "✓ JSON 检查通过"; fi

echo ""
echo "===== Pre-check Complete ====="
```

使用方法：
```bash
chmod +x check.sh
./check.sh
```

---

## 三、常见错误及修复

### 3.1 ESLint 错误

```bash
# 错误：no-unused-vars
# 修复：删除未使用的变量或用 _ 开头

# 错误：indent
# 修复：使用 2 空格缩进

# 错误：quotes
# 修复：使用单引号 '
```

### 3.2 自动修复

```bash
# ESLint 自动修复可修复的问题
npx eslint cloudfunctions/**/*.js --fix
npx eslint pages/**/*.js --fix
```

### 3.3 语法错误

```bash
# 检查具体文件
node --check cloudfunctions/login/index.js
```

---

## 四、GitHub Actions CI

### 4.1 推送后查看 CI 状态

1. 打开你的 GitHub 仓库
2. 点击 **Actions** 标签页
3. 查看 CI 运行状态

### 4.2 CI 失败怎么办

1. 点击失败的 workflow
2. 查看 **log** 找到错误原因
3. 本地修复后重新推送

### 4.3 添加徽章到 README

CI 成功后，在 README.md 顶部添加：

```markdown
[![CI](https://github.com/你的用户名/buysomething/actions/workflows/ci.yml/badge.svg)](https://github.com/你的用户名/buysomething/actions)
```

---

## 五、测试 CI 配置（无需推送）

### 5.1 使用 act 本地运行 GitHub Actions

```bash
# 安装 act
brew install act  # macOS
# 或
# Windows 用 Docker

# 运行 CI
act
```

### 5.2 模拟检查（推荐）

直接在本地运行 CI 会执行的所有命令，确保全部通过后再推送。

---

## 六、快速开始

```bash
# 1. 安装依赖
npm install eslint --save-dev

# 2. 运行检查
npm run lint

# 3. 修复问题
npm run lint:fix

# 4. 推送代码
git add .
git commit -m "feat: xxx"
git push
```

---

## 七、package.json 添加脚本

在项目根目录的 `package.json` 中添加：

```json
{
  "scripts": {
    "lint": "eslint cloudfunctions/**/*.js pages/**/*.js --max-warnings 0",
    "lint:fix": "eslint cloudfunctions/**/*.js pages/**/*.js --fix"
  }
}
```

然后你可以运行：
- `npm run lint` - 检查代码
- `npm run lint:fix` - 自动修复
