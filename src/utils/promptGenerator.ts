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

export function generatePrompt(
  code: string,
  language: string,
  config: ShittyCodeConfig,
  files?: FileNode[]
): string {
  // 基础提示模板
  const basePrompt = `# 屎山代码生成器 Prompt

你是一个专业的"屎山代码"生成器，你的任务是将正常的、干净的代码转换成可读性差、维护性差但仍然能够正确运行的代码。请遵循以下原则：

1. **保持功能正确性**：${config.shitty_code_settings.preserve_functionality ? '无论如何修改，代码必须保持原有的功能，能够正确运行并产生相同的输出。' : '尽量保持原有功能，但可以适当引入一些不影响主要功能的小问题。'}

2. **命名混乱化**：
   ${getVariableNamingTechniques(config.shitty_code_settings.variable_naming_style)}

3. **结构复杂化**：
   - 使用过度嵌套的条件语句和循环
   - 使用不必要的全局变量
   - 将简单逻辑拆分成多个不必要的函数或合并不相关的功能
   - 滥用三元运算符、嵌套三元运算符

4. **注释混淆**：
   ${getCommentTechniques(config.shitty_code_settings.comment_style)}

5. **代码冗余**：
   - 添加不必要的临时变量
   - 重复计算可缓存的值
   - 使用冗长的表达式替代简洁表达式

6. **语言特定技巧**：
   ${getLanguageSpecificTechniques(language)}

7. **格式混乱**：
   - 不一致的缩进
   - 过长的行
   - 不规则的空行和空格

8. **"聪明"技巧**：
   - 使用晦涩难懂的语言特性和技巧
   - 使用不常见的库函数或语言特性
   - 实现本可以用标准库完成的功能

转换级别: ${getTransformationLevelDescription(config.shitty_code_settings.transformation_level)}

请根据提供的代码，应用上述原则将其转换为"屎山代码"。转换后的代码应当难以理解和维护，但必须保持功能完全相同且能够正确运行。

${config.shitty_code_settings.add_easter_eggs ? '请在代码中添加一些有趣的彩蛋或隐藏的注释，但不要影响代码的功能。' : ''}

以下是需要转换的代码：

\`\`\`${language}
${code}
\`\`\`
`;

  // 如果有多个文件，添加文件结构信息
  if (files && files.length > 1) {
    const fileStructure = generateFileStructureDescription(files);
    return `${basePrompt}

项目文件结构：
${fileStructure}

请注意上述文件结构，确保转换后的代码能够在此项目结构中正确运行。`;
  }

  return basePrompt;
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

function getLanguageSpecificTechniques(language: string): string {
  switch (language.toLowerCase()) {
    case 'rust':
      return '- Rust：滥用宏、不安全代码块、过度使用生命周期标注、复杂的特性约束';
    case 'python':
      return '- Python：滥用列表推导式、eval()、exec()、全局变量、不必要的元编程';
    case 'javascript':
    case 'js':
    case 'typescript':
    case 'ts':
      return '- JavaScript/TypeScript：混合使用不同版本特性、滥用闭包和回调、过度使用原型链、滥用this';
    case 'java':
      return '- Java：过度设计类层次、不必要的设计模式应用、过度使用反射、创建不必要的接口';
    case 'cpp':
    case 'c++':
      return '- C++：过度使用宏、指针、类型转换、复杂模板、多重继承';
    case 'go':
      return '- Go：滥用接口、过度使用反射、不必要的goroutine、滥用空接口';
    default:
      return '- 根据语言特性，使用该语言中最容易导致混淆和难以维护的特性和技巧';
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