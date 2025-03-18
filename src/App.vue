<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import CodeEditor from './components/CodeEditor.vue';
import MarkdownPreview from './components/MarkdownPreview.vue';
import FileTree from './components/FileTree.vue';
import ConfigPanel from './components/ConfigPanel.vue';
import Toolbar from './components/Toolbar.vue';
import { generatePrompt, copyToClipboard, filesToTree, fileToNode, nodeToFile, type FileNode } from './utils/promptGenerator';
import { generateCursorRules } from './utils/cursorRulesGenerator';

// 状态
const sourceCode = ref('');
const generatedPrompt = ref('');
const generatedCursorRules = ref('');
const selectedLanguage = ref('python');
const projectFiles = ref<FileNode[]>([]);
const selectedFile = ref<FileNode | null>(null);
const showConfigModal = ref(false);
const showSidebar = ref(true); // 控制侧边栏显示状态
const uploadedFiles = ref<File[]>([]);

// 计算属性
const canConvert = computed(() => sourceCode.value.trim().length > 0);
const selectedFilePath = computed(() => selectedFile.value?.path || '');
const hasSidebar = computed(() => projectFiles.value.length > 0 && showSidebar.value);

// 配置
const config = reactive({
  shitty_code_settings: {
    transformation_level: 'medium',
    transformation_techniques: [
      'variable_naming',
      'code_structure',
      'comments',
      'error_handling',
      'performance',
      'readability'
    ],
    language_specific_techniques: true,
    framework: '',
    preserve_functionality: true,
    add_easter_eggs: true,
    add_comments: true,
    comment_style: 'confusing',
    variable_naming_style: 'misleading',
    code_structure_style: 'nested',
    error_handling_style: 'ignore',
    performance_style: 'inefficient',
    readability_style: 'poor',
    code_only_output: true
  }
});

// 自动更新生成的 prompt 和 cursorrules
const updatePrompt = () => {
  if (sourceCode.value.trim().length > 0) {
    const prompt = generatePrompt(
      sourceCode.value,
      selectedLanguage.value,
      config,
      projectFiles.value.length > 0 ? projectFiles.value : undefined
    );
    generatedPrompt.value = prompt;
    
    // 生成 .cursorrules 文件内容
    const cursorRules = generateCursorRules(
      selectedLanguage.value,
      config
    );
    generatedCursorRules.value = cursorRules;
  }
};

// 监听源代码、语言和配置的变化
watch(sourceCode, updatePrompt);
watch(selectedLanguage, updatePrompt);
watch(() => config.shitty_code_settings, updatePrompt, { deep: true });

const handleConvert = async () => {
  updatePrompt();
  await copyToClipboard(generatedPrompt.value);
};

const handleFileUpload = (files: File[]) => {
  if (files.length === 0) return;
  
  // 保存上传的文件，以便后续访问
  uploadedFiles.value = files;
  
  if (files.length === 1 && !files[0].webkitRelativePath) {
    // 单个文件上传
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        sourceCode.value = e.target.result as string;
        
        // 根据文件扩展名设置语言
        const extension = file.name.split('.').pop()?.toLowerCase() || '';
        setLanguageFromExtension(extension);
        
        // 添加到文件树
        projectFiles.value = [fileToNode(file)];
        selectedFile.value = projectFiles.value[0];
        
        // 确保侧边栏显示
        showSidebar.value = true;
      }
    };
    reader.readAsText(file);
  } else {
    // 项目文件夹上传
    projectFiles.value = filesToTree(files);
    
    // 如果有文件，选择第一个非目录文件
    const firstFile = findFirstFile(projectFiles.value);
    if (firstFile) {
      selectedFile.value = firstFile;
      loadFileContent(firstFile, files);
      
      // 确保侧边栏显示
      showSidebar.value = true;
    }
  }
};

const handleFileSelect = (file: FileNode) => {
  if (!file.isDirectory) {
    selectedFile.value = file;
    
    // 如果文件内容已经加载，直接使用
    if (file.content) {
      sourceCode.value = file.content;
      
      // 根据文件扩展名设置语言
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      setLanguageFromExtension(extension);
    } else {
      // 否则尝试从上传的文件中加载内容
      loadFileContent(file, projectFiles.value);
    }
  }
};

const loadFileContent = (file: FileNode, files: FileNode[] | File[]) => {
    // 辅助函数: 将文件树展平
    const flattenFiles = (nodes: FileNode[]): FileNode[] => {
      let result: FileNode[] = [];
      for (const node of nodes) {
        if (!node.isDirectory) {
          result.push(node);
        }
        if (node.children) {
          result = result.concat(flattenFiles(node.children));
        }
      }
      return result;
    };

  // 如果传入的是FileNode数组，从中查找所有实际文件
  if (files.length > 0 && 'isDirectory' in files[0]) {
   
    const allFileNodes = flattenFiles(files as FileNode[]);
    const targetNode = allFileNodes.find(node => node.path === file.path);

    if (targetNode) {
      if (targetNode.content) {
        file.content = targetNode.content;
        sourceCode.value = targetNode.content;
      } else {
        // 使用缓存的上传文件列表而不是DOM查询
        let foundFile = null;
        if (uploadedFiles.value.length > 0) {
          console.log("从缓存的上传文件中查找:", uploadedFiles.value.length, "个文件");
          foundFile = uploadedFiles.value.find(f => {
            console.log("比较:", f.webkitRelativePath, targetNode.path, f.name, targetNode.name);
            return f.webkitRelativePath === targetNode.path || f.name === targetNode.name;
          });
        }
        
        if (foundFile) {
          console.log("找到匹配文件:", foundFile.name);
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              const content = e.target.result as string;
              file.content = content;
              targetNode.content = content;
              sourceCode.value = content;
            } else {
              console.error('文件内容读取失败', e);
            }
          };
          reader.onerror = (e) => {
            console.error('文件读取错误', e);
          };
          reader.readAsText(foundFile);
        } else {
          console.warn(`找不到匹配的文件: ${targetNode.path || targetNode.name}`);
        }
      }
      // 根据文件扩展名设置语言
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      setLanguageFromExtension(extension);
      return;
    }
  }
  
  // 如果是File数组，按原方式处理
  const uploadedFile = (files as File[]).find(f => f.webkitRelativePath === file.path || f.name === file.name);
  if (uploadedFile) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const content = e.target.result as string;
        file.content = content;
        sourceCode.value = content;
        
        // 根据文件扩展名设置语言
        const extension = file.name.split('.').pop()?.toLowerCase() || '';
        setLanguageFromExtension(extension);
      }
    };
    reader.readAsText(uploadedFile);
  }
};

const findFirstFile = (nodes: FileNode[]): FileNode | null => {
  for (const node of nodes) {
    if (!node.isDirectory) {
      return node;
    }
    if (node.isDirectory && node.children && node.children.length > 0) {
      const found = findFirstFile(node.children);
      if (found) return found;
    }
  }
  return null;
};

const setLanguageFromExtension = (extension: string) => {
  switch (extension) {
    case 'js':
      selectedLanguage.value = 'javascript';
      break;
    case 'ts':
      selectedLanguage.value = 'typescript';
      break;
    case 'py':
      selectedLanguage.value = 'python';
      break;
    case 'java':
      selectedLanguage.value = 'java';
      break;
    case 'rs':
      selectedLanguage.value = 'rust';
      break;
    case 'cpp':
    case 'cc':
    case 'cxx':
    case 'c++':
    case 'h':
    case 'hpp':
      selectedLanguage.value = 'cpp';
      break;
    case 'go':
      selectedLanguage.value = 'go';
      break;
    default:
      // 保持当前语言不变
      break;
  }
};

// 切换侧边栏显示状态
const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value;
};

const handleLanguageChange = (language: string) => {
  selectedLanguage.value = language;
};

const handleConfigChange = (newConfig: any) => {
  config.shitty_code_settings = newConfig.shitty_code_settings;
};

const closeConfigModal = () => {
  showConfigModal.value = false;
};

const handleFileRemove = (file: FileNode) => {
  // 从文件树中移除文件
  const removeFile = (files: FileNode[]): FileNode[] => {
    return files.filter(f => {
      if (f.path === file.path) {
        return false;
      }
      if (f.children) {
        f.children = removeFile(f.children);
      }
      return true;
    });
  };
  
  projectFiles.value = removeFile(projectFiles.value);
  
  // 如果移除的是当前选中的文件，清空编辑器
  if (selectedFile.value?.path === file.path) {
    selectedFile.value = null;
    sourceCode.value = '';
  }
};

const handleFileEdit = (file: FileNode) => {
  if (!file.isDirectory) {
    selectedFile.value = file;
    sourceCode.value = file.content || '';
    
    // 根据文件扩展名设置语言
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    setLanguageFromExtension(extension);
  }
};
</script>

<template>
  <div class="app">
    <Toolbar 
      :canConvert="canConvert" 
      @convert="handleConvert"
      @open-config="showConfigModal = true"
    />
    
    <div class="main-content">
      <!-- 侧边栏 -->
      <div v-if="hasSidebar" class="sidebar">
        <div class="sidebar-header">
          <h3>项目文件</h3>
          <button class="sidebar-toggle" @click="showSidebar = false">
            &times;
          </button>
        </div>
        <FileTree 
          :files="projectFiles" 
          :selected-path="selectedFilePath" 
          @file-select="handleFileSelect"
          @file-remove="handleFileRemove"
          @file-edit="handleFileEdit"
        />
      </div>
      
      <!-- 侧边栏切换按钮 -->
      <button 
        v-if="projectFiles.length > 0 && !showSidebar" 
        class="sidebar-show-button"
        @click="toggleSidebar"
        title="显示侧边栏"
      >
        <span>▶</span>
      </button>
      
      <!-- 内容区域 -->
      <div class="content-area" :class="{ 'with-sidebar': hasSidebar }">
        <!-- 编辑器部分 -->
        <div class="editor-section">
          <div class="section-header">
            <h3>源代码</h3>
            <div class="language-selector">
              <label for="language-select">语言:</label>
              <select 
                id="language-select" 
                v-model="selectedLanguage" 
                @change="updatePrompt"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="csharp">C#</option>
                <option value="cpp">C++</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="php">PHP</option>
                <option value="ruby">Ruby</option>
                <option value="swift">Swift</option>
                <option value="kotlin">Kotlin</option>
                <option value="scala">Scala</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="sql">SQL</option>
              </select>
            </div>
          </div>
          <CodeEditor 
            v-model="sourceCode" 
            :language="selectedLanguage" 
            :show-upload="true" 
            @file-upload="handleFileUpload"
          />
        </div>
        
        <!-- 预览部分 -->
        <div class="preview-section">
          <div class="section-header">
            <h3>生成的提示</h3>
          </div>
          <MarkdownPreview 
            v-model="generatedPrompt" 
            :cursor-rules="generatedCursorRules"
          />
        </div>
      </div>
    </div>
    
    <!-- 配置模态窗口 -->
    <div class="modal-overlay" v-if="showConfigModal" @click="closeConfigModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h2>配置选项</h2>
          <button class="close-button" @click="closeConfigModal">×</button>
        </div>
        <div class="modal-body">
          <ConfigPanel 
            v-model:selectedLanguage="selectedLanguage"
            v-model:config="config"
          />
        </div>
        <div class="modal-footer">
          <button class="save-button" @click="closeConfigModal">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: #121212;
  color: #e0e0e0;
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  max-width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 250px;
  background-color: #252526;
  border-right: 1px solid #333;
  background-color: #1e1e1e;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #333;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
}

.sidebar-toggle {
  background: none;
  border: none;
  color: #e0e0e0;
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.sidebar-toggle:hover {
  color: #e0e0e0;
  background-color: #3a3a3a;
}

.sidebar-show-button {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  background-color: #252526;
  border: 1px solid #333;
  border-left: none;
  color: #e0e0e0;
  padding: 10px 5px;
  cursor: pointer;
  z-index: 10;
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@media (min-width: 768px) {
  .content-area {
    flex-direction: row;
  }
}

.content-area.with-sidebar {
  margin-left: 0;
}

.editor-section, .preview-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 10px;
  border-bottom: 1px solid #333;
}

@media (min-width: 768px) {
  .editor-section, .preview-section {
    border-bottom: none;
  }
  
  .editor-section {
    border-right: 1px solid #333;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
}

.language-selector {
  display: flex;
  align-items: center;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
  animation: fadeIn 0.2s ease;
}

.modal-container {
  background-color: #1e1e1e;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  width: 80%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #2a2a2a;
  border-bottom: 1px solid #333;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  color: #e0e0e0;
}

.close-button {
  background: none;
  border: none;
  color: #e0e0e0;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s;
}

.close-button:hover {
  color: #e0e0e0;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  max-height: calc(90vh - 130px);
}

.modal-footer {
  padding: 12px 20px;
  display: flex;
  justify-content: flex-end;
  background-color: #2a2a2a;
  border-top: 1px solid #333;
}

.save-button {
  background-color: #8e44ad;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.save-button:hover {
  background-color: #9b59b6;
  transform: translateY(-2px);
}

.save-button:active {
  transform: translateY(0);
}

@media (max-width: 1200px) {
  .editors {
    flex-direction: column;
  }
  
  .editor-panel {
    height: 50%;
    min-height: 300px;
  }
  
  .modal-container {
    width: 95%;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: 200px;
    border-right: none;
    border-bottom: 1px solid #333;
  }
  
  .editors.with-sidebar {
    width: 100%;
    height: calc(100% - 200px);
  }
  
  .editor-container {
    width: 100%;
    height: calc(100% - 200px);
    padding: 8px;
  }
  
  .sidebar-show-button {
    top: 200px;
    left: 50%;
    transform: translateX(-50%) rotate(90deg);
    border-radius: 0 0 4px 4px;
    border-right: none;
    border-top: 1px solid #333;
  }
}
</style>
