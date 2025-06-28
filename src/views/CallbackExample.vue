<template>
  <div class="bg-gray-50 p-5">
    <div class="text-center mb-8 p-10 bg-white rounded-xl shadow-md">
      <h1 class="text-4xl font-semibold mb-3 text-gray-800">回调函数示例</h1>
      <p class="text-lg text-gray-600">演示扫码枪回调函数的使用，包括成功回调、失败回调和连续扫码完成回调</p>
    </div>

    <CallbackExample />
  </div>
</template>

<script setup lang="ts">
import CallbackExample from '~/components/CallbackExample.vue'

defineOptions({
  name: 'CallbackExamplePage',
})
</script>