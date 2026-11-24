import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ProductCard from "../ProductCard.vue";
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
  buyLink: "https://t.me/example",
};

describe("ProductCard", () => {
  it("показывает название, цену и состояние", () => {
    const wrapper = mount(ProductCard, { props: { product: baseProduct } });
    expect(wrapper.text()).toContain("Джедай-рыцарь");
    expect(wrapper.text()).toContain(formatPrice(baseProduct.price, baseProduct.currency));
    expect(wrapper.text()).toContain("Б/у");
  });

  it("показывает бейдж количества, только если товаров больше одного", () => {
    const single = mount(ProductCard, { props: { product: baseProduct } });
    expect(single.find(".qty-badge").exists()).toBe(false);

    const multiple = mount(ProductCard, {
      props: { product: { ...baseProduct, quantity: 3 } },
    });
    expect(multiple.find(".qty-badge").text()).toBe("×3");
  });

  it("блокирует кнопку и показывает «Нет в наличии», если quantity = 0", () => {
    const wrapper = mount(ProductCard, {
      props: { product: { ...baseProduct, quantity: 0 } },
    });
    const button = wrapper.find(".buy-btn");
    expect(button.attributes("disabled")).toBeDefined();
    expect(button.text()).toBe("Нет в наличии");
    expect(wrapper.find(".sold-out-badge").exists()).toBe(true);
  });

  it("открывает buyLink в новой вкладке по клику на «Купить»", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => {});
    const wrapper = mount(ProductCard, { props: { product: baseProduct } });

    await wrapper.find(".buy-btn").trigger("click");

    expect(openSpy).toHaveBeenCalledWith("https://t.me/example", "_blank", "noopener");
    openSpy.mockRestore();
  });
});
