# Слайдер на главной странице и баннеры профиля

## Оглавление
- [Banner (Слайдер на главной)](#banner-слайдер-на-главной)
- [GameCard (Карточки игр)](#gamecard-карточки-игр)
- [Promo Banners (Баннеры профиля)](#promo-banners-баннеры-профиля)
- [Preloader Logo](#preloader-logo)
- [Header Logo](#header-logo)

---

## Banner (Слайдер на главной)

### Расположение файлов
- **Компонент:** `src/components/Banner.jsx`
- **Стили:** `src/components/Banner.css`

### Описание
Слайдер использует **Swiper.js** для создания карусели баннеров с автопрокруткой.

### Зависимости
```javascript
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
```

### Структура данных
```javascript
const bannerSlides = [
  { id: 1, image: '/image/Slide1.webp', alt: 'Promo banner 2' },
  { id: 2, image: '/image/Slide2.webp', alt: 'Promo banner 3' },
]
```

### Конфигурация Swiper
```jsx
<Swiper
  modules={[Pagination, Autoplay]}
  spaceBetween={0}
  slidesPerView={1}
  pagination={{ clickable: true }}
  autoplay={{ delay: 5000, disableOnInteraction: false }}
  loop={true}
  className="banner-swiper"
>
```

| Параметр | Значение | Описание |
|----------|----------|----------|
| `spaceBetween` | `0` | Отступ между слайдами |
| `slidesPerView` | `1` | Количество видимых слайдов |
| `autoplay.delay` | `5000` | Задержка автопрокрутки (5 сек) |
| `loop` | `true` | Бесконечная прокрутка |

### CSS стили

#### Контейнер
```css
.banner-carousel {
  position: relative;
  border-radius: 16px;
  margin-bottom: 16px;
  overflow: hidden;
}
```

#### Изображение
```css
.banner-image {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: 16px;
  object-fit: cover;
  object-position: center;
}
```

#### Пагинация (точки)
```css
.banner-swiper .swiper-pagination {
  bottom: 12px !important;
  left: 16px !important;
  width: auto !important;
  text-align: left !important;
}

.banner-swiper .swiper-pagination-bullet {
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.4);
  opacity: 1;
  transition: all 0.3s ease;
}

.banner-swiper .swiper-pagination-bullet-active {
  width: 24px;
  height: 6px;
  border-radius: 3px;
  background: #ffffff;
}
```

### Используемые изображения
| Файл | Путь |
|------|------|
| Slide1.webp | `/public/image/Slide1.webp` |
| Slide2.webp | `/public/image/Slide2.webp` |

---

## GameCard (Карточки игр)

### Расположение файлов
- **Компонент:** `src/components/GameCard.jsx`
- **Стили:** `src/components/GameCard.css`

### Описание
Карточки игр на главной странице. Каждая карточка имеет уникальный визуальный контент в зависимости от типа игры.

### Props
```typescript
interface GameCardProps {
  title: string    // Название игры (локализованное)
  online: number   // Количество онлайн игроков
  type?: string    // Тип карточки (опционально)
}
```

### Типы карточек и их классы
| Игра | CSS класс | Маршрут |
|------|-----------|---------|
| Кейсы | `game-card--cases` | `/cases` |
| Crash | `game-card--roulette` | `/crash` |
| Wheel | `game-card--wheel` | `/wheel` |
| PvP | `game-card--pvp` | `/pvp` |
| Upgrade | `game-card--upgrade` | `/upgrade` |

### Структура JSX
```jsx
<div className={`game-card ${getCardClass()}`} onClick={handleClick}>
  <div className="game-header">
    <span className="online-dot"></span>
    <span className="online-count">{online} {t('home.online')}</span>
  </div>
  
  <div className="game-card-visual">
    {renderContent()}
  </div>
  
  <div className="game-content">
    <h3 className="game-title">{title}</h3>
  </div>
</div>
```

### Визуальный контент карточек

#### 1. Cases (Кейсы)
```jsx
<div className="game-card-cases-layout">
  <div className="game-card-mini-roulette">
    <div className="game-card-mini-roulette-track">
      {/* Анимированная лента с предметами */}
    </div>
  </div>
  <div className="game-card-case-image">
    <img src="/image/Group 7188.svg" alt="cat" />
  </div>
</div>
```

**Изображения предметов (caseItems):**
```javascript
const caseItems = [
  { id: 1, image: '/image/Pumpkin.webp', name: 'Pumpkin' },
  { id: 2, image: '/image/Mask.webp', name: 'Mask' },
  { id: 3, image: '/image/La_Baboon.webp', name: 'La Baboon' },
  { id: 4, image: '/image/Huggy_Bear.webp', name: 'Huggy Bear' },
  { id: 5, image: '/image/Inferno.webp', name: 'Inferno' },
  { id: 6, image: '/image/Crypto_Boom.webp', name: 'Crypto Boom' },
  { id: 7, image: '/image/Cozy_Galaxy.webp', name: 'Cozy Galaxy' },
  { id: 8, image: '/image/Christmas.webp', name: 'Christmas' },
]
```

#### 2. Crash
```jsx
<div className="game-card-crash">
  <img src="/image/Venus.png" alt="moon" className="game-card-moon" />
  <svg className="game-card-wave-line">...</svg>
  <Player autoplay loop src="/animation/cat fly___.json" className="game-card-flying-cat" />
  <div className="game-card-crash-multiplier">
    <span className="crash-multiplier-x">x</span>
    <span className="crash-multiplier-value">{multiplierValue}</span>
  </div>
</div>
```

**Логика множителя:**
```javascript
useEffect(() => {
  let startTime = Date.now()
  let crashPoint = 1.5 + Math.random() * 4

  const interval = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000
    const multiplier = Math.pow(Math.E, 0.15 * elapsed)
    // ... обновление multiplierValue
  }, 100)
}, [])
```

#### 3. Wheel (Рулетка)
```jsx
<div className="game-card-wheel">
  <div className="game-card-wheel-glow"></div>
  <div className="game-card-wheel-container">
    <div className="game-card-wheel-fortune" style={{ transform: `rotate(${wheelAngle}deg)` }}>
      <svg viewBox="0 0 200 200">
        {/* 10-сегментное колесо */}
      </svg>
      {wheelItems.map((item, index) => (
        <div className="game-card-wheel-segment-content" style={{ '--segment-angle': `${angle}deg` }}>
          <img src={item.image} alt={item.name} />
        </div>
      ))}
    </div>
    <div className="game-card-wheel-hub">...</div>
    <div className="game-card-wheel-pointer">...</div>
  </div>
</div>
```

**Предметы колеса:**
```javascript
const wheelItems = [
  { id: 1, image: '/image/Cozy_Galaxy.webp', name: 'Cozy Galaxy', type: 'purple' },
  { id: 2, image: '/image/Durovs_Figurine.webp', name: 'Durovs Figurine', type: 'blue' },
  { id: 3, image: '/image/Neon_Fuel.webp', name: 'Neon Fuel', type: 'purple' },
  { id: 4, image: '/image/Red_Menace.webp', name: 'Red Menace', type: 'blue' },
  // повторяется для 10 сегментов
]
```

#### 4. PvP
```jsx
<div className="game-card-pvp">
  <div className="pvp-cat pvp-cat--left">
    <img src="/image/cat1.svg" alt="cat1" />
  </div>
  <div className="game-card-vs">
    <span className="game-card-vs-v">V</span>
    <span className="game-card-vs-s">S</span>
  </div>
  <div className="pvp-cat pvp-cat--right">
    <img src="/image/cat2.svg" alt="cat2" />
  </div>
</div>
```

#### 5. Upgrade
```jsx
<div className="game-card-upgrade">
  <div className="game-card-upgrade-gift">
    <img src="/image/Froggy.webp" alt="source" />
  </div>
  <div className="game-card-upgrade-arrows">
    <svg>...</svg>
  </div>
  <div className="game-card-upgrade-wheel">
    {/* SVG колесо шанса */}
  </div>
  <div className="game-card-upgrade-arrows">...</div>
  <div className="game-card-upgrade-gift game-card-upgrade-gift--target">
    <img src="/image/Midas_Pepe.webp" alt="target" />
  </div>
</div>
```

### CSS - Фоны карточек

#### Stars effect (звёзды)
```css
.game-card--cases::before,
.game-card--roulette::before,
.game-card--pvp::before,
.game-card--upgrade::before,
.game-card--wheel::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(1px 1px at 20px 30px, white, transparent),
    radial-gradient(1px 1px at 40px 70px, rgba(255,255,255,0.8), transparent),
    /* ... */;
  pointer-events: none;
  z-index: 0;
}
```

#### Градиенты фонов
```css
/* Cases */
.game-card--cases {
  background: linear-gradient(135deg, #1a0a2e 0%, #16082a 50%, #0d0619 100%);
}

/* Crash */
.game-card--roulette {
  background: 
    radial-gradient(ellipse at 30% 20%, rgba(88, 28, 135, 0.6) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(59, 7, 100, 0.5) 0%, transparent 50%),
    linear-gradient(135deg, #1a0a2e 0%, #0f0420 100%);
}

/* Wheel */
.game-card--wheel {
  background:
    radial-gradient(ellipse at 35% 25%, rgba(88, 28, 135, 0.65) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 80%, rgba(59, 7, 100, 0.55) 0%, transparent 55%),
    radial-gradient(circle at 60% 40%, rgba(255, 215, 0, 0.12) 0%, transparent 45%),
    linear-gradient(135deg, #1a0a2e 0%, #0f0420 100%);
}
```

### Анимации

#### Roulette track animation
```css
@keyframes scroll-roulette-horizontal {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.game-card-mini-roulette-track {
  animation: scroll-roulette-horizontal 10s linear infinite;
}
```

#### Cat float animation
```css
@keyframes cat-float {
  0%, 100% { transform: rotate(-90deg) translateY(0); }
  50% { transform: rotate(-90deg) translateY(-5px); }
}
```

#### Wheel spin (JS controlled)
```javascript
const spinWheel = () => {
  const spins = 2 + Math.floor(Math.random() * 2)
  const extraAngle = Math.random() * 360
  const next = current + spins * 360 + extraAngle
  setWheelAngle(next)
}
// Интервал: 5000ms
```

---

## Promo Banners (Баннеры профиля)

### Расположение файлов
- **Компонент:** `src/components/ProfilePage.jsx`
- **Стили:** `src/components/ProfilePage.css`

### Описание
Два промо-блока в профиле с абстрактным fluid-дизайном.

### Структура JSX
```jsx
<div className="promo-section">
  {/* Telegram Promo */}
  <div className="promo-block telegram-promo" onClick={() => window.open('https://t.me/ggcat_gift', '_blank')}>
    <div className="promo-decor-layer">
      <div className="promo-blob-1"></div>
      <div className="promo-blob-2"></div>
      <div className="promo-accent-circle"></div>
      <div className="promo-stripes"></div>
    </div>
    
    <div className="promo-content-left">
      <div className="promo-icon-box">
        <svg>...</svg>
      </div>
      <div className="promo-text-group">
        <h3 className="promo-title">{t('profile.promoTitle')}</h3>
        <p className="promo-description">
          <span className="promo-highlight">@ggcat_gift</span> {t('profile.promoDescription')}
        </p>
      </div>
    </div>
    <div className="promo-action-icon">
      <svg>...</svg>
    </div>
  </div>

  {/* Partner Program */}
  <div className="promo-block partner-promo" onClick={() => navigate('/partner')}>
    {/* Аналогичная структура */}
  </div>
</div>
```

### CSS - Базовые стили

#### Контейнер промо-секции
```css
.promo-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}
```

#### Базовый промо-блок
```css
.promo-block {
  position: relative;
  width: 100%;
  border-radius: 20px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100px;
  min-height: 100px;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), 
              box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.05);
  background-color: #1a0b2e;
  z-index: 1;
}

.promo-block:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
}
```

### CSS - Telegram Theme
```css
.telegram-promo .promo-decor-layer {
  background: linear-gradient(100deg, #1C1139 0%, #0F0524 100%);
}

.telegram-promo .promo-blob-1 {
  position: absolute;
  bottom: -40%;
  right: -10%;
  width: 250px;
  height: 250px;
  background: linear-gradient(135deg, #00C6FF 0%, #0072FF 100%);
  border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
  filter: blur(20px);
  opacity: 0.8;
  animation: blob-float 8s infinite alternate ease-in-out;
}

.telegram-promo .promo-blob-2 {
  position: absolute;
  top: -20%;
  left: -10%;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, #7F00FF 0%, transparent 70%);
  opacity: 0.6;
  filter: blur(25px);
}
```

### CSS - Partner Theme
```css
.partner-promo .promo-decor-layer {
  background: linear-gradient(100deg, #1C1139 0%, #0F0524 100%);
}

.partner-promo .promo-blob-1 {
  position: absolute;
  top: -30%;
  right: -20%;
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #FF00CC 0%, #333399 100%);
  border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
  filter: blur(25px);
  opacity: 0.9;
  animation: blob-float 10s infinite alternate-reverse ease-in-out;
}

.partner-promo .promo-blob-2 {
  position: absolute;
  bottom: -20%;
  left: 20%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, #8B5CF6 0%, transparent 60%);
  opacity: 0.5;
  filter: blur(30px);
}
```

### Анимация blob-float
```css
@keyframes blob-float {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(10px, -10px) scale(1.05); }
}
```

### Иконки в промо-блоках

#### Telegram иконка (inline SVG)
```jsx
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M20.665 3.333L3.333 10.665L8.665 12.665L18.665 5.333L10.665 13.333L10.665 18.665L14.665 14.665L18.665 17.333L20.665 3.333Z" fill="white"/>
</svg>
```

#### Partner иконка (файл)
```jsx
<img src="/image/partner.svg" alt="Partner" className="promo-fixed-icon" />
```

### Используемые изображения
| Файл | Путь |
|------|------|
| partner.svg | `/public/image/partner.svg` |

---

## Preloader Logo

### Расположение файлов
- **Компонент:** `src/components/Preloader.jsx`
- **Стили:** `src/components/Preloader.css`

### Структура
```jsx
function Preloader({ progress = 0 }) {
  return (
    <div className="preloader">
      <div className="preloader-content">
        <img src="/image/Logo.svg" alt="GG Cat Logo" className="preloader-logo" />

        <div className="preloader-progress-container">
          <div
            className="preloader-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="preloader-text">Loading...</p>
      </div>
    </div>
  )
}
```

### CSS стили
```css
.preloader {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #1a0533 0%, #0d0118 50%, #1a0533 100%);
  z-index: 9999;
}

.preloader-logo {
  width: 280px;
  max-width: 80vw;
  height: auto;
  filter: drop-shadow(0 0 20px rgba(187, 253, 68, 0.3));
}

.preloader-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #BBFD44, #76FF03, #BBFD44);
  border-radius: 3px;
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(187, 253, 68, 0.5);
}
```

### Shimmer анимация
```css
.preloader-progress-bar::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

### Используемые изображения
| Файл | Путь | Размер в прелоадере |
|------|------|---------------------|
| Logo.svg | `/public/image/Logo.svg` | 280px width |

---

## Header Logo

### Расположение файлов
- **Компонент:** `src/components/Header.jsx`
- **Стили:** `src/components/Header.css`

### Структура
```jsx
<header className="header">
  <Link className="logo" to="/" aria-label="На главную">
    <img src="/image/Text.svg" alt="GG Cat logo" />
  </Link>
  {/* ... */}
</header>
```

### CSS стили
```css
.logo {
  display: flex;
  align-items: center;
  height: 18px;
  transform-origin: left center;
}

.logo img {
  height: 18px;
  display: block;
}
```

### Используемые изображения
| Файл | Путь | Размер |
|------|------|--------|
| Text.svg | `/public/image/Text.svg` | 18px height |

---

## Сводная таблица изображений

### Слайдер (Banner)
| Изображение | Путь |
|-------------|------|
| Slide1.webp | `/public/image/Slide1.webp` |
| Slide2.webp | `/public/image/Slide2.webp` |

### GameCard
| Изображение | Путь | Использование |
|-------------|------|---------------|
| Group 7188.svg | `/public/image/Group 7188.svg` | Cases - кот |
| Venus.png | `/public/image/Venus.png` | Crash - луна |
| cat fly___.json | `/public/animation/cat fly___.json` | Crash - летящий кот |
| cat1.svg | `/public/image/cat1.svg` | PvP - левый кот |
| cat2.svg | `/public/image/cat2.svg` | PvP - правый кот |
| Froggy.webp | `/public/image/Froggy.webp` | Upgrade - исходный предмет |
| Midas_Pepe.webp | `/public/image/Midas_Pepe.webp` | Upgrade - целевой предмет |

### Предметы для рулетки/колеса
| Изображение | Путь |
|-------------|------|
| Pumpkin.webp | `/public/image/Pumpkin.webp` |
| Mask.webp | `/public/image/Mask.webp` |
| La_Baboon.webp | `/public/image/La_Baboon.webp` |
| Huggy_Bear.webp | `/public/image/Huggy_Bear.webp` |
| Inferno.webp | `/public/image/Inferno.webp` |
| Crypto_Boom.webp | `/public/image/Crypto_Boom.webp` |
| Cozy_Galaxy.webp | `/public/image/Cozy_Galaxy.webp` |
| Christmas.webp | `/public/image/Christmas.webp` |
| Durovs_Figurine.webp | `/public/image/Durovs_Figurine.webp` |
| Neon_Fuel.webp | `/public/image/Neon_Fuel.webp` |
| Red_Menace.webp | `/public/image/Red_Menace.webp` |

### Профиль
| Изображение | Путь |
|-------------|------|
| partner.svg | `/public/image/partner.svg` |

### Логотипы
| Изображение | Путь | Использование |
|-------------|------|---------------|
| Logo.svg | `/public/image/Logo.svg` | Preloader (280px) |
| Text.svg | `/public/image/Text.svg` | Header (18px) |
