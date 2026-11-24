<script setup>
import { ref, computed } from "vue";
import BrickIcon from "./icons/BrickIcon.vue";
import CloseIcon from "./icons/CloseIcon.vue";
import { injectCart } from "../composables/useCart";
import { getConditionLabel } from "../constants/conditions";
import { formatPrice } from "../utils/format";

// item = { product, quantity, lineTotal } — элемент из useCart().items
const props = defineProps({
  item: { type: Object, required: true },
});

const { add, setQty, remove, canAdd } = injectCart();

const imageFailed = ref(false);

const product = computed(() => props.item.product);
const showImage = computed(() => Boolean(product.value.image) && !imageFailed.value);
const unitPrice = computed(() => formatPrice(product.value.price, product.value.currency));
const linePrice = computed(() => formatPrice(props.item.lineTotal, product.value.currency));
const conditionLabel = computed(() => getConditionLabel(product.value.condition));
</script>

<template>
  <li class="item">
    <div class="thumb">
      <img
        v-if="showImage"
        :src="product.image"
        :alt="product.name"
        loading="lazy"
        @error="imageFailed = true"
      />
      <BrickIcon v-else class="thumb-icon" />
    </div>

    <div class="info">
      <div class="top-row">
        <h3 class="name">{{ product.name }}</h3>
        <button
          type="button"
          class="remove-btn"
          :aria-label="`Убрать «${product.name}» из корзины`"
          @click="remove(product.id)"
        >
          <CloseIcon class="remove-icon" />
        </button>
      </div>

      <p class="meta">{{ unitPrice }} · {{ conditionLabel }}</p>

      <div class="bottom-row">
        <div class="stepper" role="group" :aria-label="`Количество: ${product.name}`">
          <button
            type="button"
            class="stepper-btn"
            aria-label="Убрать одну"
            @click="setQty(product, item.quantity - 1)"
          >
            −
          </button>
          <span class="stepper-count">{{ item.quantity }}</span>
          <button
            type="button"
            class="stepper-btn"
            aria-label="Добавить ещё"
            :disabled="!canAdd(product)"
            @click="add(product)"
          >
            +
          </button>
        </div>
        <span class="line-price">{{ linePrice }}</span>
      </div>
    </div>
  </li>
</template>

<style scoped>
.item {
  display: grid;
  grid-template-columns: 68px 1fr;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid var(--line);
}

.thumb {
  width: 68px;
  height: 68px;
  border-radius: var(--radius-md);
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 30% 20%, var(--signal-blue-soft), transparent 60%),
    radial-gradient(circle at 75% 80%, var(--signal-orange-soft), transparent 55%), #10131a;
}

.thumb img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
}

.thumb-icon {
  width: 46%;
  height: 46%;
  color: var(--line);
}

.info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.top-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.name {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 15px;
  line-height: 1.25;
}

.remove-btn {
  flex: none;
  width: 28px;
  height: 28px;
  margin: -4px -6px 0 0;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease;
}

.remove-btn:hover {
  color: var(--signal-orange);
  background: var(--signal-orange-soft);
}

.remove-icon {
  width: 14px;
  height: 14px;
}

.meta {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--muted);
}

.bottom-row {
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.stepper {
  display: inline-flex;
  align-items: stretch;
  height: 32px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.stepper-btn {
  width: 32px;
  border: none;
  background: transparent;
  color: var(--paper);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s ease;
}

.stepper-btn:hover:not(:disabled) {
  background: var(--signal-blue-soft);
}

.stepper-btn:disabled {
  color: var(--muted);
  opacity: 0.5;
  cursor: not-allowed;
}

.stepper-count {
  min-width: 28px;
  display: grid;
  place-items: center;
  font-family: var(--font-mono);
  font-size: 13px;
}

.line-price {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 15px;
}
</style>
