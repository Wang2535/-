# OpenClaw Skills 快速参考

## 快速安装

```bash
# 安装 CLI
npm install -g clawdhub@latest

# 安装技能
npx clawdhub@latest install frontend-design
npx clawdhub@latest install ui-audit
npx clawdhub@latest install gemini
```

## 常用技能速查

| 技能 | 用途 | 命令 |
|------|------|------|
| frontend-design | 界面设计 | `npx clawdhub@latest install frontend-design` |
| ui-audit | UI审核 | `npx clawdhub@latest install ui-audit` |
| markdown-converter | 文档转换 | `npx clawdhub@latest install markdown-converter` |
| gemini | AI问答 | `npx clawdhub@latest install gemini` |
| notion | 文档协作 | `npx clawdhub@latest install notion` |
| github-pr | PR管理 | `npx clawdhub@latest install github-pr` |

## API密钥获取

- **Google Gemini**: https://makersuite.google.com/app/apikey
- **OpenAI**: https://platform.openai.com/api-keys
- **Perplexity**: https://www.perplexity.ai/settings/api
- **Todoist**: https://todoist.com/app/settings/integrations/developer
- **Notion**: https://www.notion.so/my-integrations

## 环境变量示例

```bash
GOOGLE_API_KEY=your-key
OPENAI_API_KEY=your-key
PERPLEXITY_API_KEY=your-key
TODOIST_API_KEY=your-key
NOTION_API_KEY=your-key
```

## 使用提示

1. 安装技能后，AI 会自动识别并调用
2. 部分技能需要配置 API 密钥
3. 可以手动触发："使用 ui-audit 检查这个界面"
