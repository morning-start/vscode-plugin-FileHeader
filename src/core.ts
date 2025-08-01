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
export function formatConfig(cfg: object, symbol: string[]) {
  // 将配置项数组映射为带符号标记的格式
  // cfg -> key: value 的数组
  let info = Object.entries(cfg).map(([key, value]) => {
    // key 首字母大写
    let title = key.charAt(0).toUpperCase() + key.slice(1);
    return `${title}: ${value}`;
  });

  let content = info.map((item) => {
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
  const author = cfg.get("author") as string;
  const description = cfg.get("description") as string;
  const copyRight = cfg.get("copyRight") as string;
  let data = {
    author,
    date: getFileCreateDate(editor.document.uri).toString(),
    lastEditors: author,
    lastEditTime: new Date().toLocaleString(),
    description,
    copyright: `Copyright (©)}) ${new Date().getFullYear()} ${
      copyRight || author
    }. All rights reserved.`,
  };
  return data;
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
 * @returns 返回文件创建日期的字符串格式(YYYY-MM-DD)
 */
export function getFileCreateDate(uri: vscode.Uri) {
  const stat = fs.statSync(uri.fsPath);
  const createDate = stat.birthtime;
  // 格式化为 YYYY-MM-DD HH:mm:ss
  return createDate.toLocaleString();
}

/**
 * 从文档中提取头部上下文内容
 * @param document - 要处理的完整文档字符串
 * @param symbol - 包含三个符号的数组，用于定位提取范围
 * @returns 返回从第一个符号位置开始到第三个符号结束位置的子字符串
 */
function getHeaderContext(document: string, symbol: string[]) {
  // 根据符号数组中的起始和结束符号位置提取文档片段
  return document.substring(
    document.indexOf(symbol[0]),
    document.indexOf(symbol[2]) + symbol[2].length + 1
  );
}

/**
 * 匹配文档头部内容中的特定模式并返回对应的范围
 * @param document - VSCode文本文档对象
 * @param symbol - 用于标识头部内容的符号数组
 * @param reg - 用于匹配的正则表达式或字符串模式
 * @returns 匹配内容对应的VSCode范围对象，如果未找到匹配则返回undefined
 */
export function matchUpdateRage(
  document: vscode.TextDocument,
  symbol: string[],
  reg: string | RegExp
) {
  // 获取文档头部内容并匹配指定模式
  let headerContent = getHeaderContext(document.getText(), symbol);
  let line = headerContent.match(reg);

  // 如果未找到匹配内容则直接返回
  if (!line || line.index === undefined) {
    return;
  }
  // 根据匹配位置计算范围的起始和结束位置
  const start = document.positionAt(line.index);
  const row = document.lineAt(start.line);
  const end = row.range.end;
  return new vscode.Range(start, end);
}
