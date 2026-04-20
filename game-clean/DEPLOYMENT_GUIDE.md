# 游戏系统部署指南

## 项目结构

### 根目录
D:\X 学习\学习文件合集\中科院实习\工作五：桌游设计\额外尝试：trae 基于 kimi 第七版的进一步完善\game-temp

### 核心代码目录
- src/ - 游戏源代码
- package.json - 项目配置
- vite.config.ts - Vite 配置
- index.html - HTML 入口

### 需要排除的目录
- node_modules/ - npm 依赖
- dist/ - 构建输出
- .trae/ - IDE 配置
- *.log - 日志文件

## 部署步骤

### 1. 初始化 Git
cd 到项目目录
git init
git add .
git commit -m "Initial commit"

### 2. 创建 GitHub 仓库
1. 访问 github.com
2. New repository
3. 填写仓库名（如：dadong-game）
4. 不要勾选 Initialize with README
5. Create repository

### 3. 推送到 GitHub
git remote add origin https://github.com/YOUR_USERNAME/dadong-game.git
git branch -M main
git push -u origin main

### 4. 配置 GitHub Pages
方法 A：GitHub Actions（推荐）
- Settings -> Pages -> GitHub Actions
- 选择 Static HTML
- Commit changes

方法 B：手动部署
npm run build
npm install --save-dev gh-pages
npx gh-pages -d dist

### 5. 访问网址
https://YOUR_USERNAME.github.io/dadong-game/

## 本地开发

npm install          # 安装依赖
npm run dev          # 启动开发服务器
npm run build        # 生产构建

## 注意事项

1. 推送前确保 .gitignore 已创建
2. package.json 中的 name 要修改为合适的仓库名
3. 如果是 SPA，需要在 vite.config.ts 中配置 base
4. 部署后等待 1-2 分钟生效

祝部署顺利！
