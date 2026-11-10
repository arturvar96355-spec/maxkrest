// Единый источник описания динамических полей шага 2.
// Используется и в UI мастера заявки, и в серверной валидации.

export type FieldDef = {
  name: string;
  label: string;
  type: "select" | "number" | "text" | "textarea";
  options?: string[];
  /** Для числовых полей: чекбокс «не знаю» */
  unknownOption?: boolean;
  required?: boolean;
  placeholder?: string;
  unit?: string;
};

export type FormKey =
  | "private"
  | "commercial"
  | "roof"
  | "parking"
  | "mechanized"
  | "removal"
  | "complex"
  | "other";

export const SERVICE_CHOICES: { key: FormKey; label: string }[] = [
  { key: "private", label: "Уборка снега на частной территории" },
  { key: "commercial", label: "Уборка коммерческой территории" },
  { key: "roof", label: "Очистка крыши от снега и наледи" },
  { key: "parking", label: "Уборка парковки или проезда" },
  { key: "mechanized", label: "Механизированная уборка" },
  { key: "removal", label: "Вывоз снега" },
  { key: "complex", label: "Комплексное/регулярное обслуживание" },
  { key: "other", label: "Другая услуга" },
];

const territoryTypes = ["Частный участок", "Двор жилого дома", "Коммерческая территория", "Предприятие", "Склад", "Другое"];

export const FIELDS: Record<FormKey, FieldDef[]> = {
  roof: [
    { name: "roofType", label: "Тип крыши", type: "select", options: ["Плоская", "Скатная", "Мансардная", "Другая", "Не знаю"] },
    { name: "roofArea", label: "Примерная площадь крыши", type: "number", unit: "м²", unknownOption: true },
    { name: "buildingHeight", label: "Высота здания", type: "select", options: ["До 5 м", "5–10 м", "10–20 м", "Более 20 м", "Не знаю"] },
    { name: "floors", label: "Количество этажей", type: "number" },
    { name: "objectType", label: "Тип объекта", type: "select", options: ["Частный дом", "Многоквартирный дом", "Офис", "Торговый объект", "Склад", "Производство", "Другое"] },
    { name: "roofWork", label: "Что требуется", type: "select", options: ["Уборка снега", "Удаление наледи", "Удаление сосулек", "Комплексная очистка", "Другое"] },
    { name: "needRemoval", label: "Нужен ли вывоз снега", type: "select", options: ["Да", "Нет", "Требуется консультация"] },
  ],
  private: [
    { name: "objectType", label: "Тип объекта", type: "select", options: territoryTypes },
    { name: "area", label: "Примерная площадь территории", type: "number", unit: "м²", unknownOption: true },
    { name: "clearWhat", label: "Что требуется очистить", type: "select", options: ["Дорожки", "Двор", "Въезд", "Проезды", "Площадка", "Вся территория", "Другое"] },
    { name: "method", label: "Предпочтительный способ", type: "select", options: ["Вручную", "Техникой", "Определить после консультации"] },
    { name: "needRemoval", label: "Нужен ли вывоз снега", type: "select", options: ["Да", "Нет", "Не знаю"] },
  ],
  commercial: [
    { name: "objectType", label: "Тип объекта", type: "select", options: territoryTypes },
    { name: "area", label: "Примерная площадь территории", type: "number", unit: "м²", unknownOption: true },
    { name: "clearWhat", label: "Что требуется очистить", type: "select", options: ["Дорожки", "Двор", "Въезд", "Проезды", "Площадка", "Вся территория", "Другое"] },
    { name: "method", label: "Предпочтительный способ", type: "select", options: ["Вручную", "Техникой", "Определить после консультации"] },
    { name: "needRemoval", label: "Нужен ли вывоз снега", type: "select", options: ["Да", "Нет", "Не знаю"] },
  ],
  parking: [
    { name: "area", label: "Площадь", type: "number", unit: "м²", unknownOption: true },
    { name: "spots", label: "Количество парковочных мест", type: "number" },
    { name: "parkingType", label: "Тип", type: "select", options: ["Открытая", "Крытая", "Подземная", "Проезд", "Другое"] },
    { name: "method", label: "Способ уборки", type: "select", options: ["Ручной", "Механизированный", "Комбинированный", "Нужна консультация"] },
    { name: "needRemoval", label: "Нужен ли вывоз снега", type: "select", options: ["Да", "Нет", "Не знаю"] },
    { name: "frequency", label: "Периодичность", type: "select", options: ["Разово", "Ежедневно", "Несколько раз в неделю", "По необходимости"] },
  ],
  mechanized: [
    { name: "area", label: "Площадь территории (если известна)", type: "number", unit: "м²", unknownOption: true },
    { name: "objectType", label: "Тип объекта", type: "text" },
    { name: "mechWork", label: "Необходимые работы", type: "select", options: ["Расчистка", "Перемещение снега", "Погрузка", "Вывоз", "Другое"] },
    { name: "access", label: "Условия подъезда и доступности для техники", type: "textarea" },
  ],
  removal: [
    { name: "volume", label: "Ориентировочный объём снега", type: "number", unit: "м³" },
    { name: "needLoading", label: "Нужна ли погрузка", type: "select", options: ["Да", "Нет", "Не знаю"] },
    { name: "truckAccess", label: "Есть ли подъезд грузового транспорта", type: "select", options: ["Да", "Нет", "Не знаю"] },
    { name: "deadline", label: "Желаемый срок выполнения", type: "text" },
  ],
  complex: [
    { name: "objectType", label: "Тип объекта", type: "select", options: territoryTypes },
    { name: "area", label: "Примерная площадь территории", type: "number", unit: "м²", unknownOption: true },
    { name: "frequency", label: "Периодичность", type: "select", options: ["На зимний сезон", "Ежедневно", "Несколько раз в неделю", "По необходимости"] },
  ],
  other: [{ name: "describe", label: "Что требуется", type: "textarea" }],
};

export const ORDER_KINDS = ["Разовая уборка", "Регулярное обслуживание", "Срочная заявка", "Обслуживание на зимний сезон"];
export const CONTACT_METHODS = ["Телефон", "Telegram", "WhatsApp"];

export function fieldsFor(services: FormKey[]): { service: FormKey; fields: FieldDef[] }[] {
  return services.map((s) => ({ service: s, fields: FIELDS[s] }));
}

export const serviceLabel = (k: string) => SERVICE_CHOICES.find((s) => s.key === k)?.label ?? k;
