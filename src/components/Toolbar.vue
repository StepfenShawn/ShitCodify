<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <div class="logo">
        <img src="../assets/logo.svg" alt="ShitCodify Logo" class="logo-img" />
        <span class="logo-text">屎山代码生成器</span>
      </div>
    </div>
    <div class="toolbar-center">
      <button 
        class="config-button" 
        @click="handleOpenConfig"
      >
        <span class="button-icon">⚙️</span>
        配置
      </button>
      <button 
        class="convert-button" 
        @click="handleConvert" 
        :disabled="!canConvert"
      >
        <span class="button-icon">🔄</span>
        转换代码
      </button>
      <div class="copy-status" v-if="copyStatus">{{ copyStatus }}</div>
    </div>
    <div class="toolbar-right">
      <a href="https://github.com/StepfenShawn/ShitCodify" target="_blank" class="github-link">
        <svg class="github-icon" viewBox="0 0 24 24" width="24" height="24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps } from 'vue';

const props = defineProps({
  canConvert: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['convert', 'open-config']);

const copyStatus = ref('');

const handleConvert = () => {
  emit('convert');
  copyStatus.value = '已复制到剪贴板！';
  setTimeout(() => {
    copyStatus.value = '';
  }, 2000);
};

const handleOpenConfig = () => {
  emit('open-config');
};
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: #1e1e1e;
  border-bottom: 1px solid #333;
  height: 60px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 10;
}

.toolbar-left,
.toolbar-center,
.toolbar-right {
  display: flex;
  align-items: center;
}

.toolbar-center {
  gap: 12px;
}

.logo {
  display: flex;
  align-items: center;
}

.logo-img {
  height: 40px;
  margin-right: 12px;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: #e0e0e0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.convert-button {
  background-color: #8e44ad;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.config-button {
  background-color: #2c3e50;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.button-icon {
  margin-right: 8px;
  font-size: 18px;
}

.convert-button:hover:not(:disabled),
.config-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.convert-button:hover:not(:disabled) {
  background-color: #9b59b6;
}

.config-button:hover {
  background-color: #34495e;
}

.convert-button:active:not(:disabled),
.config-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.convert-button:disabled {
  background-color: #555;
  color: #888;
  cursor: not-allowed;
  box-shadow: none;
}

.copy-status {
  margin-left: 16px;
  color: #4caf50;
  font-size: 14px;
  font-weight: bold;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.github-link {
  color: #e0e0e0;
  text-decoration: none;
  transition: transform 0.2s ease;
  display: block;
}

.github-link:hover {
  transform: scale(1.1);
}

.github-icon {
  fill: #e0e0e0;
}

@media (max-width: 768px) {
  .logo-text {
    font-size: 16px;
  }
  
  .convert-button,
  .config-button {
    padding: 8px 12px;
    font-size: 14px;
  }
  
  .logo-img {
    height: 32px;
  }
  
  .toolbar-center {
    gap: 8px;
  }
  
  .button-icon {
    font-size: 16px;
    margin-right: 6px;
  }
  
  .copy-status {
    display: none;
  }
}

@media (max-width: 480px) {
  .logo-text {
    display: none;
  }
  
  .button-icon {
    margin-right: 0;
  }
  
  .convert-button span:not(.button-icon),
  .config-button span:not(.button-icon) {
    display: none;
  }
  
  .convert-button,
  .config-button {
    padding: 8px;
  }
}
</style> 