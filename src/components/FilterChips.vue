<script setup>
import { CONDITIONS } from "../constants/conditions";

// defineModel без имени — компонент используется как <FilterChips v-model="condition" />
const condition = defineModel({ default: "all" });

const options = [{ value: "all", label: "Все" }, ...CONDITIONS];
</script>

<template>
  <div class="chip-row">
    <button
      v-for="opt in options"
      :key="opt.value"
      class="chip"
      type="button"
      :data-active="condition === opt.value"
      @click="condition = opt.value"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

<style scoped>
.chip-row {
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 20px 14px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.chip {
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--muted);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.chip:hover {
  color: var(--paper);
  border-color: var(--muted);
}

.chip[data-active="true"] {
  color: var(--ink);
  background: var(--paper);
  border-color: var(--paper);
}
</style>
