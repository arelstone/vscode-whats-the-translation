import * as vscode from 'vscode';
import { CodelensProvider } from './CodeLensProvider';

let disposables: vscode.Disposable[] = [];

export function activate(context: vscode.ExtensionContext) {	
	const codelensProvider = new CodelensProvider();

	vscode.languages.registerCodeLensProvider(
		[
			{ language: 'javascript' },
			{ language: 'javascriptreact' },
			{ language: 'typescript' },
			{ language: 'typescriptreact' },
		],
		codelensProvider
	);

	vscode.commands.registerCommand('whats-the-text.enable', () => {
		vscode.workspace.getConfiguration('whats-the-text').update('enable', true, true);
	});

	vscode.commands.registerCommand('whats-the-text.disable', () => {
		vscode.workspace.getConfiguration('whats-the-text').update('enable', false, true);
	});

	vscode.commands.registerCommand('whats-the-text.codelensAction', (args: any) => {
		vscode.window.showInformationMessage(`CodeLense action clicked with args=${args}`);
	});
}

export function deactivate() {
	if (disposables) {
		disposables.forEach(item => item.dispose());
	}

	disposables = [];
}
