import { useState, useRef, useCallback } from 'react'
import { Player } from '@lottiefiles/react-lottie-player'
import AsyncImage from './AsyncImage'

/**
 * Component that shows webp image by default and loads Lottie animation only on hover/hold
 * This optimizes performance by not loading all JSON animations at once
 */
function HoverLottie({ 
  image, 
  animation, 
  alt = 'Gift', 
  imageClassName = '', 
  animationClassName = '',
  holdDelay = 200 // ms to wait before showing animation on mobile hold
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [shouldLoadAnimation, setShouldLoadAnimation] = useState(false)
  const holdTimerRef = useRef(null)
  
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    if (animation) {
      setShouldLoadAnimation(true)
    }
  }, [animation])
  
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    // Keep animation loaded once it's been loaded (caching)
  }, [])
  
  const handleTouchStart = useCallback(() => {
    if (animation) {
      holdTimerRef.current = setTimeout(() => {
        setIsHovered(true)
        setShouldLoadAnimation(true)
      }, holdDelay)
    }
  }, [animation, holdDelay])
  
  const handleTouchEnd = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
    setIsHovered(false)
  }, [])
  
  // If no animation, just show image
  if (!animation) {
    return (
      <AsyncImage
        src={image}
        alt={alt}
        className={imageClassName}
      />
    )
  }
  
  return (
    <div 
      className="hover-lottie-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Always render image as base layer */}
      <AsyncImage
        src={image}
        alt={alt}
        className={imageClassName}
        style={{ 
          opacity: isHovered && shouldLoadAnimation ? 0 : 1,
          transition: 'opacity 0.2s ease'
        }}
      />
      
      {/* Only load and show Lottie when hovered and animation should be loaded */}
      {shouldLoadAnimation && (
        <Player
          autoplay={isHovered}
          loop
          src={animation}
          className={animationClassName}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s ease',
            pointerEvents: 'none'
          }}
        />
      )}
    </div>
  )
}

export default HoverLottie
