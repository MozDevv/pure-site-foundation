import { API_BASE_URL } from '@/lib/api';
import { useRef, useCallback } from 'react';

type IncomingCallCallback = (fromUserId: string) => void;
type CallAcceptedCallback = (roomId: string) => void;

const RECONNECT_DELAY_MS = 2000;
const MAX_RETRIES = 10;
function getWsBaseUrl(apiBaseUrl: string): string {
  // Remove protocol and path, keep only domain:port
  if (apiBaseUrl.startsWith('http')) {
    const match = apiBaseUrl.match(/^https?:\/\/([^/]+)/i);
    if (match) return match[1];
  }
  // Relative URL (e.g. '/api') — fall back to current page host
  return window.location.host;
}
export function useCallSignaling() {
  const wsRef = useRef<WebSocket | null>(null);
  const onIncomingCallRef = useRef<IncomingCallCallback | null>(null);
  const onCallAcceptedRef = useRef<CallAcceptedCallback | null>(null);
  const retryCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUserIdRef = useRef<string | null>(null);
  const lastTokenRef = useRef<string | null>(null);

  const connect = useCallback((userId: string, token: string) => {
    lastUserIdRef.current = userId;
    lastTokenRef.current = token;

    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsDomain = getWsBaseUrl(API_BASE_URL);
    // Always derive protocol from the page protocol to avoid mixed-content blocks
    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${wsProtocol}://${wsDomain.replace(
      /:([0-9]+)\/api$/,
      ':8080'
    )}/ws/${userId}?token=${token}`;

    console.log('[CallSignaling] Attempting to connect to:', wsUrl);

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('Call signaling WebSocket connected');
      retryCountRef.current = 0;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received signaling message:', data);

        if (data.action === 'ring') {
          onIncomingCallRef.current?.(data.fromUserId);
        } else if (data.action === 'accepted') {
          onCallAcceptedRef.current?.(data.meetingLink);
        }
      } catch (e) {
        console.error('Failed to parse signaling message', e);
      }
    };

    wsRef.current.onclose = () => {
      console.log('Call signaling WebSocket closed');
      wsRef.current = null;
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current += 1;
        reconnectTimeoutRef.current = setTimeout(() => {
          if (lastUserIdRef.current && lastTokenRef.current) {
            connect(lastUserIdRef.current, lastTokenRef.current);
          }
        }, RECONNECT_DELAY_MS);
      }
    };

    wsRef.current.onerror = (err) => {
      console.error('Call signaling WebSocket error', err);
      wsRef.current?.close();
    };
  }, []);

  const setOnIncomingCall = useCallback((callback: IncomingCallCallback) => {
    onIncomingCallRef.current = callback;
  }, []);

  const setOnCallAccepted = useCallback((callback: CallAcceptedCallback) => {
    onCallAcceptedRef.current = callback;
  }, []);

  const send = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not open');
      // Optionally: queue messages for later sending
      // Or trigger reconnect here if needed
    }
  }, []);

  const initiateCall = useCallback(
    (targetUserId: string, fromUserId: string) => {
      send({
        action: 'call',
        targetUserId,
        fromUserId,
      });
    },
    [send]
  );

  const acceptCall = useCallback(
    (fromUserId: string, targetUserId: string) => {
      console.log('Accepting call from', fromUserId);
      console.log('Target user ID:', targetUserId);
      send({
        action: 'accept',
        fromUserId,
        targetUserId,
      });
    },
    [send]
  );

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  return {
    connect,
    setOnIncomingCall,
    setOnCallAccepted,
    initiateCall,
    acceptCall,
    disconnect,
  };
}
