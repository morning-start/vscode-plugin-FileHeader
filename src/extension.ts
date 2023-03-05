// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "file-header" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const getConfig = (symbol: string) => {
    let header = vscode.workspace.getConfiguration("file-header");
    let author = `${symbol}@Author: ${header.get("author")}\n`;
    let email = `${symbol}@Email: ${header.get("email")}\n`;
    let date = `${symbol}@Date: ${new Date().toLocaleString()}\n`;
    let lastEditors = `${symbol}@LastEditors: ${header.get("author")}\n`;
    let lastEditTime = `${symbol}@LastEditTime: ${new Date().toLocaleString()}\n`;
    let description = `${symbol}Description: \n`;
    let copyright = `${symbol}Copyright: Copyright (©)}) ${new Date().getFullYear()} ${
      header.get("copyRight") || header.get("author")
    }. All rights reserved.\n`;
    return {
      author,
      email,
      date,
      lastEditors,
      lastEditTime,
      description,
      copyright,
    };
  };
  const getSymbol = (editor: vscode.TextEditor | undefined): string[] => {
    switch (editor?.document.languageId) {
      case "python":
        return ["'''", ":", "'''"];
      case "javascript":
      case "javascriptreact":
      case "typescript":
      case "typescriptreact":
      case "java":
      case "c":
      case "cpp":
      case "csharp":
      case "go":
      case "php":
      case "rust":
      case "swift":
        return ["/**", " * ", " */"];
      default:
        return [];
    }
  };

  let addHeader = vscode.commands.registerCommand(
    "file-header.addFileHeader",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      let symbol = getSymbol(editor);
      if (symbol.length === 0) {
        vscode.window.showErrorMessage("FileHeader: 暂不支持该语言");
        return;
      }
      let {
        author,
        email,
        date,
        lastEditors,
        lastEditTime,
        description,
        copyright,
      } = getConfig(symbol[1]);

      let showCopyRight = vscode.workspace
        .getConfiguration("file-header")
        .get("showCopyRight") as boolean;
      let showEmail = vscode.workspace
        .getConfiguration("file-header")
        .get("showEmail") as boolean;

      let template = `${symbol[0]}\n${author}${
        showEmail ? email : ""
      }${date}${lastEditors}${lastEditTime}${description}${
        showCopyRight ? copyright : ""
      }${symbol[2]}\n`;
      editor?.edit((editBuilder) => {
        // 查看是否已经有头部
        let firstLine = editor.document.lineAt(0);
        if (firstLine.text.startsWith(symbol[0])) {
          vscode.window.showInformationMessage(
            "FileHeader: 已经存在 Header 信息"
          );
          return;
        }
        // 插入头部
        editBuilder.insert(new vscode.Position(0, 0), template);
      });
    }
  );
  let updateHeader = vscode.commands.registerCommand(
    "file-header.updateFileHeader",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      let symbol = getSymbol(editor);
      if (symbol.length === 0) {
        vscode.window.showErrorMessage("暂不支持该语言");
        return;
      }
      let { lastEditors, lastEditTime } = getConfig(symbol[1]);
      editor?.edit((editBuilder) => {
        // 查看是否已经有头部
        let firstLine = editor.document.lineAt(0);
        if (!firstLine.text.startsWith(symbol[0])) {
          vscode.window.showErrorMessage("FileHeader: 还未添加 Header 信息");
          return;
        }
        editBuilder.replace(
          new vscode.Range(
            new vscode.Position(4, 0),
            new vscode.Position(6, 0)
          ),
          `${lastEditors}${lastEditTime}`
        );
      });
    }
  );

  context.subscriptions.push(addHeader);
  context.subscriptions.push(updateHeader);
}

// This method is called when your extension is deactivated
export function deactivate() {}
