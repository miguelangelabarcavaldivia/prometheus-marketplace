import * as vscode from 'vscode';
import {
  generateCommit,
  reviewCode,
  suggestChanges,
  generateChangelog,
} from './commands';
import { resolveCliPath } from './utils/execCLI';

export function activate(context: vscode.ExtensionContext): void {
  resolveCliPath(context);

  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBar.text = '$(git-commit) AI Commit';
  statusBar.tooltip = 'AI Commit - Click to generate commit message';
  statusBar.command = 'aicommit.generateCommit';
  statusBar.show();
  context.subscriptions.push(statusBar);

  const disposables = [
    vscode.commands.registerCommand('aicommit.generateCommit', generateCommit),
    vscode.commands.registerCommand('aicommit.reviewCode', reviewCode),
    vscode.commands.registerCommand('aicommit.suggestChanges', suggestChanges),
    vscode.commands.registerCommand(
      'aicommit.generateChangelog',
      generateChangelog
    ),
  ];

  for (const disposable of disposables) {
    context.subscriptions.push(disposable);
  }
}

export function deactivate(): void {}
