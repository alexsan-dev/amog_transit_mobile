import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/src/api/client';
import { Notification } from '@/src/types/api';

export function useNotifications(read?: boolean) {
  return useQuery({
    queryKey: ['notifications', read],
    queryFn: async () => {
      try {
        const params = read !== undefined ? { read } : {};
        const res = await apiClient.get('/notifications', { params });
        const payload = res.data?.data;
        return Array.isArray(payload) ? (payload as Notification[]) : [];
      } catch {
        return [];
      }
    },
    refetchInterval: 60000, // polling every 60s when app is active
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.post(`/notifications/${id}/read`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/notifications/read-all');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
