import { useQuery } from '@tanstack/react-query';
import { apiService, endpoints } from '@/lib/api';
import { useState, useCallback } from 'react';

interface MaintenanceStatus {
  enabled: boolean;
  message?: string;
}

/**
 * Checks if the system is in maintenance mode by reading the `maintenance_mode` system setting.
 * Polls every 60 seconds. Non-authenticated; uses a public endpoint if available,
 * otherwise falls back to the authenticated system settings endpoint.
 */
export function useMaintenanceMode() {
  const [bypassed, setBypassed] = useState(false);

  const { data, isLoading } = useQuery<MaintenanceStatus>({
    queryKey: ['maintenanceMode'],
    queryFn: async () => {
      try {
        const res = await apiService.get(endpoints.getSystemSettings);
        const settings: Array<{ settingKey: string; settingValue: string; description: string }> = res.data;
        const modeSetting = settings.find(s => s.settingKey === 'maintenance_mode');
        const messageSetting = settings.find(s => s.settingKey === 'maintenance_message');
        return {
          enabled: modeSetting?.settingValue === 'true',
          message: messageSetting?.settingValue || undefined,
        };
      } catch {
        // If settings endpoint fails (e.g. 401 for unauthenticated users), not in maintenance
        return { enabled: false };
      }
    },
    refetchInterval: 5 * 60_000, // Re-check every 5 min
    staleTime: 2 * 60_000,
  });

  const bypass = useCallback(() => setBypassed(true), []);

  return {
    isMaintenanceMode: data?.enabled === true && !bypassed,
    maintenanceMessage: data?.message,
    isLoading,
    bypass,
  };
}
