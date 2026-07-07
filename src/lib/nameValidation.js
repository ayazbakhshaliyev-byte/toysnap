import { containsBlockedWords } from "./textFilter";

// Разрешены: английский алфавит + азербайджанские латинские буквы + пробелы, дефисы, апострофы
const ALLOWED_NAME_PATTERN = /^[A-Za-zƏəĞğIıİiÖöŞşÇçÜü\s'-]+$/;

// Возвращает ключ ошибки (не готовый текст) — перевод делает вызывающий код через t()
export function validateGuestName(rawName) {
  const name = rawName.trim();

  if (name.length < 2) {
    return { valid: false, reason: "errors.tooShort" };
  }
  if (name.length > 60) {
    return { valid: false, reason: "errors.tooLong" };
  }
  if (!ALLOWED_NAME_PATTERN.test(name)) {
    return { valid: false, reason: "errors.invalidChars" };
  }
  if (containsBlockedWords(name)) {
    return { valid: false, reason: "errors.profanity" };
  }

  return { valid: true, reason: null };
}
