# META - Documentation Index

Project documentation hub. Start here.

---

## Structure

```
META/
├── CLAUDE.md        ← You are here
├── PROGRESS.md      # Development log (append-only)
├── TODO.md          # Next iteration tasks (append-only)
├── CORE/            # What & How
├── ISSUE/           # Problem records
└── MILESTONES/      # Implementation phases
```

---

## Quick Links

### Core Documentation

| File | Description |
|------|-------------|
| [CORE/PRODUCT.md](CORE/PRODUCT.md) | Product definition: features, workflows, V1 scope |
| [CORE/REGULATION.md](CORE/REGULATION.md) | Development principles: atomic code, testing, documentation |
| [CORE/TECHNICAL.md](CORE/TECHNICAL.md) | Technical implementation: architecture, code, setup |

### Tracking

| File | Description |
|------|-------------|
| [PROGRESS.md](PROGRESS.md) | What we've done (append-only log) |
| [TODO.md](TODO.md) | What's next (append-only tasks) |

### Reference

| Folder | Description |
|--------|-------------|
| [ISSUE/](ISSUE/META.md) | Development issues, named `{Milestone}_{Summary}_{Date}` |
| [MILESTONES/](MILESTONES/META.md) | Implementation phases M1→M8 |

---

## Reading Order

1. **CORE/PRODUCT.md** - Understand what we're building
2. **CORE/REGULATION.md** - Understand how we work
3. **CORE/TECHNICAL.md** - Implementation details
4. **MILESTONES/** - Current development phase
5. **ISSUE/** - Known problems and decisions

---

## TODO-Driven Development

本项目采用 TODO 驱动开发模式：

1. **所有任务**在 [TODO.md](TODO.md) 中按顺序编号 (001-099)
2. **一个一个完成**，不跳过
3. **每完成一个**立即标记 `[x]`
4. **完成一个 Milestone 后** commit

### 当前状态

查看 [TODO.md](TODO.md) 的 Progress 部分获取：
- Total: 总任务数
- Completed: 已完成数
- Current: 当前正在执行的任务

---

## Development Workflow

### Before Coding

1. 查看 TODO.md 的 Current 任务
2. 阅读相关 CORE/ 文档理解上下文
3. 检查相关 ISSUE（如有）

### During Development

1. 按 TODO 顺序执行任务
2. 遵循 REGULATION.md 原则
3. 遇到设计决策问题 → 创建 ISSUE

### After Completing a Task

1. 在 TODO.md 中标记 `[x]`
2. 更新 Progress 中的 Completed 计数
3. 更新 Current 为下一个任务
4. Milestone 结束时更新 PROGRESS.md

### Creating Documentation

| Type | Location | Naming |
|------|----------|--------|
| Issue | ISSUE/ | `{Milestone}_{Summary}_{Date}.md` |
| Progress | PROGRESS.md | Append with date header |
| TODO | TODO.md | 按编号更新状态 |

### Git Conventions

See [.github/CONTRIBUTING.md](../.github/CONTRIBUTING.md) for full details on:
- Branching strategy
- Commit message format
- Pull request process
- Issue workflow
