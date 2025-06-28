<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

defineOptions({
  name: 'Home',
})

const navigateTo = (route: string) => {
  router.push(route)
}
</script>

<template>
  <div class="bg-gradient-to-br from-blue-500 to-purple-600 p-10">
    <div class="text-center mb-15 text-white">
      <h1 class="text-6xl font-bold mb-5 text-shadow-lg">扫码枪工具</h1>
      <p class="text-xl max-w-2xl mx-auto opacity-90 leading-relaxed">
        功能强大的扫码枪处理工具，支持多种扫码枪类型、数据验证、连续扫码和回调函数
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-15 max-w-6xl mx-auto">
      <div
        class="bg-white rounded-2xl p-8 cursor-pointer transition-all hover:-translate-y-2 hover:shadow-xl border-2 border-transparent hover:border-blue-500"
        @click="navigateTo('/basic-scan')">
        <div class="text-5xl mb-5 text-center">📱</div>
        <h3 class="text-2xl font-semibold mb-4 text-gray-800 text-center">基础扫码示例</h3>
        <p class="text-gray-600 leading-relaxed mb-5 text-center">演示扫码枪的基本功能，包括数据验证、前缀后缀处理等</p>
        <div class="flex flex-wrap gap-2 justify-center">
          <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">数据验证</span>
          <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">前缀后缀</span>
          <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">格式检查</span>
        </div>
      </div>

      <div
        class="bg-white rounded-2xl p-8 cursor-pointer transition-all hover:-translate-y-2 hover:shadow-xl border-2 border-transparent hover:border-blue-500"
        @click="navigateTo('/callback-example')">
        <div class="text-5xl mb-5 text-center">🔄</div>
        <h3 class="text-2xl font-semibold mb-4 text-gray-800 text-center">回调函数示例</h3>
        <p class="text-gray-600 leading-relaxed mb-5 text-center">演示扫码枪回调函数的使用，包括成功回调、失败回调和连续扫码完成回调</p>
        <div class="flex flex-wrap gap-2 justify-center">
          <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">成功回调</span>
          <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">失败回调</span>
          <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">业务逻辑</span>
        </div>
      </div>

      <div
        class="bg-white rounded-2xl p-8 cursor-pointer transition-all hover:-translate-y-2 hover:shadow-xl border-2 border-transparent hover:border-blue-500"
        @click="navigateTo('/continuous-scan')">
        <div class="text-5xl mb-5 text-center">⚡</div>
        <h3 class="text-2xl font-semibold mb-4 text-gray-800 text-center">连续扫码示例</h3>
        <p class="text-gray-600 leading-relaxed mb-5 text-center">演示连续扫码功能，支持批量扫码和自动完成回调</p>
        <div class="flex flex-wrap gap-2 justify-center">
          <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">批量扫码</span>
          <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">自动完成</span>
          <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">数据导出</span>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-10 max-w-6xl mx-auto shadow-lg">
      <h2 class="text-4xl font-semibold mb-10 text-gray-800 text-center">功能特性</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div class="text-center p-5">
          <div class="text-4xl mb-4">🎯</div>
          <h4 class="text-xl font-semibold mb-3 text-gray-800">多种扫码枪支持</h4>
          <p class="text-gray-600 leading-relaxed">支持默认、Honeywell、Datalogic、Zebra等多种扫码枪类型</p>
        </div>
        <div class="text-center p-5">
          <div class="text-4xl mb-4">🔍</div>
          <h4 class="text-xl font-semibold mb-3 text-gray-800">自动识别</h4>
          <p class="text-gray-600 leading-relaxed">自动识别扫码枪输入，区分键盘输入和扫码枪输入</p>
        </div>
        <div class="text-center p-5">
          <div class="text-4xl mb-4">✅</div>
          <h4 class="text-xl font-semibold mb-3 text-gray-800">数据验证</h4>
          <p class="text-gray-600 leading-relaxed">支持长度、格式、前缀、正则表达式等多种验证方式</p>
        </div>
        <div class="text-center p-5">
          <div class="text-4xl mb-4">🔄</div>
          <h4 class="text-xl font-semibold mb-3 text-gray-800">连续扫码</h4>
          <p class="text-gray-600 leading-relaxed">支持连续扫码功能，提高批量处理效率</p>
        </div>
        <div class="text-center p-5">
          <div class="text-4xl mb-4">📞</div>
          <h4 class="text-xl font-semibold mb-3 text-gray-800">回调函数</h4>
          <p class="text-gray-600 leading-relaxed">支持成功、失败、连续扫码完成等多种回调函数</p>
        </div>
        <div class="text-center p-5">
          <div class="text-4xl mb-4">🐛</div>
          <h4 class="text-xl font-semibold mb-3 text-gray-800">调试模式</h4>
          <p class="text-gray-600 leading-relaxed">提供详细的调试信息，便于问题排查</p>
        </div>
      </div>
    </div>
  </div>
</template>
