import * as vscode from "vscode";
import { getCommentSymbols } from "./core";

/**
 * 初始化上下文环境
 *
 * @returns 如果初始化成功返回包含编辑器和注释符号的对象，否则返回false
 */
export function initContext():
  | false
  | { editor: vscode.TextEditor; symbol: string[] } {
  // 获取当前激活的文本编辑器
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return false;
  }

  // 获取当前语言的注释符号
  const symbol = getCommentSymbols(editor);
  if (symbol.length === 0) {
    // 如果不支持当前语言，显示错误消息
    vscode.window.showErrorMessage("FileHeader: 暂不支持该语言");
    return false;
  }

  return { editor, symbol };
}

export function hasHeader(editor: vscode.TextEditor, symbol: string) {
  const firstLine = editor.document.lineAt(0);
  return firstLine.text.startsWith(`${symbol}FileHeader`);
}
