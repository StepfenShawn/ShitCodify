import { getLanguageStrategy } from '../prompt/languages';
import { getFrameworkStrategy } from '../prompt/frameworks';
import cursorRulesTemplate from '../prompt/cursorrules.md?raw';
import { getCommentTechniques, getTransformationLevelDescription, getVariableNamingTechniques } from './styleRules';

interface ShittyCodeConfig {
  shitty_code_settings: {
    transformation_level: string;
    transformation_techniques: string[];
    language_specific_techniques: boolean;
    framework?: string;
    preserve_functionality: boolean;
    add_easter_eggs: boolean;
    add_comments: boolean;
    comment_style: string;
    variable_naming_style: string;
    code_structure_style: string;
    error_handling_style: string;
    performance_style: string;
    readability_style: string;
    code_only_output: boolean;
  };
}

/**
 * 生成 .cursorrules 文件内容
 * @param language 编程语言
 * @param config 配置选项
 * @returns .cursorrules 文件内容
 */
export function generateCursorRules(language: string, config: ShittyCodeConfig): string {
  // 替换模板中的变量
  let cursorRules = cursorRulesTemplate;
  
  // 替换变量命名技巧
  cursorRules = cursorRules.replace('{{variable_naming_techniques}}', getVariableNamingTechniques(config.shitty_code_settings.variable_naming_style));
  
  // 替换注释技巧
  cursorRules = cursorRules.replace('{{comment_techniques}}', getCommentTechniques(config.shitty_code_settings.comment_style));
  
  // 替换语言特定技巧
  const languageStrategy = getLanguageStrategy(language);
  cursorRules = cursorRules.replace('{{language_specific_techniques}}', 
    languageStrategy ? `  \n - 针对 ${language} 的特定技巧:  \n${languageStrategy}` : '');
   
  // 替换框架特定技巧
  let frameworkTechniques = '';
  if (config.shitty_code_settings.framework) {
    const frameworkStrategy = getFrameworkStrategy(config.shitty_code_settings.framework);
    if (frameworkStrategy) {
      frameworkTechniques = `\n\n### 框架特定技巧\n${frameworkStrategy}\n\n`;
    }
  }
  cursorRules = cursorRules.replace('{{framework_specific_techniques}}', frameworkTechniques);
  
  // 替换转换级别
  cursorRules = cursorRules.replace('{{transformation_level}}', getTransformationLevelDescription(config.shitty_code_settings.transformation_level));
  
  return cursorRules;
}