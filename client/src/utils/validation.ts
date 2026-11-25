// Сумма из текстового поля: допускаем запятую, возвращаем null, если значение некорректно или не больше нуля
export const parseAmount = (value: string): number | null => {
  const amount = Number(value.trim().replace(',', '.'));
  return Number.isFinite(amount) && amount > 0 ? amount : null;
};
