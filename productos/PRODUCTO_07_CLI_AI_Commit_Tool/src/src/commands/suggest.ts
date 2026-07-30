import { loadConfig } from '../config.js';
import { getUnstagedDiff } from '../git.js';
import { generateWithAI } from '../ai.js';

export async function suggestCommand(): Promise<void> {
  const config = loadConfig();

  const diff = getUnstagedDiff();
  if (!diff) {
    console.log('No unstaged changes found.');
    return;
  }

  const systemPrompt = 'You are an expert software developer providing code improvement suggestions.';

  const prompt = `Analyze the following unstaged code changes and suggest specific improvements.\n\nFocus on:\n1. Code quality and readability\n2. Potential bugs and edge cases\n3. Performance optimization opportunities\n4. Best practices and design patterns\n5. Specific code examples for improvements\n\nBe constructive and prioritize the most impactful suggestions.\n\nChanges:\n${diff}`;

  const result = await generateWithAI(config, prompt, systemPrompt);
  console.log('\n' + result + '\n');
}
