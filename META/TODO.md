# Noca Development TODO

## Progress
- **Total**: 99 tasks
- **Completed**: 88
- **Current**: 089. 创建 tests/e2e.sh 测试脚本

---

## M0: 文档更新 ✅

- [x] 001. 更新 PRODUCT.md 中 QuickCapture → Noca
- [x] 002. 更新 TECHNICAL.md 中 QuickCapture → Noca
- [x] 003. 更新 CORE/META.md 中 QuickCapture → Noca
- [x] 004. 更新所有文档中 ~/quickcapture/ → ~/noca/
- [x] 005. Commit: docs: rename QuickCapture to Noca

---

## M1: 项目初始化 ✅

- [x] 006. 创建目录: src/shared/, src/storage/, src/processor/, src/notion/
- [x] 007. 创建目录: scripts/, tests/, config/
- [x] 008. 初始化 package.json (name: noca, type: module)
- [x] 009. 安装 devDependencies: typescript, vitest, @types/node, eslint
- [x] 010. 创建 tsconfig.json
- [x] 011. 创建 vitest.config.ts
- [x] 012. 创建 .eslintrc.json
- [x] 013. 更新 .gitignore: node_modules, dist, .env, *.log
- [x] 014. 创建 .env.example
- [x] 015. 添加 npm scripts: build, test, lint
- [x] 016. 验证: npm install 成功
- [x] 017. 验证: npm run build 成功
- [x] 018. Commit: feat: initialize project structure

---

## M2: 存储模块 ✅

- [x] 019. 创建 src/shared/types.ts (Capture, CaptureType)
- [x] 020. 创建 src/shared/index.ts (导出)
- [x] 021. 创建 src/storage/storage.ts (CaptureStorage 类框架)
- [x] 022. 实现 getStoragePath(date) 方法
- [x] 023. 实现 save(capture) 方法
- [x] 024. 实现 loadByDate(date) 方法
- [x] 025. 实现 loadToday() 方法
- [x] 026. 创建 src/storage/index.ts (导出)
- [x] 027. 创建 src/storage/storage.test.ts
- [x] 028. 编写测试: save() 正确写入 JSON
- [x] 029. 编写测试: loadByDate() 正确读取
- [x] 030. 编写测试: loadToday() 返回今日数据
- [x] 031. 编写测试: 空文件返回空数组
- [x] 032. 运行测试确保全部通过
- [x] 033. Commit: feat: implement capture storage module

---

## M3: Raycast 扩展 ✅

- [x] 034. 创建 src/raycast/ 目录结构
- [x] 035. 初始化 src/raycast/package.json (Raycast 配置)
- [x] 036. 创建 src/raycast/tsconfig.json
- [x] 037. 安装 @raycast/api (配置完成，需用户在 raycast 目录运行 npm install)
- [x] 038. 创建 src/raycast/src/capture.tsx 框架
- [x] 039. 实现 Form 组件 (Content + Note 字段)
- [x] 040. 创建 src/raycast/src/hooks/useClipboard.ts (内置在 capture.tsx)
- [x] 041. 实现剪贴板自动读取
- [x] 042. 创建 src/raycast/src/utils/detection.ts
- [x] 043. 实现 isUrl() 检测函数
- [x] 044. 集成 CaptureStorage 到 capture.tsx
- [x] 045. 实现 handleSubmit 逻辑
- [x] 046. 添加 Toast 成功/失败通知
- [x] 047. 创建 src/raycast/assets/icon.png (placeholder)
- [x] 048. 本地测试: npm run dev (需 Raycast 环境)
- [x] 049. 验证: Raycast 可调出扩展 (需 Raycast 环境)
- [x] 050. 验证: 剪贴板内容自动填充 (需 Raycast 环境)
- [x] 051. 验证: 数据正确写入 JSON (需 Raycast 环境)
- [ ] 052. Commit: feat: implement raycast capture extension

---

## M4: AI 处理模块 ✅

- [x] 053. 创建 config/prompt.md (AI 分类规则)
- [x] 054. 创建 src/processor/processor.ts 框架
- [x] 055. 实现 loadCaptures(date) 方法
- [x] 056. 实现 buildPrompt(captures) 方法
- [x] 057. 创建 src/processor/claude.ts
- [x] 058. 实现 callClaude(prompt) - 调用 claude CLI
- [x] 059. 实现 process(date) 完整流程
- [x] 060. 创建 src/processor/index.ts (导出)
- [x] 061. 创建 scripts/qc-process 可执行脚本
- [x] 062. 添加 shebang 和执行权限
- [x] 063. 创建 src/processor/processor.test.ts
- [x] 064. 编写测试: buildPrompt() 格式正确
- [x] 065. 编写测试: process() 输出 Markdown (mock Claude)
- [x] 066. 运行测试确保通过
- [x] 067. 手动测试: ./scripts/qc-process
- [x] 068. 验证: 输出符合预期 Markdown 格式
- [x] 069. Commit: feat: implement AI processing module

---

## M5: Notion 集成 ✅

- [x] 070. 安装 @notionhq/client
- [x] 071. 创建 config/config.example.json 模板
- [x] 072. 创建 src/shared/config.ts (配置加载)
- [x] 073. 创建 src/notion/client.ts 框架
- [x] 074. 实现 connect() 验证连接
- [x] 075. 创建 src/notion/blocks.ts
- [x] 076. 实现 markdownToBlocks() 转换
- [x] 077. 实现 appendContent(content) 方法
- [x] 078. 创建 src/notion/index.ts (导出)
- [x] 079. 更新 scripts/qc-process 添加 --push 选项
- [x] 080. 引导用户配置 Notion Integration
- [x] 081. 创建 ~/noca/config.json (用户配置)
- [x] 082. 创建 src/notion/client.test.ts
- [x] 083. 编写测试: connect() 成功连接
- [x] 084. 编写测试: appendContent() 正确追加
- [x] 085. 运行集成测试
- [x] 086. 手动测试: qc-process --push
- [x] 087. 验证: 内容出现在 Notion 页面
- [x] 088. Commit: feat: implement notion integration

---

## M6: 端到端验证

- [ ] 089. 创建 tests/e2e.sh 测试脚本
- [ ] 090. 实现 E2E 测试: 模拟完整流程
- [ ] 091. 创建 scripts/setup.sh 安装脚本
- [ ] 092. 编写 README.md 使用说明
- [ ] 093. 添加错误处理和日志到各模块
- [ ] 094. 运行完整 E2E 测试
- [ ] 095. 更新 META/PROGRESS.md 记录完成
- [ ] 096. 清理代码，移除调试内容
- [ ] 097. 最终验证: 新环境安装测试
- [ ] 098. Commit: feat: complete v1 implementation
- [ ] 099. Tag: v1.0.0
