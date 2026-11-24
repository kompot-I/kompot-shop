<script setup>
import { ref, computed } from "vue";
import BrickIcon from "./icons/BrickIcon.vue";
import { getConditionLabel, getConditionTone } from "../constants/conditions";
import { formatPrice } from "../utils/format";

const props = defineProps({
  product: { type: Object, required: true },
});

// Если картинка не загрузилась (битая ссылка), переключаемся на плейсхолдер.
const imageFailed = ref(false);

const inStock = computed(() => Number(props.product.quantity) > 0);
const conditionLabel = computed(() => getConditionLabel(props.product.condition));
const conditionTone = computed(() => getConditionTone(props.product.condition));
const price = computed(() => formatPrice(props.product.price, props.product.currency));
const showImage = computed(() => Boolean(props.product.image) && !imageFailed.value);

function handleBuyClick() {
  if (!inStock.value || !props.product.buyLink) return;
  window.open(props.product.buyLink, "_blank", "noopener");
}
</script>

<template>
  <article class="card">
    <div class="card-photo">
      <img
        v-if="showImage"
        :src="product.image"
        :alt="product.name"
        loading="lazy"
        @error="imageFailed = true"
      />
      <BrickIcon v-else class="placeholder-icon" />

      <span v-if="product.quantity > 1" class="qty-badge">×{{ product.quantity }}</span>
      <div v-if="!inStock" class="sold-out-badge">Продано</div>
    </div>

    <div class="card-body">
      <span class="card-category">{{ product.category }}</span>
      <h3 class="card-title">{{ product.name }}</h3>
      <p class="card-desc">{{ product.description }}</p>

      <div class="card-meta">
        <span class="condition-tag">
          <span class="condition-dot" :data-tone="conditionTone"></span>{{ conditionLabel }}
        </span>
        <span class="price">{{ price }}</span>
      </div>

      <button class="buy-btn" :disabled="!inStock" @click="handleBuyClick">
        {{ inStock ? "Купить" : "Нет в наличии" }}
      </button>
    </div>
  </article>
</template>

<style scoped>
.card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.card:hover {
  transform: translateY(-3px);
  border-color: #333a48;
  background: var(--surface-hover);
}

.card-photo {
  aspect-ratio: 1 / 1;
  position: relative;
  overflow: hidden;
  background: radial-gradient(circle at 30% 20%, var(--signal-blue-soft), transparent 60%),
    radial-gradient(circle at 75% 80%, var(--signal-orange-soft), transparent 55%), #10131a,
    radial-gradient(var(--line) 1px, transparent 1px);
  background-size: auto, auto, auto, 16px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-photo img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 10px;
}

.card-photo .placeholder-icon {
  width: 42%;
  height: 42%;
  color: var(--line);
}

.qty-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(11, 13, 18, 0.75);
  border: 1px solid var(--line);
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 999px;
}

.sold-out-badge {
  position: absolute;
  inset: 0;
  background: rgba(11, 13, 18, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.card-body {
  padding: 14px 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.card-category {
  font-size: 11px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.card-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 16px;
  line-height: 1.25;
  margin: 0;
}

.card-desc {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
  flex: 1;
}

.card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 13px;
}

.condition-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--muted);
}

.condition-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex: none;
}

.condition-dot[data-tone="blue"] {
  background: var(--signal-blue);
  box-shadow: 0 0 8px var(--signal-blue);
}

.condition-dot[data-tone="orange"] {
  background: var(--signal-orange);
  box-shadow: 0 0 8px var(--signal-orange);
}

.price {
  font-weight: 700;
  font-size: 15px;
  color: var(--paper);
}

.buy-btn {
  margin-top: 4px;
  width: 100%;
  padding: 10px;
  border-radius: var(--radius-sm);
  border: none;
  background: var(--signal-blue);
  color: #08111f;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease;
}

.buy-btn:hover {
  background: #6ba0ff;
  box-shadow: 0 0 0 3px var(--signal-orange-soft);
}

.buy-btn:active {
  transform: scale(0.98);
}

.buy-btn:disabled {
  background: var(--line);
  color: var(--muted);
  cursor: not-allowed;
}

.buy-btn:disabled:hover {
  box-shadow: none;
}

@media (max-width: 640px) {
  .card-title {
    font-size: 14px;
  }
}
</style>
