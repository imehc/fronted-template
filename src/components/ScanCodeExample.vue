<template>
  <div class="max-w-4xl mx-auto p-5">
    <h2 class="text-3xl font-semibold mb-6 text-gray-800">扫码枪示例</h2>

    <!-- 配置区域 -->
    <div class="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
      <h3 class="text-xl font-semibold mb-4 text-gray-700">配置</h3>
      <div class="flex items-center gap-3 mb-4">
        <label class="flex items-center gap-2">
          <input type="checkbox" v-model="config.autoEnter" @change="updateConfig"
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500">
          自动回车
        </label>
      </div>

      <div class="flex items-center gap-3 mb-4">
        <label class="min-w-24 font-medium text-gray-700">扫码枪类型:</label>
        <select v-model="config.type" @change="updateConfig"
          class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option value="default">默认</option>
        </select>
      </div>

      <div class="flex items-center gap-3 mb-4">
        <label class="min-w-24 font-medium text-gray-700">超时时间(ms):</label>
        <input type="number" v-model="config.timeout" @change="updateConfig" min="50" max="1000"
          class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-32">
      </div>

      <div class="flex items-center gap-3 mb-4">
        <label class="min-w-24 font-medium text-gray-700">最大长度:</label>
        <input type="number" v-model="config.maxLength" @change="updateConfig" min="1"
          class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-32">
      </div>

      <div class="flex items-center gap-3 mb-6">
        <label class="flex items-center gap-2">
          <input type="checkbox" v-model="config.debug" @change="updateConfig"
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500">
          调试模式
        </label>
      </div>

      <!-- 前缀验证配置 -->
      <div class="flex items-center gap-3 mb-4">
        <label class="min-w-24 font-medium text-gray-700">允许的前缀:</label>
        <input type="text" v-model="prefixInput" @keydown.enter="addPrefix" placeholder="输入前缀后按回车添加"
          class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        <button @click="addPrefix"
          class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm">添加</button>
      </div>

      <div v-if="config.allowedPrefixes && config.allowedPrefixes.length > 0" class="mb-6">
        <label class="block font-medium text-gray-700 mb-2">当前前缀列表:</label>
        <div class="flex flex-wrap gap-2">
          <span v-for="(prefix, index) in config.allowedPrefixes" :key="index"
            class="inline-flex items-center bg-gray-100 border border-gray-300 rounded-full px-3 py-1 text-sm text-gray-700">
            {{ prefix }}
            <button @click="removePrefix(index)"
              class="ml-2 text-red-500 hover:text-red-700 font-bold text-lg leading-none">×</button>
          </span>
        </div>
      </div>

      <div class="flex items-center gap-3 mb-6">
        <label class="flex items-center gap-2">
          <input type="checkbox" v-model="config.strictPrefix" @change="updateConfig"
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500">
          严格前缀匹配（必须以前缀开头）
        </label>
      </div>

      <!-- 正则表达式验证配置 -->
      <div class="flex items-center gap-3 mb-4">
        <label class="min-w-24 font-medium text-gray-700">允许的正则表达式:</label>
        <input type="text" v-model="patternInput" @keydown.enter="addPattern" placeholder="输入正则表达式后按回车添加"
          class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        <button @click="addPattern"
          class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm">添加</button>
      </div>

      <div v-if="config.allowedPatterns && config.allowedPatterns.length > 0">
        <label class="block font-medium text-gray-700 mb-2">当前正则表达式列表:</label>
        <div class="flex flex-wrap gap-2">
          <span v-for="(pattern, index) in config.allowedPatterns" :key="index"
            class="inline-flex items-center bg-gray-100 border border-gray-300 rounded-full px-3 py-1 text-sm text-gray-700">
            {{ pattern.source }}
            <button @click="removePattern(index)"
              class="ml-2 text-red-500 hover:text-red-700 font-bold text-lg leading-none">×</button>
          </span>
        </div>
      </div>
    </div>

    <!-- 扫码区域 -->
    <div class="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
      <h3 class="text-xl font-semibold mb-4 text-gray-700">扫码区域</h3>
      <div
        class="min-h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        tabindex="0" @keydown="handleKeyEvent" @focus="onFocus" @blur="onBlur"
        :class="{ 'border-blue-500 bg-blue-50': isFocused }">
        <div v-if="isScanning" class="text-blue-600 font-semibold">
          <span>正在扫码...</span>
        </div>
        <div v-else class="text-gray-500 italic">
          点击此处并扫描条码
        </div>
      </div>
    </div>

    <!-- 结果显示 -->
    <div class="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
      <h3 class="text-xl font-semibold mb-4 text-gray-700">扫码结果</h3>
      <div v-if="scanData" class="bg-white p-4 rounded-lg border border-gray-200">
        <div class="mb-3 pb-3 border-b border-gray-100">
          <strong class="text-gray-700">原始数据:</strong> <span class="text-gray-900">{{ scanData.rawData }}</span>
        </div>
        <div class="mb-3 pb-3 border-b border-gray-100">
          <strong class="text-gray-700">处理后数据:</strong> <span class="text-gray-900">{{ scanData.processedData }}</span>
        </div>
        <div class="mb-3 pb-3 border-b border-gray-100">
          <strong class="text-gray-700">扫码枪类型:</strong> <span class="text-gray-900">{{ scanData.gunType }}</span>
        </div>
        <div class="mb-3 pb-3 border-b border-gray-100">
          <strong class="text-gray-700">时间戳:</strong> <span class="text-gray-900">{{ new
            Date(scanData.timestamp).toLocaleString() }}</span>
        </div>
        <div class="mb-3 pb-3 border-b border-gray-100">
          <strong class="text-gray-700">状态:</strong>
          <span
            :class="{ 'text-green-600 font-semibold': scanData.isValid, 'text-red-600 font-semibold': !scanData.isValid }">
            {{ scanData.isValid ? '有效' : '无效' }}
          </span>
        </div>
        <div v-if="scanData.error" class="text-red-600 bg-red-50 p-3 rounded border border-red-200">
          <strong>错误:</strong> {{ scanData.error }}
        </div>
      </div>
      <div v-else class="text-gray-500 italic text-center py-8">
        暂无扫码数据
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex gap-4">
      <button @click="clearBuffer"
        class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">清空缓冲区</button>
      <button @click="showConfig"
        class="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium">显示配置</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useScanCodeGun, type ScanCodeGunConfig } from '../utils/scan-code-gun';

// 扫码枪配置
const config = reactive<ScanCodeGunConfig>({
  autoEnter: true,
  type: 'default',
  timeout: 100,
  debug: false,
  maxLength: 50,
  allowedPrefixes: [],
  allowedPatterns: [],
  strictPrefix: false
});

// 输入框的响应式变量
const prefixInput = ref('');
const patternInput = ref('');

// 使用扫码枪工具
const {
  scanData,
  isScanning,
  handleKeyEvent,
  updateConfig: updateScanConfig,
  clearBuffer,
  getConfig
} = useScanCodeGun(config);

// 焦点状态
const isFocused = ref(false);

// 更新配置
const updateConfig = () => {
  updateScanConfig(config);
};

// 添加前缀
const addPrefix = () => {
  if (prefixInput.value.trim()) {
    if (!config.allowedPrefixes) {
      config.allowedPrefixes = [];
    }
    if (!config.allowedPrefixes.includes(prefixInput.value.trim())) {
      config.allowedPrefixes.push(prefixInput.value.trim());
      updateConfig();
    }
    prefixInput.value = '';
  }
};

// 移除前缀
const removePrefix = (index: number) => {
  if (config.allowedPrefixes) {
    config.allowedPrefixes.splice(index, 1);
    updateConfig();
  }
};

// 添加正则表达式
const addPattern = () => {
  if (patternInput.value.trim()) {
    try {
      const pattern = new RegExp(patternInput.value.trim());
      if (!config.allowedPatterns) {
        config.allowedPatterns = [];
      }
      // 检查是否已存在相同的正则表达式
      const exists = config.allowedPatterns.some(p => p.source === pattern.source);
      if (!exists) {
        config.allowedPatterns.push(pattern);
        updateConfig();
      }
      patternInput.value = '';
    } catch (error) {
      alert('无效的正则表达式: ' + patternInput.value);
    }
  }
};

// 移除正则表达式
const removePattern = (index: number) => {
  if (config.allowedPatterns) {
    config.allowedPatterns.splice(index, 1);
    updateConfig();
  }
};

// 焦点事件
const onFocus = () => {
  isFocused.value = true;
};

const onBlur = () => {
  isFocused.value = false;
};

// 显示配置
const showConfig = () => {
  console.log('当前配置:', getConfig());
  alert('配置已输出到控制台');
};
</script>