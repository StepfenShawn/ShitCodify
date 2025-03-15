// 导入所有语言的策略
import javascriptStrategy from './javascript.md?raw';
import pythonStrategy from './python.md?raw';
import javaStrategy from './java.md?raw';
import cppStrategy from './cpp.md?raw';
import rustStrategy from './rust.md?raw';
import goStrategy from './go.md?raw';
import defaultStrategy from './default.md?raw';

// 语言策略映射
const languageStrategies: Record<string, string> = {
  javascript: javascriptStrategy,
  js: javascriptStrategy,
  typescript: javascriptStrategy,
  ts: javascriptStrategy,
  python: pythonStrategy,
  py: pythonStrategy,
  java: javaStrategy,
  cpp: cppStrategy,
  'c++': cppStrategy,
  rust: rustStrategy,
  rs: rustStrategy,
  go: goStrategy,
  default: defaultStrategy
};

/**
 * 从Markdown文件中提取语言特定技巧
 * @param content Markdown内容
 * @returns 提取的技巧字符串
 */
function extractTechniquesFromMarkdown(content: string): string {
  // 查找"## 语言特定技巧"部分
  const techniquesSection = content.split('## 语言特定技巧')[1];
  if (!techniquesSection) {
    return '- 使用该语言中最容易导致混淆和难以维护的特性和技巧';
  }
  
  // 提取技巧列表（以"-"开头的行）
  const techniques = techniquesSection
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .join('\n');
  console.log(techniques);
  return techniques || '- 使用该语言中最容易导致混淆和难以维护的特性和技巧';
}

/**
 * 获取特定语言的屎山生成策略
 * @param language 语言名称
 * @returns 语言特定的技巧字符串
 */
export function getLanguageStrategy(language: string): string {
  const normalizedLanguage = language.toLowerCase();
  const strategyContent = languageStrategies[normalizedLanguage] || languageStrategies.default;
  return extractTechniquesFromMarkdown(strategyContent);
}

export default getLanguageStrategy; 