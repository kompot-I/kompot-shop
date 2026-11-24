// Тонкая обёртка над Telegram WebApp SDK (telegram-web-app.js).
// Вне Telegram (обычный браузер, `npm run dev`) SDK либо не загружен,
// либо window.Telegram.WebApp.initData пустая — тогда всё работает как
// обычный сайт, поэтому каждая функция тут «безопасна» без Telegram.

const BACKGROUND = "#0b0d12";

export function getWebApp() {
  return window.Telegram?.WebApp ?? null;
}

// initData непустая только когда страницу реально открыл Telegram.
export function isInsideTelegram() {
  const app = getWebApp();
  return Boolean(app && app.initData);
}

export function initTelegram() {
  const app = getWebApp();
  if (!app || !app.initData) return;

  try {
    app.ready();
    app.expand();
    // Цвета шапки/фона задаются hex-строкой с версии Bot API 6.9.
    if (app.isVersionAtLeast?.("6.9")) {
      app.setHeaderColor(BACKGROUND);
      app.setBackgroundColor(BACKGROUND);
    }
  } catch (err) {
    console.warn("Telegram WebApp: не удалось инициализировать", err);
  }
}

// Открывает ссылку: внутри Telegram — нативно (чат открывается поверх
// мини-аппа), в браузере — в новой вкладке.
export function openLink(url) {
  const app = getWebApp();
  const isTelegramLink = /^https:\/\/t\.me\//.test(url);

  if (app && app.initData && isTelegramLink && typeof app.openTelegramLink === "function") {
    app.openTelegramLink(url);
    return;
  }
  window.open(url, "_blank", "noopener");
}
