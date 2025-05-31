import { useEffect, RefObject } from 'react';

export const useAutoResize = (
  ref: RefObject<HTMLTextAreaElement | HTMLInputElement>,
  minHeight: number = 40,
  maxHeight?: number
) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const adjustHeight = () => {
      element.style.height = 'auto';
      const scrollHeight = element.scrollHeight;
      const newHeight = Math.max(minHeight, scrollHeight);
      element.style.height = maxHeight 
        ? `${Math.min(newHeight, maxHeight)}px` 
        : `${newHeight}px`;
    };

    element.addEventListener('input', adjustHeight);
    adjustHeight(); // Initial adjustment

    return () => {
      element.removeEventListener('input', adjustHeight);
    };
  }, [ref, minHeight, maxHeight]);
}; 