import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { ref, nextTick } from "vue";
import CartDrawer from "../CartDrawer.vue";
import { useCart, CART_KEY } from "../../composables/useCart";
import { openLink } from "../../utils/telegram";

// Реальную навигацию в чат не запускаем — проверяем, с чем её вызвали.
vi.mock("../../utils/telegram", () => ({
  openLink: vi.fn(),
}));

const jedi = { id: "sw-001", name: "Джедай-рыцарь", price: 1200, currency: "RUB", quantity: 3, condition: "used" };
const trooper = { id: "sw-002", name: "Штурмовик", price: 900, currency: "RUB", quantity: 5, condition: "new" };

let wrapper;

function mountDrawer({ open = true, add = [] } = {}) {
  const cart = useCart(ref([jedi, trooper]));
  add.forEach(([product, times]) => {
    for (let i = 0; i < times; i++) cart.add(product);
  });

  wrapper = mount(CartDrawer, {
    props: { open },
    attachTo: document.body,
    global: { provide: { [CART_KEY]: cart } },
  });
  return { cart, wrapper };
}

beforeEach(() => {
  localStorage.clear();
  openLink.mockClear();
});

afterEach(() => {
  wrapper?.unmount();
  document.body.style.overflow = "";
});

describe("CartDrawer", () => {
  it("закрытая панель ничего не рендерит", () => {
    mountDrawer({ open: false });
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });

  it("пустая корзина: подсказка и нет кнопки заказа", () => {
    mountDrawer();
    expect(wrapper.text()).toContain("Корзина пуста");
    expect(wrapper.find(".order-btn").exists()).toBe(false);
  });

  it("показывает позиции, количество и итог", () => {
    mountDrawer({ add: [[jedi, 2], [trooper, 1]] });

    expect(wrapper.text()).toContain("Джедай-рыцарь");
    expect(wrapper.text()).toContain("Штурмовик");
    expect(wrapper.text()).toContain("Итого · 3 шт.");
    expect(wrapper.find(".total-price").text().replace(/\s/g, "")).toBe("3300₽");
  });

  it("«Заказать» открывает чат с @kompot_lego и готовым текстом заказа", async () => {
    mountDrawer({ add: [[jedi, 2], [trooper, 1]] });

    await wrapper.find(".order-btn").trigger("click");

    expect(openLink).toHaveBeenCalledTimes(1);
    const url = new URL(openLink.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe("https://t.me/kompot_lego");

    const text = url.searchParams.get("text");
    expect(text).toContain("Джедай-рыцарь (sw-001) — 2 × 1 200 ₽ = 2 400 ₽");
    expect(text).toContain("Штурмовик (sw-002) — 1 × 900 ₽ = 900 ₽");
    expect(text).toContain("Итого: 3 300 ₽ (3 шт.)");
  });

  it("после заказа корзина остаётся (неизвестно, отправил ли покупатель сообщение)", async () => {
    const { cart } = mountDrawer({ add: [[jedi, 1]] });
    await wrapper.find(".order-btn").trigger("click");
    expect(cart.count.value).toBe(1);
  });

  it("«Очистить корзину» опустошает её и показывает пустое состояние", async () => {
    const { cart } = mountDrawer({ add: [[jedi, 2]] });

    await wrapper.find(".clear-btn").trigger("click");

    expect(cart.count.value).toBe(0);
    expect(wrapper.text()).toContain("Корзина пуста");
  });

  it("кнопка ✕ и Esc просят закрыть панель", async () => {
    mountDrawer();

    await wrapper.find(".close-btn").trigger("click");
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(wrapper.emitted("close")).toHaveLength(2);
  });

  it("клик по затемнению закрывает, клик внутри панели — нет", async () => {
    mountDrawer();

    await wrapper.find(".panel").trigger("click");
    expect(wrapper.emitted("close")).toBeUndefined();

    await wrapper.find(".overlay").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("при открытии блокирует прокрутку страницы и ставит фокус на ✕, при закрытии возвращает", async () => {
    mountDrawer({ open: false });
    expect(document.body.style.overflow).toBe("");

    await wrapper.setProps({ open: true });
    await nextTick();
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.activeElement).toBe(wrapper.find(".close-btn").element);

    await wrapper.setProps({ open: false });
    expect(document.body.style.overflow).toBe("");
  });

  it("не слушает Esc, когда закрыта", () => {
    mountDrawer({ open: false });
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(wrapper.emitted("close")).toBeUndefined();
  });
});
