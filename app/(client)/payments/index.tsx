import React from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CreditCard, ChevronRight, Calendar } from 'lucide-react-native';
import { Text } from '@/src/components/ui/Text';
import { Card } from '@/src/components/ui/Card';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { usePayments } from '@/src/hooks/usePayments';
import { useTheme } from '@/src/theme/ThemeProvider';
import { itemEnter } from '@/src/theme/animations';
import { Payment } from '@/src/types/api';

const STATUS_LABELS: Record<Payment['status'], { label: string; color: string }> = {
  pending: { label: 'En attente', color: '#c47d0e' },
  paid: { label: 'Payé', color: '#1a7a4a' },
  failed: { label: 'Échoué', color: '#b91c1c' },
  refunded: { label: 'Remboursé', color: '#1d5faa' },
};

function PaymentCard({ payment, index }: { payment: Payment; index: number }) {
  const { c } = useTheme();
  const meta = STATUS_LABELS[payment.status];

  return (
    <Animated.View entering={itemEnter(index)} className="mb-3">
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: c.primary + '12',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <CreditCard size={18} color={c.primary} strokeWidth={1.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text className="font-mono text-sm text-primary">{payment.order_reference}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <Calendar size={11} color={c.textMuted} strokeWidth={1.5} />
                <Text className="font-body text-xs text-text-muted ml-1">
                  {new Date(payment.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              </View>
              <View
                style={{
                  marginTop: 4,
                  alignSelf: 'flex-start',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 4,
                  backgroundColor: meta.color + '18',
                }}
              >
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, color: meta.color }}>
                  {meta.label}
                </Text>
              </View>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end', paddingLeft: 12 }}>
            <Text className="font-mono text-base text-text font-semibold">
              {new Intl.NumberFormat('fr').format(payment.amount)} {payment.currency}
            </Text>
            <ChevronRight size={16} color={c.textMuted} style={{ marginTop: 4 }} />
          </View>
        </View>
      </Card>
    </Animated.View>
  );
}

export default function PaymentsScreen() {
  const insets = useSafeAreaInsets();
  const { data: payments, isLoading, refetch } = usePayments();
  const { c } = useTheme();

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        <Text variant="h2" className="text-primary mb-4">Paiements</Text>

        {isLoading ? (
          <>
            <Skeleton height={80} className="mb-3" />
            <Skeleton height={80} className="mb-3" />
            <Skeleton height={80} />
          </>
        ) : !payments || payments.length === 0 ? (
          <View className="items-center justify-center py-16 bg-surface border border-border rounded-xl">
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: c.primary + '12',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <CreditCard size={26} color={c.primary} strokeWidth={1.5} />
            </View>
            <Text className="font-body text-sm text-text-muted">Aucun paiement enregistré</Text>
          </View>
        ) : (
          payments.map((p, i) => <PaymentCard key={p.id} payment={p} index={i} />)
        )}
      </ScrollView>
    </View>
  );
}
