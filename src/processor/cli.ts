#!/usr/bin/env node
import { Processor } from './processor.js';

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Parse arguments
  let date: string | undefined;
  let push = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--push' || arg === '-p') {
      push = true;
    } else if (arg === '--date' || arg === '-d') {
      date = args[++i];
    } else if (!arg.startsWith('-')) {
      date = arg;
    }
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
      console.log('\n📤 --push flag detected (Notion push will be implemented in M5)');
    }

    console.log('\n✅ Processing complete!');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
