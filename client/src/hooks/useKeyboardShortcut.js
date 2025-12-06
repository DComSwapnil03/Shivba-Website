import { useEffect } from 'react';

export const useKeyboardShortcut = (key, callback) => {
  useEffect(() => {
    const handler = (event) => {
      if (event.key === key) {
        // Prevent default only if necessary, usually safe to omit for simple keys
        // event.preventDefault(); 
        callback();
      }
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [key, callback]);
};