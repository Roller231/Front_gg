# GameFaq - Компонент FAQ для игр

## Расположение файлов
- **Компонент:** `src/components/GameFaq.jsx`
- **Стили:** `src/components/CasesPage.css` (секция FAQ Block)

---

## Описание

Компонент `GameFaq` отображает раскрывающийся блок с инструкцией "Как это работает" для каждой игры. Содержит 4 шага и секцию с советами.

---

## Props

```typescript
interface GameFaqProps {
  game: 'crash' | 'wheel' | 'upgrade' | 'pvp'  // Тип игры
}
```

---

## Структура компонента

### Импорты
```javascript
import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import './CasesPage.css'
```

### Иконки для шагов (STEP_ICONS)

Каждая игра имеет свой набор из 4 SVG-иконок:

```javascript
const STEP_ICONS = {
  crash: [
    // Иконка 1: Info circle
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>,
    // Иконка 2: Graph/Chart
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>,
    // Иконка 3: Play/Video
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="M12 12l4-2-4-2v4z"/>
    </svg>,
    // Иконка 4: Warning triangle
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>,
  ],
  
  wheel: [
    // Info circle
    // Clock/Timer
    // Box/Package
    // Refresh/Spin
  ],
  
  upgrade: [
    // Box/Package
    // Arrow up circle
    // Clock/Timer
    // Star
  ],
  
  pvp: [
    // Info circle
    // Sword
    // Flag
    // Star
  ],
}
```

---

## JSX Структура

```jsx
function GameFaq({ game }) {
  const { t } = useLanguage()
  const [isFaqOpen, setIsFaqOpen] = useState(false)

  const icons = STEP_ICONS[game] || STEP_ICONS.crash

  return (
    <div className="cases-faq-container">
      {/* Заголовок (кликабельный) */}
      <div 
        className="cases-faq-header" 
        onClick={() => setIsFaqOpen(!isFaqOpen)}
        role="button"
        tabIndex={0}
      >
        <div className="faq-header-left">
          <div className="faq-icon-wrapper">
            <span className="faq-icon">!</span>
          </div>
          <h2 className="faq-title">{t(`${game}.howItWorks`)}</h2>
        </div>
        <div className={`faq-arrow ${isFaqOpen ? 'open' : ''}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Контент (раскрывающийся) */}
      <div className={`cases-faq-content ${isFaqOpen ? 'open' : ''}`}>
        {/* Сетка шагов */}
        <div className="faq-steps-grid">
          {[1, 2, 3, 4].map(step => (
            <div className="faq-step-card" key={step}>
              <div className="step-number-badge">{step}</div>
              <div className="step-icon">{icons[step - 1]}</div>
              <h3 className="step-title">{t(`${game}.step${step}Title`)}</h3>
              <p className="step-desc">{t(`${game}.step${step}Desc`)}</p>
            </div>
          ))}
        </div>

        {/* Секция советов */}
        <div className="faq-tips-section">
          <div className="tips-header">
            <span className="tips-icon">⚡</span>
            <h3 className="tips-title">{t(`${game}.tipsTitle`)}</h3>
          </div>
          <ul className="tips-list">
            <li>{t(`${game}.tip1`)}</li>
            <li>{t(`${game}.tip2`)}</li>
            <li>{t(`${game}.tip3`)}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
```

---

## Локализационные ключи

Для каждой игры необходимы следующие ключи:

```javascript
// Пример для crash
{
  'crash.howItWorks': 'Как это работает?',
  'crash.step1Title': 'Сделай ставку',
  'crash.step1Desc': 'Выбери сумму ставки перед началом раунда.',
  'crash.step2Title': 'Следи за множителем',
  'crash.step2Desc': 'Множитель растёт с каждой секундой.',
  'crash.step3Title': 'Забери вовремя',
  'crash.step3Desc': 'Нажми "Забрать" до краша.',
  'crash.step4Title': 'Не жадничай!',
  'crash.step4Desc': 'Краш может случиться в любой момент.',
  'crash.tipsTitle': 'Советы',
  'crash.tip1': 'Начни с малых ставок',
  'crash.tip2': 'Установи авто-кешаут',
  'crash.tip3': 'Не гонись за большими множителями',
}
```

---

## CSS Стили

### Контейнер FAQ
```css
.cases-faq-container {
  margin: 0 16px 20px 16px;
  background: #1e0b4b;
  border-radius: 16px;
  border: 1px solid rgba(149, 27, 249, 0.2);
  overflow: hidden;
  transition: all 0.3s ease;
}
```

### Заголовок
```css
.cases-faq-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  cursor: pointer;
  user-select: none;
}

.faq-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
```

### Иконка "!" в кружке
```css
.faq-icon-wrapper {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #FFD700; /* Золотая обводка */
  display: flex;
  align-items: center;
  justify-content: center;
}

.faq-icon {
  color: #FFD700; /* Золотой */
  font-weight: 700;
  font-size: 14px;
}
```

### Заголовок и стрелка
```css
.faq-title {
  color: #FFD700; /* Золотой */
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}

.faq-arrow {
  color: #FFD700;
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
}

.faq-arrow.open {
  transform: rotate(180deg);
}
```

### Раскрывающийся контент
```css
.cases-faq-content {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.cases-faq-content.open {
  max-height: 400px; /* Ограничение для скролла */
  opacity: 1;
  padding: 0 16px 16px 16px;
  border-top: 1px solid rgba(149, 27, 249, 0.1);
  overflow-y: auto;
}
```

### Скроллбар
```css
.cases-faq-content::-webkit-scrollbar {
  width: 4px;
}

.cases-faq-content::-webkit-scrollbar-track {
  background: transparent;
}

.cases-faq-content::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.4);
  border-radius: 2px;
}
```

### Сетка шагов
```css
.faq-steps-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}
```

### Карточка шага
```css
.faq-step-card {
  background: #2b0d6d;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  position: relative;
}
```

### Badge номера шага
```css
.step-number-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #2C7DF8 0%, #951BF9 100%);
  border-radius: 50%;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
```

### Иконка шага
```css
.step-icon {
  width: 56px;
  height: 56px;
  background: rgba(44, 125, 248, 0.15);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: #951BF9;
}
```

### Заголовок и описание шага
```css
.step-title {
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.step-desc {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}
```

### Секция советов
```css
.faq-tips-section {
  margin-top: 16px;
  background: rgba(149, 27, 249, 0.1);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(149, 27, 249, 0.2);
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.tips-icon {
  font-size: 16px;
  background: linear-gradient(90deg, #2C7DF8 0%, #951BF9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tips-title {
  background: linear-gradient(90deg, #2C7DF8 0%, #951BF9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 14px;
  font-weight: 700;
  margin: 0;
  text-transform: uppercase;
}
```

### Список советов
```css
.tips-list {
  margin: 0;
  padding-left: 20px;
  list-style: none;
}

.tips-list li {
  position: relative;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  line-height: 1.5;
  margin-bottom: 8px;
}

.tips-list li::before {
  content: "•";
  color: #8B5CF6;
  position: absolute;
  left: -14px;
  font-weight: bold;
}

.tips-list li:last-child {
  margin-bottom: 0;
}
```

---

## Использование

```jsx
import GameFaq from './GameFaq'

// В CrashPage
<GameFaq game="crash" />

// В WheelPage
<GameFaq game="wheel" />

// В UpgradePage
<GameFaq game="upgrade" />

// В PvPPage
<GameFaq game="pvp" />
```

---

## Цветовая палитра

| Элемент | Цвет | Код |
|---------|------|-----|
| Фон контейнера | Темно-фиолетовый | `#1e0b4b` |
| Фон карточки шага | Фиолетовый | `#2b0d6d` |
| Заголовок/Иконка | Золотой | `#FFD700` |
| Бордер | Фиолетовый прозрачный | `rgba(149, 27, 249, 0.2)` |
| Номер шага (градиент) | Синий → Фиолетовый | `#2C7DF8 → #951BF9` |
| Иконка шага | Фиолетовый | `#951BF9` |
| Текст описания | Белый прозрачный | `rgba(255, 255, 255, 0.6)` |
| Bullet points | Фиолетовый | `#8B5CF6` |

---

## Анимации

### Раскрытие контента
```css
transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
```

### Поворот стрелки
```css
transition: transform 0.3s ease;
```

---

## Адаптивность

Компонент полностью адаптивен. Карточки шагов располагаются в одну колонку (`flex-direction: column`) на всех разрешениях.
