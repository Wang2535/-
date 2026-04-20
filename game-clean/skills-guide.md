# OpenClaw Skills 详细使用指南

> 基于 awesome-openclaw-skills 仓库整理  
> 总计技能数量：700+

---

## 安装方法

### 安装 ClawdHub CLI

```bash
npm install -g clawdhub@latest
```

### 安装技能

```bash
npx clawdhub@latest install <skill-slug>
```

### 手动安装

将 skill 文件夹复制到：
- **全局**：`~/.openclaw/skills/`
- **工作区**：`<project>/skills/`

---

## 推荐技能清单

### 前端开发类

#### 1. frontend-design
**功能**：创建高质量、生产级的前端界面  
**安装**：`npx clawdhub@latest install frontend-design`  
**适用场景**：设计新的用户界面、改进现有界面

#### 2. ui-audit
**功能**：自动化 UI 审核，根据 UX 原则评估界面  
**安装**：`npx clawdhub@latest install ui-audit`  
**适用场景**：审核 UI 设计、发现 UX 问题

#### 3. web-design-guidelines
**功能**：检查 UI 代码是否符合 Web 界面指南  
**安装**：`npx clawdhub@latest install web-design-guidelines`

### 代码质量类

#### 4. conventional-commits
**功能**：使用 Conventional Commits 规范格式化提交信息  
**安装**：`npx clawdhub@latest install conventional-commits`  
**示例**：
```
feat: 添加用户登录功能
fix: 修复登录页面样式问题
docs: 更新 API 文档
```

#### 5. github-pr
**功能**：本地获取、预览、合并和测试 GitHub PR  
**安装**：`npx clawdhub@latest install github-pr`

### 项目管理类

#### 6. todoist
**功能**：管理 Todoist 任务和项目  
**安装**：`npx clawdhub@latest install todoist`  
**需要**：TODOIST_API_KEY

#### 7. notion
**功能**：Notion API 用于创建和管理页面、数据库  
**安装**：`npx clawdhub@latest install notion`  
**需要**：NOTION_API_KEY

### 文档处理类

#### 8. markdown-converter
**功能**：将文档和文件转换为 Markdown  
**安装**：`npx clawdhub@latest install markdown-converter`

#### 9. pptx-creator
**功能**：创建专业 PowerPoint 演示文稿  
**安装**：`npx clawdhub@latest install pptx-creator`

### AI 辅助类

#### 10. gemini
**功能**：Google Gemini CLI 用于问答、摘要和生成  
**安装**：`npx clawdhub@latest install gemini`  
**需要**：GOOGLE_API_KEY

#### 11. perplexity
**功能**：AI 驱动的网络搜索  
**安装**：`npx clawdhub@latest install perplexity`  
**需要**：PERPLEXITY_API_KEY

---

## 环境变量配置

创建 `.env` 文件：

```bash
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

## API 密钥获取地址

| 服务 | 获取地址 |
|------|----------|
| Google Gemini | https://makersuite.google.com/app/apikey |
| OpenAI | https://platform.openai.com/api-keys |
| Perplexity | https://www.perplexity.ai/settings/api |
| Todoist | https://todoist.com/app/settings/integrations/developer |
| Notion | https://www.notion.so/my-integrations |

---

## 使用示例

### 设计界面
```
用户：帮我设计一个游戏主界面
AI：使用 frontend-design 技能...
```

### 审核代码
```
用户：检查这个登录页面的设计
AI：使用 ui-audit 技能...
```

### 搜索信息
```
用户：搜索 React 最佳实践
AI：使用 perplexity 技能...
```

---

## 更多资源

- [Awesome OpenClaw Skills](https://github.com/VoltAgent/awesome-openclaw-skills)
- [OpenClaw Skills Registry](https://github.com/openclaw/skills)
