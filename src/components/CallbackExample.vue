<template>
  <div class="max-w-6xl mx-auto p-5">
    <h2 class="text-3xl font-semibold mb-6 text-gray-800">扫码枪回调函数示例</h2>

    <div class="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
      <h3 class="text-xl font-semibold mb-4 text-gray-700">配置选项</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="flex items-center gap-2">
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="config.autoEnter"
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
            自动回车
          </label>
        </div>
        <div class="flex items-center gap-3">
          <label class="min-w-16 font-medium text-gray-700">前缀:</label>
          <input type="text" v-model="config.prefix" placeholder="可选前缀"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div class="flex items-center gap-3">
          <label class="min-w-16 font-medium text-gray-700">后缀:</label>
          <input type="text" v-model="config.suffix" placeholder="可选后缀"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div class="flex items-center gap-3">
          <label class="min-w-16 font-medium text-gray-700">最大长度:</label>
          <input type="number" v-model="config.maxLength" min="1" max="100"
            class="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div class="flex items-center gap-2">
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="config.debug"
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
            调试模式
          </label>
        </div>
        <div class="flex items-center gap-2">
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="config.enableScannerDetection"
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
            启用扫码枪识别
          </label>
        </div>
      </div>
    </div>

    <div class="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
      <h3 class="text-xl font-semibold mb-4 text-gray-700">扫码区域</h3>
      <div ref="scanArea"
        class="min-h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        tabindex="0" @focus="handleFocus" @blur="handleBlur" @keydown="handleKeyEvent">
        <div class="text-center">
          <div class="text-4xl mb-2">📱</div>
          <div class="text-gray-600 mb-2">点击此处开始扫码</div>
          <div v-if="isListening" class="flex items-center justify-center gap-2 text-blue-600">
            <span class="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
            正在监听扫码...
          </div>
        </div>
      </div>
    </div>

    <div class="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
      <h3 class="text-xl font-semibold mb-4 text-gray-700">扫码结果</h3>
      <div class="flex justify-between items-center mb-4">
        <span class="text-gray-600">共 {{ scanResults.length }} 条记录</span>
        <button @click="clearResults"
          class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm">清空结果</button>
      </div>
      <div class="space-y-3 max-h-96 overflow-y-auto">
        <div v-for="(result, index) in scanResults" :key="index" class="p-4 rounded-lg border"
          :class="{ 'bg-green-50 border-green-200': result.isValid, 'bg-red-50 border-red-200': !result.isValid }">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium text-gray-500">#{{ index + 1 }}</span>
            <span class="text-sm text-gray-500">{{ formatTime(result.timestamp) }}</span>
            <span class="px-2 py-1 rounded-full text-xs font-medium"
              :class="{ 'bg-green-100 text-green-800': result.isValid, 'bg-red-100 text-red-800': !result.isValid }">
              {{ result.isValid ? '成功' : '失败' }}
            </span>
          </div>
          <div class="space-y-1">
            <div class="text-sm">
              <strong class="text-gray-700">原始数据:</strong> <span class="text-gray-900">{{ result.rawData }}</span>
            </div>
            <div v-if="result.processedData !== result.rawData" class="text-sm">
              <strong class="text-gray-700">处理后:</strong> <span class="text-gray-900">{{ result.processedData }}</span>
            </div>
            <div class="flex gap-4 text-xs text-gray-500">
              <span>类型: {{ result.gunType }}</span>
              <span v-if="result.error" class="text-red-600">错误: {{ result.error }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
      <h3 class="text-xl font-semibold mb-4 text-gray-700">回调函数日志</h3>
      <div class="space-y-2 max-h-64 overflow-y-auto mb-4">
        <div v-for="(log, index) in callbackLogs" :key="index" class="p-3 rounded-lg text-sm"
          :class="{ 'bg-green-50 border border-green-200': log.type === 'success', 'bg-red-50 border border-red-200': log.type === 'error' }">
          <div class="flex items-center gap-3">
            <span class="text-gray-500 text-xs">{{ formatTime(log.timestamp) }}</span>
            <span class="px-2 py-1 rounded-full text-xs font-medium"
              :class="{ 'bg-green-100 text-green-800': log.type === 'success', 'bg-red-100 text-red-800': log.type === 'error' }">
              {{ log.type === 'success' ? '成功' : '错误' }}
            </span>
            <span class="text-gray-700">{{ log.message }}</span>
          </div>
        </div>
      </div>
      <button @click="clearCallbackLogs"
        class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm">清空日志</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { ScanCodeGunManager, type ScanCodeData } from '../utils/scan-code-gun';

// 扫码枪实例
let scanCodeGun: ScanCodeGunManager | null = null;

// 响应式数据
const isListening = ref(false);
const scanArea = ref<HTMLElement>();

// 扫码配置
const config = reactive({
  autoEnter: false,
  type: 'default' as const,
  prefix: '',
  suffix: '',
  maxLength: 50,
  debug: true,
  enableScannerDetection: true,
  // 回调函数
  onScanSuccess: (data: ScanCodeData) => {
    addCallbackLog('success', `扫码成功: ${data.processedData}`);
    // 这里可以添加业务逻辑，比如：
    // - 发送数据到服务器
    // - 更新库存
    // - 显示成功提示
    // - 播放成功音效
  },
  onScanError: (data: ScanCodeData) => {
    addCallbackLog('error', `扫码失败: ${data.error || '未知错误'}`);
    // 这里可以添加错误处理逻辑，比如：
    // - 显示错误提示
    // - 播放错误音效
    // - 记录错误日志
  }
});

// 扫码结果
const scanResults = ref<ScanCodeData[]>([]);

// 回调日志
const callbackLogs = ref<Array<{
  timestamp: number;
  type: 'success' | 'error';
  message: string;
}>>([]);

// 添加回调日志
const addCallbackLog = (type: 'success' | 'error', message: string) => {
  callbackLogs.value.unshift({
    timestamp: Date.now(),
    type,
    message
  });

  // 限制日志数量
  if (callbackLogs.value.length > 50) {
    callbackLogs.value = callbackLogs.value.slice(0, 50);
  }
};

// 初始化扫码枪
const initScanCodeGun = () => {
  scanCodeGun = new ScanCodeGunManager(config);

  // 监听扫码事件
  scanCodeGun.addListener((data: ScanCodeData) => {
    scanResults.value.unshift(data);

    // 限制结果数量
    if (scanResults.value.length > 100) {
      scanResults.value = scanResults.value.slice(0, 100);
    }
  });
};

// 处理焦点事件
const handleFocus = () => {
  isListening.value = true;
};

// 处理失焦事件
const handleBlur = () => {
  isListening.value = false;
};

// 处理键盘事件
const handleKeyEvent = (event: KeyboardEvent) => {
  if (scanCodeGun) {
    return scanCodeGun.handleKeyEvent(event);
  }
  return false;
};

// 清空结果
const clearResults = () => {
  scanResults.value = [];
};

// 清空回调日志
const clearCallbackLogs = () => {
  callbackLogs.value = [];
};

// 格式化时间
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString();
};

// 组件挂载时初始化
onMounted(() => {
  initScanCodeGun();
});

// 组件卸载时清理
onUnmounted(() => {
  if (scanCodeGun) {
    scanCodeGun.destroy();
  }
});
</script>