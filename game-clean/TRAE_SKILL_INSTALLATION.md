# Trae 技能安装指南

## 准备工作

1. **确保已经克隆了技能仓库**
   - 技能仓库位置：`awesome-openclaw-skills`
   - 包含 700+ 社区构建的 OpenClaw 技能

2. **检查必要文件**
   - `skills-guide.md` - 详细技能使用指南
   - `quick-reference.md` - 快速参考卡片
   - `install-skills.bat` - 批量安装脚本
   - `env-template.txt` - 环境变量模板

## 安装方法

### 方法一：通过 ClawdHub CLI 安装（推荐）

#### 步骤 1：安装 ClawdHub CLI

```bash
npm install -g clawdhub@latest
```

#### 步骤 2：安装单个技能

```bash
npx clawdhub@latest install <skill-slug>
```

#### 步骤 3：批量安装技能

1. 双击运行 `install-skills.bat` 文件
2. 或在命令行中执行：

```bash
./install-skills.bat
```

### 方法二：手动安装

#### 步骤 1：创建技能目录

在 Trae 项目中创建 `skills` 目录：

```bash
mkdir -p skills
```

#### 步骤 2：复制技能文件

将需要的技能文件夹复制到以下位置：
- **全局**：`~/.openclaw/skills/`
- **工作区**：`<project>/skills/`

## 环境变量配置

1. 复制 `env-template.txt` 为 `.env` 文件
2. 填写所需的 API 密钥

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

## 验证安装

### 检查已安装的技能

```bash
npx clawdhub@latest list
```

### 测试技能

在 Trae 中尝试使用技能，例如：

```
用户：帮我设计一个游戏主界面
AI：使用 frontend-design 技能...
```

## 推荐技能

### 前端开发类
- `frontend-design` - 创建高质量前端界面
- `ui-audit` - 自动化 UI 审核
- `web-design-guidelines` - 检查 UI 代码规范

### 代码质量类
- `conventional-commits` - 格式化提交信息
- `github-pr` - 管理 GitHub PR

### AI 辅助类
- `gemini` - Google Gemini CLI
- `perplexity` - AI 驱动的网络搜索

## 故障排除

### 常见问题

1. **ClawdHub CLI 安装失败**
   - 尝试使用 `npm install -g clawdhub@latest --force`
   - 或直接使用手动安装方法

2. **技能不生效**
   - 检查技能目录是否正确
   - 重启 Trae 应用
   - 验证环境变量配置

3. **API 密钥错误**
   - 确保 API 密钥格式正确
   - 检查网络连接
   - 验证 API 密钥权限

### 联系支持

如果遇到其他问题，请参考：
- [Awesome OpenClaw Skills](https://github.com/VoltAgent/awesome-openclaw-skills)
- [OpenClaw Skills Registry](https://github.com/openclaw/skills)

## 快捷命令

| 命令 | 描述 |
|------|------|
| `npx clawdhub@latest search <keyword>` | 搜索技能 |
| `npx clawdhub@latest info <skill-slug>` | 查看技能详情 |
| `npx clawdhub@latest uninstall <skill-slug>` | 卸载技能 |
| `npx clawdhub@latest update` | 更新技能 |

---

**提示**：建议先安装几个核心技能，如 `frontend-design`、`gemini` 和 `conventional-commits`，然后根据需要添加其他技能。