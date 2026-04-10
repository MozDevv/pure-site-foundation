import { useQuery } from '@tanstack/react-query';
import { apiService, endpoints } from '@/lib/api';
import { useState, useCallback } from 'react';

interface MaintenanceStatus {
  enabled: boolean;
  message?: string;
}

/**
 * Checks if the system is in maintenance mode.
 * For unauthenticated users: calls the public /settings/system/maintenance-status endpoint.
 * For authenticated users: same public endpoint (no token needed).
 */
export function useMaintenanceMode() {
  const [bypassed, setBypassed] = useState(false);

  const { data, isLoading } = useQuery<MaintenanceStatus>({
    queryKey: ['maintenanceMode'],
    queryFn: async () => {
      try {
        // Public endpoint — no auth required
        const res = await apiService.get(endpoints.getPublicMaintenanceStatus);
        return {
          enabled: res.data?.enabled === true,
          message: res.data?.message || undefined,
        };
      } catch {
        return { enabled: false };
      }
    },
    refetchInterval: 60_000,   // Re-check every 60 seconds
    staleTime: 30_000,
  });

  const bypass = useCallback(() => setBypassed(true), []);

  return {
    isMaintenanceMode: data?.enabled === true && !bypassed,
    maintenanceMessage: data?.message,
    isLoading,
    bypass,
  };
}
