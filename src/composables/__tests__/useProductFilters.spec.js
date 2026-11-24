import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useProductFilters } from "../useProductFilters";

const sample = [
  { id: "1", name: "Джедай", category: "Star Wars", price: 1200, condition: "used" },
  { id: "2", name: "Штурмовик", category: "Star Wars", price: 900, condition: "like_new" },
  { id: "3", name: "Волшебник", category: "Harry Potter", price: 1500, condition: "new" },
];

describe("useProductFilters", () => {
  it("без фильтров возвращает все товары", () => {
    const { filtered } = useProductFilters(ref(sample));
    expect(filtered.value).toHaveLength(3);
  });

  it("ищет по названию без учёта регистра", () => {
    const { search, filtered } = useProductFilters(ref(sample));
    search.value = "штурм";
    expect(filtered.value.map((p) => p.id)).toEqual(["2"]);
  });

  it("ищет по категории", () => {
    const { search, filtered } = useProductFilters(ref(sample));
    search.value = "harry";
    expect(filtered.value.map((p) => p.id)).toEqual(["3"]);
  });

  it("фильтрует по состоянию", () => {
    const { condition, filtered } = useProductFilters(ref(sample));
    condition.value = "used";
    expect(filtered.value.map((p) => p.id)).toEqual(["1"]);
  });

  it("сортирует по цене по возрастанию", () => {
    const { sort, filtered } = useProductFilters(ref(sample));
    sort.value = "price_asc";
    expect(filtered.value.map((p) => p.id)).toEqual(["2", "1", "3"]);
  });

  it("сортирует по цене по убыванию", () => {
    const { sort, filtered } = useProductFilters(ref(sample));
    sort.value = "price_desc";
    expect(filtered.value.map((p) => p.id)).toEqual(["3", "1", "2"]);
  });

  it("поиск и фильтр по состоянию работают вместе", () => {
    const { search, condition, filtered } = useProductFilters(ref(sample));
    search.value = "star wars";
    condition.value = "like_new";
    expect(filtered.value.map((p) => p.id)).toEqual(["2"]);
  });
});
