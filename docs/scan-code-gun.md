# 扫码枪处理工具

这是一个用于处理扫码枪数据的Vue工具，支持不同扫码枪的适配和配置。

## 功能特性

- ✅ 支持多种扫码枪类型（默认、Honeywell、Datalogic、Zebra）
- ✅ 可配置是否自动回车
- ✅ 支持自定义数据格式验证
- ✅ 支持超时处理
- ✅ 支持调试模式
- ✅ Vue 3 组合式API支持
- ✅ TypeScript 类型支持

## 安装和使用

### 基本使用

```typescript
import { useScanCodeGun } from '@/utils/scan-code-gun';

// 在Vue组件中使用
const { scanData, isScanning, handleKeyEvent } = useScanCodeGun({
  autoEnter: true,
  type: 'default',
  timeout: 100
});
```

### 配置选项

```typescript
interface ScanCodeGunConfig {
  /** 是否自动回车 */
  autoEnter: boolean;
  /** 扫码枪类型 */
  type: 'default' | 'honeywell' | 'datalogic' | 'zebra' | 'custom';
  /** 自定义前缀 */
  prefix?: string;
  /** 自定义后缀 */
  suffix?: string;
  /** 数据长度限制 */
  maxLength?: number;
  /** 数据格式验证正则 */
  pattern?: RegExp;
  /** 超时时间(ms) */
  timeout?: number;
  /** 是否启用调试模式 */
  debug?: boolean;
  /** 允许扫码的前缀列表 */
  allowedPrefixes?: string[];
  /** 允许扫码的正则表达式列表 */
  allowedPatterns?: RegExp[];
  /** 是否严格匹配前缀（true: 必须完全匹配前缀，false: 包含前缀即可） */
  strictPrefix?: boolean;
  /** 是否启用扫码枪识别 */
  enableScannerDetection?: boolean;
  /** 扫码枪识别的最小字符间隔(ms) */
  minCharInterval?: number;
  /** 扫码枪识别的最大字符间隔(ms) */
  maxCharInterval?: number;
  /** 扫码枪识别的最小数据长度 */
  minDataLength?: number;
  /** 扫码枪识别的最大数据长度 */
  maxDataLength?: number;
}
```

## 扫码枪类型

### 默认扫码枪
适用于大多数通用扫码枪，自动移除回车符和空白字符。

### Honeywell 扫码枪
专门适配Honeywell扫码枪，处理特殊控制字符。

### Datalogic 扫码枪
适配Datalogic扫码枪，处理前缀字符。

### Zebra 扫码枪
适配Zebra扫码枪，处理校验位。

## 使用示例

### 1. 基本扫码处理

```vue
<template>
  <div 
    tabindex="0" 
    @keydown="handleKeyEvent"
    class="scan-area"
  >
    点击此处扫描条码
  </div>
  
  <div v-if="scanData">
    <p>扫描结果: {{ scanData.processedData }}</p>
    <p>是否有效: {{ scanData.isValid }}</p>
  </div>
</template>

<script setup>
import { useScanCodeGun } from '@/utils/scan-code-gun';

const { scanData, handleKeyEvent } = useScanCodeGun();
</script>
```

### 2. 自定义配置

```vue
<script setup>
import { useScanCodeGun } from '@/utils/scan-code-gun';

const { scanData, handleKeyEvent, updateConfig } = useScanCodeGun({
  autoEnter: false, // 禁用自动回车
  type: 'default', // 使用默认适配器
  timeout: 200, // 200ms超时
  maxLength: 20, // 最大长度20字符
  pattern: /^[0-9]+$/, // 只允许数字
  debug: true // 启用调试模式
});

// 动态更新配置
const updateScanConfig = () => {
  updateConfig({
    autoEnter: true,
    maxLength: 30
  });
};
</script>
```

### 3. 前缀和正则表达式验证

```vue
<script setup>
import { useScanCodeGun } from '@/utils/scan-code-gun';

const { scanData, handleKeyEvent, updateConfig } = useScanCodeGun({
  // 只允许以特定前缀开头的扫码数据
  allowedPrefixes: ['ABC', 'XYZ'],
  strictPrefix: true, // 严格匹配：必须以前缀开头
  
  // 或者允许包含特定前缀的扫码数据
  // allowedPrefixes: ['ABC', 'XYZ'],
  // strictPrefix: false, // 宽松匹配：包含前缀即可
  
  // 只允许符合特定正则表达式的扫码数据
  allowedPatterns: [/^[0-9]{13}$/, /^[A-Z]{2}\d{2}$/],
  
  debug: true
});

// 监听扫码结果
watch(scanData, (data) => {
  if (data && data.isValid) {
    console.log('扫码成功:', data.processedData);
  } else if (data && !data.isValid) {
    console.log('扫码失败:', data.error);
  }
});
</script>
```

### 4. 扫码枪识别

```vue
<script setup>
import { useScanCodeGun } from '@/utils/scan-code-gun';

const { scanData, handleKeyEvent, updateConfig } = useScanCodeGun({
  // 启用扫码枪识别
  enableScannerDetection: true,
  
  // 扫码枪识别参数
  minCharInterval: 10,    // 最小字符间隔10ms
  maxCharInterval: 100,   // 最大字符间隔100ms
  minDataLength: 5,       // 最小数据长度5字符
  maxDataLength: 50,      // 最大数据长度50字符
  
  // 调试模式，查看识别过程
  debug: true
});

// 监听扫码结果
watch(scanData, (data) => {
  if (data && data.isValid) {
    console.log('扫码枪识别成功:', data.processedData);
  }
});
</script>
```

### 5. 扫码枪识别优化
合理配置扫码枪识别参数可以提高识别的准确性。

```typescript
// 快速扫码枪配置（如激光扫码枪）
const fastScannerConfig = {
  enableScannerDetection: true,
  minCharInterval: 5,     // 5ms最小间隔
  maxCharInterval: 50,    // 50ms最大间隔
  minDataLength: 8,       // 8字符最小长度
  maxDataLength: 30       // 30字符最大长度
};

// 慢速扫码枪配置（如CCD扫码枪）
const slowScannerConfig = {
  enableScannerDetection: true,
  minCharInterval: 20,    // 20ms最小间隔
  maxCharInterval: 200,   // 200ms最大间隔
  minDataLength: 5,       // 5字符最小长度
  maxDataLength: 50       // 50字符最大长度
};

// 混合环境配置（同时支持键盘和扫码枪）
const mixedConfig = {
  enableScannerDetection: false, // 禁用识别，允许所有输入
  debug: true
};
```

### 6. 扫码枪识别原理
扫码枪识别基于以下特征：

1. **按键间隔一致性**：扫码枪的按键间隔通常非常一致
2. **数据长度范围**：扫码枪数据通常在合理长度范围内
3. **输入速度**：扫码枪输入速度比人工输入快得多
4. **输入模式**：扫码枪通常连续输入，不会出现退格等编辑操作

### 7. 故障排除

#### 扫码枪识别问题

**1. 扫码枪输入被忽略**
- 检查 `enableScannerDetection` 是否启用
- 调整 `minCharInterval` 和 `maxCharInterval` 参数
- 检查 `minDataLength` 和 `maxDataLength` 设置
- 启用调试模式查看识别过程

**2. 键盘输入被误识别为扫码枪**
- 增加 `maxCharInterval` 值
- 调整 `minDataLength` 和 `maxDataLength`
- 检查按键间隔的一致性要求

**3. 识别准确率低**
- 根据实际扫码枪类型调整参数
- 启用调试模式分析按键间隔
- 考虑禁用识别功能，使用其他验证方式

#### 通用问题

**1. 扫码数据不完整**
- 检查超时时间设置
- 确认扫码枪配置是否正确
- 启用调试模式查看详细日志

**2. 回车键行为异常**
- 检查 `autoEnter` 配置
- 确认事件处理是否正确阻止默认行为

**3. 数据格式错误**
- 检查数据验证规则
- 确认适配器选择是否正确
- 查看原始数据格式

## 更新日志

### v1.0.0
- 初始版本
- 支持多种扫码枪类型
- Vue 3 组合式API支持
- TypeScript 类型支持 