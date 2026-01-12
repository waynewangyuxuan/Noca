# Noca

**Zero-friction capture, AI-powered organization, direct to Notion.**

Noca is a productivity tool that lets you quickly capture thoughts, links, and tasks throughout your day, then uses AI to intelligently organize them and push to Notion.

## Features

- **Quick Capture**: Raycast extension for instant capture with clipboard auto-fill
- **Smart Detection**: Automatically detects URLs vs plain text
- **AI Processing**: Uses Claude to categorize and organize your daily captures
- **Notion Integration**: Push organized content directly to your Notion inbox
- **Local Storage**: All captures stored locally in JSON files

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Raycast   │────▶│   Storage   │────▶│  Processor  │
│  Extension  │     │  (JSON)     │     │  (Claude)   │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │   Notion    │
                                        │    API      │
                                        └─────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+
- [Raycast](https://raycast.com/) (for capture extension)
- [Claude CLI](https://docs.anthropic.com/claude/claude-cli) (for AI processing)
- Notion account (for pushing to Notion)

### Installation

```bash
# Clone the repository
git clone https://github.com/waynewangyuxuan/Noca.git
cd Noca

# Run setup script
./scripts/setup.sh
```

Or manually:

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Create noca directory
mkdir -p ~/noca/captures ~/noca/processed
```

### Raycast Extension Setup

1. Open Raycast
2. Go to Extensions → Add Extension → Import Extension
3. Select the directory: `<project>/src/raycast`
4. Run `npm install` in the raycast directory
5. Search for "Noca Capture" in Raycast

### Notion Configuration

1. Create an Integration at https://www.notion.so/my-integrations
2. Copy the "Internal Integration Token"
3. Create a page in Notion for your daily captures
4. Share the page with your integration (... → Add connections)
5. Copy the page ID from the URL
6. Create `~/noca/config.json`:

```json
{
  "notion": {
    "token": "secret_your_token",
    "pageId": "your_page_id"
  }
}
```

## Usage

### Capture (via Raycast)

1. Open Raycast and search "Noca Capture"
2. Content from clipboard is auto-filled
3. Optionally add a note
4. Press Enter to save

Captures are stored in `~/noca/captures/{YYYY-MM-DD}.json`

### Process

```bash
# Process today's captures
./scripts/qc-process

# Process a specific date
./scripts/qc-process 2024-01-15

# Process and push to Notion
./scripts/qc-process --push

# Show help
./scripts/qc-process --help
```

### Automatic Daily Processing

Noca includes a scheduler that automatically processes yesterday's captures at 8:00 AM daily.

```bash
# Install scheduler
./scripts/install-scheduler.sh

# Check status
launchctl list | grep noca

# View logs
cat ~/noca/logs/$(date +%Y-%m-%d).log
```

**Schedule logic:** A "day" is defined as 8:00 AM to 8:00 AM next day. So at 8:00 AM on Jan 12, captures from Jan 11 (8 AM Jan 11 - 8 AM Jan 12) are processed.

### Output Format

AI organizes captures into three categories:

```markdown
# 2024-01-15 Daily Captures

## TODO
- [ ] Complete project documentation

## 链接 (Links)
- [GitHub](https://github.com) - Code repository

## 想法 (Ideas)
- AI is transforming software development
```

## Project Structure

```
Noca/
├── src/
│   ├── shared/          # Shared types and utilities
│   ├── storage/         # Local JSON storage
│   ├── processor/       # AI processing with Claude
│   ├── notion/          # Notion API integration
│   └── raycast/         # Raycast extension
├── scripts/
│   ├── qc-process       # CLI for processing
│   └── setup.sh         # Installation script
├── config/
│   ├── prompt.md        # AI prompt template
│   └── config.example.json
├── tests/
│   └── e2e.sh           # End-to-end tests
└── META/                # Project documentation
```

## Development

```bash
# Build
npm run build

# Run tests
npm run test

# Watch mode
npm run test:watch

# Lint
npm run lint

# E2E tests
./tests/e2e.sh
```

## Data Storage

- **Captures**: `~/noca/captures/{YYYY-MM-DD}.json`
- **Processed**: `~/noca/processed/{YYYY-MM-DD}.md`
- **Config**: `~/noca/config.json`

### Capture Format

```typescript
interface Capture {
  content: string;      // The captured content
  type: 'url' | 'text'; // Auto-detected type
  note: string | null;  // Optional note
  time: string;         // HH:mm:ss timestamp
}
```

## AI Processing Rules

The AI categorizes captures based on:

1. **TODO**: Contains keywords like "要", "需要", "deadline", "任务"
2. **Links**: Type is `url`
3. **Ideas**: Everything else

Notes are used as descriptions when available.

## License

MIT

## Contributing

See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for guidelines.
