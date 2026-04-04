import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  connectWebSocket,
  disconnectWebSocket,
  onNotification,
  type NotificationPayload,
} from '@/services/websocket';
import { useToast } from '@/hooks/use-toast';

/**
 * Connects to the backend STOMP WebSocket and invalidates notification
 * React Query caches whenever a new notification arrives.
 * Also shows a toast for high-priority notifications.
 *
 * Mount this once — e.g. inside DashboardLayout.
 */
export function useNotificationWebSocket() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    const token = localStorage.getItem('token');
    if (!token) return;

    connectWebSocket();

    const unsubscribe = onNotification((notif: NotificationPayload) => {
      // Instantly update React Query caches — no polling needed
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });

      // Toast for urgent / high-priority notifications
      if (notif.priority === 'HIGH' || notif.priority === 'URGENT') {
        toast({
          title: notif.title,
          description: notif.message,
          variant: 'default',
        });
      }
    });

    return () => {
      unsubscribe();
      disconnectWebSocket();
      mounted.current = false;
    };
  }, [queryClient, toast]);
}
