# 《大东话安全》关卡模式游戏系统

这是一个基于 React + TypeScript + Vite 的网页游戏系统，用于展示《大东话安全》系列的关卡内容。

## 在线演示

访问游戏：https://YOUR_USERNAME.github.io/dadong-game-levels/

## 功能特点

- 完整的关卡模式游戏流程
- 7 个游戏阶段：判定、恢复、摸牌、行动、响应、弃牌、结束
- AI 对手系统
- 详细的游戏日志记录
- 响应式设计，支持手机、平板、电脑

## 技术栈

- **前端框架**: React 18
- **开发语言**: TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **游戏引擎**: 自定义关卡游戏引擎

## 本地开发

### 安装依赖
`ash
npm install
`

### 启动开发服务器
`ash
npm run dev
`
访问 http://localhost:5173/

### 生产构建
`ash
npm run build
`

## 项目结构

`
game-temp/
─ src/
    components/     # React 组件
    engine/         # 游戏引擎核心
   ─ types/          # TypeScript 类型定义
    ...
─ public/             # 静态资源
└ package.json        # 项目配置
`

## 部署

本项目已配置 GitHub Actions 自动部署：
1. 推送到 main 分支
2. GitHub Actions 自动构建
3. 部署到 GitHub Pages

## 许可证

MIT License

## 联系方式

如有问题，请提交 Issue 或联系开发者。
