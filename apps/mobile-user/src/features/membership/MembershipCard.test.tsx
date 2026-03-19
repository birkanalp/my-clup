import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MembershipCard } from './MembershipCard';
import type { MembershipScreenData } from './types';

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

vi.mock('react-native-qrcode-svg', () => ({
  default: () => null,
}));

describe('MembershipCard', () => {
  it('renders package data, frozen state, and qr container', () => {
    const data: MembershipScreenData = {
      locale: 'en',
      memberId: 'member-1',
      membership: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        planId: '550e8400-e29b-41d4-a716-446655440001',
        memberId: '550e8400-e29b-41d4-a716-446655440002',
        gymId: '550e8400-e29b-41d4-a716-446655440003',
        branchId: null,
        status: 'frozen',
        validFrom: '2025-03-01T00:00:00.000Z',
        validUntil: '2025-03-31T00:00:00.000Z',
        remainingSessions: 5,
        freezeStartAt: '2025-03-10T00:00:00.000Z',
        freezeEndAt: '2025-03-14T00:00:00.000Z',
        entitledBranchIds: ['branch-a'],
        createdAt: '2025-03-01T00:00:00.000Z',
        updatedAt: '2025-03-01T00:00:00.000Z',
      },
      plan: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        gymId: '550e8400-e29b-41d4-a716-446655440003',
        branchId: null,
        name: 'Gold Pack',
        type: 'session_based',
        status: 'active',
        durationDays: null,
        sessionCount: 10,
        freezeRule: { maxDays: 7, maxCountPerPeriod: 1, period: 'month' },
        branchRestrictionEnabled: false,
        allowedBranchIds: [],
        pricingTiers: [{ label: 'Standard', amount: 1500, currency: 'TRY' }],
        discountRules: [],
        trialEnabled: false,
        createdAt: '2025-03-01T00:00:00.000Z',
        updatedAt: '2025-03-01T00:00:00.000Z',
      },
      renewalOptions: [],
      canRenew: true,
      renewalReason: 'expiring_soon',
    };

    render(<MembershipCard data={data} />);

    expect(screen.getByText('Gold Pack')).toBeTruthy();
    expect(screen.getByText('message.frozen')).toBeTruthy();
    expect(screen.getByText('branch-a')).toBeTruthy();
    expect(screen.getByTestId('member-pass-qr')).toBeTruthy();
  });
});
