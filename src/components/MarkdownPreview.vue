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
        <button @click="toggleCursorRules" class="action-button rules-button" v-if="cursorRules">
          <span class="button-icon">📜</span>
          {{ showCursorRules ? '显示提示词' : '显示 .cursorrules' }}
        </button>
        <div class="dropdown">
          <button @click="toggleModelDropdown" class="action-button model-button">
            <span class="button-icon">🤖</span>
            发送到大模型
            <span class="dropdown-icon">▼</span>
          </button>
          <div v-if="showModelDropdown" class="dropdown-content">
            <div 
              v-for="model in allModels" 
              :key="model.name" 
              class="dropdown-item"
              @click="sendToModel(model)"
            >
              <span>{{ model.name }}</span>
              <span v-if="!model.isDefault" class="dropdown-item-actions">
                <span class="edit-icon" @click.stop="editModel(model)">✏️</span>
                <span class="delete-icon" @click.stop="deleteModel(model)">🗑️</span>
              </span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item add-model" @click.stop="openAddModelModal">
              <span>➕ 添加自定义模型</span>
            </div>
          </div>
        </div>
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
    
    <!-- 添加/编辑模型对话框 -->
    <div v-if="showAddModelModal" class="modal-overlay" @click="closeAddModelModal">
      <div class="modal-dialog" @click.stop>
        <h3>{{ editingModel ? '编辑模型' : '添加自定义模型' }}</h3>
        <div class="form-group">
          <label for="modelName">模型名称</label>
          <input 
            type="text" 
            id="modelName" 
            v-model="newModel.name" 
            placeholder="例如: ChatGLM"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label for="modelUrl">模型URL</label>
          <input 
            type="text" 
            id="modelUrl" 
            v-model="newModel.url" 
            placeholder="例如: https://chatglm.cn/"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label for="modelPromptParam">URL参数名 (可选)</label>
          <input 
            type="text" 
            id="modelPromptParam" 
            v-model="newModel.promptParam" 
            placeholder="例如: prompt"
            class="form-input"
          />
        </div>
        <div class="form-actions">
          <button @click="closeAddModelModal" class="cancel-button">取消</button>
          <button @click="saveModel" class="save-button">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, defineProps, defineEmits } from 'vue';
import { marked } from 'marked';

// 定义模型接口
interface Model {
  name: string;
  url: string;
  promptParam: string;
  isDefault: boolean;
}

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: 'Markdown 预览'
  },
  cursorRules: {
    type: String,
    default: ''
  },
  showCursorRulesToggle: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

const localContent = ref(props.modelValue);
const isEditMode = ref(false);
const copyStatus = ref('');
const showModelDropdown = ref(false);
const showAddModelModal = ref(false);
const editingModel = ref<Model | null>(null);
const showCursorRules = ref(false);

// 切换显示 .cursorrules 文件
const toggleCursorRules = () => {
  showCursorRules.value = !showCursorRules.value;
  if (showCursorRules.value) {
    localContent.value = props.cursorRules;
  } else {
    localContent.value = props.modelValue;
  }
};

// 监听 cursorRules 属性变化
watch(() => props.cursorRules, (newValue) => {
  if (showCursorRules.value) {
    localContent.value = newValue;
  }
});

// 监听 modelValue 属性变化
watch(() => props.modelValue, (newValue) => {
  if (!showCursorRules.value) {
    localContent.value = newValue;
  }
});

// 默认模型列表
const defaultModels: Model[] = [
  {
    name: 'DeepSeek',
    url: 'https://chat.deepseek.com/',
    promptParam: '',
    isDefault: true
  },
  { 
    name: 'ChatGPT', 
    url: 'https://chat.openai.com/',
    promptParam: '',
    isDefault: true
  },
  { 
    name: 'Claude', 
    url: 'https://claude.ai/chats',
    promptParam: '',
    isDefault: true
  },
  {
    name: 'Gemini',
    url: 'https://gemini.google.com/',
    promptParam: '',
    isDefault: true
  },
  { 
    name: '文心一言', 
    url: 'https://yiyan.baidu.com/',
    promptParam: '',
    isDefault: true
  },
  { 
    name: '通义千问', 
    url: 'https://qianwen.aliyun.com/',
    promptParam: '',
    isDefault: true
  }
];

// 用户自定义模型
const customModels = ref<Model[]>([]);

// 新模型表单数据
const newModel = ref<Model>({
  name: '',
  url: '',
  promptParam: '',
  isDefault: false
});

// 合并默认模型和自定义模型
const allModels = computed((): Model[] => {
  return [...defaultModels, ...customModels.value];
});

// 从 LocalStorage 加载自定义模型
const loadCustomModels = (): void => {
  const savedModels = localStorage.getItem('shitcodify_custom_models');
  if (savedModels) {
    try {
      customModels.value = JSON.parse(savedModels);
    } catch (error) {
      console.error('加载自定义模型失败:', error);
      customModels.value = [];
    }
  }
};

// 保存自定义模型到 LocalStorage
const saveCustomModels = (): void => {
  localStorage.setItem('shitcodify_custom_models', JSON.stringify(customModels.value));
};

// 打开添加模型对话框
const openAddModelModal = (): void => {
  showAddModelModal.value = true;
  showModelDropdown.value = false;
};

// 添加或更新模型
const saveModel = (): void => {
  if (!newModel.value.name || !newModel.value.url) {
    copyStatus.value = '模型名称和URL不能为空';
    setTimeout(() => {
      copyStatus.value = '';
    }, 2000);
    return;
  }
  
  if (editingModel.value) {
    // 更新现有模型
    const index = customModels.value.findIndex(m => m.name === editingModel.value!.name);
    if (index !== -1) {
      customModels.value[index] = { ...newModel.value };
    }
  } else {
    // 添加新模型
    customModels.value.push({ ...newModel.value });
  }
  
  saveCustomModels();
  closeAddModelModal();
  
  // 显示成功消息
  copyStatus.value = editingModel.value ? '模型已更新！' : '模型已添加！';
  setTimeout(() => {
    copyStatus.value = '';
  }, 2000);
};

// 编辑模型
const editModel = (model: Model): void => {
  editingModel.value = model;
  newModel.value = { ...model };
  showAddModelModal.value = true;
  showModelDropdown.value = false;
};

// 删除模型
const deleteModel = (model: Model): void => {
  const index = customModels.value.findIndex(m => m.name === model.name);
  if (index !== -1) {
    customModels.value.splice(index, 1);
    saveCustomModels();
    
    // 显示成功消息
    copyStatus.value = '模型已删除！';
    setTimeout(() => {
      copyStatus.value = '';
    }, 2000);
  }
};

// 关闭添加模型对话框
const closeAddModelModal = (): void => {
  showAddModelModal.value = false;
  editingModel.value = null;
  newModel.value = {
    name: '',
    url: '',
    promptParam: '',
    isDefault: false
  };
};

const renderedMarkdown = computed(() => {
  try {
    return marked(localContent.value);
  } catch (error) {
    console.error('Markdown 渲染错误:', error);
    return '<div class="error">Markdown 渲染错误</div>';
  }
});

const updateContent = () => {
  if (!showCursorRules.value) {
    emit('update:modelValue', localContent.value);
  }
};

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value;
};

const copyContent = async () => {
  try {
    await navigator.clipboard.writeText(localContent.value);
    copyStatus.value = '复制成功！';
    setTimeout(() => {
      copyStatus.value = '';
    }, 2000);
  } catch (err) {
    copyStatus.value = '复制失败，请手动复制';
    console.error('复制失败:', err);
    setTimeout(() => {
      copyStatus.value = '';
    }, 2000);
  }
};

// 切换模型下拉菜单
const toggleModelDropdown = () => {
  showModelDropdown.value = !showModelDropdown.value;
};

// 点击外部关闭下拉菜单
const closeDropdownOnClickOutside = (event: MouseEvent) => {
  const dropdown = document.querySelector('.dropdown');
  if (dropdown && !dropdown.contains(event.target as Node) && showModelDropdown.value) {
    showModelDropdown.value = false;
  }
  
  const modal = document.querySelector('.modal-dialog');
  if (modal && !modal.contains(event.target as Node) && showAddModelModal.value && event.target !== document.querySelector('.modal-overlay')) {
    closeAddModelModal();
  }
};

const sendToModel = (model: Model): void => {
  let url = '';
  if (model.promptParam) {
    let param = encodeURIComponent(model.promptParam);
    url = `${model.url}?${param}=${localContent.value}`;
  } else {
    copyContent();
    copyStatus.value = '已复制到剪贴板！请在模型中粘贴';
    url = `${model.url}`;
  }
  window.open(url, '_blank');
  
  showModelDropdown.value = false;
};

const handleResize = () => {
};

// 初始化
onMounted(() => {
  window.addEventListener('resize', handleResize);
  document.addEventListener('click', closeDropdownOnClickOutside);
  loadCustomModels();
  
  // 调试信息
  console.log('组件已挂载');
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  document.removeEventListener('click', closeDropdownOnClickOutside);
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

.rules-button {
  background-color: #2c3e50;
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

.rules-button:hover {
  background-color: #34495e;
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
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  box-sizing: border-box;
  text-align: left;
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
  text-align: left;
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
  text-align: left;
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
  text-align: left;
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
  text-align: left;
}

.markdown-container :deep(li) {
  margin-top: 0.25em;
  text-align: left;
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
  text-align: left;
}

.markdown-container :deep(pre code) {
  background-color: transparent;
  padding: 0;
  margin: 0;
  font-size: 100%;
  word-break: normal;
  white-space: pre;
  overflow: visible;
  text-align: left;
}

.markdown-container :deep(blockquote) {
  padding: 0 1em;
  color: #8b949e;
  border-left: 0.25em solid #30363d;
  margin: 0 0 16px 0;
  text-align: left;
}

.markdown-container :deep(table) {
  display: block;
  width: 100%;
  overflow: auto;
  margin-top: 0;
  margin-bottom: 16px;
  border-spacing: 0;
  border-collapse: collapse;
  text-align: left;
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
  text-align: left;
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

/* 下拉菜单样式 */
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-icon {
  margin-left: 4px;
  font-size: 10px;
}

.dropdown-content {
  position: absolute;
  right: 0;
  top: 100%;
  background-color: #2a2a2a;
  min-width: 180px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  z-index: 1000;
  margin-top: 4px;
  overflow: hidden;
  border: 1px solid #333;
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  color: #e0e0e0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #3a3a3a;
}

.dropdown-item-actions {
  display: flex;
  gap: 8px;
  opacity: 0.7;
}

.dropdown-item:hover .dropdown-item-actions {
  opacity: 1;
}

.edit-icon, .delete-icon {
  cursor: pointer;
  font-size: 12px;
}

.edit-icon:hover {
  color: #58a6ff;
}

.delete-icon:hover {
  color: #f44336;
}

.dropdown-divider {
  height: 1px;
  background-color: #333;
  margin: 4px 0;
}

.add-model {
  color: #4caf50;
}

.model-button {
  background-color: #4caf50;
  color: white;
}

.model-button:hover {
  background-color: #45a049;
}

/* 模态对话框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-dialog {
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 20px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-dialog h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #e0e0e0;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #e0e0e0;
}

.form-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #333;
  border-radius: 4px;
  background-color: #1e1e1e;
  color: #e0e0e0;
  font-size: 14px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-button, .save-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.cancel-button {
  background-color: #4a4a4a;
  color: #e0e0e0;
}

.save-button {
  background-color: #4caf50;
  color: white;
}

.cancel-button:hover {
  background-color: #5a5a5a;
}

.save-button:hover {
  background-color: #45a049;
}
</style> 