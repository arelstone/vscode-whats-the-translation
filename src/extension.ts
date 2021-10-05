import * as vscode from 'vscode';
import { CodelensProvider } from './CodeLensProvider';
import * as C from './constants';

let disposables: vscode.Disposable[] = [];

// TODO: Add check if config.file-path has been provided
export async function activate(context: vscode.ExtensionContext) {		
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

	vscode.commands.registerCommand(`${C.id}.enable`, () => {
		vscode.workspace.getConfiguration(C.id).update('enable', true, true);
		vscode.window.showInformationMessage(`${C.name} is enabled`);
	});

	vscode.commands.registerCommand(`${C.id}.disable`, () => {
		vscode.workspace.getConfiguration(C.id).update('enable', false, true);
	});

	vscode.commands.registerCommand(`${C.id}.codelensAction`, (args: any) => {
        vscode.window.showInformationMessage(`CodeLens action clicked with args=${args}`);
    });
}

export function deactivate() {
	if (disposables) {
		disposables.forEach(item => item.dispose());
	}

	disposables = [];
}
