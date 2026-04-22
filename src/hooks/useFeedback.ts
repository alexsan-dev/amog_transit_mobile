import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/src/api/client';

export function useFeedback() {
  return useMutation({
    mutationFn: async (payload: { rating: number; comment: string }) => {
      const res = await apiClient.post('/feedback', payload);
      return res.data;
    },
  });
}
