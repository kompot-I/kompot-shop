<script setup>
import ProductCard from "./ProductCard.vue";
import EmptyState from "./EmptyState.vue";

defineProps({
  items: { type: Array, required: true },
  isLoading: { type: Boolean, default: false },
  error: { type: [Error, null], default: null },
});
</script>

<template>
  <div class="grid">
    <EmptyState v-if="isLoading" title="Загружаем каталог…" hint="Это займёт секунду." />
    <EmptyState
      v-else-if="error"
      title="Каталог не загрузился"
      :hint="`Проверьте, что products.json доступен. (${error.message})`"
    />
    <EmptyState
      v-else-if="items.length === 0"
      title="Ничего не нашлось"
      hint="Попробуйте изменить запрос или сбросить фильтр."
    />
    <template v-else>
      <ProductCard v-for="item in items" :key="item.id" :product="item" />
    </template>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 18px;
}

@media (max-width: 640px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
}
</style>
