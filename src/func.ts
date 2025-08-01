import * as vscode from "vscode";
import { Logger } from "./logger";
import {
  formatConfig,
  generateBaseConfig,
  matchUpdateRage,
  UpdateData,
} from "./core";
import { hasHeader, initContext, insertEditor, updateEditor } from "./utils";

export function addFileHeader() {
  let context = initContext();
  if (!context) {
    vscode.window.showErrorMessage("FileHeader: 暂不支持该语言");
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
  const cfg = vscode.workspace.getConfiguration("file-header");
  const info = cfg.get("moreInfo") as object;
  let template = formatConfig({ ...baseConfig, ...info }, symbol);

  insertEditor(editor, template);
  vscode.window.showInformationMessage("FileHeader: 添加信息成功");
}

export function updateFileHeader() {
  let context = initContext();
  if (!context) {
    vscode.window.showErrorMessage("FileHeader: 暂不支持该语言");
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

  updateEditor(editor, symbol, updateData);
  vscode.window.showInformationMessage("FileHeader: 添加信息成功");
}

export function autoUpdateFileHeader() {
  let context = initContext();
  if (!context) {
    return;
  }
  const { editor, symbol } = context;

  // 查看是否已经有头部
  if (!hasHeader(editor, symbol[0])) {
    return;
  }

  let { lastEditors, lastEditTime } = generateBaseConfig(editor);

  let updateData: UpdateData[] = [
    { reg: "@LastEditTime", newValue: lastEditTime },
    { reg: "@LastEditors", newValue: lastEditors },
  ];

  updateEditor(editor, symbol, updateData);
}
