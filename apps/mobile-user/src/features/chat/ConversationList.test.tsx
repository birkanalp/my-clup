import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ConversationList } from './ConversationList';

vi.mock('react-native', () => {
  type FlatListItem = {
    id?: string;
  };

  type MockProps = {
    children?: React.ReactNode;
    onClick?: () => void;
    onPress?: () => void;
    testID?: string;
  } & Record<string, unknown>;

  const createComponent =
    (tag: 'div' | 'button') =>
    ({ children, onClick, onPress, testID, ...props }: MockProps) =>
      React.createElement(
        tag,
        {
          ...props,
          'data-testid': testID,
          onClick: onClick ?? onPress,
        },
        children as React.ReactNode
      );

  return {
    ActivityIndicator: createComponent('div'),
    FlatList: ({
      data,
      renderItem,
      ListFooterComponent,
    }: {
      data: FlatListItem[];
      renderItem: ({ item }: { item: FlatListItem }) => React.ReactNode;
      ListFooterComponent?: React.ReactNode;
    }) => (
      <div>
        {data.map((item) => renderItem({ item }))}
        {ListFooterComponent}
      </div>
    ),
    RefreshControl: createComponent('div'),
    StyleSheet: { create: (styles: unknown) => styles },
    View: createComponent('div'),
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('../../components/AppStateBlock', () => ({
  AppStateBlock: ({
    title,
    description,
    actionLabel,
    onAction,
  }: {
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
  }) => (
    <div>
      <span>{title}</span>
      {description ? <span>{description}</span> : null}
      {actionLabel ? <button onClick={onAction}>{actionLabel}</button> : null}
    </div>
  ),
}));

vi.mock('./ConversationRow', () => ({
  ConversationRow: ({
    conversation,
    onPress,
  }: {
    conversation: { id: string };
    onPress: () => void;
  }) => <button onClick={onPress}>{conversation.id}</button>,
}));

describe('ConversationList', () => {
  it('renders empty state copy when there are no conversations', () => {
    render(
      <ConversationList
        items={[]}
        loading={false}
        error={null}
        onRefresh={() => {}}
        onLoadMore={() => {}}
        onSelectConversation={() => {}}
        nextCursor={null}
      />
    );

    expect(screen.getByText('list.empty')).toBeTruthy();
    expect(screen.getByText('list.emptyBody')).toBeTruthy();
  });

  it('renders error state with retry action', () => {
    const onRefresh = vi.fn();

    render(
      <ConversationList
        items={[]}
        loading={false}
        error={new Error('boom')}
        onRefresh={onRefresh}
        onLoadMore={() => {}}
        onSelectConversation={() => {}}
        nextCursor={null}
      />
    );

    fireEvent.click(screen.getByText('list.retry'));
    expect(onRefresh).toHaveBeenCalled();
  });

  it('renders rows and forwards selection', () => {
    const onSelectConversation = vi.fn();

    render(
      <ConversationList
        items={[
          {
            id: 'conv-1',
            gymId: 'gym-1',
            branchId: null,
            type: 'support',
            metadata: {},
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
          },
        ]}
        loading={false}
        error={null}
        onRefresh={() => {}}
        onLoadMore={() => {}}
        onSelectConversation={onSelectConversation}
        nextCursor={null}
      />
    );

    fireEvent.click(screen.getByText('conv-1'));
    expect(onSelectConversation).toHaveBeenCalledWith('conv-1');
  });
});
