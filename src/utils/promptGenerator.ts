// 定义文件节点接口
export interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
  content?: string;
}

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

// 导入模板文件
import promptTemplate from '../prompt/promptTemplate.md?raw';
// 导入语言策略
import { getLanguageStrategy } from '../prompt/languages';
// 导入框架策略
import { getFrameworkStrategy } from '../prompt/frameworks';
import { getCommentTechniques, getTransformationLevelDescription, getVariableNamingTechniques } from './styleRules';

export function generatePrompt(
  code: string,
  language: string,
  config: ShittyCodeConfig,
  files?: FileNode[]
): string {
  // 替换模板中的变量
  let prompt = promptTemplate;
  
  // 替换保持功能正确性
  const preserveFunctionality = config.shitty_code_settings.preserve_functionality
    ? '无论如何修改，代码必须保持原有的功能，能够正确运行并产生相同的输出。'
    : '尽量保持原有功能，但可以适当引入一些不影响主要功能的小问题。';
  prompt = prompt.replace('{{preserve_functionality}}', preserveFunctionality);
  
  // 替换变量命名技巧
  prompt = prompt.replace('{{variable_naming_techniques}}', getVariableNamingTechniques(config.shitty_code_settings.variable_naming_style));
  
  // 替换注释技巧
  prompt = prompt.replace('{{comment_techniques}}', getCommentTechniques(config.shitty_code_settings.comment_style));
  
  // 替换语言特定技巧
  prompt = prompt.replace('{{language_specific_techniques}}', getLanguageStrategy(language));
  
  // 替换框架特定技巧
  let frameworkTechniques = '';
  if (config.shitty_code_settings.framework) {
    const frameworkStrategy = getFrameworkStrategy(config.shitty_code_settings.framework);
    if (frameworkStrategy) {
      frameworkTechniques = `\n\n### 框架特定技巧\n${frameworkStrategy}\n\n`;
    }
  }
  prompt = prompt.replace('{{framework_specific_techniques}}', frameworkTechniques);
  
  // 替换转换级别
  prompt = prompt.replace('{{transformation_level}}', getTransformationLevelDescription(config.shitty_code_settings.transformation_level));
  
  // 替换彩蛋
  const easterEggs = config.shitty_code_settings.add_easter_eggs
    ? '请在代码中添加一些有趣的彩蛋或隐藏的注释，但不要影响代码的功能。'
    : '';
  prompt = prompt.replace('{{easter_eggs}}', easterEggs);
  
  // 替换只输出代码选项
  const codeOnlyOutput = config.shitty_code_settings.code_only_output
    ? '请只输出转换后的代码，不要包含任何解释、说明或其他文本。直接以代码块形式返回结果。'
    : '';
  prompt = prompt.replace('{{code_only_output}}', codeOnlyOutput);
  
  // 替换代码
  prompt = prompt.replace('{{language}}', language);
  prompt = prompt.replace('{{code}}', code);
  
  // 替换文件结构
  let fileStructure = '';
  if (files && files.length > 1) {
    fileStructure = `
项目文件结构：
${generateFileStructureDescription(files)}

请注意上述文件结构，确保转换后的代码能够在此项目结构中正确运行。`;
  }
  prompt = prompt.replace('{{file_structure}}', fileStructure);
  
  return prompt;
}

function generateFileStructureDescription(files: FileNode[]): string {
  let result = '';
  
  function traverseFiles(nodes: FileNode[], depth: number = 0) {
    for (const node of nodes) {
      // 使用空格字符串拼接而不是 repeat 方法
      let indent = '';
      for (let i = 0; i < depth * 2; i++) {
        indent += ' ';
      }
      result += `${indent}${node.isDirectory ? '📁' : '📄'} ${node.name}\n`;
      
      if (node.isDirectory && node.children) {
        traverseFiles(node.children, depth + 1);
      }
    }
  }
  
  traverseFiles(files);
  return result;
}

// 辅助函数：将文件列表转换为树形结构
export function filesToTree(files: File[]): FileNode[] {
  const root: FileNode[] = [];
  const pathMap: Record<string, FileNode> = {};
  
  // 首先创建所有目录节点
  for (const file of files) {
    const pathParts = file.webkitRelativePath.split('/');
    let currentPath = '';
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!part) continue;
      
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      
      if (!pathMap[currentPath]) {
        const dirNode: FileNode = {
          name: part,
          path: currentPath,
          isDirectory: true,
          children: []
        };
        
        pathMap[currentPath] = dirNode;
        
        if (parentPath) {
          pathMap[parentPath].children?.push(dirNode);
        } else {
          root.push(dirNode);
        }
      }
    }
  }
  
  // 然后添加文件节点
  for (const file of files) {
    const pathParts = file.webkitRelativePath.split('/');
    const fileName = pathParts[pathParts.length - 1];
    const parentPath = pathParts.slice(0, -1).join('/');
    
    const fileNode: FileNode = {
      name: fileName,
      path: file.webkitRelativePath,
      isDirectory: false,
    };
    
    if (parentPath && pathMap[parentPath]) {
      pathMap[parentPath].children?.push(fileNode);
    } else {
      root.push(fileNode);
    }
  }
  
  return root;
}

// 辅助函数：将单个文件转换为树节点
export function fileToNode(file: File): FileNode {
  return {
    name: file.name,
    path: file.name,
    isDirectory: false
  };
}

// 辅助函数：将树节点转换为文件
export function nodeToFile(node: FileNode): File {          
  const file = new File([node.content || ''], node.name);
  Object.defineProperty(file, 'webkitRelativePath', {
    value: node.path,
    writable: false
  });
  return file;
}

// 辅助函数：复制文本到剪贴板
export function copyToClipboard(text: string): Promise<boolean> {
  // 使用回调方式处理 Promise，避免使用 async/await
  return new Promise<boolean>((resolve) => {
    try {
      navigator.clipboard.writeText(text)
        .then(() => resolve(true))
        .catch((err) => {
          console.error('Failed to copy text: ', err);
          resolve(false);
        });
    } catch (err) {
      console.error('Failed to copy text: ', err);
      resolve(false);
    }
  });
} 