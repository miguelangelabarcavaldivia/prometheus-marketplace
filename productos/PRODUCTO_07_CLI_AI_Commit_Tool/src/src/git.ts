import { execSync } from 'child_process';

function exec(command: string): string {
  try {
    return execSync(command, { encoding: 'utf-8' }).trim();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Git command failed: ${command}\n${message}`);
  }
}

export function isGitRepo(): boolean {
  try {
    execSync('git rev-parse --git-dir', { encoding: 'utf-8', stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function getCommitCount(): number {
  try {
    const result = exec('git rev-list --count HEAD 2>nul');
    return parseInt(result, 10);
  } catch {
    return 0;
  }
}

export function getStagedDiff(): string {
  if (!isGitRepo()) {
    throw new Error('Not a git repository');
  }
  return exec('git diff --staged');
}

export function getLatestCommitDiff(): string {
  if (!isGitRepo()) {
    throw new Error('Not a git repository');
  }
  const count = getCommitCount();
  if (count === 0) {
    throw new Error('No commits found in this repository');
  }
  if (count === 1) {
    return exec('git diff --root HEAD');
  }
  return exec('git diff HEAD~1 HEAD');
}

export function getLatestCommitMessage(): string {
  if (!isGitRepo()) {
    throw new Error('Not a git repository');
  }
  return exec('git log -1 --format="%s"');
}

export function getUnstagedDiff(): string {
  if (!isGitRepo()) {
    throw new Error('Not a git repository');
  }
  return exec('git diff');
}

export function getRecentCommits(count = 20): string {
  if (!isGitRepo()) {
    throw new Error('Not a git repository');
  }
  return exec(`git log --oneline -${count} --format="%h %s"`);
}
