#!/usr/bin/env node
import { Command } from 'commander';
import { generateCommand } from './commands/generate.js';
import { reviewCommand } from './commands/review.js';
import { suggestCommand } from './commands/suggest.js';
import { changelogCommand } from './commands/changelog.js';
import { initCommand } from './commands/init.js';

const program = new Command();

program
  .name('aicommit')
  .description('AI-powered commit message generator and code review tool')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate a commit message from staged changes')
  .option('--conventional', 'Use conventional commits format')
  .option('--no-conventional', 'Disable conventional commits')
  .option('--emoji', 'Include emoji in commit message')
  .action(async (options) => {
    try {
      await generateCommand(options);
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('review')
  .description('Review the latest commit')
  .action(async () => {
    try {
      await reviewCommand();
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('suggest')
  .description('Suggest improvements for unstaged changes')
  .action(async () => {
    try {
      await suggestCommand();
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('changelog')
  .description('Generate a changelog from recent commits')
  .option('-c, --count <number>', 'Number of commits to include', '20')
  .action(async (options) => {
    try {
      await changelogCommand(options);
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Create a .aicommitrc configuration file')
  .action(async () => {
    try {
      await initCommand();
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  });

program.parse();
