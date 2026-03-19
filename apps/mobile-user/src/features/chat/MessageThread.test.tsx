import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MessageThread } from './MessageThread';

vi.mock('react-native', () => {
  type FlatListItem = {
    id?: string;
  };

  type MockProps = {
    children?: React.ReactNode;
    onClick?: () => void;
    onPress?: () => void;
    testID?: string;
    value?: string;
  } & Record<string, unknown>;

  const createComponent =
    (tag: 'div' | 'button') =>
    ({ children, onClick, onPress, testID, value, ...props }: MockProps) =>
      React.createElement(
        tag,
        {
          ...props,
          'data-testid': testID,
          onClick: onClick ?? onPress,
          value,
        },
        children as React.ReactNode
      );

  return {
    FlatList: ({
      data,
      renderItem,
      ListEmptyComponent,
    }: {
      data: FlatListItem[];
      renderItem: ({ item }: { item: FlatListItem }) => React.ReactNode;
      ListEmptyComponent?: React.ReactNode;
    }) => (
      <div>{data.length === 0 ? ListEmptyComponent : data.map((item) => renderItem({ item }))}</div>
    ),
    KeyboardAvoidingView: createComponent('div'),
    Platform: { OS: 'web' },
    Pressable: createComponent('button'),
    StyleSheet: { create: (styles: unknown) => styles },
    TextInput: ({
      onChangeText,
      value,
      placeholder,
      ...props
    }: {
      onChangeText?: (value: string) => void;
      value?: string;
      placeholder?: string;
    } & Record<string, unknown>) =>
      React.createElement('textarea', {
        ...props,
        placeholder,
        value,
        onChange: (event: { target: { value: string } }) => onChangeText?.(event.target.value),
      }),
    View: createComponent('div'),
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: 'en' },
  }),
}));

vi.mock('@myclup/ui-native', () => ({
  Card: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../components/AppStateBlock', () => ({
  AppStateBlock: ({ title, description }: { title: string; description?: string }) => (
    <div>
      <span>{title}</span>
      {description ? <span>{description}</span> : null}
    </div>
  ),
}));

vi.mock('../../components/AppText', () => ({
  AppText: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock('../../components/AppIcon', () => ({
  AppIcon: ({ name }: { name: string }) => <span>{name}</span>,
}));

describe('MessageThread', () => {
  it('renders localized empty state when there are no messages', () => {
    render(
      <MessageThread
        conversationId="conv-1"
        messages={[]}
        currentUserId="user-1"
        loading={false}
        error={null}
        onSendMessage={async () => {}}
        typingLabel={null}
        onTypingChange={() => {}}
      />
    );

    expect(screen.getByText('thread.emptyTitle')).toBeTruthy();
    expect(screen.getByText('thread.emptyBody')).toBeTruthy();
  });

  it('renders generic error state copy instead of raw error details', () => {
    render(
      <MessageThread
        conversationId="conv-1"
        messages={[]}
        currentUserId="user-1"
        loading={false}
        error={new Error('raw backend message')}
        onSendMessage={async () => {}}
        typingLabel={null}
        onTypingChange={() => {}}
      />
    );

    expect(screen.getByText('thread.errorTitle')).toBeTruthy();
    expect(screen.queryByText('raw backend message')).toBeNull();
  });

  it('forwards outgoing messages through the composer', () => {
    const onSendMessage = vi.fn().mockResolvedValue(undefined);

    render(
      <MessageThread
        conversationId="conv-1"
        messages={[
          {
            id: 'msg-1',
            conversationId: 'conv-1',
            senderId: 'user-2',
            content: 'Hello',
            dedupeKey: null,
            createdAt: '2025-01-01T10:00:00Z',
          },
        ]}
        currentUserId="user-1"
        loading={false}
        error={null}
        onSendMessage={onSendMessage}
        typingLabel="label.typingSomeone"
        onTypingChange={() => {}}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('input.placeholder'), {
      target: { value: 'Hi there' },
    });
    fireEvent.click(screen.getByText('input.send'));

    expect(onSendMessage).toHaveBeenCalledWith('Hi there');
    expect(screen.getByText('label.typingSomeone')).toBeTruthy();
  });
});
