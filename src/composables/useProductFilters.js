import { ref, computed } from "vue";

// productsRef — реактивный источник (например, из useProducts()).
// Композабл сам ничего не знает про fetch и вёрстку — только фильтрует.
export function useProductFilters(productsRef) {
  const search = ref("");
  const condition = ref("all");
  const sort = ref("default");

  const filtered = computed(() => {
    const query = search.value.trim().toLowerCase();

    let items = productsRef.value.filter((p) => {
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        (p.category || "").toLowerCase().includes(query);
      const matchesCondition = condition.value === "all" || p.condition === condition.value;
      return matchesSearch && matchesCondition;
    });

    if (sort.value === "price_asc") {
      items = items.slice().sort((a, b) => a.price - b.price);
    } else if (sort.value === "price_desc") {
      items = items.slice().sort((a, b) => b.price - a.price);
    }

    return items;
  });

  return { search, condition, sort, filtered };
}
