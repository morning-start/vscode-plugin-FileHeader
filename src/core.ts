import * as vscode from "vscode";
import * as fs from "fs";
export type UpdateData = {
  reg: RegExp | string;
  newValue: string;
};

/**
 * 格式化配置数组，生成带符号标记的模板字符串
 * @param cfg - 配置项数组，每个元素将被格式化
 * @param symbol - 包含三个符号的数组，用于标记模板的开始、中间和结束部分
 * @returns 格式化后的模板字符串
 */
export function formatConfig(cfg: string[], symbol: string[]) {
  // 将配置项数组映射为带符号标记的格式
  let content = cfg.map((item) => {
    return `${symbol[1]}@${item}`;
  });
  // 构造最终的模板字符串
  let template = `${symbol[0]}FileHeader\n${content.join("\n")}\n${
    symbol[2]
  }\n`;
  return template;
}

/**
 * 获取文件头配置信息
 * @param symbol 注释符号前缀
 * @returns 包含文件头各项配置的对象
 */
export function generateBaseConfig(editor: vscode.TextEditor) {
  const cfg = vscode.workspace.getConfiguration("file-header");
  let author = `Author: ${cfg.get("author")}`;
  let date = `CreateDate: ${getFileCreateDate(editor?.document.uri)}`;
  let lastEditors = `LastEditors: ${cfg.get("author")}`;
  let lastEditTime = `LastEditTime: ${new Date().toLocaleString()}`;
  let description = `Description: `;
  let copyright = `Copyright: Copyright (©)}) ${new Date().getFullYear()} ${
    cfg.get("copyRight") || cfg.get("author")
  }. All rights reserved.`;
  return { author, date, lastEditors, lastEditTime, description, copyright };
}

/**
 * 根据编辑器中文档的语言类型获取相应的注释符号
 * @param editor VSCode文本编辑器实例
 * @returns 包含开始符号、行前缀和结束符号的数组
 */
export function getCommentSymbols(
  editor: vscode.TextEditor | undefined
): string[] {
  switch (editor?.document.languageId) {
    case "python":
      return ["'''", ": ", "'''"];
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
}

/**
 * 获取文件的创建日期
 * @param uri - 文件的Uri对象，用于定位文件路径
 * @returns 返回文件创建日期的字符串格式(YYYY-MM-DD)，如果获取失败则返回undefined
 */
export function getFileCreateDate(uri: vscode.Uri): string | undefined {
  try {
    // 验证输入参数
    if (!uri || !uri.fsPath) {
      return undefined;
    }

    // 获取文件状态信息
    const stat = fs.statSync(uri.fsPath);
    const createDate = stat.birthtime;
    // 格式化为 YYYY-MM-DD HH:mm:ss
    return createDate.toLocaleString();
  } catch (err) {
    // 记录错误信息便于调试
    console.warn(`Failed to get file create date for ${uri?.fsPath}:`, err);
    return undefined;
  }
}

function getHeaderContext(document: string, symbol: string[]) {
  return document.substring(
    document.indexOf(symbol[0]),
    document.indexOf(symbol[2]) + symbol[2].length + 1
  );
}

export function matchUpdateRage(
  document: vscode.TextDocument,
  symbol: string[],
  reg: string | RegExp
) {
  let headerContent = getHeaderContext(document.getText(), symbol);
  let line = headerContent.match(reg);

  if (!line || line.index === undefined) {
    return;
  }
  const start = document.positionAt(line.index);
  const row = document.lineAt(start.line);
  const end = row.range.end;
  return new vscode.Range(start, end);
}
