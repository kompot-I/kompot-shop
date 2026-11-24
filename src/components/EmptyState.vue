<script setup>
defineProps({
  title: { type: String, required: true },
  hint: { type: String, default: "" },
});
</script>

<template>
  <div class="state-block">
    <p class="state-title">{{ title }}</p>
    <p v-if="hint" class="state-hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.state-block {
  text-align: center;
  padding: 80px 20px;
  color: var(--muted);
  grid-column: 1 / -1;
}

.state-title {
  font-family: var(--font-display);
  color: var(--paper);
  font-size: 18px;
  margin: 0 0 6px;
}

.state-hint {
  font-size: 13px;
  margin: 0;
}
</style>
