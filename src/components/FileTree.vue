<template>
  <div class="file-tree">
    <div class="file-tree-header">
      <h3>项目文件</h3>
    </div>
    <div class="file-tree-content">
      <div v-if="files.length === 0" class="empty-message">
        <div class="empty-icon">📁</div>
        <p>请上传文件或项目</p>
        <p class="empty-hint">支持单个文件或整个文件夹</p>
      </div>
      <ul v-else class="tree-root">
        <file-tree-node 
          v-for="file in rootFiles" 
          :key="file.path" 
          :file="file" 
          :selected-path="selectedPath"
          @file-select="handleFileSelect"
        />
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue';
import FileTreeNode from './FileTreeNode.vue';

export interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
  content?: string;
}

const props = defineProps({
  files: {
    type: Array as () => FileNode[],
    default: () => []
  },
  selectedPath: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['file-select']);

const rootFiles = computed(() => {
  return props.files;
});

const handleFileSelect = (file: FileNode) => {
  emit('file-select', file);
};
</script>

<style scoped>
.file-tree {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #333;
  border-radius: 6px;
  overflow: hidden;
  background-color: #1e1e1e;
  color: #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.file-tree-header {
  padding: 10px 16px;
  background-color: #2a2a2a;
  border-bottom: 1px solid #333;
}

.file-tree-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.file-tree-content {
  flex: 1;
  overflow: auto;
  padding: 8px 0;
}

.empty-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
  color: #888;
  height: 100%;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-message p {
  margin: 4px 0;
  font-size: 14px;
}

.empty-hint {
  font-size: 12px;
  opacity: 0.7;
}

.tree-root {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
</style> 