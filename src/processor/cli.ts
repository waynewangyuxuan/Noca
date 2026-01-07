#!/usr/bin/env node
import { Processor } from './processor.js';
import { NotionClient } from '../notion/client.js';

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Parse arguments
  let date: string | undefined;
  let push = false;
  let help = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--push' || arg === '-p') {
      push = true;
    } else if (arg === '--date' || arg === '-d') {
      date = args[++i];
    } else if (arg === '--help' || arg === '-h') {
      help = true;
    } else if (!arg.startsWith('-')) {
      date = arg;
    }
  }

  if (help) {
    console.log(`
Noca Processor - AI-powered capture organization

Usage: qc-process [options] [date]

Options:
  -d, --date <date>  Process captures for a specific date (YYYY-MM-DD)
  -p, --push         Push processed content to Notion
  -h, --help         Show this help message

Examples:
  qc-process                     Process today's captures
  qc-process 2024-01-15          Process captures for Jan 15, 2024
  qc-process --push              Process and push to Notion
  qc-process -d 2024-01-15 -p    Process specific date and push
`);
    return;
  }

  const processor = new Processor();

  try {
    console.log('🚀 Noca Processor starting...');
    const result = await processor.process(date);

    if (result.startsWith('No captures')) {
      console.log(result);
      return;
    }

    console.log('\n📝 Generated output:\n');
    console.log('─'.repeat(50));
    console.log(result);
    console.log('─'.repeat(50));

    if (push) {
      console.log('\n📤 Pushing to Notion...');

      const notion = new NotionClient();

      if (!notion.isConfigured()) {
        console.error('❌ Notion not configured. Please set up ~/noca/config.json');
        console.log('\nTo configure Notion:');
        console.log('1. Create an integration at https://www.notion.so/my-integrations');
        console.log('2. Copy the integration token');
        console.log('3. Create a page in Notion and share it with your integration');
        console.log('4. Create ~/noca/config.json with:');
        console.log('   {');
        console.log('     "notion": {');
        console.log('       "token": "secret_your_token",');
        console.log('       "pageId": "your_page_id"');
        console.log('     }');
        console.log('   }');
        process.exit(1);
      }

      const connected = await notion.connect();
      if (!connected) {
        console.error('❌ Failed to connect to Notion');
        process.exit(1);
      }

      const pushed = await notion.appendContent(result);
      if (pushed) {
        console.log('✅ Successfully pushed to Notion!');
      } else {
        console.error('❌ Failed to push to Notion');
        process.exit(1);
      }
    }

    console.log('\n✅ Processing complete!');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
