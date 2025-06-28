<template>
  <nav class="bg-white shadow-md sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-5 flex items-center justify-between h-15">
      <div class="flex items-center gap-2.5 cursor-pointer transition-opacity hover:opacity-80"
        @click="navigateTo('/')">
        <span class="text-2xl">📱</span>
        <span class="text-xl font-semibold text-gray-800 hidden sm:block">扫码枪工具</span>
      </div>

      <div class="flex gap-5">
        <router-link to="/"
          class="text-gray-500 font-medium px-4 py-2 rounded-lg transition-all hover:text-gray-700 hover:bg-gray-50 relative"
          :class="{ 'text-blue-600 bg-blue-50': $route.path === '/' }">
          首页
        </router-link>
        <router-link to="/basic-scan"
          class="text-gray-500 font-medium px-4 py-2 rounded-lg transition-all hover:text-gray-700 hover:bg-gray-50 relative"
          :class="{ 'text-blue-600 bg-blue-50': $route.path === '/basic-scan' }">
          基础扫码
        </router-link>
        <router-link to="/callback-example"
          class="text-gray-500 font-medium px-4 py-2 rounded-lg transition-all hover:text-gray-700 hover:bg-gray-50 relative"
          :class="{ 'text-blue-600 bg-blue-50': $route.path === '/callback-example' }">
          回调函数
        </router-link>
        <router-link to="/continuous-scan"
          class="text-gray-500 font-medium px-4 py-2 rounded-lg transition-all hover:text-gray-700 hover:bg-gray-50 relative"
          :class="{ 'text-blue-600 bg-blue-50': $route.path === '/continuous-scan' }">
          连续扫码
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateTo = (route: string) => {
  router.push(route)
}
</script>