import { loadConfig } from '../config.js';
import { getLatestCommitDiff, getLatestCommitMessage } from '../git.js';
import { generateWithAI } from '../ai.js';

export async function reviewCommand(): Promise<void> {
  const config = loadConfig();

  const diff = getLatestCommitDiff();
  const commitMessage = getLatestCommitMessage();

  const systemPrompt = 'You are an expert code reviewer. Provide thorough, constructive, and actionable feedback.';

  const prompt = `Review the following code diff from the latest commit.\n\nCommit message: ${commitMessage}\n\nAnalyze the diff and provide:\n1. Summary of the change\n2. Potential bugs or issues\n3. Code quality concerns\n4. Security considerations\n5. Specific improvement suggestions\n\nBe constructive and specific.\n\nDiff:\n${diff}`;

  const result = await generateWithAI(config, prompt, systemPrompt);
  console.log('\n' + result + '\n');
}
