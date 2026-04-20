# OpenClaw Skills 完整技能文档

## 什么是 OpenClaw Skills

OpenClaw Skills 是遵循 Anthropic Agent Skill 开放标准的本地运行 AI 助手技能集合。这些技能可以让 Trae 具备更多专业能力，如前端设计、代码审核、文档处理等。

---

## 核心技能详解

### 一、前端开发类

#### 1. frontend-design
**功能**：创建高质量、生产级的前端界面

**安装命令**：
```bash
npx clawdhub@latest install frontend-design
```

**使用场景**：
- 设计新的用户界面
- 改进现有界面
- 创建响应式布局
- 实现组件设计系统

**使用示例**：
```
用户：帮我设计一个游戏主界面
AI：使用 frontend-design 技能，我会为你创建一个现代化的游戏主界面，包含导航栏、游戏区域、状态面板等组件...
```

---

#### 2. ui-audit
**功能**：自动化 UI 审核，根据 UX 原则评估界面

**安装命令**：
```bash
npx clawdhub@latest install ui-audit
```

**使用场景**：
- 审核 UI 设计质量
- 发现 UX 问题
- 检查可访问性
- 评估视觉层次

**使用示例**：
```
用户：检查这个登录页面的设计
AI：使用 ui-audit 技能，我发现了以下问题：1. 对比度不足 2. 按钮尺寸不符合规范 3. 缺少错误状态提示...
```

---

#### 3. web-design-guidelines
**功能**：检查 UI 代码是否符合 Web 界面指南

**安装命令**：
```bash
npx clawdhub@latest install web-design-guidelines
```

**使用场景**：
- 验证代码规范
- 检查设计一致性
- 确保最佳实践

---

### 二、代码质量类

#### 4. conventional-commits
**功能**：使用 Conventional Commits 规范格式化提交信息

**安装命令**：
```bash
npx clawdhub@latest install conventional-commits
```

**使用场景**：
- 规范化 Git 提交信息
- 自动生成 CHANGELOG
- 提高代码历史可读性

**提交类型**：
- `feat`: 新功能
- `fix`: 修复问题
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构代码
- `test`: 添加测试
- `chore`: 构建过程或辅助工具的变动

**使用示例**：
```
用户：帮我写提交信息
AI：根据 conventional-commits 规范，建议提交信息：
feat: 添加用户登录功能
- 实现登录表单验证
- 集成 JWT 认证
- 添加记住密码功能
```

---

#### 5. github-pr
**功能**：本地获取、预览、合并和测试 GitHub PR

**安装命令**：
```bash
npx clawdhub@latest install github-pr
```

**使用场景**：
- 本地预览 PR 代码
- 测试 PR 功能
- 合并 PR
- 代码审查

---

### 三、项目管理类

#### 6. todoist
**功能**：管理 Todoist 任务和项目

**安装命令**：
```bash
npx clawdhub@latest install todoist
```

**环境变量**：
```env
TODOIST_API_KEY=your-todoist-api-key
```

**使用场景**：
- 创建任务
- 管理项目
- 设置截止日期
- 分配任务优先级

**API 密钥获取**：https://todoist.com/app/settings/integrations/developer

---

#### 7. notion
**功能**：Notion API 用于创建和管理页面、数据库

**安装命令**：
```bash
npx clawdhub@latest install notion
```

**环境变量**：
```env
NOTION_API_KEY=your-notion-api-key
```

**使用场景**：
- 创建文档页面
- 管理数据库
- 协作编辑
- 知识库管理

**API 密钥获取**：https://www.notion.so/my-integrations

---

### 四、文档处理类

#### 8. markdown-converter
**功能**：将文档和文件转换为 Markdown

**安装命令**：
```bash
npx clawdhub@latest install markdown-converter
```

**使用场景**：
- 转换 PDF 为 Markdown
- 转换 Word 文档
- 提取网页内容
- 文档格式统一

---

#### 9. pptx-creator
**功能**：创建专业 PowerPoint 演示文稿

**安装命令**：
```bash
npx clawdhub@latest install pptx-creator
```

**使用场景**：
- 自动生成演示文稿
- 创建项目汇报 PPT
- 制作培训材料
- 数据可视化展示

---

### 五、AI 辅助类

#### 10. gemini
**功能**：Google Gemini CLI 用于问答、摘要和生成

**安装命令**：
```bash
npx clawdhub@latest install gemini
```

**环境变量**：
```env
GOOGLE_API_KEY=your-google-api-key
```

**使用场景**：
- AI 问答
- 文本摘要
- 内容生成
- 代码解释

**API 密钥获取**：https://makersuite.google.com/app/apikey

**使用示例**：
```
用户：解释这段代码的作用
AI：使用 gemini 技能，这段代码实现了...
```

---

#### 11. perplexity
**功能**：AI 驱动的网络搜索

**安装命令**：
```bash
npx clawdhub@latest install perplexity
```

**环境变量**：
```env
PERPLEXITY_API_KEY=your-perplexity-api-key
```

**使用场景**：
- 实时信息搜索
- 技术问题解答
- 最新资讯获取
- 研究资料收集

**API 密钥获取**：https://www.perplexity.ai/settings/api

**使用示例**：
```
用户：搜索 React 最佳实践
AI：使用 perplexity 技能，我为你搜索到以下 React 最佳实践：...
```

---

## 环境变量配置

创建 `.env` 文件并添加以下配置：

```env
# Google Gemini
GOOGLE_API_KEY=your-google-api-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Perplexity
PERPLEXITY_API_KEY=your-perplexity-api-key

# Todoist
TODOIST_API_KEY=your-todoist-api-key

# Notion
NOTION_API_KEY=your-notion-api-key
```

---

## 安装步骤

### 1. 安装 ClawdHub CLI

```bash
npm install -g clawdhub@latest
```

### 2. 安装单个技能

```bash
npx clawdhub@latest install <skill-slug>
```

### 3. 批量安装核心技能

```bash
# 前端开发
npx clawdhub@latest install frontend-design
npx clawdhub@latest install ui-audit
npx clawdhub@latest install web-design-guidelines

# 代码质量
npx clawdhub@latest install conventional-commits
npx clawdhub@latest install github-pr

# AI 辅助
npx clawdhub@latest install gemini
npx clawdhub@latest install perplexity
```

---

## 使用技巧

### 1. 明确触发技能

可以直接告诉 Trae 使用特定技能：
```
使用 frontend-design 技能，帮我设计一个登录页面
```

### 2. 组合使用技能

多个技能可以组合使用：
```
使用 ui-audit 检查这个设计，然后用 conventional-commits 提交修改
```

### 3. 检查技能状态

```bash
npx clawdhub@latest list
```

### 4. 搜索更多技能

```bash
npx clawdhub@latest search <keyword>
```

---

## 故障排除

### 问题 1：技能不生效
- 检查环境变量是否正确配置
- 重启 Trae 应用
- 验证技能安装路径

### 问题 2：API 密钥错误
- 确认 API 密钥格式正确
- 检查网络连接
- 验证 API 密钥权限

### 问题 3：ClawdHub CLI 安装失败
- 使用管理员权限运行
- 尝试 `npm install -g clawdhub@latest --force`
- 检查 Node.js 版本（建议 v16+）

---

## 推荐配置

对于前端开发项目，建议安装以下技能组合：

1. **frontend-design** - 界面设计
2. **ui-audit** - UI 审核
3. **conventional-commits** - 提交规范
4. **github-pr** - PR 管理
5. **gemini** - AI 辅助

对于全栈开发项目，额外添加：

6. **perplexity** - 网络搜索
7. **markdown-converter** - 文档转换
8. **notion** - 文档协作

---

## 更多资源

- [Awesome OpenClaw Skills](https://github.com/VoltAgent/awesome-openclaw-skills)
- [OpenClaw Skills Registry](https://github.com/openclaw/skills)
- [ClawdHub CLI 文档](https://github.com/VoltAgent/clawdhub)

---

**注意**：部分技能需要配置 API 密钥才能正常使用。建议优先安装不需要 API 密钥的技能（如 frontend-design、ui-audit、conventional-commits），然后根据需要添加其他技能。