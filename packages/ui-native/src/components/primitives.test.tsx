import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  Button,
  Card,
  ScreenContainer,
  SectionHeader,
  StateBlock,
  StatusBadge,
} from './primitives';

vi.mock('react-native', () => {
  const createComponent =
    (name: string) =>
    ({ children, ...props }: Record<string, unknown>) =>
      React.createElement(name, props, children);

  return {
    ActivityIndicator: createComponent('ActivityIndicator'),
    Pressable: createComponent('Pressable'),
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
    },
    Text: createComponent('Text'),
    View: createComponent('View'),
  };
});

describe('ui-native primitives', () => {
  it('renders a screen container with children', () => {
    const element = ScreenContainer({ children: 'content', testID: 'screen' });
    expect(element.props.testID).toBe('screen');
    expect(element.props.children).toBe('content');
  });

  it('renders a button label and accessibility role', () => {
    const element = Button({ children: 'Continue', variant: 'primary' });
    expect(element.props.accessibilityRole).toBe('button');
    expect(element.props.children.props.children).toBe('Continue');
  });

  it('renders a section header and action', () => {
    const element = SectionHeader({
      title: 'Membership',
      subtitle: 'Overview',
      actionLabel: 'Open',
      onAction: () => {},
    });

    expect(element.props.children[0].props.children[0].props.children).toBe('Membership');
  });

  it('renders a status badge', () => {
    const element = StatusBadge({ label: 'Active', tone: 'success' });
    expect(element.props.children.props.children).toBe('Active');
  });

  it('renders a state block with description and action', () => {
    const element = StateBlock({
      title: 'Nothing here',
      description: 'Try later',
      actionLabel: 'Retry',
      onAction: () => {},
    });

    expect(element.props.children[1].props.children).toBe('Nothing here');
    expect(element.props.children[2].props.children).toBe('Try later');
  });

  it('renders a card wrapper', () => {
    const element = Card({ children: 'card body' });
    expect(element.props.children).toBe('card body');
  });
});
