<template>
  <div v-if="showBreadcrumb" class="bg-white border-b border-gray-200 py-3">
    <div class="max-w-6xl mx-auto px-5 flex items-center gap-2 text-sm">
      <router-link to="/" class="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors">
        <span class="text-base">🏠</span>
        首页
      </router-link>
      <span class="text-gray-300 font-light">/</span>
      <span class="text-gray-800 font-medium">{{ currentPage }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const showBreadcrumb = computed(() => {
  return route.path !== '/'
})

const currentPage = computed(() => {
  const pathMap: Record<string, string> = {
    '/basic-scan': '基础扫码示例',
    '/callback-example': '回调函数示例',
    '/continuous-scan': '连续扫码示例',
    '/about': '关于'
  }

  return pathMap[route.path] || '未知页面'
})
</script>