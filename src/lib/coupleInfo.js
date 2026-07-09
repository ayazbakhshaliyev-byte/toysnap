// Читает локализованные поля пары из event с разумным откатом на другие языки,
// если для текущего языка организатор ещё не заполнил поле.
function readField(event, base, lang) {
  if (!event) return "";
  const order = [lang, "en", "az", "ru"];
  for (const l of order) {
    const val = event[`${base}_${l}`];
    if (val) return val;
  }
  return "";
}

export function getPartnerName(event, num, lang) {
  return readField(event, `partner${num}_name`, lang);
}

export function getCityName(event, lang) {
  return readField(event, "city", lang);
}

// Инициалы всегда берутся из английского варианта имени — монограмма декоративная
// и не должна "переключаться" при смене языка интерфейса.
export function getMonogramInitials(event) {
  const n1 = getPartnerName(event, 1, "en");
  const n2 = getPartnerName(event, 2, "en");
  return {
    initial1: n1 ? n1.trim()[0].toUpperCase() : "",
    initial2: n2 ? n2.trim()[0].toUpperCase() : "",
  };
}

// true, если организатор заполнил имена пары хотя бы для одного языка —
// иначе экраны должны красиво откатиться на старое поведение (event.title).
export function hasCoupleNames(event) {
  return !!(getPartnerName(event, 1, "az") || getPartnerName(event, 1, "ru") || getPartnerName(event, 1, "en")) &&
    !!(getPartnerName(event, 2, "az") || getPartnerName(event, 2, "ru") || getPartnerName(event, 2, "en"));
}
