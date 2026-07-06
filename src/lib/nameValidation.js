import { containsBlockedWords } from "./textFilter";

const ALLOWED_NAME_PATTERN = /^[A-Za-zƏəĞğIıİiÖöŞşÇçÜü\s'-]+$/;

export function validateGuestName(rawName) {
  const name = rawName.trim();

  if (name.length < 2) {
    return { valid: false, reason: "Имя слишком короткое" };
  }
  if (name.length > 60) {
    return { valid: false, reason: "Имя слишком длинное" };
  }
  if (!ALLOWED_NAME_PATTERN.test(name)) {
    return {
      valid: false,
      reason: "Используйте латиницу (английские или азербайджанские буквы)",
    };
  }
  if (containsBlockedWords(name)) {
    return { valid: false, reason: "Пожалуйста, введите настоящее имя" };
  }

  return { valid: true, reason: null };
}
