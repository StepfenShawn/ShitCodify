<template>
  <div class="markdown-preview">
    <div class="preview-header">
      <h3>{{ title }}</h3>
      <div class="preview-actions">
        <button @click="toggleEditMode" class="action-button edit-button">
          <span class="button-icon">{{ isEditMode ? '👁️' : '✏️' }}</span>
          {{ isEditMode ? '预览' : '编辑' }}
        </button>
        <button @click="copyContent" class="action-button copy-button">
          <span class="button-icon">📋</span>
          复制
        </button>
      </div>
    </div>
    <div class="preview-content">
      <div v-if="isEditMode" class="editor-container">
        <textarea 
          v-model="localContent" 
          class="markdown-editor"
          @input="updateContent"
        ></textarea>
      </div>
      <div v-else class="markdown-container" v-html="renderedMarkdown"></div>
    </div>
    <div v-if="copyStatus" class="copy-status">{{ copyStatus }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, defineProps, defineEmits } from 'vue';
import { marked } from 'marked';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: 'Markdown 预览'
  }
});

const emit = defineEmits(['update:modelValue']);

const localContent = ref(props.modelValue);
const isEditMode = ref(false);
const copyStatus = ref('');

// 监听 props 变化
watch(() => props.modelValue, (newValue) => {
  localContent.value = newValue;
});

// 渲染 Markdown
const renderedMarkdown = computed(() => {
  try {
    return marked(localContent.value);
  } catch (error) {
    console.error('Markdown 渲染错误:', error);
    return '<div class="error">Markdown 渲染错误</div>';
  }
});

// 更新内容
const updateContent = () => {
  emit('update:modelValue', localContent.value);
};

// 切换编辑模式
const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value;
};

// 复制内容
const copyContent = async () => {
  try {
    await navigator.clipboard.writeText(localContent.value);
    copyStatus.value = '已复制到剪贴板！';
    setTimeout(() => {
      copyStatus.value = '';
    }, 2000);
  } catch (error) {
    console.error('复制失败:', error);
    copyStatus.value = '复制失败，请手动复制';
    setTimeout(() => {
      copyStatus.value = '';
    }, 2000);
  }
};

// 初始化
onMounted(() => {
  // 可以在这里添加初始化逻辑
});
</script>

<style scoped>
.markdown-preview {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #333;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  background-color: #1e1e1e;
  position: relative;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background-color: #2a2a2a;
  border-bottom: 1px solid #333;
}

.preview-header h3 {
  margin: 0;
  color: #e0e0e0;
  font-size: 16px;
  font-weight: 500;
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.action-button {
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

.edit-button {
  background-color: #2c3e50;
}

.copy-button {
  background-color: #8e44ad;
}

.button-icon {
  margin-right: 6px;
  font-size: 14px;
}

.action-button:hover {
  transform: translateY(-1px);
}

.edit-button:hover {
  background-color: #34495e;
}

.copy-button:hover {
  background-color: #9b59b6;
}

.action-button:active {
  transform: translateY(0);
}

.preview-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
  width: 100%;
  height: calc(100% - 50px);
  box-sizing: border-box;
}

.markdown-editor {
  width: 100%;
  height: 100%;
  min-height: 300px;
  background-color: #1e1e1e;
  color: #e0e0e0;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 12px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  box-sizing: border-box;
}

.editor-container {
  width: 100%;
  height: 100%;
}

.markdown-container {
  color: #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  width: 100%;
}

/* Markdown 样式 */
.markdown-container :deep(h1),
.markdown-container :deep(h2),
.markdown-container :deep(h3),
.markdown-container :deep(h4),
.markdown-container :deep(h5),
.markdown-container :deep(h6) {
  color: #e0e0e0;
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-container :deep(h1) {
  font-size: 2em;
  border-bottom: 1px solid #333;
  padding-bottom: 0.3em;
}

.markdown-container :deep(h2) {
  font-size: 1.5em;
  border-bottom: 1px solid #333;
  padding-bottom: 0.3em;
}

.markdown-container :deep(h3) {
  font-size: 1.25em;
}

.markdown-container :deep(h4) {
  font-size: 1em;
}

.markdown-container :deep(p) {
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-container :deep(a) {
  color: #58a6ff;
  text-decoration: none;
}

.markdown-container :deep(a:hover) {
  text-decoration: underline;
}

.markdown-container :deep(ul),
.markdown-container :deep(ol) {
  padding-left: 2em;
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-container :deep(li) {
  margin-top: 0.25em;
}

.markdown-container :deep(code) {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(110, 118, 129, 0.4);
  border-radius: 3px;
}

.markdown-container :deep(pre) {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #2a2a2a;
  border-radius: 6px;
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-container :deep(pre code) {
  background-color: transparent;
  padding: 0;
  margin: 0;
  font-size: 100%;
  word-break: normal;
  white-space: pre;
  overflow: visible;
}

.markdown-container :deep(blockquote) {
  padding: 0 1em;
  color: #8b949e;
  border-left: 0.25em solid #30363d;
  margin: 0 0 16px 0;
}

.markdown-container :deep(table) {
  display: block;
  width: 100%;
  overflow: auto;
  margin-top: 0;
  margin-bottom: 16px;
  border-spacing: 0;
  border-collapse: collapse;
}

.markdown-container :deep(table tr) {
  background-color: #1e1e1e;
  border-top: 1px solid #30363d;
}

.markdown-container :deep(table tr:nth-child(2n)) {
  background-color: #2a2a2a;
}

.markdown-container :deep(table th),
.markdown-container :deep(table td) {
  padding: 6px 13px;
  border: 1px solid #30363d;
}

.markdown-container :deep(table th) {
  font-weight: 600;
}

.copy-status {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #4caf50;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 768px) {
  .preview-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .preview-actions {
    width: 100%;
  }
  
  .action-button {
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
  .action-button span:not(.button-icon) {
    display: none;
  }
  
  .button-icon {
    margin-right: 0;
    font-size: 16px;
  }
  
  .preview-content {
    padding: 8px;
  }
}
</style> 