<script setup>
import FilterChips from "./FilterChips.vue";
import SearchIcon from "./icons/SearchIcon.vue";
import CartIcon from "./icons/CartIcon.vue";

defineProps({
  cartCount: { type: Number, default: 0 },
});
const emit = defineEmits(["open-cart"]);

const search = defineModel("search", { default: "" });
const sort = defineModel("sort", { default: "default" });
const condition = defineModel("condition", { default: "all" });
</script>

<template>
  <header class="site-header">
    <div class="header-inner">
      <div class="brand">
        <span class="brand-mark" aria-hidden="true"></span>
        BRICKBOX
      </div>

      <div class="search-wrap">
        <SearchIcon class="search-icon" />
        <input v-model="search" type="text" placeholder="Найти минифигурку или серию…" />
      </div>

      <select v-model="sort" class="sort-select">
        <option value="default">По умолчанию</option>
        <option value="price_asc">Сначала дешевле</option>
        <option value="price_desc">Сначала дороже</option>
      </select>

      <button
        type="button"
        class="cart-btn"
        :aria-label="cartCount > 0 ? `Корзина, товаров: ${cartCount}` : 'Корзина'"
        @click="emit('open-cart')"
      >
        <CartIcon class="cart-icon" />
        <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
      </button>
    </div>

    <FilterChips v-model="condition" />
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(14px);
  background: rgba(11, 13, 18, 0.82);
  border-bottom: 1px solid var(--line);
}

.header-inner {
  max-width: 1160px;
  margin: 0 auto;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 19px;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.brand-mark {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: linear-gradient(135deg, var(--signal-blue), var(--signal-orange));
  position: relative;
  flex: none;
}

.brand-mark::before,
.brand-mark::after {
  content: "";
  position: absolute;
  top: -4px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: inherit;
}

.brand-mark::before {
  left: 4px;
}

.brand-mark::after {
  right: 4px;
}

.search-wrap {
  flex: 1 1 240px;
  min-width: 180px;
  position: relative;
}

.search-wrap input {
  width: 100%;
  padding: 10px 14px 10px 36px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  color: var(--paper);
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.search-wrap input::placeholder {
  color: var(--muted);
}

.search-wrap input:focus {
  border-color: var(--signal-blue);
  box-shadow: 0 0 0 3px var(--signal-blue-soft);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  color: var(--muted);
  pointer-events: none;
}

.sort-select {
  padding: 10px 12px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  color: var(--paper);
  font-size: 14px;
  outline: none;
  cursor: pointer;
}

.sort-select:focus {
  border-color: var(--signal-blue);
}

.cart-btn {
  position: relative;
  flex: none;
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  color: var(--paper);
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.cart-btn:hover {
  border-color: var(--muted);
}

.cart-icon {
  width: 22px;
  height: 22px;
}

.cart-badge {
  position: absolute;
  top: -7px;
  right: -7px;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: var(--signal-orange);
  color: #1a0d03;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
}

@media (max-width: 640px) {
  .header-inner {
    padding: 12px 16px;
  }

  /* На телефоне корзина встаёт в первую строку рядом с логотипом,
     а поиск и сортировка уходят ниже. */
  .brand {
    order: 0;
  }
  .cart-btn {
    order: 1;
    margin-left: auto;
  }
  .search-wrap {
    order: 2;
  }
  .sort-select {
    order: 3;
  }
}
</style>
