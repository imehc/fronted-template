<template>
  <div class="scanner-detection-example">
    <h2>扫码枪识别示例</h2>

    <!-- 配置区域 -->
    <div class="config-section">
      <h3>扫码枪识别配置</h3>

      <div class="config-item">
        <label>
          <input type="checkbox" v-model="config.enableScannerDetection" @change="updateConfig">
          启用扫码枪识别
        </label>
      </div>

      <div class="config-item">
        <label>最小字符间隔(ms):</label>
        <input type="number" v-model="config.minCharInterval" @change="updateConfig" min="1" max="200">
      </div>

      <div class="config-item">
        <label>最大字符间隔(ms):</label>
        <input type="number" v-model="config.maxCharInterval" @change="updateConfig" min="50" max="500">
      </div>

      <div class="config-item">
        <label>最小数据长度:</label>
        <input type="number" v-model="config.minDataLength" @change="updateConfig" min="1" max="20">
      </div>

      <div class="config-item">
        <label>最大数据长度:</label>
        <input type="number" v-model="config.maxDataLength" @change="updateConfig" min="10" max="100">
      </div>

      <div class="config-item">
        <label>
          <input type="checkbox" v-model="config.debug" @change="updateConfig">
          调试模式
        </label>
      </div>
    </div>

    <!-- 测试区域 -->
    <div class="test-section">
      <h3>测试区域</h3>

      <div class="test-instructions">
        <h4>测试说明：</h4>
        <ul>
          <li><strong>扫码枪测试：</strong>使用扫码枪扫描条码，应该会被识别并处理</li>
          <li><strong>键盘测试：</strong>手动输入字符，应该会被忽略（如果启用了识别）</li>
          <li><strong>混合测试：</strong>先手动输入，再扫码，观察行为差异</li>
        </ul>
      </div>

      <div class="test-area" tabindex="0" @keydown="handleKeyEvent" @focus="onFocus" @blur="onBlur"
        :class="{ focused: isFocused }">
        <div v-if="isScanning" class="scanning-indicator">
          <span>正在扫码...</span>
        </div>
        <div v-else class="test-placeholder">
          点击此处进行测试
          <br>
          <small>可以手动输入或使用扫码枪</small>
        </div>
      </div>
    </div>

    <!-- 结果显示 -->
    <div class="result-section">
      <h3>识别结果</h3>

      <div class="result-summary">
        <div class="summary-item">
          <strong>总输入次数:</strong> {{ totalInputs }}
        </div>
        <div class="summary-item">
          <strong>扫码枪识别次数:</strong> {{ scannerInputs }}
        </div>
        <div class="summary-item">
          <strong>键盘输入次数:</strong> {{ keyboardInputs }}
        </div>
        <div class="summary-item">
          <strong>识别率:</strong> {{ recognitionRate }}%
        </div>
      </div>

      <div v-if="scanData" class="scan-result">
        <div class="result-item">
          <strong>原始数据:</strong> {{ scanData.rawData }}
        </div>
        <div class="result-item">
          <strong>处理后数据:</strong> {{ scanData.processedData }}
        </div>
        <div class="result-item">
          <strong>识别时间:</strong> {{ new Date(scanData.timestamp).toLocaleString() }}
        </div>
        <div class="result-item">
          <strong>状态:</strong>
          <span :class="{ valid: scanData.isValid, invalid: !scanData.isValid }">
            {{ scanData.isValid ? '有效' : '无效' }}
          </span>
        </div>
        <div v-if="scanData.error" class="result-item error">
          <strong>错误:</strong> {{ scanData.error }}
        </div>
      </div>
      <div v-else class="no-result">
        暂无识别数据
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-section">
      <button @click="clearBuffer" class="btn">清空缓冲区</button>
      <button @click="resetStats" class="btn">重置统计</button>
      <button @click="showConfig" class="btn">显示配置</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useScanCodeGun, type ScanCodeGunConfig } from '../utils/scan-code-gun';

// 扫码枪配置
const config = reactive<ScanCodeGunConfig>({
  autoEnter: true,
  type: 'default',
  timeout: 100,
  debug: true,
  enableScannerDetection: true,
  minCharInterval: 10,
  maxCharInterval: 100,
  minDataLength: 5,
  maxDataLength: 50
});

// 统计信息
const totalInputs = ref(0);
const scannerInputs = ref(0);
const keyboardInputs = ref(0);

// 计算识别率
const recognitionRate = computed(() => {
  if (totalInputs.value === 0) return 0;
  return Math.round((scannerInputs.value / totalInputs.value) * 100);
});

// 使用扫码枪工具
const {
  scanData,
  isScanning,
  handleKeyEvent: originalHandleKeyEvent,
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

// 处理键盘事件（添加统计）
const handleKeyEvent = (event: KeyboardEvent) => {
  totalInputs.value++;

  // 检查是否为可打印字符
  if (event.key.length === 1 && event.key.charCodeAt(0) >= 32) {
    // 这里我们无法直接知道是否被识别为扫码枪，但可以通过调试信息判断
    // 在实际使用中，扫码枪识别是在内部处理的
  }

  const result = originalHandleKeyEvent(event);

  // 如果事件被处理，可能是扫码枪输入
  if (result && event.key === 'Enter') {
    scannerInputs.value++;
  }

  return result;
};

// 重置统计
const resetStats = () => {
  totalInputs.value = 0;
  scannerInputs.value = 0;
  keyboardInputs.value = 0;
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

<style scoped>
.scanner-detection-example {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.config-section,
.test-section,
.result-section,
.action-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.config-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.config-item label {
  min-width: 150px;
  font-weight: bold;
}

.config-item input[type="number"] {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 120px;
}

.test-instructions {
  background-color: #e7f3ff;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.test-instructions h4 {
  margin-top: 0;
  color: #0056b3;
}

.test-instructions ul {
  margin: 10px 0;
  padding-left: 20px;
}

.test-instructions li {
  margin-bottom: 5px;
}

.test-area {
  min-height: 120px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.test-area.focused {
  border-color: #007bff;
  background-color: #f0f8ff;
}

.test-area:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.scanning-indicator {
  color: #007bff;
  font-weight: bold;
}

.test-placeholder {
  color: #666;
  font-style: italic;
}

.result-summary {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.summary-item {
  text-align: center;
  padding: 10px;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.summary-item strong {
  display: block;
  margin-bottom: 5px;
  color: #495057;
}

.scan-result {
  background-color: white;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.result-item {
  margin-bottom: 10px;
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}

.result-item:last-child {
  border-bottom: none;
}

.valid {
  color: #28a745;
  font-weight: bold;
}

.invalid {
  color: #dc3545;
  font-weight: bold;
}

.error {
  color: #dc3545;
  background-color: #f8d7da;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
}

.no-result {
  color: #666;
  font-style: italic;
  text-align: center;
  padding: 20px;
}

.btn {
  padding: 10px 20px;
  margin-right: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn:hover {
  background-color: #0056b3;
}

h2,
h3,
h4 {
  color: #333;
  margin-bottom: 15px;
}
</style>