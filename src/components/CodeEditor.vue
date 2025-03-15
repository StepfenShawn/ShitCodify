<template>
  <div class="code-editor">
    <div class="editor-header">
      <h3>{{ title }}</h3>
      <div class="editor-actions">
        <button v-if="showUpload" @click="triggerFileUpload" class="upload-button">
          <span class="button-icon">📄</span>
          上传文件
        </button>
        <button v-if="showUpload" @click="triggerFolderUpload" class="upload-button folder-button">
          <span class="button-icon">📁</span>
          上传文件夹
        </button>
        <input 
          type="file" 
          ref="fileInput" 
          style="display: none" 
          @change="handleFileUpload" 
          :accept="accept"
          :multiple="multiple"
        />
        <input 
          type="file" 
          ref="folderInput" 
          style="display: none" 
          @change="handleFileUpload" 
          webkitdirectory 
          directory
          multiple
        />
      </div>
    </div>
    <div class="editor-content" ref="editorContainer"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, defineProps, defineEmits } from 'vue';
import * as monaco from 'monaco-editor';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'javascript'
  },
  title: {
    type: String,
    default: '代码编辑器'
  },
  readOnly: {
    type: Boolean,
    default: false
  },
  showUpload: {
    type: Boolean,
    default: false
  },
  accept: {
    type: String,
    default: '.js,.ts,.py,.java,.cpp,.rs,.go'
  },
  multiple: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'file-upload']);

const editorContainer = ref<HTMLElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const folderInput = ref<HTMLInputElement | null>(null);
let editor: monaco.editor.IStandaloneCodeEditor | null = null;

onMounted(() => {
  if (editorContainer.value) {
    editor = monaco.editor.create(editorContainer.value, {
      value: props.modelValue,
      language: props.language,
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      readOnly: props.readOnly,
      fontSize: 14,
      lineNumbers: 'on',
      renderLineHighlight: 'all',
      tabSize: 2,
      wordWrap: 'on',
      padding: { top: 10 }
    });

    editor.onDidChangeModelContent(() => {
      if (editor) {
        emit('update:modelValue', editor.getValue());
      }
    });
  }
});

watch(() => props.modelValue, (newValue) => {
  if (editor && newValue !== editor.getValue()) {
    editor.setValue(newValue);
  }
});

watch(() => props.language, (newValue) => {
  if (editor) {
    monaco.editor.setModelLanguage(editor.getModel()!, newValue);
  }
});

const triggerFileUpload = () => {
  fileInput.value?.click();
};

const triggerFolderUpload = () => {
  folderInput.value?.click();
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const files = Array.from(target.files);
    emit('file-upload', files);
    
    // 如果只上传单个文件，直接读取内容到编辑器
    if (files.length === 1 && !files[0].webkitRelativePath) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (editor && e.target?.result) {
          editor.setValue(e.target.result as string);
        }
      };
      reader.readAsText(file);
    }
    
    // 重置文件输入，以便可以再次上传相同的文件
    target.value = '';
  }
};
</script>

<style scoped>
.code-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #333;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  background-color: #1e1e1e;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background-color: #2a2a2a;
  border-bottom: 1px solid #333;
}

.editor-header h3 {
  margin: 0;
  color: #e0e0e0;
  font-size: 16px;
  font-weight: 500;
}

.editor-actions {
  display: flex;
  gap: 8px;
}

.upload-button {
  display: flex;
  align-items: center;
  background-color: #4a4a4a;
  color: #e0e0e0;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
}

.folder-button {
  background-color: #2c3e50;
}

.button-icon {
  margin-right: 6px;
  font-size: 14px;
}

.upload-button:hover {
  background-color: #5a5a5a;
  transform: translateY(-1px);
}

.folder-button:hover {
  background-color: #34495e;
}

.upload-button:active {
  transform: translateY(0);
}

.editor-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* 确保 Monaco 编辑器正确填充容器 */
:deep(.monaco-editor) {
  width: 100% !important;
  height: 100% !important;
}

@media (max-width: 768px) {
  .editor-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .editor-actions {
    width: 100%;
  }
  
  .upload-button {
    flex: 1;
    justify-content: center;
    padding: 8px;
  }
  
  .button-icon {
    margin-right: 4px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .upload-button span:not(.button-icon) {
    display: none;
  }
  
  .button-icon {
    margin-right: 0;
    font-size: 16px;
  }
}
</style> 