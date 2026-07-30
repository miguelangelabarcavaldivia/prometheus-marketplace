import { existsSync } from 'fs';
import { join } from 'path';
import { getDefaultConfig, saveConfig } from '../config.js';

export async function initCommand(): Promise<void> {
  const configPath = join(process.cwd(), '.aicommitrc');

  if (existsSync(configPath)) {
    console.error('.aicommitrc already exists in the current directory.');
    process.exit(1);
  }

  const config = getDefaultConfig();
  saveConfig(config);

  console.log(`Created .aicommitrc at ${configPath}`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. Open .aicommitrc and set your API key');
  console.log('  2. Optionally change the provider and model');
  console.log('  3. Stage your changes with git add');
  console.log('  4. Run: npx aicommit generate');
}
