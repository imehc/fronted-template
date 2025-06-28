<template>
  <div class="bg-gray-50 p-5">
    <div class="text-center mb-8 p-10 bg-white rounded-xl shadow-md">
      <h1 class="text-4xl font-semibold mb-3 text-gray-800">连续扫码示例</h1>
      <p class="text-lg text-gray-600">演示连续扫码功能，支持批量扫码和自动完成回调</p>
    </div>

    <ContinuousScanExample />
  </div>
</template>

<script setup lang="ts">
import ContinuousScanExample from '~/components/ContinuousScanExample.vue'

defineOptions({
  name: 'ContinuousScanPage',
})
</script>