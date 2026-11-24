import { formatPrice } from "./format";

// Лимит на текст сообщения в Telegram — 4096 символов; оставляем запас.
const MAX_MESSAGE_LENGTH = 3500;

// toLocaleString("ru-RU") ставит неразрывные пробелы — в тексте сообщения
// они ни к чему, заменяем на обычные.
function money(value, currency) {
  return formatPrice(value, currency).replace(/[  ]/g, " ");
}

/**
 * Собирает текст заказа для менеджера.
 *
 * @param items элементы корзины: [{ product, quantity, lineTotal }]
 * @param shopName название магазина для приветствия
 */
export function buildOrderMessage(items, { shopName = "KOMPOT LEGO" } = {}) {
  if (items.length === 0) return "";

  const currency = items[0].product.currency;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);

  const lines = items.map(({ product, quantity, lineTotal }, index) => {
    const unit = money(product.price, currency);
    const line = money(lineTotal, currency);
    return `${index + 1}. ${product.name} (${product.id}) — ${quantity} × ${unit} = ${line}`;
  });

  const header = `Здравствуйте! Хочу заказать в ${shopName}:`;
  const footer = `Итого: ${money(total, currency)} (${totalQuantity} шт.)`;

  const compose = (shown) => {
    const hidden = lines.length - shown;
    return [
      header,
      "",
      ...lines.slice(0, shown),
      ...(hidden > 0 ? [`…и ещё ${hidden} поз. — состав уточню в чате`] : []),
      "",
      footer,
    ].join("\n");
  };

  // Если корзина огромная — урезаем список позиций, но итог остаётся полным.
  let shown = lines.length;
  while (shown > 1 && compose(shown).length > MAX_MESSAGE_LENGTH) shown--;
  return compose(shown);
}

/**
 * Ссылка, которая открывает чат с пользователем и подставляет текст
 * в поле ввода. Покупателю остаётся нажать «Отправить».
 */
export function buildManagerLink(username, text) {
  const handle = username.replace(/^@/, "");
  return `https://t.me/${handle}?text=${encodeURIComponent(text)}`;
}
