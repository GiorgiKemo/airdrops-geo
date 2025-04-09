import { useState, useEffect } from 'react';

/**
 * OptimizedImage component for lazy loading and progressive image loading
 * 
 * @param {Object} props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Alt text for the image
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.placeholderSrc - Optional placeholder image to show while loading
 * @param {Object} props.imgProps - Additional props to pass to the img element
 */
const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholderSrc = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E',
  ...imgProps 
}) => {
  const [imgSrc, setImgSrc] = useState(placeholderSrc);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Reset state if src changes
    setImgSrc(placeholderSrc);
    setIsLoaded(false);
    
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImgSrc(src);
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      // Keep the placeholder if the image fails to load
    };
    
    return () => {
      // Clean up
      img.onload = null;
      img.onerror = null;
    };
  }, [src, placeholderSrc]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-40'} ${className}`}
      loading="lazy"
      {...imgProps}
    />
  );
};

export default OptimizedImage;
