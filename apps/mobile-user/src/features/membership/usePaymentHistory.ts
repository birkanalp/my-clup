import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Invoice } from '@myclup/api-client';
import { api } from '../../lib/api';
import { useCurrentUser } from '../chat/useCurrentUser';
import type { PaymentHistoryItem } from './types';

export function usePaymentHistory() {
  const memberId = useCurrentUser();
  const [items, setItems] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!memberId) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [paymentsResult, invoicesResult] = await Promise.all([
        api.membership.listPayments({ memberId, limit: 20 }),
        api.membership.listInvoices({ memberId, limit: 20 }),
      ]);
      const invoiceById = new Map(invoicesResult.items.map((invoice) => [invoice.id, invoice]));
      const nextItems = [...paymentsResult.items]
        .sort((left, right) => {
          const leftTimestamp = new Date(left.paidAt ?? left.createdAt).getTime();
          const rightTimestamp = new Date(right.paidAt ?? right.createdAt).getTime();
          return rightTimestamp - leftTimestamp;
        })
        .map((payment) => ({
          payment,
          invoice: payment.invoiceId ? (invoiceById.get(payment.invoiceId) ?? null) : null,
        }));

      setItems(nextItems);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError : new Error(String(loadError)));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    void load();
  }, [load]);

  const invoices = useMemo(
    () =>
      items.map((item) => item.invoice).filter((invoice): invoice is Invoice => invoice !== null),
    [items]
  );

  const findInvoiceById = useCallback(
    (invoiceId: string) => invoices.find((invoice) => invoice.id === invoiceId) ?? null,
    [invoices]
  );

  return {
    error,
    findInvoiceById,
    invoices,
    items,
    loading,
    refresh: load,
  };
}
