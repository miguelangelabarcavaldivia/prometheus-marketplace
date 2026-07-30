import { loadConfig } from '../config.js';
import { getStagedDiff } from '../git.js';
import { generateWithAI } from '../ai.js';

interface GenerateOptions {
  conventional?: boolean;
  emoji?: boolean;
}

export async function generateCommand(options: GenerateOptions): Promise<void> {
  const config = loadConfig();

  const diff = getStagedDiff();
  if (!diff) {
    console.error('No staged changes found. Run git add to stage changes first.');
    process.exit(1);
  }

  const useConventional = options.conventional ?? config.conventionalCommits;
  const useEmoji = options.emoji ?? config.emoji;

  const systemPrompt = 'You are an expert at writing git commit messages. Follow the rules precisely.';

  let prompt = 'Generate a concise, descriptive commit message for the following diff.\n\n';
  if (useConventional) {
    prompt += 'Use conventional commits format: type(scope): description\n';
    prompt += 'Valid types: feat, fix, chore, docs, style, refactor, perf, test, ci, build, revert\n';
  }
  prompt += 'Keep the subject line under 72 characters.\n';
  prompt += 'Use imperative mood (e.g., "Add feature" not "Added feature").\n';
  prompt += 'Output ONLY the commit message without any explanation or markdown.\n';

  if (useEmoji) {
    prompt += 'Prefix the commit message with an appropriate emoji followed by a space.\n';
  }

  const maxLen = config.maxDiffLength;
  const truncatedDiff = diff.length > maxLen
    ? diff.slice(0, maxLen) + '\n... (diff truncated)'
    : diff;

  prompt += `\nDiff:\n${truncatedDiff}`;

  const result = await generateWithAI(config, prompt, systemPrompt);
  console.log('\n' + result + '\n');
}
