import * as vscode from 'vscode';
import { execCLI } from '../utils/execCLI';

export async function generateCommit(): Promise<void> {
  const channel = vscode.window.createOutputChannel('AI Commit');
  channel.show(true);

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'AI Commit: Generating commit message...',
      cancellable: false,
    },
    async () => {
      try {
        const result = await execCLI(['generate', '--conventional']);
        channel.appendLine(result);

        const repoApi = vscode.extensions.getExtension('vscode.git')?.exports
          ?.getAPI(1);
        if (repoApi) {
          const repo = repoApi.repositories[0];
          if (repo) {
            repo.inputBox.value = result;
            vscode.window.showInformationMessage(
              'Commit message inserted into SCM input'
            );
            return;
          }
        }
        vscode.window.showInformationMessage(
            `Commit message:\n${result}`
        );
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        channel.appendLine(`Error: ${msg}`);
        vscode.window.showErrorMessage(`AI Commit failed: ${msg}`);
      }
    }
  );
}
