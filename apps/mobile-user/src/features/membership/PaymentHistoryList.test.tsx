import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PaymentHistoryList } from './PaymentHistoryList';

vi.mock('react-native', () => {
  const createComponent = (tag: 'div' | 'span' | 'button') =>
    ({ children, onPress, testID, accessibilityRole, ...props }: any) =>
      React.createElement(
        tag,
        {
          ...props,
          'data-testid': testID,
          onClick: onPress,
        },
        children as React.ReactNode
      );

  return {
    Pressable: createComponent('button'),
    StyleSheet: { create: (styles: unknown) => styles },
    Text: createComponent('span'),
    View: createComponent('div'),
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('PaymentHistoryList', () => {
  it('renders payment rows and invoice action', () => {
    const onSelectInvoice = vi.fn();

    render(
      <PaymentHistoryList
        items={[
          {
            payment: {
              id: 'payment-1',
              gymId: 'gym-1',
              branchId: null,
              memberId: 'member-1',
              invoiceId: 'invoice-1',
              currency: 'TRY',
              amount: 1200,
              method: 'card',
              status: 'succeeded',
              paidAt: '2025-03-10T00:00:00.000Z',
              createdAt: '2025-03-10T00:00:00.000Z',
              updatedAt: '2025-03-10T00:00:00.000Z',
            },
            invoice: {
              id: 'invoice-1',
              gymId: 'gym-1',
              branchId: null,
              memberId: 'member-1',
              membershipInstanceId: null,
              status: 'paid',
              currency: 'TRY',
              subtotalAmount: 1200,
              discountAmount: 0,
              totalAmount: 1200,
              dueAt: '2025-03-10T00:00:00.000Z',
              issuedAt: '2025-03-10T00:00:00.000Z',
              paidAt: '2025-03-10T00:00:00.000Z',
              lineItems: [
                {
                  id: 'line-1',
                  label: 'Membership',
                  quantity: 1,
                  unitAmount: 1200,
                  totalAmount: 1200,
                },
              ],
              createdAt: '2025-03-10T00:00:00.000Z',
              updatedAt: '2025-03-10T00:00:00.000Z',
            },
          },
        ]}
        locale="en"
        onSelectInvoice={onSelectInvoice}
      />
    );

    fireEvent.click(screen.getByText('cta.viewInvoice'));
    expect(onSelectInvoice).toHaveBeenCalledWith('invoice-1');
  });

  it('renders empty state when there are no payments', () => {
    render(<PaymentHistoryList items={[]} locale="en" onSelectInvoice={() => {}} />);
    expect(screen.getByText('message.noPayments')).toBeTruthy();
  });
});
