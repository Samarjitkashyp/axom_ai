import { useState, useEffect } from 'react';

const MAX_WORDS = 5000;
const REGEN_RATE_PER_SEC = MAX_WORDS / 86400; // 5000 words in 24 hours (86400 seconds)

export function useWordLimit(isAuthenticated) {
  const [remainingWords, setRemainingWords] = useState(() => {
    if (isAuthenticated) return MAX_WORDS;

    const remaining = localStorage.getItem('axom_ai_remaining_words');
    const lastUpdate = localStorage.getItem('axom_ai_last_update');
    const now = Date.now();

    if (remaining === null || lastUpdate === null) {
      localStorage.setItem('axom_ai_remaining_words', MAX_WORDS);
      localStorage.setItem('axom_ai_last_update', now);
      return MAX_WORDS;
    }

    const parsedRemaining = parseFloat(remaining);
    const parsedLastUpdate = parseInt(lastUpdate, 10);

    const elapsedSecs = Math.max(0, (now - parsedLastUpdate) / 1000);
    const regenerated = elapsedSecs * REGEN_RATE_PER_SEC;
    const currentRemaining = Math.min(MAX_WORDS, parsedRemaining + regenerated);

    localStorage.setItem('axom_ai_remaining_words', currentRemaining);
    localStorage.setItem('axom_ai_last_update', now);
    return currentRemaining;
  });

  useEffect(() => {
    if (isAuthenticated) return;

    const timer = setInterval(() => {
      const remaining = localStorage.getItem('axom_ai_remaining_words');
      const lastUpdate = localStorage.getItem('axom_ai_last_update');
      const now = Date.now();

      if (remaining !== null && lastUpdate !== null) {
        const parsedRemaining = parseFloat(remaining);
        const parsedLastUpdate = parseInt(lastUpdate, 10);

        const elapsedSecs = Math.max(0, (now - parsedLastUpdate) / 1000);
        const regenerated = elapsedSecs * REGEN_RATE_PER_SEC;
        const currentRemaining = Math.min(MAX_WORDS, parsedRemaining + regenerated);

        localStorage.setItem('axom_ai_remaining_words', currentRemaining);
        localStorage.setItem('axom_ai_last_update', now);
        setRemainingWords(currentRemaining);
      }
    }, 1000);

    return () => {
      // Memory management cleanup of interval timer
      clearInterval(timer);
    };
  }, [isAuthenticated]);

  const deductWords = (count) => {
    if (isAuthenticated) return;

    const remaining = localStorage.getItem('axom_ai_remaining_words');
    const now = Date.now();
    let currentRemaining = remaining !== null ? parseFloat(remaining) : MAX_WORDS;

    currentRemaining = Math.max(0, currentRemaining - count);
    localStorage.setItem('axom_ai_remaining_words', currentRemaining);
    localStorage.setItem('axom_ai_last_update', now);
    setRemainingWords(currentRemaining);
  };

  return {
    remainingWords,
    deductWords,
    maxWords: MAX_WORDS
  };
}
