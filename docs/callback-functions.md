# 扫码枪回调函数使用说明

## 概述

扫码枪工具现在支持回调函数，可以在扫码成功或失败时执行自定义逻辑。这为业务处理提供了更大的灵活性。

## 支持的回调函数

### 1. onScanSuccess - 扫码成功回调

当扫码成功时触发此回调函数。

```typescript
onScanSuccess?: (data: ScanCodeData) => void
```

**参数说明：**
- `data`: 扫码数据对象，包含原始数据、处理后数据、扫码枪类型、时间戳、有效性等信息

**使用示例：**
```typescript
const config = {
  // ... 其他配置
  onScanSuccess: (data) => {
    console.log('扫码成功:', data.processedData);
    
    // 业务逻辑示例：
    // 1. 发送数据到服务器
    // fetch('/api/scan', { method: 'POST', body: JSON.stringify(data) });
    
    // 2. 更新库存
    // updateInventory(data.processedData);
    
    // 3. 显示成功提示
    // showSuccessMessage('扫码成功！');
    
    // 4. 播放成功音效
    // playSuccessSound();
    
    // 5. 记录日志
    // logScanActivity(data);
  }
};
```

### 2. onScanError - 扫码失败回调

当扫码失败时触发此回调函数。

```typescript
onScanError?: (data: ScanCodeData) => void
```

**参数说明：**
- `data`: 扫码数据对象，包含错误信息

**使用示例：**
```typescript
const config = {
  // ... 其他配置
  onScanError: (data) => {
    console.log('扫码失败:', data.error);
    
    // 业务逻辑示例：
    // 1. 显示错误提示
    // showErrorMessage(data.error || '扫码失败');
    
    // 2. 播放错误音效
    // playErrorSound();
    
    // 3. 记录错误日志
    // logError(data);
    
    // 4. 重试逻辑
    // retryScan();
  }
};
```

### 3. onContinuousScanComplete - 连续扫码完成回调

当连续扫码完成时触发此回调函数（仅在启用连续扫码功能时有效）。

```typescript
onContinuousScanComplete?: (count: number, dataList: ScanCodeData[]) => void
```

**参数说明：**
- `count`: 连续扫码的次数
- `dataList`: 连续扫码的数据列表

**使用示例：**
```typescript
const config = {
  // ... 其他配置
  enableContinuousScan: true,
  continuousScanInterval: 2000,
  maxContinuousScans: 10,
  onContinuousScanComplete: (count, dataList) => {
    console.log(`连续扫码完成: ${count} 次扫码`);
    
    // 业务逻辑示例：
    // 1. 批量处理数据
    // processBatchData(dataList);
    
    // 2. 显示汇总信息
    // showSummary(count, dataList);
    
    // 3. 导出数据
    // exportBatchData(dataList);
    
    // 4. 发送批量请求
    // sendBatchRequest(dataList);
  }
};
```

## 完整配置示例

```typescript
import { ScanCodeGunManager } from './utils/scan-code-gun';

const config = {
  autoEnter: false,
  type: 'default',
  prefix: '',
  suffix: '',
  maxLength: 50,
  debug: true,
  enableScannerDetection: true,
  
  // 回调函数
  onScanSuccess: (data) => {
    console.log('扫码成功:', data.processedData);
    
    // 发送数据到服务器
    fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: data.processedData,
        timestamp: data.timestamp,
        type: data.gunType
      })
    }).then(response => {
      if (response.ok) {
        showSuccessMessage('数据已保存');
      } else {
        showErrorMessage('保存失败');
      }
    }).catch(error => {
      console.error('请求失败:', error);
      showErrorMessage('网络错误');
    });
  },
  
  onScanError: (data) => {
    console.log('扫码失败:', data.error);
    showErrorMessage(data.error || '扫码失败，请重试');
    playErrorSound();
  },
  
  // 连续扫码回调
  enableContinuousScan: true,
  continuousScanInterval: 2000,
  maxContinuousScans: 10,
  onContinuousScanComplete: (count, dataList) => {
    console.log(`连续扫码完成: ${count} 次扫码`);
    
    // 批量保存数据
    const codes = dataList.map(item => item.processedData);
    fetch('/api/scan/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codes })
    }).then(response => {
      if (response.ok) {
        showSuccessMessage(`批量保存成功: ${count} 条记录`);
      } else {
        showErrorMessage('批量保存失败');
      }
    });
  }
};

// 创建扫码枪实例
const scanCodeGun = new ScanCodeGunManager(config);
```

## 注意事项

1. **错误处理**: 回调函数中的错误不会影响扫码枪的正常工作，但建议在回调函数中添加适当的错误处理。

2. **性能考虑**: 回调函数应该尽量轻量，避免执行耗时的操作。如果需要执行复杂操作，建议使用异步处理。

3. **内存管理**: 回调函数中避免创建闭包引用大量数据，以防止内存泄漏。

4. **调试模式**: 启用 `debug: true` 可以在控制台看到详细的回调函数执行日志。

## 实际应用场景

### 1. 库存管理
```typescript
onScanSuccess: (data) => {
  // 查询库存
  queryInventory(data.processedData).then(item => {
    if (item) {
      showInventoryInfo(item);
    } else {
      showErrorMessage('商品不存在');
    }
  });
}
```

### 2. 订单处理
```typescript
onScanSuccess: (data) => {
  // 添加到订单
  addToOrder(data.processedData).then(() => {
    updateOrderDisplay();
    playSuccessSound();
  });
}
```

### 3. 数据验证
```typescript
onScanSuccess: (data) => {
  // 验证条码格式
  if (validateBarcode(data.processedData)) {
    processValidBarcode(data.processedData);
  } else {
    showErrorMessage('无效的条码格式');
  }
}
```

### 4. 批量操作
```typescript
onContinuousScanComplete: (count, dataList) => {
  // 批量导入
  importBatchData(dataList).then(() => {
    showSuccessMessage(`成功导入 ${count} 条记录`);
    refreshDataList();
  });
}
```

通过合理使用这些回调函数，可以实现各种复杂的业务逻辑，提高扫码应用的灵活性和用户体验。 