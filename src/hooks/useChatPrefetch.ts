import { useEffect, useRef } from 'react';
import { API_BASE_URL } from '@/lib/api';

/**
 * Prefetches chat-related data in the background when the dashboard loads.
 * This eliminates the ~5s cold start when navigating to the chat page by:
 * 1. Pre-fetching the users list into localStorage cache
 * 2. Pre-fetching the Firebase custom token so auth is faster
 *
 * Runs once after a short delay so it doesn't compete with initial page load.
 */
export function useChatPrefetch() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = localStorage.getItem('token');
    if (!token) return;

    // Delay prefetch so it doesn't block initial dashboard render
    const timer = setTimeout(async () => {
      try {
        // Prefetch users list if cache is stale or missing
        const cacheTime = localStorage.getItem('chat_users_cache_time');
        const isStale = !cacheTime || (Date.now() - parseInt(cacheTime)) > 5 * 60 * 1000;

        if (isStale) {
          const usersRes = await fetch(`${API_BASE_URL}/users/all?pageSize=1000`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (usersRes.ok) {
            const data = await usersRes.json();
            const usersList = data.data || [];
            localStorage.setItem('chat_users_cache', JSON.stringify(usersList));
            localStorage.setItem('chat_users_cache_time', Date.now().toString());
          }
        }

        // Prefetch Firebase token into sessionStorage
        const cachedFirebaseToken = sessionStorage.getItem('firebase_token');
        const fbTokenTime = sessionStorage.getItem('firebase_token_time');
        const fbStale = !cachedFirebaseToken || !fbTokenTime || (Date.now() - parseInt(fbTokenTime)) > 50 * 60 * 1000; // 50 min

        if (fbStale) {
          const fbRes = await fetch(`${API_BASE_URL}/users/firebase/token`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (fbRes.ok) {
            const firebaseToken = await fbRes.text();
            sessionStorage.setItem('firebase_token', firebaseToken);
            sessionStorage.setItem('firebase_token_time', Date.now().toString());
          }
        }
      } catch {
        // Silent fail — prefetch is best-effort
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);
}
