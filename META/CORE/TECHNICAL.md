# Noca 技术文档

## 架构

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Raycast      │────▶│   Local JSON    │────▶│  Claude Code    │
│    Extension    │     │   Storage       │     │  Processing     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                                ┌─────────────────┐
                                                │   Notion API    │
                                                └─────────────────┘
```

## 目录结构

```
~/noca/
├── captures/                # 每日数据
│   └── 2026-01-06.json
├── processed/               # 处理后输出
│   └── 2026-01-06.md
├── config.json              # 配置文件
└── prompt.md                # AI 整理规则
```

---

## 1. Raycast 扩展

### 创建项目

```bash
# 安装 Raycast 扩展开发工具
npm install -g @raycast/api

# 创建扩展
cd ~/Developer
npx create-raycast-extension --type form
# 名字：noca
```

### package.json

```json
{
  "name": "noca",
  "title": "Noca",
  "description": "Capture anything to Notion",
  "icon": "icon.png",
  "author": "you",
  "license": "MIT",
  "commands": [
    {
      "name": "capture",
      "title": "Noca Capture",
      "description": "Capture clipboard content with optional note",
      "mode": "view"
    }
  ],
  "dependencies": {
    "@raycast/api": "^1.50.0"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "typescript": "^5.0.0"
  }
}
```

### src/capture.tsx

```tsx
import {
  Form,
  ActionPanel,
  Action,
  showToast,
  Toast,
  Clipboard,
  popToRoot,
} from "@raycast/api";
import { useState, useEffect } from "react";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const CAPTURE_DIR = path.join(process.env.HOME || "", "noca/captures");

export default function Command() {
  const [content, setContent] = useState("");
  const [note, setNote] = useState("");

  // 启动时读取剪贴板
  useEffect(() => {
    async function loadClipboard() {
      const text = await Clipboard.readText();
      if (text) {
        setContent(text);
      }
    }
    loadClipboard();
  }, []);

  async function handleSubmit() {
    if (!content.trim()) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Content is empty",
      });
      return;
    }

    try {
      // 确保目录存在
      if (!fs.existsSync(CAPTURE_DIR)) {
        fs.mkdirSync(CAPTURE_DIR, { recursive: true });
      }

      // 今日文件
      const today = new Date().toISOString().split("T")[0];
      const filePath = path.join(CAPTURE_DIR, `${today}.json`);

      // 读取现有数据
      let captures: any[] = [];
      if (fs.existsSync(filePath)) {
        captures = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      }

      // 判断类型
      const isUrl = content.trim().startsWith("http");
      const type = isUrl ? "url" : "text";

      // 添加新条目
      captures.push({
        content: content.trim(),
        type,
        note: note.trim() || null,
        time: new Date().toTimeString().split(" ")[0],
      });

      // 写入文件
      fs.writeFileSync(filePath, JSON.stringify(captures, null, 2));

      await showToast({
        style: Toast.Style.Success,
        title: "Captured!",
        message: `${captures.length} items today`,
      });

      popToRoot();
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to save",
        message: String(error),
      });
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="content"
        title="Content"
        placeholder="Paste or type anything..."
        value={content}
        onChange={setContent}
      />
      <Form.TextField
        id="note"
        title="Note"
        placeholder="Optional note..."
        value={note}
        onChange={setNote}
      />
    </Form>
  );
}
```

### 安装扩展

```bash
cd ~/Developer/noca
npm install
npm run dev  # 开发模式，Raycast 会自动加载
```

---

## 2. 本地存储

### 数据格式

**~/noca/captures/2026-01-06.json**

```json
[
  {
    "content": "https://arxiv.org/abs/2401.12345",
    "type": "url",
    "note": "forecasting 相关",
    "time": "10:45:30"
  },
  {
    "content": "能不能做个 AI 整理书签的工具",
    "type": "text",
    "note": null,
    "time": "11:30:00"
  }
]
```

### 配置文件

**~/noca/config.json**

```json
{
  "notion": {
    "token": "secret_xxx",
    "page_id": "xxx-xxx-xxx"
  }
}
```

---

## 3. AI 整理

### prompt.md

**~/noca/prompt.md**

```markdown
你是一个帮我整理每日信息的助手。

## 输入
JSON 数组，每个 item 有：
- content: 内容
- type: url / text
- note: 可选备注
- time: 时间

## 输出
严格按以下 Markdown 格式，不要任何前言：

## {日期}

### 链接
- [标题](url) - 描述

### 想法
- 内容

### TODO
- [ ] 任务

## 规则
1. 有 note 时用 note 作为描述
2. 包含"要/需要/deadline"等词 → TODO
3. URL → 链接（尝试从 URL 推断标题）
4. 其他 → 想法
5. 空分类不输出
```

### 处理脚本

**创建 qc-process 命令**

```bash
# 添加到 ~/.zshrc 或 ~/.bashrc
alias qc-process='~/noca/process.sh'
```

**~/noca/process.sh**

```bash
#!/bin/bash
set -e

QC_DIR=~/quickcapture
TODAY=${1:-$(date +%Y-%m-%d)}
CAPTURE_FILE=$QC_DIR/captures/$TODAY.json
PROMPT_FILE=$QC_DIR/prompt.md
OUTPUT_FILE=$QC_DIR/processed/$TODAY.md
CONFIG_FILE=$QC_DIR/config.json

# 检查文件
if [ ! -f "$CAPTURE_FILE" ]; then
    echo "No captures for $TODAY"
    exit 0
fi

COUNT=$(jq length "$CAPTURE_FILE")
if [ "$COUNT" -eq 0 ]; then
    echo "No captures for $TODAY"
    exit 0
fi

echo "Processing $COUNT captures for $TODAY..."

# 创建输出目录
mkdir -p $QC_DIR/processed

# 调用 Claude Code
PROMPT=$(cat "$PROMPT_FILE")
cat "$CAPTURE_FILE" | claude -p "$PROMPT

日期: $TODAY

内容:
" > "$OUTPUT_FILE"

echo "Output: $OUTPUT_FILE"

# 推送到 Notion
echo "Pushing to Notion..."
python3 - << 'PYTHON' "$OUTPUT_FILE" "$CONFIG_FILE"
import sys
import json
from notion_client import Client

output_file = sys.argv[1]
config_file = sys.argv[2]

# 读取配置
with open(config_file) as f:
    config = json.load(f)

# 读取内容
with open(output_file) as f:
    content = f.read()

# 连接 Notion
notion = Client(auth=config["notion"]["token"])
page_id = config["notion"]["page_id"]

# 简单实现：把整个 markdown 作为一个 paragraph 追加
# （完整实现需要解析 markdown 转成 blocks）
notion.blocks.children.append(
    block_id=page_id,
    children=[
        {
            "object": "block",
            "type": "divider",
            "divider": {}
        },
        {
            "object": "block",
            "type": "paragraph",
            "paragraph": {
                "rich_text": [{"type": "text", "text": {"content": content[:2000]}}]
            }
        }
    ]
)
print("Done!")
PYTHON
```

```bash
chmod +x ~/noca/process.sh
```

---

## 4. 安装步骤

### Step 1: 创建目录

```bash
mkdir -p ~/noca/{captures,processed}
```

### Step 2: 配置文件

```bash
cat > ~/noca/config.json << 'EOF'
{
  "notion": {
    "token": "YOUR_NOTION_TOKEN",
    "page_id": "YOUR_PAGE_ID"
  }
}
EOF
```

### Step 3: Prompt 文件

```bash
cat > ~/noca/prompt.md << 'EOF'
你是一个帮我整理每日信息的助手。

## 输入
JSON 数组，每个 item 有 content, type, note, time

## 输出
Markdown 格式，不要前言：

## {日期}

### 链接
- [标题](url) - 描述

### 想法
- 内容

### TODO
- [ ] 任务

## 规则
1. 有 note 用 note 作描述
2. 含"要/需要/deadline" → TODO
3. URL → 链接
4. 其他 → 想法
5. 空分类不输出
EOF
```

### Step 4: 安装依赖

```bash
pip install notion-client --break-system-packages
```

### Step 5: 获取 Notion 配置

1. 创建 Integration: https://www.notion.so/my-integrations
2. 复制 token 到 config.json
3. 创建一个 inbox page，分享给 Integration
4. 复制 page ID 到 config.json

### Step 6: 安装 Raycast 扩展

```bash
cd ~/Developer
npx create-raycast-extension
# 复制上面的代码到 src/capture.tsx
npm install
npm run dev
```

### Step 7: 设置快捷键

Raycast → Extensions → Noca → 设置快捷键（如 ⌘+Shift+C）

---

## 使用

```bash
# 捕获
⌘ + Shift + C → 填写 → 回车

# 整理
qc-process          # 处理今天
qc-process 2026-01-05  # 处理指定日期
```

---

## 依赖

| 组件 | 依赖 |
|------|------|
| Raycast 扩展 | Node.js, @raycast/api |
| 数据处理 | jq, Claude Code |
| Notion 同步 | Python 3, notion-client |