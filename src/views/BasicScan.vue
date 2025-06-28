<template>
  <div class="bg-gray-50 p-5">
    <div class="text-center mb-8 p-10 bg-white rounded-xl shadow-md">
      <h1 class="text-4xl font-semibold mb-3 text-gray-800">基础扫码示例</h1>
      <p class="text-lg text-gray-600">演示扫码枪的基本功能，包括数据验证、前缀后缀处理等</p>
    </div>

    <ScanCodeExample />
  </div>
</template>

<script setup lang="ts">
import ScanCodeExample from '~/components/ScanCodeExample.vue'

defineOptions({
  name: 'BasicScan',
})
</script>