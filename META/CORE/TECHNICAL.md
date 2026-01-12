# Noca 技术文档

## 架构

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Raycast      │────▶│   Local JSON    │────▶│  Claude Code    │
│    Extension    │     │   Storage       │     │  Processing     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                               ┌────────────────────────┤
                               │                        │
                               ▼                        ▼
                        ┌─────────────┐         ┌─────────────┐
                        │   Logs      │         │ Notion API  │
                        └─────────────┘         └─────────────┘
```

## 目录结构

```
~/noca/
├── captures/                # 每日捕获数据
│   └── 2026-01-11.json
├── processed/               # AI 处理后的输出
│   └── 2026-01-11.md
├── logs/                    # 运行日志
│   └── 2026-01-11.log
└── config.json              # Notion 配置
```

---

## 1. 日志系统

### 日志位置

日志保存在 `~/noca/logs/` 目录，每天一个文件。

### 日志格式

```
[2026-01-11 08:00:00] INFO  Noca Processor started
[2026-01-11 08:00:00] INFO  Processing date: 2026-01-10
[2026-01-11 08:00:00] INFO  Loaded 5 captures
[2026-01-11 08:00:03] INFO  Calling Claude AI for processing...
[2026-01-11 08:00:08] INFO  AI processing completed
[2026-01-11 08:00:08] INFO  Saved to: /Users/.../processed/2026-01-10.md
[2026-01-11 08:00:08] INFO  Push to Notion requested
[2026-01-11 08:00:09] INFO  Notion connected successfully
[2026-01-11 08:00:10] INFO  Pushing 12 blocks to Notion
[2026-01-11 08:00:11] INFO  Pushed to Notion successfully
[2026-01-11 08:00:11] INFO  Completed successfully
```

### 查看日志

```bash
# 查看今天的日志
cat ~/noca/logs/$(date +%Y-%m-%d).log

# 查看所有日志
ls -la ~/noca/logs/

# 实时查看（调度器运行时）
tail -f ~/noca/logs/*.log
```

---

## 2. 自动调度器

### 工作原理

使用 macOS launchd 实现每日自动处理。

**调度逻辑：**
- 每天早上 8:00 运行
- 处理**昨天**的 captures（因为"一天"定义为 8:00 AM 到次日 8:00 AM）
- 自动推送到 Notion

### 配置文件

**位置：** `~/Library/LaunchAgents/com.noca.daily-push.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "...">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.noca.daily-push</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>-c</string>
        <string>cd ~/noca && ./scripts/qc-process $(date -v-1d +%Y-%m-%d) --push</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>8</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/tmp/noca-push.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/noca-push.error.log</string>
</dict>
</plist>
```

### 安装调度器

```bash
./scripts/install-scheduler.sh
```

### 管理命令

```bash
# 检查状态（退出码 0 = 正常）
launchctl list | grep noca

# 查看 launchd 日志
cat /tmp/noca-push.log
cat /tmp/noca-push.error.log

# 重新加载
launchctl unload ~/Library/LaunchAgents/com.noca.daily-push.plist
launchctl load ~/Library/LaunchAgents/com.noca.daily-push.plist

# 卸载
launchctl unload ~/Library/LaunchAgents/com.noca.daily-push.plist
rm ~/Library/LaunchAgents/com.noca.daily-push.plist
```

---

## 3. CLI 使用

### 基本命令

```bash
# 处理今天的 captures
./scripts/qc-process

# 处理指定日期
./scripts/qc-process 2026-01-10

# 处理并推送到 Notion
./scripts/qc-process --push
./scripts/qc-process 2026-01-10 --push

# 显示帮助
./scripts/qc-process --help
```

### 脚本实现

**scripts/qc-process:**

```bash
#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# 使用绝对路径确保 launchd 兼容性
NODE_PATH="/opt/homebrew/bin/node"
if [ ! -x "$NODE_PATH" ]; then
    NODE_PATH="node"
fi

"$NODE_PATH" "$PROJECT_DIR/dist/processor/cli.js" "$@"
```

---

## 4. 数据格式

### Capture JSON

**~/noca/captures/2026-01-11.json**

```json
[
  {
    "content": "https://example.com/article",
    "type": "url",
    "note": "有趣的文章",
    "time": "10:45:30"
  },
  {
    "content": "这是一个想法",
    "type": "text",
    "note": null,
    "time": "11:30:00"
  }
]
```

### Processed Markdown

**~/noca/processed/2026-01-11.md**

```markdown
## 2026-01-11

### 链接
- [Example Article](https://example.com/article) - 有趣的文章

### 想法
- 这是一个想法

### TODO
- [ ] 完成项目文档
```

### Config

**~/noca/config.json**

```json
{
  "notion": {
    "token": "secret_xxx",
    "pageId": "xxx-xxx-xxx"
  },
  "storage": {
    "path": "~/noca"
  }
}
```

---

## 5. 项目源码结构

```
Noca/
├── src/
│   ├── shared/
│   │   ├── types.ts        # Capture, CaptureType 类型定义
│   │   ├── config.ts       # 配置加载
│   │   ├── logger.ts       # 日志系统
│   │   └── index.ts
│   ├── storage/
│   │   ├── storage.ts      # CaptureStorage 类
│   │   └── storage.test.ts
│   ├── processor/
│   │   ├── cli.ts          # CLI 入口
│   │   ├── processor.ts    # Processor 类
│   │   ├── claude.ts       # Claude CLI 调用
│   │   └── processor.test.ts
│   ├── notion/
│   │   ├── client.ts       # NotionClient 类
│   │   ├── blocks.ts       # Markdown → Notion Blocks 转换
│   │   └── blocks.test.ts
│   └── raycast/            # Raycast 扩展
│       ├── src/
│       │   ├── capture.tsx
│       │   └── view-captures.tsx
│       └── package.json
├── scripts/
│   ├── qc-process          # CLI 脚本
│   ├── install-scheduler.sh
│   └── setup.sh
├── config/
│   ├── com.noca.daily-push.plist  # launchd 配置
│   └── prompt.md           # AI Prompt
└── dist/                   # 编译输出
```

---

## 6. 依赖

| 组件 | 依赖 |
|------|------|
| 核心 | Node.js 18+, TypeScript |
| Raycast 扩展 | @raycast/api |
| Notion 集成 | @notionhq/client |
| AI 处理 | Claude CLI |
| 调度 | macOS launchd |

---

## 7. 开发命令

```bash
# 安装依赖
npm install

# 编译
npm run build

# 运行测试
npm run test

# 监听模式测试
npm run test:watch

# 代码检查
npm run lint
```
