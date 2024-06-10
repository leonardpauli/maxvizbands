<script setup lang="ts">
import Diagram from './components/Diagram.vue'
import { exampleDataset } from './components/utils'
</script>

<template>
  <div>
    <h1>GRAPFF!</h1>
    <Diagram :dataset="exampleDataset" style=""/>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
