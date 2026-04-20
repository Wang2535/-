@echo off
echo ==========================================
echo   OpenClaw Skills 批量安装脚本
echo ==========================================
echo.

echo [1/3] 安装前端开发类技能...
npx clawdhub@latest install frontend-design
npx clawdhub@latest install ui-audit
npx clawdhub@latest install web-design-guidelines

echo.
echo [2/3] 安装代码质量类技能...
npx clawdhub@latest install conventional-commits
npx clawdhub@latest install github-pr

echo.
echo [3/3] 安装 AI 辅助类技能...
npx clawdhub@latest install gemini
npx clawdhub@latest install perplexity

echo.
echo ==========================================
echo   安装完成！
echo ==========================================
echo.
echo 下一步：
echo 1. 复制 env-template.txt 为 .env
echo 2. 填入你的 API 密钥
echo.
pause
