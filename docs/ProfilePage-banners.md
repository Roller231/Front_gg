# Баннеры в ProfilePage

## JSX (ProfilePage.jsx)

### Promo Section (строки 325-386)

```jsx
{/* ===== PROMO BLOCKS (Daily/Hot) - After Level Progress ===== */}
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="promo-fixed-icon">
          <path d="M20.665 3.333L3.333 10.665L8.665 12.665L18.665 5.333L10.665 13.333L10.665 18.665L14.665 14.665L18.665 17.333L20.665 3.333Z" fill="white"/>
        </svg>
      </div>
      <div className="promo-text-group">
        <div className="promo-header-row">
          <h3 className="promo-title">{t('profile.promoTitle')}</h3>
        </div>
        <p className="promo-description">
          <span className="promo-highlight">@ggcat_gift</span> {t('profile.promoDescription')}
        </p>
      </div>
    </div>
    <div className="promo-action-icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  </div>

  {/* Partner Program */}
  <div className="promo-block partner-promo" onClick={() => navigate('/partner')}>
    <div className="promo-decor-layer">
      <div className="promo-blob-1"></div>
      <div className="promo-blob-2"></div>
      <div className="promo-accent-triangle"></div>
      <div className="promo-stripes"></div>
    </div>

    <div className="promo-content-left">
      <div className="promo-icon-box partner-icon-box">
        <img src="/image/partner.svg" alt="Partner" className="promo-fixed-icon" onError={(e) => e.target.style.display = 'block'} />
      </div>
      <div className="promo-text-group">
        <div className="promo-header-row">
          <h3 className="promo-title">{t('profile.partnerTitle')}</h3>
        </div>
        <p className="promo-description">
          {t('profile.partnerDescription')}
        </p>
      </div>
    </div>
    <div className="promo-action-icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  </div>
</div>
```

---

## CSS (ProfilePage.css)

### Bonus Banner (строки 434-447)

```css
/* Bonus Banner */
.bonus-banner-img {
  width: 100%;
  height: auto;
  border-radius: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: transform 0.2s ease;
  display: block;
}

.bonus-banner-img:hover {
  transform: scale(1.02);
}
```

### Partner Program Banner (строки 449-462)

```css
/* Partner Program */
.partner-program-img {
  width: 100%;
  height: auto;
  border-radius: 16px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: transform 0.2s ease;
  display: block;
}

.partner-program-img:hover {
  transform: scale(1.02);
}
```

### Promo Blocks (строки 792-1254)

```css
/* ===== PROMO BLOCKS (Abstract Fluid Style) ===== */
.promo-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

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
  box-sizing: border-box;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.05);
  background-color: #1a0b2e; /* Deep dark violet base */
  z-index: 1;
}

.promo-block:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
}

.promo-block:active {
  transform: scale(0.98);
}

/* --- Common Fluid Shapes & Decor --- */
.promo-decor-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: -1;
  border-radius: 20px;
}

/* --- Telegram Theme (Cyan/Blue/Purple) --- */
.telegram-promo .promo-decor-layer {
  /* Dark base + subtle gradient */
  background: linear-gradient(100deg, #1C1139 0%, #0F0524 100%);
}

.telegram-promo .promo-blob-1 {
  /* Big Cyan Blob bottom-right */
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
  /* Purple Blob top-left */
  position: absolute;
  top: -20%;
  left: -10%;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, #7F00FF 0%, transparent 70%);
  opacity: 0.6;
  filter: blur(25px);
}

.telegram-promo .promo-accent-circle {
  display: none;
}

.telegram-promo .promo-stripes {
  /* Striped Pattern bottom-left */
  position: absolute;
  bottom: 10px;
  left: 10px;
  width: 40px;
  height: 40px;
  background-image: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.1) 2px,
    transparent 2px,
    transparent 6px
  );
  z-index: 0;
}

/* Partner Theme (Pink/Magenta/Purple) */

.partner-promo .promo-header-row {
  flex-wrap: nowrap; /* Force title and tag on same line */
}

.partner-promo .promo-description {
  display: block;
  -webkit-line-clamp: unset;
  line-clamp: unset;
  overflow: visible;
}

.partner-promo .promo-decor-layer {
  background: linear-gradient(100deg, #1C1139 0%, #0F0524 100%);
}

.partner-promo .promo-blob-1 {
  /* Big Pink/Magenta Blob right */
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
  /* Purple Blob left-bottom */
  position: absolute;
  bottom: -20%;
  left: 20%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, #8B5CF6 0%, transparent 60%);
  opacity: 0.5;
  filter: blur(30px);
}

.partner-promo .promo-accent-triangle {
  /* Floating Triangle */
  position: absolute;
  top: 15%;
  left: 50%;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 14px solid #FF0080;
  transform: rotate(15deg);
  opacity: 0.8;
}

.partner-promo .promo-stripes {
  /* Striped Pattern top-right */
  position: absolute;
  top: 10px;
  right: 10px;
  width: 50px;
  height: 50px;
  background-image: repeating-linear-gradient(
    -45deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.1) 2px,
    transparent 2px,
    transparent 6px
  );
  z-index: 0;
}

@keyframes blob-float {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(10px, -10px) scale(1.05); }
}

/* --- Layout & Content --- */
.promo-content-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  z-index: 2;
  position: relative;
  padding-right: 8px; 
}

/* Icon Boxes */
.promo-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.partner-icon-box {
  background: rgba(255, 255, 255, 0.1);
}

.promo-fixed-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.partner-emoji {
  font-size: 22px;
}

/* Text Group */
.promo-text-group {
  display: flex;
  flex-direction: column;
  gap: 0px;
  flex: 1;
}

.promo-header-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  width: 100%;
}

.promo-title {
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  font-weight: 800;
  color: #fff;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  white-space: nowrap;
}

/* Ensure both banners have identical title styles */
.telegram-promo .promo-title,
.partner-promo .promo-title {
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  font-weight: 800;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
  white-space: nowrap;
}

.promo-tag {
  font-size: 11px;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 4px;
  background: #2AABEE;
  color: #fff;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  line-height: 1.2;
  flex-shrink: 0;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  position: relative;
  overflow: visible;
}

/* Yellow sun circle behind DAILY tag */
.telegram-promo .promo-tag::before {
  content: '';
  position: absolute;
  top: -8px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, #FFD700 0%, #FF9F1C 60%, transparent 70%);
  border-radius: 50%;
  z-index: -1;
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.8);
}

.partner-tag {
  background: #B24BF3;
  position: relative; /* Anchor for pseudo */
  overflow: visible;  /* Allow emoji to peek out */
}

/* Fire emoji peeking from behind */
.partner-tag::after {
  content: '🔥';
  position: absolute;
  top: -15px; /* 4px higher (was -11px) */
  right: 2px; /* 5px left (was -3px) */
  font-size: 18px;
  z-index: -1; 
  transform: rotate(15deg);
  pointer-events: none;
}

.promo-description {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  padding-bottom: 2px;
}

.promo-highlight {
  color: #fff;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1.5px;
}

/* Arrow / Action */
.promo-action-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  min-width: 32px;
  transition: background 0.2s ease, transform 0.2s ease;
  z-index: 2;
}

.promo-block:hover .promo-action-icon {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

/* Small screens adjustments */
@media (max-width: 400px) {
  .promo-section {
    gap: 10px;
    margin-bottom: 16px;
  }
  
  .promo-block {
    height: 85px;
    min-height: 85px;
    padding: 12px 14px;
  }
  
  .promo-icon-box {
    width: 40px;
    height: 40px;
  }
  
  .promo-title {
    font-size: 13px;
  }
  
  .promo-description {
    font-size: 10px;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }
  
  .promo-action-icon {
    width: 28px;
    height: 28px;
    min-width: 28px;
  }
}

@media (max-width: 360px) {
  .promo-section {
    gap: 8px;
    margin-bottom: 12px;
  }
  
  .promo-block {
    height: 75px;
    min-height: 75px;
    padding: 10px 12px;
  }
  
  .promo-icon-box {
    width: 36px;
    height: 36px;
  }
  
  .promo-fixed-icon {
    width: 20px;
    height: 20px;
  }
  
  .promo-title {
    font-size: 12px;
    letter-spacing: 0.5px;
  }
  
  .promo-tag {
    font-size: 9px;
    padding: 3px 6px;
  }
  
  .promo-description {
    font-size: 9px;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }
  
  .promo-content-left {
    gap: 10px;
  }
}

@media (max-width: 320px) {
  .promo-block {
    height: 70px;
    min-height: 70px;
    padding: 8px 10px;
  }
  
  .promo-icon-box {
    width: 32px;
    height: 32px;
  }
  
  .promo-fixed-icon {
    width: 18px;
    height: 18px;
  }
  
  .promo-title {
    font-size: 11px;
  }
  
  .promo-tag {
    font-size: 8px;
    padding: 2px 5px;
  }
  
  .promo-description {
    display: none;
  }
  
  .promo-action-icon {
    width: 24px;
    height: 24px;
    min-width: 24px;
  }
}
```
