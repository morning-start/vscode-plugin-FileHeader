import * as vscode from "vscode";
import { Logger } from "./logger";
import {
  formatConfig,
  generateBaseConfig,
  matchUpdateRage,
  UpdateData,
} from "./core";
import { hasHeader, initContext } from "./utils";
export function activate(context: vscode.ExtensionContext) {
  let addHeader = vscode.commands.registerCommand(
    "file-header.addFileHeader",
    () => {
      let context = initContext();
      if (!context) {
        return;
      }
      const { editor, symbol } = context;
      // 查看是否已经有头部
      if (hasHeader(editor, symbol[0])) {
        vscode.window.showInformationMessage(
          "FileHeader: 已经存在 Header 信息。请使用 ctrl+alt+u 命令更新头部信息。"
        );
        return;
      }

      let baseConfig = generateBaseConfig(editor);
      let template = formatConfig(Object.values(baseConfig), symbol);

      editor?.edit((editBuilder) => {
        editBuilder.insert(new vscode.Position(0, 0), template);
        vscode.window.showInformationMessage("FileHeader: 添加信息成功");
      });
    }
  );

  let updateHeader = vscode.commands.registerCommand(
    "file-header.updateFileHeader",
    () => {
      let context = initContext();
      if (!context) {
        return;
      }
      const { editor, symbol } = context;

      // 查看是否已经有头部
      if (!hasHeader(editor, symbol[0])) {
        vscode.window.showErrorMessage(
          "FileHeader: 还未添加 Header 信息. 请先 ctrl+alt+h 添加"
        );
        return;
      }

      let { lastEditors, lastEditTime } = generateBaseConfig(editor);

      let updateData: UpdateData[] = [
        { reg: "@LastEditTime", newValue: lastEditTime },
        { reg: "@LastEditors", newValue: lastEditors },
      ];

      editor?.edit((editBuilder) => {
        updateData.forEach((item) => {
          // 正则的方式更新时间
          let range = matchUpdateRage(editor.document, symbol, item.reg);
          if (range) {
            editBuilder.replace(range, `@${item.newValue}`);
          }
        });
        vscode.window.showInformationMessage("FileHeader: 添加信息成功");
      });
    }
  );

  context.subscriptions.push(addHeader);
  context.subscriptions.push(updateHeader);
}

// This method is called when your extension is deactivated
export function deactivate() {}
