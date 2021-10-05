import * as vscode from 'vscode';
import * as C from './constants';

/**
 * CodelensProvider
 */
export class CodelensProvider implements vscode.CodeLensProvider {

    private codeLenses: vscode.CodeLens[] = [];
    private regex: RegExp = /I18n\.t\('(\w*)'/gmi;
    private readonly fileGlob = vscode.workspace.getConfiguration(C.id).get('file-glob') || null;
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;
    private translations: Record<string, string> = {};

    constructor() {
        vscode.workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire();
        });
        
        if (!this.fileGlob) {
            vscode.window.showErrorMessage(`${C.name} - file-glob is not defined. Please add it to settings.json-file`);
        } 
    }

    // @TODO: Not sure if using require is the best approach
    private fileContent = async () => {
        return vscode.workspace.findFiles(this.fileGlob as string, '**/node_modules/**', 1).then(file => require(file[0].path));
    };

    public async provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.CodeLens[]> {
        if (vscode.workspace.getConfiguration(C.id).get("enable", true)) {
            this.codeLenses = [];
            const regex = new RegExp(this.regex);
            const text = document.getText();

            let matches;
            while ((matches = regex.exec(text)) !== null) {
                const line = document.lineAt(document.positionAt(matches.index).line);
                const indexOf = line.text.indexOf(matches[0]);
                const position = new vscode.Position(line.lineNumber, indexOf);
                const range = document.getWordRangeAtPosition(position, new RegExp(this.regex));   
                if (range) {
                    this.codeLenses.push(new vscode.CodeLens(range));

                    if (!this.translations[range.start.line]) {
                        this.translations = {
                            ...this.translations,
                            [range.start.line]: (await this.fileContent())[matches[1]]
                        };
                    }
                    
                }
            }
            return this.codeLenses;
        }
        return [];
    }

    public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {        
        if (vscode.workspace.getConfiguration(C.id).get("enable", true)) {
            codeLens.command = {
                title: this.translations[codeLens.range.start.line],
                command: `${C.id}.codelensAction`
            };

            return codeLens;
        }
        return null;
    }
}