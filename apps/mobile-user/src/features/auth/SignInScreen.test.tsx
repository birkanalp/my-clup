import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const { mockSignInWithPassword, mockReplace } = vi.hoisted(() => {
  const mockSignInWithPassword = vi.fn();
  const mockReplace = vi.fn();
  return { mockSignInWithPassword, mockReplace };
});

// --- mock supabase ---
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
  },
}));

// --- mock expo-router ---
vi.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSegments: () => [],
}));

// --- mock react-i18next ---
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// --- mock @myclup/ui-native ---
vi.mock('@myclup/ui-native', () => {
  type MockProps = {
    children?: React.ReactNode;
    style?: unknown;
    onPress?: () => void;
  } & Record<string, unknown>;

  const Div = ({ children }: MockProps) => React.createElement('div', {}, children);
  const ButtonEl = ({ children, onPress }: MockProps) =>
    React.createElement('button', { onClick: onPress }, children);

  return {
    ScreenContainer: Div,
    Card: Div,
    Button: ButtonEl,
  };
});

// --- mock react-native ---
vi.mock('react-native', () => {
  type MockProps = {
    children?: React.ReactNode;
    onChangeText?: (v: string) => void;
    value?: string;
    placeholder?: string;
    testID?: string;
    accessibilityLabel?: string;
    style?: unknown;
    behavior?: string;
    editable?: boolean;
  } & Record<string, unknown>;

  const Div = ({ children }: MockProps) => React.createElement('div', {}, children);

  const InputEl = ({ onChangeText, value, placeholder, accessibilityLabel }: MockProps) =>
    React.createElement('input', {
      'aria-label': accessibilityLabel,
      value: value ?? '',
      placeholder,
      onChange: (e: { target: { value: string } }) => onChangeText?.(e.target.value),
    });

  return {
    View: Div,
    TextInput: InputEl,
    StyleSheet: { create: (s: unknown) => s },
    KeyboardAvoidingView: Div,
    ActivityIndicator: () => React.createElement('div', { 'data-testid': 'activity-indicator' }),
    Platform: { OS: 'ios' },
  };
});

// --- mock AppText ---
vi.mock('../../components/AppText', () => ({
  AppText: ({ children }: { children?: React.ReactNode }) =>
    React.createElement('span', {}, children),
}));

// --- mock appTheme ---
vi.mock('../../theme/appTheme', () => ({
  appTheme: {
    colors: {
      primary: '#0f766e',
      primarySoft: '#d9f3f0',
      textSoft: '#7c8a9b',
      textMuted: '#5b6b7f',
      text: '#0f172a',
      border: '#d7e0ea',
      dangerText: '#b42318',
    },
    radii: { sm: 14 },
    spacing: { xs: 6, sm: 10, md: 14, lg: 18 },
    fontFamily: 'Manrope_400Regular',
  },
}));

import MemberSignInScreen from '../../../app/sign-in';

describe('MemberSignInScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email and password input fields', () => {
    render(<MemberSignInScreen />);

    expect(screen.getByPlaceholderText('memberAuth.emailPlaceholder')).toBeTruthy();
    expect(screen.getByPlaceholderText('memberAuth.passwordPlaceholder')).toBeTruthy();
  });

  it('renders the sign-in button with correct i18n key', () => {
    render(<MemberSignInScreen />);
    expect(screen.getByRole('button', { name: 'memberAuth.signIn' })).toBeTruthy();
  });

  it('navigates to root on successful sign-in', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: null });

    render(<MemberSignInScreen />);

    fireEvent.change(screen.getByPlaceholderText('memberAuth.emailPlaceholder'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('memberAuth.passwordPlaceholder'), {
      target: { value: 'secret123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'memberAuth.signIn' }));

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'secret123',
      });
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
  });

  it('shows invalid credentials error on 400 response', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      error: { message: 'Invalid login credentials', status: 400 },
    });

    render(<MemberSignInScreen />);

    fireEvent.click(screen.getByRole('button', { name: 'memberAuth.signIn' }));

    await waitFor(() => {
      expect(screen.getByText('memberAuth.error.invalidCredentials')).toBeTruthy();
    });
  });

  it('shows generic error on server failure', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      error: { message: 'Network request failed', status: 500 },
    });

    render(<MemberSignInScreen />);

    fireEvent.click(screen.getByRole('button', { name: 'memberAuth.signIn' }));

    await waitFor(() => {
      expect(screen.getByText('memberAuth.error.generic')).toBeTruthy();
    });
  });

  it('shows invalid credentials error when message contains "invalid"', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      error: { message: 'Invalid credentials provided', status: 401 },
    });

    render(<MemberSignInScreen />);

    fireEvent.click(screen.getByRole('button', { name: 'memberAuth.signIn' }));

    await waitFor(() => {
      expect(screen.getByText('memberAuth.error.invalidCredentials')).toBeTruthy();
    });
  });
});
