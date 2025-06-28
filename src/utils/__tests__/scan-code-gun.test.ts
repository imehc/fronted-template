import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ScanCodeGunManager } from '../scan-code-gun'

describe('ScanCodeGunManager', () => {
  let manager: ScanCodeGunManager

  beforeEach(() => {
    manager = new ScanCodeGunManager()
  })

  describe('基本功能', () => {
    it('应该正确初始化默认配置', () => {
      const config = manager.getConfig()
      expect(config.autoEnter).toBe(true)
      expect(config.type).toBe('default')
      expect(config.timeout).toBe(100)
      expect(config.debug).toBe(false)
    })
  })

  describe('键盘事件处理', () => {
    it('应该处理可打印字符', () => {
      const event = new KeyboardEvent('keydown', { key: 'A' })
      const result = manager.handleKeyEvent(event)
      expect(result).toBe(false)
    })

    it('应该处理回车键并触发数据处理', () => {
      // 先输入一些字符
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: '1' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: '2' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: '3' }))

      // 模拟回车键
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' })
      const result = manager.handleKeyEvent(enterEvent)
      expect(result).toBe(true)
    })

    it('应该根据autoEnter配置处理回车键', () => {
      manager.updateConfig({ autoEnter: false })

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' })
      const result = manager.handleKeyEvent(enterEvent)
      expect(result).toBe(true) // 应该阻止默认行为
    })

    it('应该处理退格键', () => {
      // 先输入字符
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: 'A' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: 'B' }))

      // 退格
      const backspaceEvent = new KeyboardEvent('keydown', { key: 'Backspace' })
      const result = manager.handleKeyEvent(backspaceEvent)
      expect(result).toBe(false)
    })
  })

  describe('数据监听', () => {
    it('应该正确触发数据监听器', () => {
      manager.addListener(data => {
        expect(data.rawData).toBe('123')
        expect(data.processedData).toBe('123')
        expect(data.gunType).toBe('default')
        expect(data.isValid).toBe(true)
        expect(data.timestamp).toBeGreaterThan(0)
      })

      // 模拟扫码输入
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: '1' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: '2' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: '3' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    })

    it('应该能够移除监听器', () => {
      const listener = vi.fn()
      manager.addListener(listener)
      manager.removeListener(listener)

      // 模拟扫码输入
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: '1' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: 'Enter' }))

      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('数据验证', () => {
    it('应该验证数据长度限制', () => {
      manager.updateConfig({ maxLength: 2 })

      manager.addListener(data => {
        expect(data.isValid).toBe(false)
        expect(data.error).toContain('数据长度超过限制')
      })

      // 输入超过长度限制的数据
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: '1' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: '2' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: '3' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    })

    it('应该验证数据格式', () => {
      manager.updateConfig({ pattern: /^[0-9]+$/ })

      manager.addListener(data => {
        expect(data.isValid).toBe(false)
        expect(data.error).toBe('数据格式不符合要求')
      })

      // 输入不符合格式的数据
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: 'A' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    })

    it('应该验证允许的前缀（严格匹配）', () => {
      manager.updateConfig({
        allowedPrefixes: ['ABC', 'XYZ'],
        strictPrefix: true,
      })

      manager.addListener(data => {
        expect(data.isValid).toBe(false)
        expect(data.error).toContain('必须以')
        expect(data.error).toContain('ABC、XYZ')
      })

      // 输入不符合前缀要求的数据
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: '1' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: '2' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: '3' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    })

    it('应该验证允许的前缀（宽松匹配）', () => {
      manager.updateConfig({
        allowedPrefixes: ['ABC', 'XYZ'],
        strictPrefix: false,
      })

      manager.addListener(data => {
        expect(data.isValid).toBe(true)
      })

      // 输入包含前缀的数据
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: 'A' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: 'B' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: 'C' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: '1' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: '2' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: '3' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    })

    it('应该验证允许的正则表达式', () => {
      manager.updateConfig({
        allowedPatterns: [/^[0-9]{3}$/, /^[A-Z]{2}\d{2}$/],
      })

      manager.addListener(data => {
        expect(data.isValid).toBe(false)
        expect(data.error).toBe('数据格式不符合允许的模式')
      })

      // 输入不符合正则表达式的数据
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: '1' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: '2' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    })

    it('应该通过正则表达式验证', () => {
      manager.updateConfig({
        allowedPatterns: [/^[0-9]{3}$/, /^[A-Z]{2}\d{2}$/],
      })

      manager.addListener(data => {
        expect(data.isValid).toBe(true)
      })

      // 输入符合正则表达式的数据
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: '1' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: '2' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: '3' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    })

    it('应该组合验证前缀和正则表达式', () => {
      manager.updateConfig({
        allowedPrefixes: ['ABC'],
        allowedPatterns: [/^[0-9]+$/],
        strictPrefix: true,
      })

      manager.addListener(data => {
        expect(data.isValid).toBe(false)
      })

      // 输入不符合要求的数据（有前缀但格式不对）
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: 'A' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: 'B' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: 'C' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: 'A' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: 'B' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: 'C' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    })
  })

  describe('超时处理', () => {
    it('应该处理超时', () => {
      vi.useFakeTimers()

      manager.updateConfig({ timeout: 100 })

      manager.addListener(data => {
        expect(data.rawData).toBe('123')
        expect(data.processedData).toBe('123')
      })

      // 输入数据但不按回车
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: '1' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: '2' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: '3' }))

      // 快进时间
      vi.advanceTimersByTime(150)

      vi.useRealTimers()
    })
  })

  describe('清理功能', () => {
    it('应该能够清空缓冲区', () => {
      // 输入一些数据
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: '1' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: '2' }))

      manager.clearBuffer()

      // 按回车应该不会触发数据处理
      const listener = vi.fn()
      manager.addListener(listener)

      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
      expect(listener).not.toHaveBeenCalled()
    })

    it('应该能够销毁管理器', () => {
      const listener = vi.fn()
      manager.addListener(listener)
      manager.destroy()

      // 销毁后监听器应该被清空
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: '1' }))
      manager.handleKeyEvent(new KeyboardEvent('keydown', { key: 'Enter' }))

      expect(listener).not.toHaveBeenCalled()
    })
  })
})
