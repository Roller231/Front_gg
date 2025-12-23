/**
 * Маскирует имя пользователя: первые 3 символа + **** + последние 3 символа
 * Например: "mr_testman" -> "mr_****man"
 * Для коротких имен (<=6 символов) показывает первые 2 + ** + последние 2
 */
export function maskUsername(name) {
  if (!name || typeof name !== 'string') return name

  const trimmed = name.trim()
  
  if (trimmed.length <= 4) {
    // Слишком короткое имя - показываем первый и последний символ
    return trimmed[0] + '**' + trimmed[trimmed.length - 1]
  }
  
  if (trimmed.length <= 6) {
    // Короткое имя - показываем первые 2 и последние 2
    return trimmed.slice(0, 2) + '**' + trimmed.slice(-2)
  }
  
  // Стандартная маскировка: первые 3 + **** + последние 3
  return trimmed.slice(0, 3) + '****' + trimmed.slice(-3)
}

export default maskUsername
