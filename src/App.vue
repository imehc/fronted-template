<script setup lang="ts"></script>

<template>
  <header>
    <HelloWorld content="hello world" :year="new Date().getDay()" />
    <hr />
    <div class="wrapper">
      <nav class="flex gap-x-3">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header>
  <hr />
  <RouterView />
</template>

<style scoped></style>
