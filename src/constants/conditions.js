// Единый источник правды для состояний товара.
// Добавить новое состояние — значит дописать одну строку здесь,
// а не искать все места в коде, где оно упоминается.

export const CONDITIONS = [
  { value: "new", label: "Новый", tone: "blue" },
  { value: "like_new", label: "Как новый", tone: "blue" },
  { value: "used", label: "Б/у", tone: "orange" },
];

export const CONDITION_MAP = Object.fromEntries(
  CONDITIONS.map((c) => [c.value, c])
);

export function getConditionLabel(value) {
  return CONDITION_MAP[value]?.label ?? value;
}

export function getConditionTone(value) {
  return CONDITION_MAP[value]?.tone ?? "orange";
}
