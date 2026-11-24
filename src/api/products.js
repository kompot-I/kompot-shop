// Сейчас источник данных — статический products.json из папки public/.
// Когда появится бэкенд на Kotlin/Spring Boot с эндпоинтом
// GET /api/products, отдающим тот же формат ({ "products": [...] }),
// меняем ровно эту константу — остальной код (composables, компоненты)
// не трогаем.
//
// Путь НАМЕРЕННО без ведущего «/»: адрес считается от страницы, поэтому
// сайт работает и в корне домена, и в подпапке (GitHub Pages:
// https://<логин>.github.io/<репозиторий>/). Вместе с `base: "./"`
// в vite.config.js.
const DATA_URL = "products.json";

export async function fetchProducts() {
  const res = await fetch(DATA_URL);
  if (!res.ok) {
    throw new Error(`Не удалось загрузить каталог: HTTP ${res.status}`);
  }
  const data = await res.json();
  return Array.isArray(data.products) ? data.products : [];
}
