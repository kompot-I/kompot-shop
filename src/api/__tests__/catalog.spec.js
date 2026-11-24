// @vitest-environment node
// (DOM тут не нужен: тест читает файлы с диска, а в окружении jsdom
// глобальный URL подменён и `fs` его не принимает.)
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { CONDITIONS } from "../../constants/conditions";

// Проверяет сам файл каталога public/products.json — чтобы опечатка при
// ручном заполнении (пропущенная запятая, неверное состояние, фото с другим
// регистром в имени) нашлась по `npm test`, а не у покупателя.
// Как заполнять каталог — в PRODUCTS.md.

const PUBLIC_DIR = new URL("../../../public/", import.meta.url);
const CONDITION_VALUES = CONDITIONS.map((c) => c.value);

function readCatalog() {
  const raw = readFileSync(new URL("products.json", PUBLIC_DIR), "utf8");
  return JSON.parse(raw);
}

// Файл существует И имя совпадает по регистру. На macOS файловая система
// регистр не различает, а на хостинге (Linux) — различает, так что обычный
// existsSync «пропустил» бы IMG_8400.PNG вместо img_8400.png.
function imageExistsExactly(relativePath) {
  const target = new URL(relativePath, PUBLIC_DIR);
  if (!existsSync(target)) return false;

  const segments = relativePath.split("/");
  let dir = PUBLIC_DIR;
  for (const segment of segments) {
    const names = readdirSync(dir);
    if (!names.includes(segment)) return false;
    dir = new URL(`${segment}/`, dir);
  }
  return true;
}

function problemsOf(product, index) {
  const label = product?.id ? `«${product.id}»` : `товар №${index + 1}`;
  const problems = [];
  const fail = (text) => problems.push(`${label}: ${text}`);

  if (typeof product.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.id)) {
    fail("id — строчная латиница, цифры и дефис, например sw-001");
  }
  if (typeof product.name !== "string" || product.name.trim() === "") {
    fail("name не заполнено");
  }
  if (typeof product.category !== "string" || product.category.trim() === "") {
    fail("category не заполнено");
  }
  if (typeof product.description !== "string") {
    fail("description должно быть строкой (можно пустой)");
  }
  if (typeof product.price !== "number" || !Number.isFinite(product.price) || product.price <= 0) {
    fail("price — число больше нуля, без кавычек (1200, а не \"1 200 ₽\")");
  }
  if (product.currency !== "RUB") {
    fail('currency должна быть "RUB"');
  }
  if (!Number.isInteger(product.quantity) || product.quantity < 0) {
    fail("quantity — целое число от 0, без кавычек");
  }
  if (!CONDITION_VALUES.includes(product.condition)) {
    fail(`condition — одно из: ${CONDITION_VALUES.join(", ")} (сейчас: ${JSON.stringify(product.condition)})`);
  }

  const image = product.image;
  if (typeof image !== "string") {
    fail('image должно быть строкой (пустая "" — будет заглушка)');
  } else if (image !== "" && !/^https?:\/\//.test(image)) {
    if (image.startsWith("/")) {
      fail(`image пишите без «/» в начале: "images/..." (сейчас: "${image}")`);
    } else if (!imageExistsExactly(image)) {
      fail(`файл "${image}" не найден в public/ (проверьте имя и регистр букв)`);
    }
  }

  return problems;
}

describe("public/products.json", () => {
  it("валидный JSON вида { products: [...] }", () => {
    const catalog = readCatalog();
    expect(Array.isArray(catalog.products)).toBe(true);
    expect(catalog.products.length).toBeGreaterThan(0);
  });

  it("у каждого товара корректные поля", () => {
    const { products } = readCatalog();
    const problems = products.flatMap(problemsOf);
    expect(problems).toEqual([]);
  });

  it("id не повторяются", () => {
    const ids = readCatalog().products.map((p) => p.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    expect(duplicates).toEqual([]);
  });
});
