import { useState, useEffect } from 'react';

const MAX_WORDS = 5000;
const REGEN_RATE_PER_SEC = MAX_WORDS / 86400; // 5000 words in 24 hours (86400 seconds)

export function useWordLimit(isAuthenticated, isPro = false) {
  const [remainingWords, setRemainingWords] = useState(() => {
    if (isPro) return MAX_WORDS;

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

  const [serverUsage, setServerUsage] = useState(null);

  // Sync with server /api/usage/ on mount and when auth/pro status changes
  useEffect(() => {
    let isMounted = true;
    fetch('/api/usage/', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;
        setServerUsage(data);
        if (data.is_unlimited) {
          setRemainingWords(MAX_WORDS);
        } else if (typeof data.remaining_words === 'number') {
          setRemainingWords(data.remaining_words);
          localStorage.setItem('axom_ai_remaining_words', data.remaining_words);
          localStorage.setItem('axom_ai_last_update', Date.now());
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isPro]);

  // Regen timer for non-pro users
  useEffect(() => {
    if (isPro) return;

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
      clearInterval(timer);
    };
  }, [isPro]);

  const deductWords = (count) => {
    if (isPro || !count || count <= 0) return;

    // 1. Instant local deduction for snappy UI
    const remaining = localStorage.getItem('axom_ai_remaining_words');
    const now = Date.now();
    let currentRemaining = remaining !== null ? parseFloat(remaining) : remainingWords;

    currentRemaining = Math.max(0, currentRemaining - count);
    localStorage.setItem('axom_ai_remaining_words', currentRemaining);
    localStorage.setItem('axom_ai_last_update', now);
    setRemainingWords(currentRemaining);

    // 2. Sync deduction to server in background
    fetch('/api/usage/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({ deduct: count }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.remaining_words === 'number') {
          setRemainingWords(data.remaining_words);
          localStorage.setItem('axom_ai_remaining_words', data.remaining_words);
        }
      })
      .catch(() => {});
  };

  return {
    remainingWords,
    deductWords,
    maxWords: MAX_WORDS,
    isUnlimited: isPro || serverUsage?.is_unlimited === true,
  };
}
