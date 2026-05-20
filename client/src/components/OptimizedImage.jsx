import { useEffect, useState } from 'react';

const DEFAULT_PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"%3E%3Crect width="16" height="9" fill="%23e5e7eb"/%3E%3C/svg%3E';

/**
 * Lazy image with a stable placeholder and quiet fallback behavior.
 */
const OptimizedImage = ({
  src,
  alt = '',
  className = '',
  placeholderSrc = DEFAULT_PLACEHOLDER,
  fallbackSrc = placeholderSrc,
  loading = 'lazy',
  decoding = 'async',
  onError,
  ...imgProps
}) => {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [isLoaded, setIsLoaded] = useState(Boolean(src));

  useEffect(() => {
    let isActive = true;

    if (!src) {
      setImgSrc(fallbackSrc);
      setIsLoaded(false);
      return undefined;
    }

    setImgSrc(placeholderSrc);
    setIsLoaded(false);

    const image = new Image();

    image.onload = () => {
      if (!isActive) return;
      setImgSrc(src);
      setIsLoaded(true);
    };

    image.onerror = () => {
      if (!isActive) return;
      setImgSrc(fallbackSrc);
      setIsLoaded(false);
    };

    image.src = src;

    return () => {
      isActive = false;
      image.onload = null;
      image.onerror = null;
    };
  }, [fallbackSrc, placeholderSrc, src]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={`optimized-image transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-60'} ${className}`}
      loading={loading}
      decoding={decoding}
      onError={onError}
      data-load-state={isLoaded ? 'loaded' : 'fallback'}
      {...imgProps}
    />
  );
};

export default OptimizedImage;
