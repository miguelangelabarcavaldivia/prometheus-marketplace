import * as vscode from 'vscode';
import { execCLI } from '../utils/execCLI';

export async function reviewCode(): Promise<void> {
  const channel = vscode.window.createOutputChannel('AI Commit - Review');
  channel.show(true);

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'AI Commit: Reviewing latest commit...',
      cancellable: false,
    },
    async () => {
      try {
        const result = await execCLI(['review']);
        channel.appendLine(result);
        vscode.window.showInformationMessage('Code review complete');
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        channel.appendLine(`Error: ${msg}`);
        vscode.window.showErrorMessage(`AI Commit review failed: ${msg}`);
      }
    }
  );
}
