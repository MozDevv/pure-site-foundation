import { Client, IMessage } from '@stomp/stompjs';
import { API_BASE_URL } from '@/lib/api';

export type NotificationPayload = {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  actionUrl?: string;
  referenceId?: string;
  referenceType?: string;
  createdAt: string;
  isRead: boolean;
};

type NotificationHandler = (notification: NotificationPayload) => void;

let stompClient: Client | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
const handlers = new Set<NotificationHandler>();

function getWsUrl(): string {
  const wsBase = import.meta.env.VITE_WS_BASE_URL as string | undefined;
  if (wsBase) return `${wsBase}/ws/notifications/websocket`;
  // fallback: derive from API_BASE_URL
  const base = API_BASE_URL.startsWith('http')
    ? API_BASE_URL.replace(/\/api$/, '')
    : window.location.origin;
  const protocol = base.startsWith('https') ? 'wss' : 'ws';
  const host = base.replace(/^https?:\/\//, '');
  return `${protocol}://${host}/ws/notifications/websocket`;
}

export function connectWebSocket(): void {
  const token = localStorage.getItem('token');
  if (!token || stompClient?.connected) return;

  stompClient = new Client({
    brokerURL: getWsUrl(),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      // Subscribe to user-specific notification queue
      stompClient?.subscribe('/user/queue/notifications', (message: IMessage) => {
        try {
          const payload: NotificationPayload = JSON.parse(message.body);
          handlers.forEach((handler) => handler(payload));
        } catch {
          // Ignore malformed messages
        }
      });
    },
    onStompError: (frame) => {
      console.warn('STOMP error:', frame.headers['message']);
    },
    onWebSocketClose: () => {
      // Client handles reconnection via reconnectDelay
    },
  });

  stompClient.activate();
}

export function disconnectWebSocket(): void {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
}

export function onNotification(handler: NotificationHandler): () => void {
  handlers.add(handler);
  return () => {
    handlers.delete(handler);
  };
}

export function isWebSocketConnected(): boolean {
  return stompClient?.connected ?? false;
}
