<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import CodeEditor from './components/CodeEditor.vue';
import MarkdownPreview from './components/MarkdownPreview.vue';
import FileTree from './components/FileTree.vue';
import ConfigPanel from './components/ConfigPanel.vue';
import Toolbar from './components/Toolbar.vue';
import { generatePrompt, copyToClipboard, filesToTree, fileToNode, type FileNode } from './utils/promptGenerator';

// 状态
const sourceCode = ref('// 在此处输入您的代码，或者上传文件');
const generatedPrompt = ref('');
const selectedLanguage = ref('javascript');
const projectFiles = ref<FileNode[]>([]);
const selectedFile = ref<FileNode | null>(null);
const showConfigModal = ref(false);

// 计算属性
const canConvert = computed(() => sourceCode.value.trim().length > 0);
const selectedFilePath = computed(() => selectedFile.value?.path || '');

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
    preserve_functionality: true,
    add_easter_eggs: true,
    add_comments: true,
    comment_style: 'confusing',
    variable_naming_style: 'misleading',
    code_structure_style: 'nested',
    error_handling_style: 'ignore',
    performance_style: 'inefficient',
    readability_style: 'poor'
  }
});

const handleConvert = async () => {
  const prompt = generatePrompt(
    sourceCode.value,
    selectedLanguage.value,
    config,
    projectFiles.value.length > 0 ? projectFiles.value : undefined
  );
  generatedPrompt.value = prompt;
  await copyToClipboard(prompt);
};

const handleFileUpload = (files: File[]) => {
  if (files.length === 0) return;
  
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
      const uploadedFiles = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (uploadedFiles && uploadedFiles.files) {
        const files = Array.from(uploadedFiles.files);
        loadFileContent(file, files);
      }
    }
  }
};

const loadFileContent = (file: FileNode, files: File[]) => {
  const uploadedFile = files.find(f => f.webkitRelativePath === file.path || f.name === file.name);
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

// const handleLanguageChange = (language: string) => {
//   selectedLanguage.value = language;
// };

// const handleConfigChange = (newConfig: any) => {
//   config.shitty_code_settings = newConfig.shitty_code_settings;
// };

const closeConfigModal = () => {
  showConfigModal.value = false;
};
</script>

<template>
  <div class="app">
    <Toolbar 
      :canConvert="canConvert" 
      @convert="handleConvert"
      @open-config="showConfigModal = true"
    />
    
    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 侧边栏 -->
      <div class="sidebar" v-if="projectFiles.length > 0">
        <FileTree 
          :files="projectFiles" 
          @file-select="handleFileSelect"
          :selected-path="selectedFilePath"
        />
      </div>
      
      <!-- 编辑器区域 -->
      <div class="editors">
        <div class="editor-container">
          <CodeEditor 
            v-model="sourceCode" 
            :language="selectedLanguage"
            :showUpload="true"
            title="源代码"
            @file-upload="handleFileUpload"
          />
        </div>
        <div class="editor-container">
          <MarkdownPreview 
            v-model="generatedPrompt" 
            title="生成的提示"
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
  width: 100%;
  height: calc(100vh - 60px);
}

.sidebar {
  width: 250px;
  min-width: 200px;
  overflow: auto;
  border-right: 1px solid #333;
  background-color: #1e1e1e;
  height: 100%;
}

.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 16px;
  height: 100%;
  box-sizing: border-box;
}

.editors {
  display: flex;
  flex: 1;
  gap: 16px;
  overflow: hidden;
  height: 100%;
  width: 100%;
}

.editor-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 400px;
  height: 100%;
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
  color: #888;
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
  
  .editor-container {
    width: 100%;
    height: calc(100% - 200px);
    padding: 8px;
  }
}
</style>
