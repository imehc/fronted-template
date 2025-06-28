<script setup lang="ts">
import NavigationBar from '~/components/NavigationBar.vue'
import Breadcrumb from '~/components/Breadcrumb.vue'
</script>

<template>
  <div id="app" class="min-h-screen flex flex-col">
    <NavigationBar />
    <Breadcrumb />
    <main class="flex-1">
      <RouterView />
    </main>
  </div>
</template>
