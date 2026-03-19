/**
 * Component tests for ConversationList.
 * Task 17.10, Issue #106
 */

import React from 'react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { ConversationList } from './ConversationList';

vi.mock('next-intl', async () => {
  const actual = await vi.importActual<typeof import('next-intl')>('next-intl');
  return {
    ...actual,
    useTranslations: () => (key: string) => key,
  };
});

const messages = { chat: {} };

const defaultProps = {
  conversations: [
    {
      id: 'conv-1',
      gymId: 'gym-1',
      branchId: 'branch-1',
      type: 'support' as const,
      metadata: {},
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    },
    {
      id: 'conv-2',
      gymId: 'gym-1',
      branchId: null,
      type: 'direct' as const,
      metadata: {},
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    },
  ],
  selectedId: null,
  onSelect: vi.fn(),
  filter: 'all' as const,
  onFilterChange: vi.fn(),
  branchOptions: [{ id: 'branch-1', name: 'Main Branch' }],
  selectedBranchId: null,
  onBranchChange: vi.fn(),
  isLoading: false,
};

function renderWithProvider(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider messages={messages} locale="en">
      {ui}
    </NextIntlClientProvider>
  );
}

describe('ConversationList', () => {
  it('renders list title and conversations', () => {
    renderWithProvider(<ConversationList {...defaultProps} />);
    expect(screen.getByText('list.title')).toBeInTheDocument();
    expect(screen.getByText('conversation.withGym')).toBeInTheDocument();
    expect(screen.getByText('conversation.direct')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    renderWithProvider(<ConversationList {...defaultProps} isLoading />);
    expect(screen.getByText('label.loading')).toBeInTheDocument();
  });

  it('shows empty state when no conversations', () => {
    renderWithProvider(<ConversationList {...defaultProps} conversations={[]} />);
    expect(screen.getByText('list.empty')).toBeInTheDocument();
  });

  it('calls onSelect when conversation is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithProvider(<ConversationList {...defaultProps} onSelect={onSelect} />);
    await user.click(screen.getByText('conversation.withGym'));
    expect(onSelect).toHaveBeenCalledWith('conv-1');
  });

  it('calls onFilterChange when filter button clicked', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    renderWithProvider(<ConversationList {...defaultProps} onFilterChange={onFilterChange} />);
    await user.click(screen.getByText('list.filterAll'));
    expect(onFilterChange).toHaveBeenCalledWith('all');
  });
});
