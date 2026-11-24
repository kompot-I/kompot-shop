<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from "vue";
import CartItem from "./CartItem.vue";
import CloseIcon from "./icons/CloseIcon.vue";
import { injectCart } from "../composables/useCart";
import { MANAGER_USERNAME, SHOP_NAME } from "../config";
import { buildOrderMessage, buildManagerLink } from "../utils/order";
import { openLink } from "../utils/telegram";
import { formatPrice } from "../utils/format";

const props = defineProps({
  open: { type: Boolean, default: false },
});
const emit = defineEmits(["close"]);

const { items, count, total, currency, clear } = injectCart();

const panel = ref(null);
const closeButton = ref(null);

const isEmpty = computed(() => items.value.length === 0);
const totalPrice = computed(() => formatPrice(total.value, currency.value));

// Корзина не очищается после «Заказать»: мы не знаем, нажал ли покупатель
// «Отправить» в открывшемся чате. Очистить можно вручную.
function placeOrder() {
  if (isEmpty.value) return;
  const text = buildOrderMessage(items.value, { shopName: SHOP_NAME });
  openLink(buildManagerLink(MANAGER_USERNAME, text));
}

// ---- Поведение модального окна: Esc, фокус, блокировка прокрутки страницы ----

let isLocked = false;
let previouslyFocused = null;
let previousOverflow = "";

function onKeydown(event) {
  if (event.key === "Escape") {
    emit("close");
    return;
  }
  if (event.key !== "Tab" || !panel.value) return;

  // Не даём Tab уйти за пределы панели, пока она открыта.
  const focusable = panel.value.querySelectorAll(
    'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function lock() {
  isLocked = true;
  previouslyFocused = document.activeElement;
  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  window.addEventListener("keydown", onKeydown);
}

function unlock() {
  if (!isLocked) return;
  isLocked = false;
  window.removeEventListener("keydown", onKeydown);
  document.body.style.overflow = previousOverflow;
  previouslyFocused?.focus?.();
  previouslyFocused = null;
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      lock();
      await nextTick();
      closeButton.value?.focus();
    } else {
      unlock();
    }
  },
  { immediate: true }
);

onBeforeUnmount(unlock);
</script>

<template>
  <Transition name="cart">
    <div v-if="open" class="overlay" @click.self="emit('close')">
      <aside ref="panel" class="panel" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <header class="head">
          <h2 id="cart-title" class="title">
            Корзина
            <span v-if="count > 0" class="title-count">{{ count }}</span>
          </h2>
          <button
            ref="closeButton"
            type="button"
            class="close-btn"
            aria-label="Закрыть корзину"
            @click="emit('close')"
          >
            <CloseIcon class="close-icon" />
          </button>
        </header>

        <div v-if="isEmpty" class="empty">
          <p class="empty-title">Корзина пуста</p>
          <p class="empty-hint">Добавьте минифигурки из каталога — они появятся здесь.</p>
          <button type="button" class="back-btn" @click="emit('close')">К каталогу</button>
        </div>

        <ul v-else class="list">
          <CartItem v-for="item in items" :key="item.product.id" :item="item" />
        </ul>

        <footer v-if="!isEmpty" class="foot">
          <div class="total-row">
            <span class="total-label">Итого · {{ count }} шт.</span>
            <span class="total-price">{{ totalPrice }}</span>
          </div>

          <button type="button" class="order-btn" @click="placeOrder">Заказать в Telegram</button>
          <p class="hint">
            Откроется чат с менеджером, список уже в сообщении. Останется нажать «Отправить».
          </p>

          <button type="button" class="clear-btn" @click="clear">Очистить корзину</button>
        </footer>
      </aside>
    </div>
  </Transition>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  justify-content: flex-end;
  background: rgba(5, 6, 9, 0.66);
}

.panel {
  width: min(440px, 100%);
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border-left: 1px solid var(--line);
  box-shadow: var(--shadow-card);
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid var(--line);
}

.title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
}

.title-count {
  min-width: 24px;
  height: 24px;
  padding: 0 7px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: var(--signal-orange-soft);
  color: var(--signal-orange);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
}

.close-btn {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.close-btn:hover {
  color: var(--paper);
  border-color: var(--muted);
}

.close-icon {
  width: 16px;
  height: 16px;
}

.list {
  flex: 1;
  margin: 0;
  padding: 0 20px;
  list-style: none;
  overflow-y: auto;
}

.empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  text-align: center;
}

.empty-title {
  margin: 0 0 6px;
  font-family: var(--font-display);
  font-size: 18px;
}

.empty-hint {
  margin: 0 0 20px;
  font-size: 13px;
  color: var(--muted);
}

.back-btn {
  padding: 10px 18px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--paper);
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.back-btn:hover {
  border-color: var(--muted);
}

.foot {
  padding: 16px 20px 20px;
  border-top: 1px solid var(--line);
  background: var(--surface);
}

.total-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 14px;
}

.total-label {
  font-size: 13px;
  color: var(--muted);
}

.total-price {
  font-family: var(--font-mono);
  font-size: 22px;
  font-weight: 700;
}

.order-btn {
  width: 100%;
  height: 46px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--signal-blue);
  color: #08111f;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease;
}

.order-btn:hover {
  background: #6ba0ff;
  box-shadow: 0 0 0 3px var(--signal-orange-soft);
}

.order-btn:active {
  transform: scale(0.98);
}

.hint {
  margin: 10px 0 0;
  font-size: 12px;
  line-height: 1.45;
  color: var(--muted);
  text-align: center;
}

.clear-btn {
  display: block;
  margin: 12px auto 0;
  padding: 4px 8px;
  border: none;
  background: transparent;
  color: var(--muted);
  font-size: 12px;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

.clear-btn:hover {
  color: var(--signal-orange);
}

/* Появление: фон проявляется, панель выезжает справа. */
.cart-enter-active,
.cart-leave-active {
  transition: opacity 0.2s ease;
}

.cart-enter-active .panel,
.cart-leave-active .panel {
  transition: transform 0.24s ease;
}

.cart-enter-from,
.cart-leave-to {
  opacity: 0;
}

.cart-enter-from .panel,
.cart-leave-to .panel {
  transform: translateX(100%);
}

@media (max-width: 640px) {
  .head {
    padding: 14px 16px;
  }
  .list {
    padding: 0 16px;
  }
  .foot {
    padding: 14px 16px 18px;
  }
}
</style>
