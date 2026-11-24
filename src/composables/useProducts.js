import { ref } from "vue";
import { fetchProducts } from "../api/products";

// Инкапсулирует состояние загрузки каталога: products / isLoading / error.
// Используется в App.vue, но при желании можно переиспользовать
// где угодно ещё — например, на странице отдельного товара.
export function useProducts() {
  const products = ref([]);
  const isLoading = ref(true);
  const error = ref(null);

  async function load() {
    isLoading.value = true;
    error.value = null;
    try {
      products.value = await fetchProducts();
    } catch (err) {
      error.value = err;
    } finally {
      isLoading.value = false;
    }
  }

  load();

  return { products, isLoading, error, reload: load };
}
