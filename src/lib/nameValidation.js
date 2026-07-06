// Разрешены: английский алфавит + азербайджанские латинские буквы + пробелы, дефисы, апострофы
const ALLOWED_NAME_PATTERN = /^[A-Za-zƏəĞğIıİiÖöŞşÇçÜü\s'-]+$/;

// Базовый список — не претендует на полноту, отсекает самые очевидные случаи.
// При необходимости этот список можно расширять.
const BLOCKED_WORDS = [
  "fuck", "shit", "bitch", "asshole", "cunt", "dick", "penis", "sex",
  "хуй", "пизда", "блять", "сука", "ебать", "мудак",
  "sik", "amcik", "qehbe", "orospu",
];

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

  const lower = name.toLowerCase();
  const hasBlockedWord = BLOCKED_WORDS.some((word) => lower.includes(word));
  if (hasBlockedWord) {
    return { valid: false, reason: "Пожалуйста, введите настоящее имя" };
  }

  return { valid: true, reason: null };
}
