// Инициалы гостя для круглых аватаров: первая буква первого + первая буква последнего слова.
export function getInitials(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "·";
  const a = parts[0][0] || "";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (a + b).toLocaleUpperCase();
}
