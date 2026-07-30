import * as vscode from 'vscode';
import { execCLI } from '../utils/execCLI';

export async function generateChangelog(): Promise<void> {
  const count = await vscode.window.showInputBox({
    prompt: 'Number of commits to include in changelog',
    value: '20',
    validateInput: (v) => {
      const n = parseInt(v, 10);
      return isNaN(n) || n < 1 ? 'Enter a positive number' : null;
    },
  });

  if (!count) return;

  const channel = vscode.window.createOutputChannel('AI Commit - Changelog');
  channel.show(true);

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'AI Commit: Generating changelog...',
      cancellable: false,
    },
    async () => {
      try {
        const result = await execCLI(['changelog', '--count', count]);
        channel.appendLine(result);
        vscode.window.showInformationMessage('Changelog generated');
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        channel.appendLine(`Error: ${msg}`);
        vscode.window.showErrorMessage(`AI Commit changelog failed: ${msg}`);
      }
    }
  );
}
