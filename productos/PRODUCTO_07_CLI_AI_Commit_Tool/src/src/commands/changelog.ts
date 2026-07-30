import { loadConfig } from '../config.js';
import { getRecentCommits } from '../git.js';
import { generateWithAI } from '../ai.js';

interface ChangelogOptions {
  count?: string;
}

export async function changelogCommand(options: ChangelogOptions): Promise<void> {
  const config = loadConfig();
  const count = parseInt(options.count || '20', 10);

  const log = getRecentCommits(count);
  if (!log) {
    throw new Error('No commits found in this repository.');
  }

  const systemPrompt = 'You are generating a changelog from git commit messages.';

  const prompt = `Generate a well-structured changelog from the following commit messages.\n\nRules:\n- Group changes by type: Features, Bug Fixes, Performance, Refactoring, Documentation, etc.\n- Use clear, user-friendly language\n- Include relevant commit hashes\n- Omit trivial commits\n- Output in markdown format\n\nCommits:\n${log}`;

  const result = await generateWithAI(config, prompt, systemPrompt);
  console.log('\n' + result + '\n');
}
