import { apiClient } from '@/src/api/client';
import { ShippingRoute } from '@/src/types/api';
import { useQuery } from '@tanstack/react-query';

export function useShippingRoutes() {
  return useQuery({
    queryKey: ['shipping-routes'],
    queryFn: async () => {
      const res = await apiClient.get('/shipping-routes');
      const payload = res.data?.data;
      return Array.isArray(payload) ? (payload as ShippingRoute[]) : [];
    },
    retry: 1,
  });
}
