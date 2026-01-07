#!/bin/bash

# Noca E2E Test Script
# Tests the complete flow: capture → process → (optionally) push to Notion

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test directory
TEST_DIR=$(mktemp -d)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "📁 Test directory: $TEST_DIR"
echo "📂 Project directory: $PROJECT_DIR"

# Cleanup on exit
cleanup() {
  echo -e "\n🧹 Cleaning up test directory..."
  rm -rf "$TEST_DIR"
}
trap cleanup EXIT

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

pass() {
  echo -e "${GREEN}✓ $1${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
}

fail() {
  echo -e "${RED}✗ $1${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
}

# Test 1: Build project
echo -e "\n${YELLOW}=== Test 1: Build Project ===${NC}"
cd "$PROJECT_DIR"
if npm run build > /dev/null 2>&1; then
  pass "Project builds successfully"
else
  fail "Project build failed"
  exit 1
fi

# Test 2: Run unit tests
echo -e "\n${YELLOW}=== Test 2: Run Unit Tests ===${NC}"
if npm run test > /dev/null 2>&1; then
  pass "All unit tests pass"
else
  fail "Unit tests failed"
fi

# Test 3: Test storage module
echo -e "\n${YELLOW}=== Test 3: Test Storage Module ===${NC}"
TEST_DATE="2024-01-15"
CAPTURES_DIR="$TEST_DIR/captures"
mkdir -p "$CAPTURES_DIR"

# Create test captures
cat > "$CAPTURES_DIR/$TEST_DATE.json" << 'JSONEOF'
[
  {
    "content": "https://github.com/anthropics/claude-code",
    "type": "url",
    "note": "Claude Code repository",
    "time": "10:30:00"
  },
  {
    "content": "需要完成项目文档",
    "type": "text",
    "note": "重要任务",
    "time": "11:00:00"
  },
  {
    "content": "AI正在改变软件开发方式",
    "type": "text",
    "note": null,
    "time": "14:30:00"
  }
]
JSONEOF

if [ -f "$CAPTURES_DIR/$TEST_DATE.json" ]; then
  pass "Test captures created successfully"
else
  fail "Failed to create test captures"
fi

# Test 4: Test processor (without Claude - just buildPrompt)
echo -e "\n${YELLOW}=== Test 4: Test Processor Module ===${NC}"

# Create a simple Node.js test script
cat > "$TEST_DIR/test-processor.mjs" << NODEEOF
import { Processor } from '$PROJECT_DIR/dist/processor/processor.js';

const testDir = process.argv[2];
const processor = new Processor(testDir);

// Test loadCaptures
const captures = processor.loadCaptures('2024-01-15');
if (captures.length !== 3) {
  console.error('Expected 3 captures, got', captures.length);
  process.exit(1);
}

// Test buildPrompt
const prompt = processor.buildPrompt(captures, '2024-01-15');
if (!prompt.includes('2024-01-15') || !prompt.includes('github.com')) {
  console.error('Prompt does not contain expected content');
  process.exit(1);
}

console.log('Processor tests passed');
NODEEOF

cd "$PROJECT_DIR"
if node "$TEST_DIR/test-processor.mjs" "$TEST_DIR" 2>/dev/null; then
  pass "Processor module works correctly"
else
  fail "Processor module test failed"
fi

# Test 5: Test Notion blocks conversion
echo -e "\n${YELLOW}=== Test 5: Test Notion Blocks Conversion ===${NC}"

# Write test file using echo to avoid heredoc escaping issues
echo "import { markdownToBlocks } from '$PROJECT_DIR/dist/notion/blocks.js';" > "$TEST_DIR/test-blocks.mjs"
cat >> "$TEST_DIR/test-blocks.mjs" << 'BLOCKEOF'

const markdown = "# Daily Captures\n\n## TODO\n- [ ] Complete documentation\n- [x] Review code\n\n## Links\n- A link here\n\n## Ideas\nAI is changing software development.\n";

const blocks = markdownToBlocks(markdown);

if (blocks.length < 5) {
  console.error('Expected at least 5 blocks, got', blocks.length);
  process.exit(1);
}

const types = blocks.map(b => b.type);
const hasHeading = types.includes('heading_1');
const hasTodo = types.includes('to_do');
const hasBullet = types.includes('bulleted_list_item');

if (!hasHeading || !hasTodo || !hasBullet) {
  console.error('Missing expected block types');
  console.error('Types found:', types);
  process.exit(1);
}

console.log('Blocks conversion tests passed');
BLOCKEOF

if node "$TEST_DIR/test-blocks.mjs" 2>/dev/null; then
  pass "Notion blocks conversion works correctly"
else
  fail "Notion blocks conversion test failed"
fi

# Test 6: Test CLI help
echo -e "\n${YELLOW}=== Test 6: Test CLI Help ===${NC}"
if node "$PROJECT_DIR/dist/processor/cli.js" --help 2>&1 | grep -q "Noca Processor"; then
  pass "CLI help displays correctly"
else
  fail "CLI help test failed"
fi

# Test 7: Test config module
echo -e "\n${YELLOW}=== Test 7: Test Config Module ===${NC}"

cat > "$TEST_DIR/test-config.mjs" << NODEEOF
import { loadConfig, isNotionConfigured } from '$PROJECT_DIR/dist/shared/config.js';

// Should return default config when no config file exists
const config = loadConfig();
if (!config.notion || !config.storage) {
  console.error('Config structure is invalid');
  process.exit(1);
}

// Should report Notion as not configured
if (isNotionConfigured()) {
  console.error('Expected Notion to be not configured');
  process.exit(1);
}

console.log('Config module tests passed');
NODEEOF

if node "$TEST_DIR/test-config.mjs" 2>/dev/null; then
  pass "Config module works correctly"
else
  fail "Config module test failed"
fi

# Summary
echo -e "\n${YELLOW}=== Test Summary ===${NC}"
echo -e "Tests passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "\n${GREEN}🎉 All E2E tests passed!${NC}"
  exit 0
else
  echo -e "\n${RED}❌ Some tests failed${NC}"
  exit 1
fi
