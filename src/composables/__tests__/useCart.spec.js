import { describe, it, expect, beforeEach } from "vitest";
import { ref, nextTick } from "vue";
import { useCart } from "../useCart";

const STORAGE_KEY = "brickbox.cart.v1";

const jedi = { id: "sw-001", name: "Джедай", price: 1200, currency: "RUB", quantity: 2 };
const trooper = { id: "sw-002", name: "Штурмовик", price: 900, currency: "RUB", quantity: 5 };
const soldOut = { id: "njo-001", name: "Ниндзя", price: 1100, currency: "RUB", quantity: 0 };

function createCart(products = [jedi, trooper, soldOut]) {
  const catalog = ref(products);
  return { catalog, cart: useCart(catalog) };
}

beforeEach(() => {
  localStorage.clear();
});

describe("useCart", () => {
  it("изначально пуста", () => {
    const { cart } = createCart();
    expect(cart.items.value).toEqual([]);
    expect(cart.count.value).toBe(0);
    expect(cart.total.value).toBe(0);
  });

  it("add увеличивает количество на единицу", () => {
    const { cart } = createCart();
    cart.add(trooper);
    cart.add(trooper);
    expect(cart.qtyOf("sw-002")).toBe(2);
  });

  it("не позволяет положить больше, чем есть в наличии", () => {
    const { cart } = createCart();
    cart.add(jedi);
    cart.add(jedi);
    cart.add(jedi); // остаток 2 — третий вызов ничего не меняет

    expect(cart.qtyOf("sw-001")).toBe(2);
    expect(cart.canAdd(jedi)).toBe(false);
  });

  it("не добавляет товар, которого нет в наличии", () => {
    const { cart } = createCart();
    cart.add(soldOut);
    expect(cart.items.value).toEqual([]);
    expect(cart.canAdd(soldOut)).toBe(false);
  });

  it("считает общее количество и сумму", () => {
    const { cart } = createCart();
    cart.add(jedi); // 1200
    cart.add(trooper);
    cart.add(trooper); // 2 × 900

    expect(cart.count.value).toBe(3);
    expect(cart.total.value).toBe(1200 + 2 * 900);
    expect(cart.items.value.map((i) => i.lineTotal)).toEqual([1200, 1800]);
  });

  it("setQty обрезает значение по остатку и убирает позицию при нуле", () => {
    const { cart } = createCart();
    cart.setQty(trooper, 99);
    expect(cart.qtyOf("sw-002")).toBe(5);

    cart.setQty(trooper, 0);
    expect(cart.qtyOf("sw-002")).toBe(0);
    expect(cart.items.value).toEqual([]);
  });

  it("setQty не уходит в минус", () => {
    const { cart } = createCart();
    cart.setQty(trooper, -3);
    expect(cart.qtyOf("sw-002")).toBe(0);
  });

  it("remove убирает позицию целиком, clear — всё", () => {
    const { cart } = createCart();
    cart.add(jedi);
    cart.add(trooper);
    cart.add(trooper);

    cart.remove("sw-002");
    expect(cart.items.value.map((i) => i.product.id)).toEqual(["sw-001"]);

    cart.clear();
    expect(cart.count.value).toBe(0);
  });

  it("берёт актуальные цены из каталога, а не запоминает старые", async () => {
    const { cart, catalog } = createCart();
    cart.add(trooper);
    expect(cart.total.value).toBe(900);

    catalog.value = [jedi, { ...trooper, price: 1000 }, soldOut];
    await nextTick();
    expect(cart.total.value).toBe(1000);
  });

  describe("сохранение в localStorage", () => {
    it("записывает только id и количество", async () => {
      const { cart } = createCart();
      cart.add(jedi);
      cart.add(trooper);
      cart.add(trooper);
      await nextTick();

      expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual({
        "sw-001": 1,
        "sw-002": 2,
      });
    });

    it("восстанавливает корзину при создании", () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ "sw-002": 3 }));
      const { cart } = createCart();
      expect(cart.qtyOf("sw-002")).toBe(3);
      expect(cart.count.value).toBe(3);
    });

    it("выкидывает товары, которых больше нет в каталоге, и подрезает по остатку", async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ "sw-001": 7, ghost: 2 }));
      const { cart } = createCart();
      await nextTick();

      expect(cart.items.value.map((i) => [i.product.id, i.quantity])).toEqual([["sw-001", 2]]);
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual({ "sw-001": 2 });
    });

    it("не стирает корзину, если каталог не загрузился (пустой список)", async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ "sw-002": 3 }));
      createCart([]);
      await nextTick();

      expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual({ "sw-002": 3 });
    });

    it("показывает сохранённую корзину, когда каталог догрузился позже", async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ "sw-002": 3 }));
      const { cart, catalog } = createCart([]);
      expect(cart.items.value).toEqual([]);

      catalog.value = [jedi, trooper];
      await nextTick();
      expect(cart.count.value).toBe(3);
    });

    it.each([
      ["невалидный JSON", "{oops"],
      ["массив вместо объекта", "[1,2,3]"],
      ["null", "null"],
    ])("мусор в хранилище (%s) даёт пустую корзину", (_name, raw) => {
      localStorage.setItem(STORAGE_KEY, raw);
      const { cart } = createCart();
      expect(cart.items.value).toEqual([]);
    });

    it("отбрасывает некорректные количества", () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ "sw-001": -1, "sw-002": 1.5, "njo-001": "3" })
      );
      const { cart } = createCart();
      expect(cart.items.value).toEqual([]);
    });
  });
});
