import * as vscode from 'vscode';
import { execCLI } from '../utils/execCLI';

export async function suggestChanges(): Promise<void> {
  const channel = vscode.window.createOutputChannel('AI Commit - Suggestions');
  channel.show(true);

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'AI Commit: Analyzing changes...',
      cancellable: false,
    },
    async () => {
      try {
        const result = await execCLI(['suggest']);
        channel.appendLine(result);
        vscode.window.showInformationMessage('Suggestions ready');
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        channel.appendLine(`Error: ${msg}`);
        vscode.window.showErrorMessage(`AI Commit suggest failed: ${msg}`);
      }
    }
  );
}
