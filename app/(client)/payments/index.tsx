import React, { useState } from 'react';
import { View, ScrollView, RefreshControl, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CreditCard, Calendar, Wallet, ArrowDownUp, Filter } from 'lucide-react-native';
import { Text } from '@/src/components/ui/Text';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { usePayments } from '@/src/hooks/usePayments';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Payment } from '@/src/types/api';

type Sort = 'recent' | 'amount';
type StatusFilter = 'all' | 'pending' | 'paid' | 'failed' | 'refunded';

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: '#c47d0e' },
  paid: { label: 'Paye', color: '#1a7a4a' },
  failed: { label: 'Echoue', color: '#b91c1c' },
  refunded: { label: 'Rembourse', color: '#1d5faa' },
};

function PaymentCard({ payment, index, c }: { payment: Payment; index: number; c: Record<string, string> }) {
  const meta = STATUS_META[payment.status] ?? { label: payment.status, color: c.textMuted };

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(250)} style={{ marginBottom: 10 }}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: c.surface,
            borderColor: c.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04,
            shadowRadius: 8,
            elevation: 2,
          },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 11,
              backgroundColor: meta.color + '12',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
            }}
          >
            <CreditCard size={20} color={meta.color} strokeWidth={1.5} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: 'JetBrainsMono_500Medium',
                fontSize: 13,
                color: c.primary,
                marginBottom: 3,
              }}
            >
              {payment.order_reference}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Calendar size={11} color={c.textMuted} strokeWidth={1.5} />
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: c.textMuted }}>
                {new Date(payment.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text
              style={{
                fontFamily: 'JetBrainsMono_500Medium',
                fontSize: 15,
                color: c.text,
              }}
            >
              {new Intl.NumberFormat('fr-FR').format(payment.amount)} {payment.currency}
            </Text>
            <View
              style={{
                marginTop: 4,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 20,
                backgroundColor: meta.color + '12',
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 10,
                  color: meta.color,
                }}
              >
                {meta.label}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

export default function PaymentsScreen() {
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const { data: payments, isLoading, refetch } = usePayments();
  const [sort, setSort] = useState<Sort>('recent');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = (payments ?? []).filter((p) => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return b.amount - a.amount;
  });

  const totalPaid = filtered
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: 12, backgroundColor: c.background, borderBottomColor: c.border },
        ]}
      >
        <View>
          <Text style={{ fontFamily: 'Syne_700Bold', fontSize: 18, color: c.text }}>
            Paiements
          </Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: c.textMuted, marginTop: 2 }}>
            {filtered.length} transaction{filtered.length > 1 ? 's' : ''}
          </Text>
        </View>
        <Pressable onPress={() => setShowFilters((v) => !v)} style={styles.filterBtn}>
          <Filter size={18} color={showFilters ? c.primary : c.textMuted} strokeWidth={1.8} />
        </Pressable>
      </View>

      {/* Summary */}
      <View
        style={[
          styles.summaryCard,
          { backgroundColor: c.primary + '08', borderColor: c.primary + '18' },
        ]}
      >
        <Wallet size={20} color={c.primary} strokeWidth={1.5} />
        <View style={{ marginLeft: 12 }}>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: c.textMuted }}>
            Total paye
          </Text>
          <Text style={{ fontFamily: 'JetBrainsMono_500Medium', fontSize: 18, color: c.primary }}>
            {new Intl.NumberFormat('fr-FR').format(totalPaid)} XAF
          </Text>
        </View>
      </View>

      {/* Filters */}
      {showFilters && (
        <Animated.View entering={FadeInDown.duration(200)} style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            <Pressable
              onPress={() => setSort('recent')}
              style={[
                styles.chip,
                {
                  backgroundColor: sort === 'recent' ? c.primary + '12' : c.surface,
                  borderColor: sort === 'recent' ? c.primary : c.border,
                },
              ]}
            >
              <ArrowDownUp size={12} color={sort === 'recent' ? c.primary : c.textMuted} strokeWidth={2} />
              <Text style={{ fontFamily: sort === 'recent' ? 'Inter_600SemiBold' : 'Inter_400Regular', fontSize: 12, color: sort === 'recent' ? c.primary : c.textMuted, marginLeft: 4 }}>
                Recent
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setSort('amount')}
              style={[
                styles.chip,
                {
                  backgroundColor: sort === 'amount' ? c.primary + '12' : c.surface,
                  borderColor: sort === 'amount' ? c.primary : c.border,
                },
              ]}
            >
              <ArrowDownUp size={12} color={sort === 'amount' ? c.primary : c.textMuted} strokeWidth={2} />
              <Text style={{ fontFamily: sort === 'amount' ? 'Inter_600SemiBold' : 'Inter_400Regular', fontSize: 12, color: sort === 'amount' ? c.primary : c.textMuted, marginLeft: 4 }}>
                Montant
              </Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {(['all', 'pending', 'paid', 'failed', 'refunded'] as StatusFilter[]).map((s) => (
              <Pressable
                key={s}
                onPress={() => setStatusFilter(s)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: statusFilter === s ? c.primary + '12' : c.surface,
                    borderColor: statusFilter === s ? c.primary : c.border,
                  },
                ]}
              >
                <Text style={{ fontFamily: statusFilter === s ? 'Inter_600SemiBold' : 'Inter_400Regular', fontSize: 12, color: statusFilter === s ? c.primary : c.textMuted }}>
                  {s === 'all' ? 'Tout' : STATUS_META[s]?.label ?? s}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={c.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <>
            <Skeleton height={80} className="mb-3 rounded-xl" />
            <Skeleton height={80} className="mb-3 rounded-xl" />
            <Skeleton height={80} className="rounded-xl" />
          </>
        ) : sorted.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <View style={[styles.emptyCircle, { backgroundColor: c.primary + '08' }]}>
              <CreditCard size={32} color={c.primary} strokeWidth={1.2} />
            </View>
            <Text style={{ fontFamily: 'Syne_600SemiBold', fontSize: 15, color: c.text, marginTop: 16 }}>
              Aucun paiement
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: c.textMuted, marginTop: 6, textAlign: 'center', maxWidth: 240 }}>
              Vos paiements apparaissent ici apres validation.
            </Text>
          </View>
        ) : (
          sorted.map((p, i) => <PaymentCard key={p.id} payment={p} index={i} c={c} />)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  emptyCircle: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
