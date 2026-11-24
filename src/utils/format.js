export function formatPrice(value, currency) {
  const symbol = currency === "RUB" ? "₽" : currency || "";
  return `${Number(value).toLocaleString("ru-RU")} ${symbol}`.trim();
}
