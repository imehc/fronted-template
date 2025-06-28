# 扫码枪工具

一个功能强大的扫码枪处理工具，支持多种扫码枪类型、数据验证、连续扫码和回调函数。

## 功能特性

- ✅ 支持多种扫码枪类型（默认、Honeywell、Datalogic、Zebra）
- ✅ 自动识别扫码枪输入
- ✅ 数据验证（长度、格式、前缀、正则表达式）
- ✅ 连续扫码支持
- ✅ 回调函数支持（成功、失败、连续扫码完成）
- ✅ 调试模式
- ✅ TypeScript 支持
- ✅ Vue 3 组合式 API 支持

## 页面结构

项目包含以下页面：

- **首页** (`/`) - 项目介绍和功能导航
- **基础扫码示例** (`/basic-scan`) - 演示扫码枪的基本功能
- **回调函数示例** (`/callback-example`) - 演示回调函数的使用
- **连续扫码示例** (`/continuous-scan`) - 演示连续扫码功能

## 快速开始

### 安装

```bash
npm install
```

### 运行项目

```bash
npm run dev
```

访问 `http://localhost:5173` 查看项目。

### 基本使用

```typescript
import { ScanCodeGunManager } from './utils/scan-code-gun';

const config = {
  autoEnter: false,
  debug: true,
  enableScannerDetection: true,
  
  // 回调函数
  onScanSuccess: (data) => {
    console.log('扫码成功:', data.processedData);
    // 处理扫码成功逻辑
  },
  
  onScanError: (data) => {
    console.log('扫码失败:', data.error);
    // 处理扫码失败逻辑
  }
};

const scanCodeGun = new ScanCodeGunManager(config);

// 监听键盘事件
document.addEventListener('keydown', (event) => {
  scanCodeGun.handleKeyEvent(event);
});
```

### Vue 3 使用

```vue
<template>
  <div tabindex="0" @keydown="handleKeyEvent">
    点击此处开始扫码
  </div>
</template>

<script setup>
import { useScanCodeGun } from './utils/scan-code-gun';

const { scanData, handleKeyEvent } = useScanCodeGun({
  onScanSuccess: (data) => {
    console.log('扫码成功:', data.processedData);
  }
});
</script>
```

## 回调函数

### 扫码成功回调

```typescript
onScanSuccess: (data: ScanCodeData) => {
  // 处理扫码成功逻辑
  console.log('扫码成功:', data.processedData);
  
  // 发送数据到服务器
  fetch('/api/scan', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}
```

### 扫码失败回调

```typescript
onScanError: (data: ScanCodeData) => {
  // 处理扫码失败逻辑
  console.log('扫码失败:', data.error);
  
  // 显示错误提示
  showErrorMessage(data.error);
}
```

### 连续扫码完成回调

```typescript
onContinuousScanComplete: (count: number, dataList: ScanCodeData[]) => {
  // 处理连续扫码完成逻辑
  console.log(`连续扫码完成: ${count} 次扫码`);
  
  // 批量处理数据
  processBatchData(dataList);
}
```

## 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `autoEnter` | boolean | false | 是否自动回车 |
| `type` | string | 'default' | 扫码枪类型 |
| `prefix` | string | '' | 自定义前缀 |
| `suffix` | string | '' | 自定义后缀 |
| `maxLength` | number | 50 | 数据长度限制 |
| `pattern` | RegExp | - | 数据格式验证正则 |
| `timeout` | number | 100 | 超时时间(ms) |
| `debug` | boolean | false | 是否启用调试模式 |
| `enableScannerDetection` | boolean | true | 是否启用扫码枪识别 |
| `enableContinuousScan` | boolean | false | 是否启用连续扫码 |
| `onScanSuccess` | function | - | 扫码成功回调 |
| `onScanError` | function | - | 扫码失败回调 |
| `onContinuousScanComplete` | function | - | 连续扫码完成回调 |

## 项目结构

```
src/
├── components/
│   ├── ScanCodeExample.vue      # 基础扫码示例组件
│   ├── CallbackExample.vue      # 回调函数示例组件
│   ├── ContinuousScanExample.vue # 连续扫码示例组件
│   ├── NavigationBar.vue        # 导航栏组件
│   └── Breadcrumb.vue           # 面包屑导航组件
├── views/
│   ├── Home.vue                 # 首页
│   ├── BasicScan.vue            # 基础扫码页面
│   ├── CallbackExample.vue      # 回调函数示例页面
│   └── ContinuousScan.vue       # 连续扫码示例页面
├── utils/
│   └── scan-code-gun.ts         # 扫码枪工具核心代码
└── router/
    └── index.ts                 # 路由配置
```

## 文档

详细文档请查看：

- [回调函数使用说明](./docs/callback-functions.md)
- [扫码枪工具文档](./docs/scan-code-gun.md)

## 许可证

MIT

## Usage

> [unplugin-icons](https://github.com/unplugin/unplugin-icons#readme)

> [example]( https://icon-sets.iconify.design/emojione-v1/panda-face/)
```html
    <i-emojione-v1-panda-face />
```