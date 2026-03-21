import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// next-intl hooks
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

// next/navigation router
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

import { SignInForm } from './SignInForm';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('SignInForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email input, password input, and submit button', () => {
    render(<SignInForm />);

    expect(screen.getByTestId('sign-in-email')).toBeTruthy();
    expect(screen.getByTestId('sign-in-password')).toBeTruthy();
    expect(screen.getByTestId('sign-in-submit')).toBeTruthy();
  });

  it('submits credentials to /api/v1/auth/sign-in and redirects on success', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ ok: true }),
    });

    render(<SignInForm />);

    fireEvent.change(screen.getByTestId('sign-in-email'), {
      target: { value: 'admin@example.com' },
    });
    fireEvent.change(screen.getByTestId('sign-in-password'), {
      target: { value: 'secret123' },
    });
    fireEvent.click(screen.getByTestId('sign-in-submit'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/auth/sign-in',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'admin@example.com', password: 'secret123' }),
        })
      );
      expect(mockReplace).toHaveBeenCalledWith('/en');
    });
  });

  it('shows error message when server returns invalid_credentials', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ ok: false, error: 'invalid_credentials' }),
    });

    render(<SignInForm />);

    fireEvent.change(screen.getByTestId('sign-in-email'), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByTestId('sign-in-password'), {
      target: { value: 'badpassword' },
    });
    fireEvent.click(screen.getByTestId('sign-in-submit'));

    await waitFor(() => {
      expect(screen.getByTestId('sign-in-error')).toBeTruthy();
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('shows error message when server returns unauthorized_role', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ ok: false, error: 'unauthorized_role' }),
    });

    render(<SignInForm />);

    fireEvent.change(screen.getByTestId('sign-in-email'), {
      target: { value: 'gymmember@example.com' },
    });
    fireEvent.change(screen.getByTestId('sign-in-password'), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByTestId('sign-in-submit'));

    await waitFor(() => {
      expect(screen.getByTestId('sign-in-error')).toBeTruthy();
    });
  });

  it('shows generic error when fetch throws', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<SignInForm />);

    fireEvent.change(screen.getByTestId('sign-in-email'), {
      target: { value: 'admin@example.com' },
    });
    fireEvent.change(screen.getByTestId('sign-in-password'), {
      target: { value: 'secret' },
    });
    fireEvent.click(screen.getByTestId('sign-in-submit'));

    await waitFor(() => {
      expect(screen.getByTestId('sign-in-error')).toBeTruthy();
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
