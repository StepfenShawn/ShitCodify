<template>
  <div class="config-panel">
    <div class="config-header">
      <h3>配置选项</h3>
      <button class="toggle-button" @click="isExpanded = !isExpanded">
        {{ isExpanded ? '收起' : '展开' }}
      </button>
    </div>
    <div class="config-content" v-if="isExpanded">
      <div class="config-grid">
        <div class="config-section">
          <h4>转换级别</h4>
          <div class="config-option">
            <select v-model="localConfig.shitty_code_settings.transformation_level">
              <option value="low">低 (轻微混乱)</option>
              <option value="medium">中 (适度混乱)</option>
              <option value="high">高 (严重混乱)</option>
              <option value="extreme">极端 (完全混乱)</option>
            </select>
          </div>
        </div>

        <div class="config-section">
          <h4>语言</h4>
          <div class="config-option">
            <select v-model="localSelectedLanguage">
              <option value="auto">自动检测</option>
              <option value="rust">Rust</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="go">Go</option>
            </select>
          </div>
        </div>

        <div class="config-section">
          <h4>注释风格</h4>
          <div class="config-option">
            <select v-model="localConfig.shitty_code_settings.comment_style">
              <option value="confusing">混淆型 (误导性注释)</option>
              <option value="outdated">过时型 (与代码不符)</option>
              <option value="excessive">过度型 (过多无用注释)</option>
              <option value="minimal">最小型 (几乎没有注释)</option>
            </select>
          </div>
        </div>

        <div class="config-section">
          <h4>变量命名风格</h4>
          <div class="config-option">
            <select v-model="localConfig.shitty_code_settings.variable_naming_style">
              <option value="misleading">误导型 (名不符实)</option>
              <option value="terse">简短型 (单字母或过短)</option>
              <option value="verbose">冗长型 (过长且复杂)</option>
              <option value="mixed">混合型 (混合多种命名风格)</option>
              <option value="pinyin">拼音型 (使用拼音命名)</option>
            </select>
          </div>
        </div>
      </div>

      <div class="config-section full-width">
        <h4>转换技术</h4>
        <div class="config-option checkbox-grid">
          <label v-for="technique in availableTechniques" :key="technique.value">
            <input 
              type="checkbox" 
              :value="technique.value" 
              v-model="localConfig.shitty_code_settings.transformation_techniques"
            >
            {{ technique.label }}
          </label>
        </div>
      </div>

      <div class="config-section full-width">
        <h4>其他选项</h4>
        <div class="config-option checkbox-grid">
          <label>
            <input type="checkbox" v-model="localConfig.shitty_code_settings.preserve_functionality">
            保持功能不变
          </label>
          <label>
            <input type="checkbox" v-model="localConfig.shitty_code_settings.add_easter_eggs">
            添加彩蛋
          </label>
          <label>
            <input type="checkbox" v-model="localConfig.shitty_code_settings.language_specific_techniques">
            使用语言特定技巧
          </label>
          <label>
            <input type="checkbox" v-model="localConfig.shitty_code_settings.code_only_output">
            只输出代码
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  selectedLanguage: {
    type: String,
    default: 'auto'
  },
  config: {
    type: Object,
    default: () => ({
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
    })
  }
});

const emit = defineEmits(['update:selectedLanguage', 'update:config']);

// 本地状态，用于双向绑定
const localSelectedLanguage = computed({
  get: () => props.selectedLanguage,
  set: (value) => emit('update:selectedLanguage', value)
});

const localConfig = computed({
  get: () => props.config,
  set: (value) => emit('update:config', value)
});

const isExpanded = ref(true);

const availableTechniques = [
  { label: '变量命名', value: 'variable_naming' },
  { label: '代码结构', value: 'code_structure' },
  { label: '注释', value: 'comments' },
  { label: '错误处理', value: 'error_handling' },
  { label: '性能', value: 'performance' },
  { label: '可读性', value: 'readability' }
];
</script>

<style scoped>
.config-panel {
  display: flex;
  flex-direction: column;
  border: 1px solid #333;
  border-radius: 4px;
  overflow: hidden;
  background-color: #1e1e1e;
  color: #e0e0e0;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background-color: #2a2a2a;
  border-bottom: 1px solid #333;
}

.config-header h3 {
  margin: 0;
  font-size: 16px;
  color: #e0e0e0;
}

.toggle-button {
  background-color: #4a4a4a;
  color: #e0e0e0;
  border: none;
  border-radius: 4px;
  padding: 4px 10px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
}

.toggle-button:hover {
  background-color: #5a5a5a;
}

.config-content {
  padding: 16px;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.config-section {
  margin-bottom: 16px;
}

.full-width {
  grid-column: 1 / -1;
}

.config-section h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #9cdcfe;
}

.config-option {
  margin-bottom: 8px;
}

.config-option select,
.config-option input[type="text"] {
  width: 100%;
  padding: 8px 10px;
  background-color: #2d2d2d;
  color: #e0e0e0;
  border: 1px solid #3d3d3d;
  border-radius: 4px;
  font-size: 13px;
}

.config-option select:focus,
.config-option input[type="text"]:focus {
  outline: none;
  border-color: #9cdcfe;
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
}

.checkbox-grid label {
  display: flex;
  align-items: center;
  font-size: 13px;
}

.checkbox-grid input[type="checkbox"] {
  margin-right: 8px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .config-grid {
    grid-template-columns: 1fr;
  }
  
  .checkbox-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style> 