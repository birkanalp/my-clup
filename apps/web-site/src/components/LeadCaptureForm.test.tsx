import { describe, expect, it, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { LeadCaptureForm } from './LeadCaptureForm';

const messages = {
  common: {
    publicSite: {
      lead: {
        name: 'Name',
        email: 'Email',
        message: 'Message',
        submit: 'Send message',
        submitting: 'Sending…',
        thanks: 'Thanks for reaching out',
        errorSubmit: 'Could not send',
      },
    },
  },
};

describe('LeadCaptureForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('shows thanks after successful submit', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, id: '00000000-0000-4000-8000-000000000001' }),
    }) as unknown as typeof fetch;

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <LeadCaptureForm />
      </NextIntlClientProvider>,
    );

    fireEvent.change(screen.getByLabelText(/^Name$/), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/^Email$/), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByText(/thanks for reaching out/i)).toBeInTheDocument();
    });
  });
});
