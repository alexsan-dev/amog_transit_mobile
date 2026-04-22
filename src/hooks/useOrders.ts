import { apiClient } from "@/src/api/client";
import { Order } from "@/src/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useOrders(status?: string) {
  return useQuery({
    queryKey: ["orders", status],
    queryFn: async () => {
      try {
        const params = status ? { status } : {};
        const res = await apiClient.get("/orders", { params });
        const payload = res.data?.data;
        return Array.isArray(payload) ? (payload as Order[]) : [];
      } catch {
        return [];
      }
    },
  });
}

export function useOrder(reference: string) {
  return useQuery({
    queryKey: ["order", reference],
    queryFn: async () => {
      try {
        const res = await apiClient.get(`/orders/${reference}`);
        return res.data?.data as Order | undefined;
      } catch {
        return undefined;
      }
    },
    enabled: !!reference,
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reference: string) => {
      const res = await apiClient.post(`/orders/${reference}/cancel`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function usePayOrderInitiate() {
  return useMutation({
    mutationFn: async (reference: string) => {
      const res = await apiClient.post(`/orders/${reference}/pay/initiate`);
      if (!res.data?.data) {
        throw new Error(res.data?.message ?? "Réponse invalide du serveur.");
      }
      return res.data.data as {
        payment_id: number;
        intent_id: string;
        client_secret: string;
        amount: number;
        currency: string;
      };
    },
    onError: (err) => {
      console.error("[usePayOrderInitiate]", err);
    },
  });
}

export function usePayOrderConfirm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      reference: string;
      payment_id: number;
      phone: string;
      operator: string;
    }) => {
      const res = await apiClient.post(
        `/orders/${payload.reference}/pay/confirm`,
        {
          payment_id: payload.payment_id,
          phone: payload.phone,
          operator: payload.operator,
        },
      );
      return res.data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", vars.reference] });
    },
    onError: (err) => {
      console.error("[usePayOrderConfirm]", err);
    },
  });
}

export function usePayOrderStatus() {
  return useMutation({
    mutationFn: async (reference: string) => {
      const res = await apiClient.get(`/orders/${reference}/pay/status`);
      return res.data?.data as { status: string } | undefined;
    },
  });
}
