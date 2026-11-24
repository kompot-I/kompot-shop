<script setup>
import { useProducts } from "./composables/useProducts";
import { useProductFilters } from "./composables/useProductFilters";
import TheHeader from "./components/TheHeader.vue";
import ProductGrid from "./components/ProductGrid.vue";

const { products, isLoading, error } = useProducts();
const { search, condition, sort, filtered } = useProductFilters(products);
</script>

<template>
  <TheHeader v-model:search="search" v-model:sort="sort" v-model:condition="condition" />

  <main class="page-inner">
    <div class="results-row">
      <span>{{ filtered.length }} из {{ products.length }}</span>
      <span>цены в рублях</span>
    </div>

    <ProductGrid :items="filtered" :is-loading="isLoading" :error="error" />
  </main>

  <footer class="site-footer">BRICKBOX · витрина коллекционных минифигурок</footer>
</template>

<style scoped>
.page-inner {
  max-width: 1160px;
  margin: 0 auto;
  padding: 28px 20px 80px;
}

.results-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 16px;
  color: var(--muted);
  font-size: 13px;
  font-family: var(--font-mono);
}

.site-footer {
  border-top: 1px solid var(--line);
  padding: 24px 20px;
  text-align: center;
  color: var(--muted);
  font-size: 12px;
}
</style>
