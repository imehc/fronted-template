<template>
  <div class="max-w-6xl mx-auto p-5">
    <h2 class="text-3xl font-semibold mb-6 text-gray-800">连续扫码示例</h2>

    <!-- 配置区域 -->
    <div class="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
      <h3 class="text-xl font-semibold mb-4 text-gray-700">扫码配置</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="flex items-center gap-2">
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="config.enableContinuousScan"
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
            启用连续扫码
          </label>
        </div>
        <div class="flex items-center gap-3">
          <label class="min-w-32 font-medium text-gray-700">连续扫码间隔 (ms):</label>
          <input type="number" v-model="config.continuousScanInterval" min="100" max="10000"
            class="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div class="flex items-center gap-3">
          <label class="min-w-32 font-medium text-gray-700">最大连续扫码次数:</label>
          <input type="number" v-model="config.maxContinuousScans" min="1" max="100"
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

    <!-- 扫码区域 -->
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

    <!-- 连续扫码状态 -->
    <div class="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
      <h3 class="text-xl font-semibold mb-4 text-gray-700">扫码状态</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
          <span class="font-medium text-gray-700">连续扫码次数:</span>
          <span class="text-lg font-semibold text-blue-600">{{ continuousScanStatus.count }}</span>
        </div>
        <div class="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
          <span class="font-medium text-gray-700">状态:</span>
          <span class="px-2 py-1 rounded-full text-sm font-medium" :class="getStatusClass()">
            {{ getStatusText() }}
          </span>
        </div>
        <div class="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
          <span class="font-medium text-gray-700">最后扫码时间:</span>
          <span class="text-sm text-gray-600">{{ formatTime(continuousScanStatus.lastScanTime) }}</span>
        </div>
      </div>
    </div>

    <!-- 扫码历史 -->
    <div class="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
      <h3 class="text-xl font-semibold mb-4 text-gray-700">扫码结果</h3>
      <div class="flex justify-between items-center mb-4">
        <span class="text-gray-600">共 {{ scanHistory.length }} 条记录</span>
        <div class="flex gap-2">
          <button @click="clearHistory"
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm">清空历史</button>
          <button @click="exportData"
            class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm">导出数据</button>
        </div>
      </div>
      <div class="space-y-3 max-h-96 overflow-y-auto">
        <div v-for="(item, index) in scanHistory" :key="index" class="p-4 rounded-lg border border-gray-200 bg-white"
          :class="{ 'border-blue-300 bg-blue-50': item.isContinuous }">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium text-gray-500">#{{ index + 1 }}</span>
            <span class="text-sm text-gray-500">{{ formatTime(item.timestamp) }}</span>
            <span v-if="item.isContinuous"
              class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">连续扫码</span>
          </div>
          <div class="space-y-1">
            <div class="text-sm">
              <strong class="text-gray-700">原始数据:</strong> <span class="text-gray-900">{{ item.rawData }}</span>
            </div>
            <div v-if="item.processedData !== item.rawData" class="text-sm">
              <strong class="text-gray-700">处理后:</strong> <span class="text-gray-900">{{ item.processedData }}</span>
            </div>
            <div class="flex gap-4 text-xs text-gray-500">
              <span>类型: {{ item.gunType }}</span>
              <span :class="{ 'text-green-600': item.isValid, 'text-red-600': !item.isValid }">
                {{ item.isValid ? '有效' : '无效' }}
              </span>
              <span v-if="item.error" class="text-red-600">错误: {{ item.error }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 回调函数日志 -->
    <div class="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
      <h3 class="text-xl font-semibold mb-4 text-gray-700">回调函数日志</h3>
      <div class="space-y-2 max-h-64 overflow-y-auto mb-4">
        <div v-for="(log, index) in callbackLogs" :key="index" class="p-3 rounded-lg text-sm" :class="{
          'bg-green-50 border border-green-200': log.type === 'success',
          'bg-red-50 border border-red-200': log.type === 'error',
          'bg-blue-50 border border-blue-200': log.type === 'complete'
        }">
          <div class="flex items-center gap-3">
            <span class="text-gray-500 text-xs">{{ formatTime(log.timestamp) }}</span>
            <span class="px-2 py-1 rounded-full text-xs font-medium" :class="{
              'bg-green-100 text-green-800': log.type === 'success',
              'bg-red-100 text-red-800': log.type === 'error',
              'bg-blue-100 text-blue-800': log.type === 'complete'
            }">
              {{ log.type === 'success' ? '成功' : log.type === 'error' ? '错误' : '完成' }}
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
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';
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
  enableContinuousScan: true,
  continuousScanInterval: 2000,
  maxContinuousScans: 10,
  debug: true,
  enableScannerDetection: true,
  // 回调函数
  onScanSuccess: (data: ScanCodeData) => {
    addCallbackLog('success', `扫码成功: ${data.processedData}`);
  },
  onScanError: (data: ScanCodeData) => {
    addCallbackLog('error', `扫码失败: ${data.error || '未知错误'}`);
  },
  onContinuousScanComplete: (count: number, dataList: ScanCodeData[]) => {
    addCallbackLog('complete', `连续扫码完成: ${count} 次扫码`);
    // 将连续扫码数据标记为连续扫码
    dataList.forEach(data => {
      (data as any).isContinuous = true;
    });
  }
});

// 扫码历史
const scanHistory = ref<(ScanCodeData & { isContinuous?: boolean })[]>([]);

// 连续扫码状态
const continuousScanStatus = reactive({
  count: 0,
  lastScanTime: 0
});

// 回调日志
const callbackLogs = ref<Array<{
  timestamp: number;
  type: 'success' | 'error' | 'complete';
  message: string;
}>>([]);

// 添加回调日志
const addCallbackLog = (type: 'success' | 'error' | 'complete', message: string) => {
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
    scanHistory.value.unshift(data);

    // 更新连续扫码状态
    continuousScanStatus.count = scanCodeGun!.getContinuousScanStatus().count;
    continuousScanStatus.lastScanTime = Date.now();

    // 限制历史记录数量
    if (scanHistory.value.length > 100) {
      scanHistory.value = scanHistory.value.slice(0, 100);
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

// 获取状态样式类
const getStatusClass = () => {
  const status = scanCodeGun?.getContinuousScanStatus();
  if (!status) return 'bg-gray-100 text-gray-800';

  if (status.count === 0) return 'bg-gray-100 text-gray-800';
  if (status.count >= config.maxContinuousScans) return 'bg-green-100 text-green-800';
  return 'bg-blue-100 text-blue-800';
};

// 获取状态文本
const getStatusText = () => {
  const status = scanCodeGun?.getContinuousScanStatus();
  if (!status) return '未开始';

  if (status.count === 0) return '未开始';
  if (status.count >= config.maxContinuousScans) return '已完成';
  return '进行中';
};

// 清空历史
const clearHistory = () => {
  scanHistory.value = [];
};

// 清空回调日志
const clearCallbackLogs = () => {
  callbackLogs.value = [];
};

// 导出数据
const exportData = () => {
  const data = scanHistory.value.map((item, index) => ({
    序号: index + 1,
    时间: new Date(item.timestamp).toLocaleString(),
    原始数据: item.rawData,
    处理后数据: item.processedData,
    扫码枪类型: item.gunType,
    状态: item.isValid ? '有效' : '无效',
    错误: item.error || '',
    连续扫码: item.isContinuous ? '是' : '否'
  }));

  const csv = [
    Object.keys(data[0] || {}).join(','),
    ...data.map(row => Object.values(row).map(value => `"${value}"`).join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `扫码数据_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 格式化时间
const formatTime = (timestamp: number) => {
  if (timestamp === 0) return '未扫码';
  return new Date(timestamp).toLocaleTimeString();
};

// 监听配置变化
watch(config, () => {
  if (scanCodeGun) {
    scanCodeGun.updateConfig(config);
  }
}, { deep: true });

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