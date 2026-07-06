// Базовый список — не претендует на полноту, отсекает самые очевидные случаи.
const BLOCKED_WORDS = [
  "fuck", "shit", "bitch", "asshole", "cunt", "dick", "penis", "sex",
  "хуй", "пизда", "блять", "сука", "ебать", "мудак",
  "sik", "amcik", "qehbe", "orospu",
];

export function containsBlockedWords(text) {
  const lower = text.toLowerCase();
  return BLOCKED_WORDS.some((word) => lower.includes(word));
}
