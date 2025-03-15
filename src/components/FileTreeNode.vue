<template>
  <li class="tree-node">
    <div 
      class="node-content" 
      :class="{ 'is-directory': file.isDirectory, 'is-file': !file.isDirectory, 'is-selected': isSelected }"
      @click="handleClick"
    >
      <span class="node-icon">
        <svg v-if="file.isDirectory" class="folder-icon" viewBox="0 0 24 24" width="16" height="16">
          <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
        </svg>
        <svg v-else class="file-icon" viewBox="0 0 24 24" width="16" height="16">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
        </svg>
      </span>
      <span class="node-name">{{ file.name }}</span>
      <span v-if="file.isDirectory && file.children && file.children.length > 0" class="expand-icon">
        {{ isExpanded ? '▼' : '▶' }}
      </span>
    </div>
    <transition name="slide">
      <ul v-if="file.isDirectory && isExpanded && file.children && file.children.length > 0" class="node-children">
        <file-tree-node 
          v-for="child in file.children" 
          :key="child.path" 
          :file="child"
          :selected-path="selectedPath"
          @file-select="handleFileSelect"
        />
      </ul>
    </transition>
  </li>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue';
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

const emit = defineEmits(['file-select']);

// 默认展开目录
const isExpanded = ref(true);
const isSelected = computed(() => props.selectedPath === props.file.path);

const handleClick = () => {
  if (props.file.isDirectory) {
    isExpanded.value = !isExpanded.value;
  } else {
    emit('file-select', props.file);
  }
};

const handleFileSelect = (file: FileNode) => {
  emit('file-select', file);
};
</script>

<style scoped>
.tree-node {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.node-content {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  cursor: pointer;
  user-select: none;
  border-radius: 4px;
  margin: 2px 4px;
  transition: background-color 0.15s ease;
  position: relative;
}

.node-content:hover {
  background-color: #2a2a2a;
}

.is-selected {
  background-color: #3a3a3a;
  font-weight: bold;
}

.node-icon {
  margin-right: 8px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.folder-icon {
  fill: #e8c07d;
}

.file-icon {
  fill: #9cdcfe;
}

.node-name {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.expand-icon {
  font-size: 10px;
  color: #888;
  margin-left: 8px;
}

.node-children {
  padding-left: 16px;
  margin: 0;
  overflow: hidden;
}

.is-directory {
  font-weight: 500;
}

.is-file {
  font-weight: normal;
}

/* 动画效果 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  max-height: 1000px;
  opacity: 1;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}
</style> 