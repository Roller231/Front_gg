import { useState, useEffect, useCallback } from 'react'
import './Banner.css'

/**
 * Task 4: Banner Carousel with custom pagination
 * - Carousel slider for multiple banners
 * - Custom pagination: dots for inactive, white line for active
 * - Smooth transition animation between slides
 */

// Banner slides data - each slide has unique image
// Add your banner images: Banner1.png, Banner2.png, Banner3.png in /public/image/
const bannerSlides = [
  { id: 1, image: '/image/Banner1.png', alt: 'Promo banner 1' },
  { id: 2, image: '/image/Banner2.png', alt: 'Promo banner 2' },
  { id: 3, image: '/image/Banner3.png', alt: 'Promo banner 3' },
]

function Banner() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  
  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying) return
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
    }, 5000) // Change slide every 5 seconds
    
    return () => clearInterval(interval)
  }, [isAutoPlaying])
  
  // Handle slide change via pagination
  const goToSlide = useCallback((index) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }, [])
  
  // Handle swipe gestures
  const [touchStart, setTouchStart] = useState(null)
  
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX)
  }
  
  const handleTouchEnd = (e) => {
    if (!touchStart) return
    
    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStart - touchEnd
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left - next slide
        setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
      } else {
        // Swipe right - previous slide
        setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length)
      }
      setIsAutoPlaying(false)
      setTimeout(() => setIsAutoPlaying(true), 10000)
    }
    
    setTouchStart(null)
  }

  return (
    <div 
      className="banner-carousel"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides container */}
      <div 
        className="banner-slides"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {bannerSlides.map((slide) => (
          <div key={slide.id} className="banner-slide">
            <img 
              src={slide.image} 
              alt={slide.alt} 
              className="banner-image"
            />
          </div>
        ))}
      </div>
      
      {/* Custom Pagination - Bottom Left */}
      <div className="banner-pagination">
        {bannerSlides.map((_, index) => (
          <button
            key={index}
            className={`banner-pagination-item ${currentSlide === index ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default Banner
