import { ref, readonly, onUnmounted } from 'vue'

/**
 * 扫码枪处理工具
 * 支持不同扫码枪的适配和配置
 */

// 扫码枪配置接口
export interface ScanCodeGunConfig {
  /** 是否自动回车 */
  autoEnter: boolean
  /** 扫码枪类型 */
  type: 'default'
  /** 自定义前缀 */
  prefix?: string
  /** 自定义后缀 */
  suffix?: string
  /** 数据长度限制 */
  maxLength?: number
  /** 最小数据长度 */
  minLength?: number
  /** 数据格式验证正则 */
  pattern?: RegExp
  /** 超时时间(ms) */
  timeout?: number
  /** 是否启用调试模式 */
  debug?: boolean
  /** 允许扫码的前缀列表 */
  allowedPrefixes?: string[]
  /** 允许扫码的正则表达式列表 */
  allowedPatterns?: RegExp[]
  /** 是否严格匹配前缀（true: 必须完全匹配前缀，false: 包含前缀即可） */
  strictPrefix?: boolean
  /** 是否启用扫码枪识别 */
  enableScannerDetection?: boolean
  /** 扫码枪识别的最小字符间隔(ms) */
  minCharInterval?: number
  /** 扫码枪识别的最大字符间隔(ms) */
  maxCharInterval?: number
  /** 扫码枪识别的最小数据长度 */
  minDataLength?: number
  /** 扫码枪识别的最大数据长度 */
  maxDataLength?: number
  /** 是否启用连续扫码 */
  enableContinuousScan?: boolean
  /** 连续扫码间隔时间(ms) */
  continuousScanInterval?: number
  /** 连续扫码最大次数 */
  maxContinuousScans?: number
  /** 扫码成功回调函数 */
  onScanSuccess?: (data: ScanCodeData) => void
  /** 扫码失败回调函数 */
  onScanError?: (data: ScanCodeData) => void
  /** 连续扫码完成回调函数 */
  onContinuousScanComplete?: (count: number, dataList: ScanCodeData[]) => void
}

// 扫码数据接口
export interface ScanCodeData {
  /** 原始数据 */
  rawData: string
  /** 处理后的数据 */
  processedData: string
  /** 扫码枪类型 */
  gunType: string
  /** 时间戳 */
  timestamp: number
  /** 是否有效 */
  isValid: boolean
  /** 错误信息 */
  error?: string
}

// 扫码枪适配器接口
export interface ScanCodeGunAdapter {
  /** 适配器名称 */
  name: string
  /** 处理原始数据 */
  processData(rawData: string, config: ScanCodeGunConfig): string
  /** 验证数据格式 */
  validateData(data: string, config: ScanCodeGunConfig): boolean
  /** 获取错误信息 */
  getErrorMessage(data: string, config: ScanCodeGunConfig): string
}

// 默认扫码枪适配器
class DefaultAdapter implements ScanCodeGunAdapter {
  name = 'default'

  processData(rawData: string, config: ScanCodeGunConfig): string {
    let data = rawData.trim()

    // 移除回车符
    data = data.replace(/\r?\n/g, '')

    // 应用前缀和后缀
    if (config.prefix && data.startsWith(config.prefix)) {
      data = data.substring(config.prefix.length)
    }
    if (config.suffix && data.endsWith(config.suffix)) {
      data = data.substring(0, data.length - config.suffix.length)
    }

    return data
  }

  validateData(data: string, config: ScanCodeGunConfig): boolean {
    if (config.minLength && data.length < config.minLength) {
      return false
    }
    if (config.maxLength && data.length > config.maxLength) {
      return false
    }

    if (config.pattern && !config.pattern.test(data)) {
      return false
    }

    // 验证允许的前缀
    if (config.allowedPrefixes && config.allowedPrefixes.length > 0) {
      const hasValidPrefix = config.allowedPrefixes.some(prefix => {
        if (config.strictPrefix) {
          // 严格匹配：数据必须以指定前缀开头
          return data.startsWith(prefix)
        } else {
          // 宽松匹配：数据包含指定前缀即可
          return data.includes(prefix)
        }
      })

      if (!hasValidPrefix) {
        return false
      }
    }

    // 验证允许的正则表达式
    if (config.allowedPatterns && config.allowedPatterns.length > 0) {
      const matchesAnyPattern = config.allowedPatterns.some(pattern => {
        return pattern.test(data)
      })

      if (!matchesAnyPattern) {
        return false
      }
    }

    return data.length > 0
  }

  getErrorMessage(data: string, config: ScanCodeGunConfig): string {
    if (config.maxLength && data.length > config.maxLength) {
      return `数据长度超过限制: ${data.length}/${config.maxLength}`
    }

    if (config.pattern && !config.pattern.test(data)) {
      return '数据格式不符合要求'
    }

    // 检查前缀验证错误
    if (config.allowedPrefixes && config.allowedPrefixes.length > 0) {
      const hasValidPrefix = config.allowedPrefixes.some(prefix => {
        if (config.strictPrefix) {
          return data.startsWith(prefix)
        } else {
          return data.includes(prefix)
        }
      })

      if (!hasValidPrefix) {
        const prefixType = config.strictPrefix ? '必须以' : '必须包含'
        const prefixes = config.allowedPrefixes.join('、')
        return `数据${prefixType}以下前缀之一: ${prefixes}`
      }
    }

    // 检查正则表达式验证错误
    if (config.allowedPatterns && config.allowedPatterns.length > 0) {
      const matchesAnyPattern = config.allowedPatterns.some(pattern => {
        return pattern.test(data)
      })

      if (!matchesAnyPattern) {
        return '数据格式不符合允许的模式'
      }
    }

    return '数据无效'
  }
}

// 扫码枪管理器
export class ScanCodeGunManager {
  private config: ScanCodeGunConfig
  private adapters: Map<string, ScanCodeGunAdapter>
  private currentAdapter: ScanCodeGunAdapter
  private buffer = ''
  private timeoutId?: ReturnType<typeof setTimeout>
  private listeners: Array<(data: ScanCodeData) => void> = []

  // 扫码枪识别相关
  private lastKeyTime = 0
  private keyIntervals: number[] = []
  private isScannerInput = false
  private scannerDetectionBuffer = ''

  // 连续扫码相关
  private continuousScanCount = 0
  private lastScanTime = 0
  private continuousScanTimeoutId?: ReturnType<typeof setTimeout>
  private continuousScanDataList: ScanCodeData[] = []

  constructor(config: Partial<ScanCodeGunConfig> = {}) {
    this.config = {
      autoEnter: true,
      type: 'default',
      timeout: 100,
      debug: false,
      enableScannerDetection: true,
      minCharInterval: 1, // 调整为1ms，适应快速扫码枪
      maxCharInterval: 50, // 调整为50ms，适应扫码枪特征
      minDataLength: 3, // 调整为3字符，扫码枪通常至少3位
      maxDataLength: 50,
      minLength: 6, // 默认最小长度6位
      enableContinuousScan: false,
      continuousScanInterval: 1000,
      maxContinuousScans: 10,
      ...config,
    }

    // 初始化适配器
    this.adapters = new Map()
    this.adapters.set('default', new DefaultAdapter())

    this.currentAdapter =
      this.adapters.get(this.config.type) || this.adapters.get('default')!
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<ScanCodeGunConfig>): void {
    this.config = { ...this.config, ...newConfig }

    if (newConfig.type && this.adapters.has(newConfig.type)) {
      this.currentAdapter = this.adapters.get(newConfig.type)!
    }
  }

  /**
   * 添加自定义适配器
   */
  addAdapter(adapter: ScanCodeGunAdapter): void {
    this.adapters.set(adapter.name, adapter)
  }

  /**
   * 检测是否为扫码枪输入
   */
  private detectScannerInput(key: string): boolean {
    if (!this.config.enableScannerDetection) {
      return true // 如果未启用检测，默认认为是扫码枪
    }

    const currentTime = Date.now()
    const interval = currentTime - this.lastKeyTime
    this.lastKeyTime = currentTime

    // 记录按键间隔
    if (interval > 0 && interval < 1000) {
      // 忽略异常大的间隔
      this.keyIntervals.push(interval)
      // 只保留最近的10个间隔用于分析
      if (this.keyIntervals.length > 10) {
        this.keyIntervals.shift()
      }
    }

    // 添加到检测缓冲区
    this.scannerDetectionBuffer += key

    // 如果缓冲区长度超过最大长度，清空并重新开始
    if (this.scannerDetectionBuffer.length > this.config.maxDataLength!) {
      this.scannerDetectionBuffer = key
      this.keyIntervals = [interval]
    }

    // 前几个字符暂时认为是扫码枪输入，避免误判
    if (this.scannerDetectionBuffer.length <= 2) {
      return true
    }

    // 分析是否为扫码枪输入
    const isScanner = this.analyzeScannerPattern()

    if (this.config.debug) {
      console.log('ScanCodeGun: Scanner detection', {
        key,
        interval,
        bufferLength: this.scannerDetectionBuffer.length,
        keyIntervals: this.keyIntervals,
        isScanner,
      })
    }

    return isScanner
  }

  /**
   * 分析扫码枪输入模式
   */
  private analyzeScannerPattern(): boolean {
    // 如果数据长度不符合扫码枪特征，认为是键盘输入
    if (
      this.scannerDetectionBuffer.length < this.config.minDataLength! ||
      this.scannerDetectionBuffer.length > this.config.maxDataLength!
    ) {
      return false
    }

    // 如果按键间隔不符合扫码枪特征，认为是键盘输入
    if (this.keyIntervals.length >= 2) {
      // 过滤掉异常大的间隔（可能是第一次输入或系统延迟）
      const validIntervals = this.keyIntervals.filter(
        interval => interval < 100,
      )

      if (validIntervals.length < 1) {
        return false
      }

      const avgInterval =
        validIntervals.reduce((sum, interval) => sum + interval, 0) /
        validIntervals.length

      if (
        avgInterval < this.config.minCharInterval! ||
        avgInterval > this.config.maxCharInterval!
      ) {
        return false
      }

      // 检查间隔的一致性（扫码枪的间隔通常很一致）
      if (validIntervals.length >= 3) {
        const variance =
          validIntervals.reduce((sum, interval) => {
            const diff = interval - avgInterval
            return sum + diff * diff
          }, 0) / validIntervals.length

        // 如果间隔变化太大，可能是人工输入
        if (variance > 200) {
          // 增加方差阈值到200ms
          return false
        }
      }
    }

    // 额外的扫码枪特征检查
    // 1. 检查是否有连续的快速输入（间隔小于10ms）
    const fastInputs = this.keyIntervals.filter(
      interval => interval < 10,
    ).length
    const totalInputs = this.keyIntervals.length

    // 如果快速输入占比超过50%，很可能是扫码枪
    if (totalInputs > 0 && fastInputs / totalInputs > 0.5) {
      return true
    }

    // 2. 检查数据长度和输入速度的组合
    if (
      this.scannerDetectionBuffer.length >= 5 &&
      this.keyIntervals.length >= 3
    ) {
      const avgInterval =
        this.keyIntervals.reduce((sum, interval) => sum + interval, 0) /
        this.keyIntervals.length
      // 如果平均间隔小于20ms且数据长度大于5，很可能是扫码枪
      if (avgInterval < 20) {
        return true
      }
    }

    // 检查是否包含典型的扫码枪特征
    // 1. 数据长度通常在合理范围内
    // 2. 按键间隔快速且一致
    // 3. 通常以回车结束
    return true
  }

  /**
   * 重置扫码枪检测状态
   */
  private resetScannerDetection(): void {
    this.keyIntervals = []
    this.scannerDetectionBuffer = ''
    this.isScannerInput = false
  }

  /**
   * 处理键盘事件
   */
  handleKeyEvent(event: KeyboardEvent): boolean {
    if (this.config.debug) {
      console.log('ScanCodeGun: Key event', event.key, event.code)
    }

    // 处理回车键
    if (event.key === 'Enter' || event.code === 'Enter') {
      if (this.buffer.length > 0) {
        // 检查是否为扫码枪输入
        if (this.config.enableScannerDetection && !this.isScannerInput) {
          if (this.config.debug) {
            console.log('ScanCodeGun: Ignoring keyboard Enter key')
          }
          this.resetScannerDetection()
          return false // 不阻止默认行为
        }

        this.processScannedData()
        return true // 阻止默认行为
      }
      return !this.config.autoEnter // 根据配置决定是否阻止默认行为
    }

    // 处理退格键
    if (event.key === 'Backspace' || event.code === 'Backspace') {
      this.buffer = this.buffer.slice(0, -1)
      this.resetScannerDetection() // 退格键通常表示人工输入
      return false
    }

    // 处理可打印字符
    if (event.key.length === 1 && event.key.charCodeAt(0) >= 32) {
      // 检测是否为扫码枪输入
      const isScanner = this.detectScannerInput(event.key)

      // 只有扫码枪输入才处理
      if (isScanner || !this.config.enableScannerDetection) {
        this.isScannerInput = isScanner
        this.buffer += event.key

        // 清除之前的超时
        if (this.timeoutId) {
          clearTimeout(this.timeoutId)
        }

        // 设置超时处理
        if (this.config.timeout) {
          this.timeoutId = setTimeout(() => {
            if (this.buffer.length > 0) {
              this.processScannedData()
            }
          }, this.config.timeout)
        }

        return false
      } else {
        // 键盘输入，完全不响应
        if (this.config.debug) {
          console.log('ScanCodeGun: Ignoring keyboard input:', event.key)
        }
        return false
      }
    }

    return false
  }

  /**
   * 处理扫码数据
   */
  private processScannedData(): void {
    const rawData = this.buffer
    this.buffer = ''

    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = undefined
    }

    // 重置扫码枪检测状态
    this.resetScannerDetection()

    try {
      // 使用当前适配器处理数据（包括前缀、后缀处理）
      const processedData = this.currentAdapter.processData(
        rawData,
        this.config,
      )
      const isValid = this.currentAdapter.validateData(
        processedData,
        this.config,
      )

      const scanData: ScanCodeData = {
        rawData,
        processedData,
        gunType: this.currentAdapter.name,
        timestamp: Date.now(),
        isValid,
        error: isValid
          ? undefined
          : this.currentAdapter.getErrorMessage(processedData, this.config),
      }

      if (this.config.debug) {
        console.log('ScanCodeGun: Processed data', scanData)
        console.log('ScanCodeGun: Raw buffer length:', rawData.length)
        console.log('ScanCodeGun: Processed data length:', processedData.length)
      }

      // 调用相应的回调函数
      if (isValid && this.config.onScanSuccess) {
        try {
          this.config.onScanSuccess(scanData)
        } catch (error) {
          if (this.config.debug) {
            console.error('ScanCodeGun: Error in onScanSuccess callback', error)
          }
        }
      } else if (!isValid && this.config.onScanError) {
        try {
          this.config.onScanError(scanData)
        } catch (error) {
          if (this.config.debug) {
            console.error('ScanCodeGun: Error in onScanError callback', error)
          }
        }
      }

      // 通知监听器
      this.listeners.forEach(listener => listener(scanData))

      // 处理连续扫码
      this.handleContinuousScan(scanData)
    } catch (error) {
      if (this.config.debug) {
        console.error('ScanCodeGun: Error processing data', error)
      }
    }
  }

  /**
   * 处理连续扫码逻辑
   */
  private handleContinuousScan(scanData: ScanCodeData): void {
    if (!this.config.enableContinuousScan) {
      return
    }

    const currentTime = Date.now()

    // 检查是否在连续扫码时间窗口内
    if (
      currentTime - this.lastScanTime <=
      this.config.continuousScanInterval!
    ) {
      this.continuousScanCount++
      this.continuousScanDataList.push(scanData)

      if (this.config.debug) {
        console.log(`ScanCodeGun: Continuous scan #${this.continuousScanCount}`)
      }

      // 检查是否超过最大连续扫码次数
      if (this.continuousScanCount >= this.config.maxContinuousScans!) {
        if (this.config.debug) {
          console.log(
            'ScanCodeGun: Max continuous scans reached, calling completion callback',
          )
        }

        // 调用连续扫码完成回调
        if (this.config.onContinuousScanComplete) {
          try {
            this.config.onContinuousScanComplete(this.continuousScanCount, [
              ...this.continuousScanDataList,
            ])
          } catch (error) {
            if (this.config.debug) {
              console.error(
                'ScanCodeGun: Error in onContinuousScanComplete callback',
                error,
              )
            }
          }
        }

        this.resetContinuousScan()
        return
      }
    } else {
      // 超出时间窗口，重置连续扫码计数
      this.continuousScanCount = 1
      this.continuousScanDataList = [scanData]
    }

    this.lastScanTime = currentTime

    // 设置连续扫码超时，如果超时则重置计数
    if (this.continuousScanTimeoutId) {
      clearTimeout(this.continuousScanTimeoutId)
    }

    this.continuousScanTimeoutId = setTimeout(() => {
      if (this.config.debug) {
        console.log(
          'ScanCodeGun: Continuous scan timeout, calling completion callback',
        )
      }

      // 调用连续扫码完成回调
      if (
        this.config.onContinuousScanComplete &&
        this.continuousScanDataList.length > 0
      ) {
        try {
          this.config.onContinuousScanComplete(this.continuousScanCount, [
            ...this.continuousScanDataList,
          ])
        } catch (error) {
          if (this.config.debug) {
            console.error(
              'ScanCodeGun: Error in onContinuousScanComplete callback',
              error,
            )
          }
        }
      }

      this.resetContinuousScan()
    }, this.config.continuousScanInterval!)
  }

  /**
   * 重置连续扫码状态
   */
  private resetContinuousScan(): void {
    this.continuousScanCount = 0
    this.lastScanTime = 0
    this.continuousScanDataList = []

    if (this.continuousScanTimeoutId) {
      clearTimeout(this.continuousScanTimeoutId)
      this.continuousScanTimeoutId = undefined
    }
  }

  /**
   * 添加数据监听器
   */
  addListener(listener: (data: ScanCodeData) => void): void {
    this.listeners.push(listener)
  }

  /**
   * 移除数据监听器
   */
  removeListener(listener: (data: ScanCodeData) => void): void {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  /**
   * 清空缓冲区
   */
  clearBuffer(): void {
    this.buffer = ''
    this.resetScannerDetection()
    this.resetContinuousScan()
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = undefined
    }
  }

  /**
   * 获取当前配置
   */
  getConfig(): ScanCodeGunConfig {
    return { ...this.config }
  }

  /**
   * 获取连续扫码状态
   */
  getContinuousScanStatus(): { count: number; lastScanTime: number } {
    return {
      count: this.continuousScanCount,
      lastScanTime: this.lastScanTime,
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.clearBuffer()
    this.listeners = []
  }
}

// 创建默认实例
export const scanCodeGun = new ScanCodeGunManager()

// 导出便捷方法
export const createScanCodeGun = (config?: Partial<ScanCodeGunConfig>) => {
  return new ScanCodeGunManager(config)
}

// Vue 组合式函数
export function useScanCodeGun(config?: Partial<ScanCodeGunConfig>) {
  const manager = new ScanCodeGunManager(config)
  const scanData = ref<ScanCodeData | null>(null)
  const isScanning = ref(false)
  const continuousScanStatus = ref(manager.getContinuousScanStatus())

  // 监听扫码数据
  manager.addListener(data => {
    scanData.value = data
    isScanning.value = false
    // 更新连续扫码状态
    continuousScanStatus.value = manager.getContinuousScanStatus()
  })

  // 处理键盘事件
  const handleKeyEvent = (event: KeyboardEvent) => {
    isScanning.value = true
    return manager.handleKeyEvent(event)
  }

  // 组件卸载时清理
  onUnmounted(() => {
    manager.destroy()
  })

  return {
    scanData: readonly(scanData),
    isScanning: readonly(isScanning),
    continuousScanStatus: readonly(continuousScanStatus),
    handleKeyEvent,
    updateConfig: manager.updateConfig.bind(manager),
    clearBuffer: manager.clearBuffer.bind(manager),
    getConfig: manager.getConfig.bind(manager),
    getContinuousScanStatus: manager.getContinuousScanStatus.bind(manager),
  }
}
