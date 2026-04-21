import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/src/api/client';
import { Payment } from '@/src/types/api';

export function usePayments() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const res = await apiClient.get('/payments');
      return res.data.data as Payment[];
    },
    retry: 2,
  });
}
