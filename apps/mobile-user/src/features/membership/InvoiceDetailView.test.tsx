import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InvoiceDetailView } from './InvoiceDetailView';

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

describe('InvoiceDetailView', () => {
  it('renders invoice details and share action', () => {
    const onShare = vi.fn();

    render(
      <InvoiceDetailView
        invoice={{
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
        }}
        locale="en"
        onShare={onShare}
      />
    );

    fireEvent.click(screen.getByText('cta.shareInvoice'));
    expect(onShare).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Membership x1')).toBeTruthy();
  });
});
