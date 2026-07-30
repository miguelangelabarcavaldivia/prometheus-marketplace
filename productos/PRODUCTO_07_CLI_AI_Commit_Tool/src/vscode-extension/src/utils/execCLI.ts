import { spawn } from 'child_process';
import { join } from 'path';
import * as vscode from 'vscode';

let cliPath: string;

export function resolveCliPath(context: vscode.ExtensionContext): void {
  cliPath = join(context.extensionPath, 'bundled-cli', 'dist', 'cli.js');
}

export function execCLI(args: string[], cwd?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const workDir = cwd ?? vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
    if (!workDir) {
      reject(new Error('No workspace folder open'));
      return;
    }

    const proc = spawn('node', [cliPath, ...args], {
      cwd: workDir,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env },
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(stderr.trim() || `Process exited with code ${code}`));
      }
    });

    proc.on('error', (err) => {
      reject(new Error(`Failed to start CLI: ${err.message}`));
    });
  });
}
