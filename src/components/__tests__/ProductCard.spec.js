import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import ProductCard from "../ProductCard.vue";
import { useCart, CART_KEY } from "../../composables/useCart";
import { formatPrice } from "../../utils/format";

const baseProduct = {
  id: "sw-001",
  name: "Джедай-рыцарь",
  category: "Star Wars",
  description: "Оригинальная минифигурка",
  price: 1200,
  currency: "RUB",
  quantity: 1,
  condition: "used",
  image: "",
};

// Карточке нужна корзина из provide() — в приложении её создаёт App.vue,
// в тесте создаём такую же вручную.
function mountCard(overrides = {}) {
  const product = { ...baseProduct, ...overrides };
  const cart = useCart(ref([product]));
  const wrapper = mount(ProductCard, {
    props: { product },
    global: { provide: { [CART_KEY]: cart } },
  });
  return { wrapper, cart, product };
}

beforeEach(() => {
  localStorage.clear();
});

describe("ProductCard", () => {
  it("показывает название, цену и состояние", () => {
    const { wrapper } = mountCard();
    expect(wrapper.text()).toContain("Джедай-рыцарь");
    expect(wrapper.text()).toContain(formatPrice(baseProduct.price, baseProduct.currency));
    expect(wrapper.text()).toContain("Б/у");
  });

  it("показывает бейдж количества, только если товаров больше одного", () => {
    expect(mountCard().wrapper.find(".qty-badge").exists()).toBe(false);
    expect(mountCard({ quantity: 3 }).wrapper.find(".qty-badge").text()).toBe("×3");
  });

  it("блокирует кнопку и показывает «Нет в наличии», если quantity = 0", () => {
    const { wrapper } = mountCard({ quantity: 0 });
    const button = wrapper.find(".buy-btn");

    expect(button.attributes("disabled")).toBeDefined();
    expect(button.text()).toBe("Нет в наличии");
    expect(wrapper.find(".sold-out-badge").exists()).toBe(true);
  });

  describe("корзина", () => {
    it("по умолчанию показывает «В корзину»", () => {
      const { wrapper } = mountCard();
      expect(wrapper.find(".buy-btn").text()).toBe("В корзину");
      expect(wrapper.find(".stepper").exists()).toBe(false);
    });

    it("клик по «В корзину» кладёт товар и меняет кнопку на степпер", async () => {
      const { wrapper, cart } = mountCard({ quantity: 3 });

      await wrapper.find(".buy-btn").trigger("click");

      expect(cart.qtyOf("sw-001")).toBe(1);
      expect(wrapper.find(".buy-btn").exists()).toBe(false);
      expect(wrapper.find(".stepper-count").text()).toBe("В корзине: 1");
    });

    it("«+» и «−» меняют количество, «−» на единице возвращает «В корзину»", async () => {
      const { wrapper, cart } = mountCard({ quantity: 3 });
      await wrapper.find(".buy-btn").trigger("click");

      const [minus, plus] = wrapper.findAll(".stepper-btn");
      await plus.trigger("click");
      expect(wrapper.find(".stepper-count").text()).toBe("В корзине: 2");

      await minus.trigger("click");
      await minus.trigger("click");
      expect(cart.qtyOf("sw-001")).toBe(0);
      expect(wrapper.find(".buy-btn").text()).toBe("В корзину");
    });

    it("«+» блокируется, когда в корзине всё, что есть в наличии", async () => {
      const { wrapper } = mountCard({ quantity: 1 });
      await wrapper.find(".buy-btn").trigger("click");

      const plus = wrapper.findAll(".stepper-btn")[1];
      expect(plus.attributes("disabled")).toBeDefined();
    });

    it("без provide(корзины) падает с понятной ошибкой", () => {
      expect(() => mount(ProductCard, { props: { product: baseProduct } })).toThrow(/provideCart/);
    });
  });
});
