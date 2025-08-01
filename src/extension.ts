import * as vscode from "vscode";
import { Logger } from "./logger";
import { addFileHeader, updateFileHeader, autoUpdateFileHeader } from "./func";
export function activate(context: vscode.ExtensionContext) {
  let addHeader = vscode.commands.registerCommand(
    "file-header.addFileHeader",
    addFileHeader
  );

  let updateHeader = vscode.commands.registerCommand(
    "file-header.updateFileHeader",
    updateFileHeader
  );

  // const cfg = vscode.workspace.getConfiguration("file-header");
  // const isAutoUpdate = cfg.get("autoUpdate") as boolean;
  // let autoUpdate = vscode.workspace.onWillSaveTextDocument((e) => {
  //   //  如果配置项为true，则自动更新文件头
  //   if (isAutoUpdate) {
  //     autoUpdateFileHeader();
  //   }
  //   e.document.save();
  // });

  // context.subscriptions.push(autoUpdate);
  context.subscriptions.push(addHeader);
  context.subscriptions.push(updateHeader);
}

// This method is called when your extension is deactivated
export function deactivate() {}
