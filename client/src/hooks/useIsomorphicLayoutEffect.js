import { useLayoutEffect, useEffect } from 'react';

// Use useLayoutEffect in the browser for smoother rendering, but fall back to useEffect during SSR
export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
