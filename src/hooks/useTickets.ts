import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/src/api/client';
import { Ticket, TicketMessage } from '@/src/types/api';

export function useTickets() {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/tickets');
        const payload = res.data?.data;
        return Array.isArray(payload) ? (payload as Ticket[]) : [];
      } catch {
        return [];
      }
    },
  });
}

export function useTicket(id: number) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => {
      try {
        const res = await apiClient.get(`/tickets/${id}`);
        const data = res.data?.data as (Ticket & { messages: TicketMessage[] }) | undefined;
        if (data && !Array.isArray(data.messages)) {
          data.messages = [];
        }
        return data;
      } catch {
        return undefined;
      }
    },
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      subject: string;
      message: string;
      order_reference?: string;
    }) => {
      const res = await apiClient.post('/tickets', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { ticketId: number; body: string }) => {
      const res = await apiClient.post(`/tickets/${payload.ticketId}/messages`, {
        body: payload.body,
      });
      return res.data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', vars.ticketId] });
    },
  });
}
