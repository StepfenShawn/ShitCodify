export function getTransformationLevelDescription(level: string): string {
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

export function getVariableNamingTechniques(style: string): string {
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

export function getCommentTechniques(style: string): string {
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
