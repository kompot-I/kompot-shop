import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { initTelegram, openLink, isInsideTelegram } from "../telegram";

function installTelegram(overrides = {}) {
  window.Telegram = {
    WebApp: {
      initData: "query_id=abc",
      ready: vi.fn(),
      expand: vi.fn(),
      setHeaderColor: vi.fn(),
      setBackgroundColor: vi.fn(),
      isVersionAtLeast: vi.fn(() => true),
      openTelegramLink: vi.fn(),
      ...overrides,
    },
  };
  return window.Telegram.WebApp;
}

let openSpy;

beforeEach(() => {
  openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
});

afterEach(() => {
  delete window.Telegram;
  openSpy.mockRestore();
});

describe("openLink", () => {
  it("в обычном браузере открывает ссылку в новой вкладке", () => {
    openLink("https://t.me/kompot_lego?text=x");
    expect(openSpy).toHaveBeenCalledWith("https://t.me/kompot_lego?text=x", "_blank", "noopener");
  });

  it("внутри Telegram открывает t.me-ссылку нативно", () => {
    const app = installTelegram();
    openLink("https://t.me/kompot_lego?text=x");

    expect(app.openTelegramLink).toHaveBeenCalledWith("https://t.me/kompot_lego?text=x");
    expect(openSpy).not.toHaveBeenCalled();
  });

  it("внутри Telegram обычные ссылки открывает как в браузере", () => {
    const app = installTelegram();
    openLink("https://example.com");

    expect(app.openTelegramLink).not.toHaveBeenCalled();
    expect(openSpy).toHaveBeenCalledWith("https://example.com", "_blank", "noopener");
  });

  it("если SDK загружен, но initData пустая (открыто не из Telegram) — ведёт себя как браузер", () => {
    const app = installTelegram({ initData: "" });
    openLink("https://t.me/kompot_lego");

    expect(app.openTelegramLink).not.toHaveBeenCalled();
    expect(openSpy).toHaveBeenCalled();
  });
});

describe("isInsideTelegram", () => {
  it("false без SDK и с пустой initData, true — с непустой", () => {
    expect(isInsideTelegram()).toBe(false);
    installTelegram({ initData: "" });
    expect(isInsideTelegram()).toBe(false);
    installTelegram();
    expect(isInsideTelegram()).toBe(true);
  });
});

describe("initTelegram", () => {
  it("вне Telegram ничего не делает и не падает", () => {
    expect(() => initTelegram()).not.toThrow();
  });

  it("внутри Telegram вызывает ready, expand и красит шапку", () => {
    const app = installTelegram();
    initTelegram();

    expect(app.ready).toHaveBeenCalled();
    expect(app.expand).toHaveBeenCalled();
    expect(app.setHeaderColor).toHaveBeenCalledWith("#0b0d12");
    expect(app.setBackgroundColor).toHaveBeenCalledWith("#0b0d12");
  });

  it("на старых версиях клиента не трогает цвета", () => {
    const app = installTelegram({ isVersionAtLeast: vi.fn(() => false) });
    initTelegram();

    expect(app.ready).toHaveBeenCalled();
    expect(app.setHeaderColor).not.toHaveBeenCalled();
  });
});
