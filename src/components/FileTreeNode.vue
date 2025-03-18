<template>
  <li class="file-tree-node">
    <div 
      class="node-content"
      :class="{ 
        'selected': file.path === selectedPath,
        'directory': file.isDirectory,
        'file': !file.isDirectory
      }"
      @click="handleClick"
    >
      <span 
        v-if="file.isDirectory" 
        class="folder-toggle"
        @click.stop="toggleExpanded"
      >
        {{ expanded ? '▼' : '▶' }}
      </span>
      <span class="node-icon">
        {{ file.isDirectory ? (expanded ? '📂' : '📁') : '📄' }}
      </span>
      <span class="node-name">{{ file.name }}</span>
      <div class="node-actions">
        <button 
          class="action-button edit-button"
          @click.stop="handleEdit"
          title="编辑文件"
          v-if="!file.isDirectory"
        >
          ✏️
        </button>
        <button 
          class="action-button remove-button"
          @click.stop="handleRemove"
          title="删除"
        >
          🗑️
        </button>
      </div>
    </div>
    <ul v-if="file.isDirectory && file.children && expanded" class="node-children">
      <file-tree-node
        v-for="child in file.children"
        :key="child.path"
        :file="child"
        :selected-path="selectedPath"
        @file-select="$emit('file-select', $event)"
        @file-remove="$emit('file-remove', $event)"
        @file-edit="$emit('file-edit', $event)"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref } from 'vue';
import type { FileNode } from './FileTree.vue';

const props = defineProps({
  file: {
    type: Object as () => FileNode,
    required: true
  },
  selectedPath: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['file-select', 'file-remove', 'file-edit']);

// 默认展开文件夹
const expanded = ref(true);

const toggleExpanded = () => {
  expanded.value = !expanded.value;
};

const handleClick = () => {
  if (props.file.isDirectory) {
    toggleExpanded();
  } else {
    emit('file-select', props.file);
  }
};

const handleEdit = () => {
  emit('file-edit', props.file);
};

const handleRemove = () => {
  emit('file-remove', props.file);
};
</script>

<style scoped>
.file-tree-node {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.node-content {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  cursor: pointer;
  user-select: none;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.node-content:hover {
  background-color: #2a2a2a;
}

.node-content.selected {
  background-color: #3a3a3a;
}

.node-icon {
  margin-right: 8px;
  font-size: 16px;
}

.folder-toggle {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  margin-right: 4px;
  color: #aaa;
  transition: transform 0.2s;
}

.node-name {
  flex: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.node-content:hover .node-actions {
  opacity: 1;
}

.action-button {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  font-size: 14px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.action-button:hover {
  background-color: #4a4a4a;
}

.edit-button:hover {
  background-color: #2c3e50;
}

.remove-button:hover {
  background-color: #c0392b;
}

.node-children {
  list-style-type: none;
  padding-left: 20px;
  margin: 0;
}

.directory {
  font-weight: 500;
}

.file {
  font-weight: normal;
}
</style> 