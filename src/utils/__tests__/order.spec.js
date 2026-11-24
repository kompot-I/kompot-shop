import { describe, it, expect } from "vitest";
import { buildOrderMessage, buildManagerLink } from "../order";

function item(id, name, price, quantity) {
  return {
    product: { id, name, price, currency: "RUB" },
    quantity,
    lineTotal: price * quantity,
  };
}

describe("buildOrderMessage", () => {
  const items = [item("sw-001", "Джедай-рыцарь", 1200, 2), item("cty-001", "Полицейский", 450, 1)];

  it("перечисляет позиции с id, количеством и суммой по строке", () => {
    const text = buildOrderMessage(items, { shopName: "BRICKBOX" });

    expect(text).toContain("Здравствуйте! Хочу заказать в BRICKBOX:");
    expect(text).toContain("1. Джедай-рыцарь (sw-001) — 2 × 1 200 ₽ = 2 400 ₽");
    expect(text).toContain("2. Полицейский (cty-001) — 1 × 450 ₽ = 450 ₽");
  });

  it("считает итог и общее число штук", () => {
    const text = buildOrderMessage(items);
    expect(text).toContain("Итого: 2 850 ₽ (3 шт.)");
  });

  it("не содержит неразрывных пробелов", () => {
    expect(buildOrderMessage(items)).not.toMatch(/[  ]/);
  });

  it("для пустой корзины возвращает пустую строку", () => {
    expect(buildOrderMessage([])).toBe("");
  });

  it("урезает слишком длинный список, но итог остаётся полным", () => {
    const many = Array.from({ length: 200 }, (_, i) =>
      item(`id-${i}`, `Очень длинное название минифигурки номер ${i}`, 100, 1)
    );
    const text = buildOrderMessage(many);

    expect(text.length).toBeLessThanOrEqual(3500);
    expect(text).toContain("…и ещё");
    expect(text).toContain("Итого: 20 000 ₽ (200 шт.)");
  });
});

describe("buildManagerLink", () => {
  it("ведёт в чат с пользователем и подставляет текст", () => {
    const link = buildManagerLink("kompot_lego", "Привет!\nЗаказ");
    expect(link.startsWith("https://t.me/kompot_lego?text=")).toBe(true);

    const text = new URL(link).searchParams.get("text");
    expect(text).toBe("Привет!\nЗаказ");
  });

  it("кодирует переносы строк и спецсимволы", () => {
    const link = buildManagerLink("kompot_lego", "a&b=c\nd");
    expect(link).toContain("%0A");
    expect(link).not.toContain("&b=");
  });

  it("принимает ник с @", () => {
    expect(buildManagerLink("@kompot_lego", "x")).toBe("https://t.me/kompot_lego?text=x");
  });
});
