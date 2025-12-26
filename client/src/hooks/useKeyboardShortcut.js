import { useEffect } from 'react';

export const useKeyboardShortcut = (key, callback, modifiers = {}) => {
  useEffect(() => {
    const handler = (event) => {
      // 1. Safety Check: Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) {
        return;
      }

      // 2. Check Modifiers (Alt, Ctrl, Shift)
      const matchesAlt = modifiers.altKey ? event.altKey : !event.altKey;
      const matchesCtrl = modifiers.ctrlKey ? event.ctrlKey : !event.ctrlKey;
      const matchesShift = modifiers.shiftKey ? event.shiftKey : !event.shiftKey;

      if (event.key.toLowerCase() === key.toLowerCase() && matchesAlt && matchesCtrl && matchesShift) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, modifiers]); // Dependencies ensure it updates if params change
};