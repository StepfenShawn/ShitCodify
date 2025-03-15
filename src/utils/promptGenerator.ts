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
    preserve_functionality: boolean;
    add_easter_eggs: boolean;
    add_comments: boolean;
    comment_style: string;
    variable_naming_style: string;
    code_structure_style: string;
    error_handling_style: string;
    performance_style: string;
    readability_style: string;
  };
}

// 导入模板文件
import promptTemplate from '../prompt/promptTemplate.md?raw';
// 导入语言策略
import getLanguageStrategy from '../prompt/languages';

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
  
  // 替换转换级别
  prompt = prompt.replace('{{transformation_level}}', getTransformationLevelDescription(config.shitty_code_settings.transformation_level));
  
  // 替换彩蛋
  const easterEggs = config.shitty_code_settings.add_easter_eggs
    ? '请在代码中添加一些有趣的彩蛋或隐藏的注释，但不要影响代码的功能。'
    : '';
  prompt = prompt.replace('{{easter_eggs}}', easterEggs);
  
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

function getVariableNamingTechniques(style: string): string {
  switch (style) {
    case 'misleading':
      return '- 使用无意义、误导性的变量名（如将计数器命名为 data，将数据命名为 counter）\n   - 对相似功能的变量使用相似的名称（如 data, data1, data2, dta）';
    case 'terse':
      return '- 使用过于简短的变量名（如 a, b, c, temp1, temp2）\n   - 使用单字母变量名，特别是在复杂逻辑中';
    case 'verbose':
      return '- 使用过长且复杂的变量名（如 thisIsAVeryLongVariableNameThatDescribesASimpleCounter）\n   - 添加不必要的前缀和后缀';
    case 'mixed':
      return '- 混用命名风格（驼峰、下划线、匈牙利命名法等混用）\n   - 在同一作用域内使用不同的命名约定';
    case 'pinyin':
      return '- 使用拼音变量名（如 shujv, jishuqi, zonghe）\n   - 混合使用拼音和英文';
    default:
      return '- 使用无意义、误导性或过于简短的变量名（如 a, b, c, temp1, temp2）\n   - 对相似功能的变量使用相似的名称（如 data, data1, data2, dta）\n   - 混用命名风格（驼峰、下划线、匈牙利命名法等混用）';
  }
}

function getCommentTechniques(style: string): string {
  switch (style) {
    case 'confusing':
      return '- 添加误导性注释，与代码实际功能不符\n   - 使用模糊不清的描述';
    case 'outdated':
      return '- 保留过时的注释，不再反映当前代码的功能\n   - 注释描述的功能与实际代码不符';
    case 'excessive':
      return '- 对简单代码过度注释，添加大量无用信息\n   - 使用冗长的注释解释显而易见的操作';
    case 'minimal':
      return '- 对复杂代码不加注释或只添加极少的注释\n   - 在关键逻辑处省略注释';
    default:
      return '- 添加误导性注释\n   - 保留过时的注释\n   - 对复杂代码不加注释，对简单代码过度注释';
  }
}

function getTransformationLevelDescription(level: string): string {
  switch (level) {
    case 'low':
      return '轻微混乱 - 代码仍然可以理解，但增加了一些不必要的复杂性';
    case 'medium':
      return '适度混乱 - 代码变得明显难以理解，但结构仍然可以辨认';
    case 'high':
      return '严重混乱 - 代码非常难以理解，结构被严重扭曲';
    case 'extreme':
      return '极端混乱 - 代码几乎不可能理解，使用了所有可能的混淆技术';
    default:
      return '适度混乱 - 代码变得明显难以理解，但结构仍然可以辨认';
  }
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
      isDirectory: false
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