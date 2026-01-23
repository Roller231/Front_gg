# API для авторизации и регистрации пользователей

## Текущие эндпоинты (уже реализованы)

### POST `/api/users/`
Создание нового пользователя.

**Request Body:**
```json
{
  "tg_id": "string",           // Уникальный ID (для TG или desktop_*)
  "username": "string",         // Имя пользователя
  "firstname": "string",        // Отображаемое имя
  "email": "string | null",     // Email (опционально)
  "password": "string",         // Пароль (НУЖНО ДОБАВИТЬ)
  "refLink": "string",          // Реферальная ссылка
  "url_image": "string | null"  // URL аватара
}
```

**Response:**
```json
{
  "id": 123,
  "tg_id": "desktop_1234567890_abc123",
  "username": "newuser",
  "firstname": "New User",
  "email": "user@example.com",
  "balance": 0,
  "level": 1,
  "xp": 0,
  "inventory": [],
  "refLink": "https://ggcat.org/ref/desktop_1234567890_abc123",
  "url_image": null
}
```

---

## Новые эндпоинты (НУЖНО ДОБАВИТЬ)

### POST `/api/users/login`
Авторизация пользователя по username и паролю.

**Request Body:**
```json
{
  "username": "string",  // Имя пользователя
  "password": "string"   // Пароль
}
```

**Response (успех):**
```json
{
  "success": true,
  "user": {
    "id": 123,
    "tg_id": "desktop_1234567890_abc123",
    "username": "existinguser",
    "firstname": "Existing User",
    "email": "user@example.com",
    "balance": 1500.50,
    "level": 5,
    "xp": 4200,
    "inventory": [...],
    "refLink": "https://ggcat.org/ref/desktop_1234567890_abc123",
    "url_image": "https://..."
  }
}
```

**Response (ошибка):**
```json
{
  "success": false,
  "detail": "Invalid credentials"  // или "User not found"
}
```

**HTTP коды:**
- `200` — успешный вход
- `401` — неверный пароль
- `404` — пользователь не найден

---

## Изменения в существующих эндпоинтах

### POST `/api/users/` — добавить поле `password`

При создании пользователя теперь может передаваться поле `password`:

```json
{
  "tg_id": "desktop_1234567890_abc123",
  "username": "newuser",
  "firstname": "New User",
  "email": "user@example.com",
  "password": "securepassword123",  // <-- НОВОЕ ПОЛЕ
  "refLink": "https://ggcat.org/ref/...",
  "url_image": null
}
```

**Требования к паролю:**
- Минимум 6 символов
- Хешировать перед сохранением (bcrypt рекомендуется)

---

## Модель пользователя (обновление)

Добавить поля в модель User:

```python
class User:
    # ... существующие поля ...
    
    email: str | None = None       # Email пользователя (опционально)
    password_hash: str | None = None  # Хеш пароля (для desktop пользователей)
```

**Примечание:** Пользователи из Telegram WebApp могут не иметь пароля — они авторизуются через TG.

---

## Валидация

### При регистрации:
1. `username` — обязательно, минимум 3 символа, уникальный
2. `email` — опционально, если передан — валидный формат
3. `password` — обязательно для desktop, минимум 6 символов

### При входе:
1. Найти пользователя по `username`
2. Проверить `password` против `password_hash`
3. Вернуть данные пользователя или ошибку

---

## Безопасность

1. **Хеширование паролей** — использовать bcrypt или argon2
2. **Rate limiting** — ограничить попытки входа (например, 5 попыток в минуту)
3. **Не возвращать пароль** — никогда не включать password_hash в ответы API

---

## Пример использования на фронтенде

### Регистрация:
```javascript
const response = await fetch('/api/users/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tg_id: 'desktop_' + Date.now() + '_' + randomString(),
    username: 'newuser',
    firstname: 'New User',
    email: 'user@example.com',
    password: 'securepassword123',
    refLink: 'https://ggcat.org/ref/...',
    url_image: null,
  }),
})
```

### Вход:
```javascript
const response = await fetch('/api/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'existinguser',
    password: 'securepassword123',
  }),
})
```

---

## Статус реализации

| Эндпоинт | Статус |
|----------|--------|
| `POST /api/users/` | ✅ Существует (нужно добавить password) |
| `GET /api/users/tg/{tg_id}` | ✅ Существует |
| `POST /api/users/login` | ❌ **НУЖНО ДОБАВИТЬ** |
| `PATCH /api/users/{id}` | ✅ Существует |

---

## Контакт

Если есть вопросы по реализации — пишите в чат проекта.
