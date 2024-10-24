<script setup lang="ts">
type Props = {
  year?: number
  content: string
}

defineOptions({
  name: 'HelloWorld',
})
withDefaults(defineProps<Props>(), {
  content: 'h',
})
</script>

<template>
  <span class="text-teal-500">{{ year }}</span>
  <span class="text-pink-500">{{ content }}</span>
</template>
