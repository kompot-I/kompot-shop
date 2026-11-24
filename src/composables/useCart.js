import { ref, computed, watch, provide, inject } from "vue";

const STORAGE_KEY = "brickbox.cart.v1";
const CART_KEY = Symbol("cart");

// В localStorage храним только { id: количество }. Цены и названия НЕ
// сохраняем — они всегда берутся из актуального каталога, поэтому после
// смены цены в products.json корзина покажет новую.
function loadStored() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    const result = {};
    for (const [id, qty] of Object.entries(parsed)) {
      if (Number.isInteger(qty) && qty > 0) result[id] = qty;
    }
    return result;
  } catch {
    return {};
  }
}

function persist(quantities) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quantities));
  } catch {
    // Приватный режим / переполнение — корзина просто живёт до перезагрузки.
  }
}

function stockOf(product) {
  return Math.max(0, Math.floor(Number(product.quantity) || 0));
}

// productsRef — реактивный каталог (из useProducts()).
export function useCart(productsRef) {
  const quantities = ref(loadStored());

  const productsById = computed(() => new Map(productsRef.value.map((p) => [p.id, p])));

  // Корзина «склеивается» с каталогом: позиции, которых там больше нет,
  // пропускаются, количество не превышает остаток.
  const items = computed(() => {
    const result = [];
    for (const [id, qty] of Object.entries(quantities.value)) {
      const product = productsById.value.get(id);
      if (!product) continue;

      const quantity = Math.min(qty, stockOf(product));
      if (quantity <= 0) continue;

      result.push({ product, quantity, lineTotal: product.price * quantity });
    }
    return result;
  });

  const count = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0));
  const total = computed(() => items.value.reduce((sum, item) => sum + item.lineTotal, 0));
  const currency = computed(() => items.value[0]?.product.currency ?? "RUB");

  function qtyOf(id) {
    return quantities.value[id] ?? 0;
  }

  function canAdd(product) {
    return qtyOf(product.id) < stockOf(product);
  }

  function setQty(product, qty) {
    const next = Math.min(Math.max(0, Math.floor(qty)), stockOf(product));
    const copy = { ...quantities.value };
    if (next === 0) delete copy[product.id];
    else copy[product.id] = next;
    quantities.value = copy;
  }

  function add(product) {
    setQty(product, qtyOf(product.id) + 1);
  }

  function remove(id) {
    const copy = { ...quantities.value };
    delete copy[id];
    quantities.value = copy;
  }

  function clear() {
    quantities.value = {};
  }

  // Сохранение подключаем ДО очистки ниже: иначе очистка при старте
  // (когда каталог уже есть) не попала бы в localStorage.
  watch(quantities, persist);

  // Когда каталог загрузился — выкидываем из сохранённой корзины то, чего
  // в нём уже нет (товар сняли с продажи), и подрезаем по остаткам.
  // Пустой каталог (ошибка загрузки) игнорируем, чтобы не стереть корзину.
  watch(
    productsRef,
    (products) => {
      if (products.length === 0) return;
      const cleaned = {};
      for (const [id, qty] of Object.entries(quantities.value)) {
        const product = productsById.value.get(id);
        if (!product) continue;
        const quantity = Math.min(qty, stockOf(product));
        if (quantity > 0) cleaned[id] = quantity;
      }
      quantities.value = cleaned;
    },
    { immediate: true }
  );

  return { items, count, total, currency, qtyOf, canAdd, add, setQty, remove, clear };
}

// provide/inject — встроенный в Vue аналог DI-контейнера: App.vue один раз
// создаёт корзину, а любая карточка или панель получает ту же самую.
export function provideCart(productsRef) {
  const cart = useCart(productsRef);
  provide(CART_KEY, cart);
  return cart;
}

export function injectCart() {
  const cart = inject(CART_KEY, null);
  if (!cart) {
    throw new Error("Корзина не предоставлена: вызовите provideCart() в корневом компоненте");
  }
  return cart;
}

export { CART_KEY };
