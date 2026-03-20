import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
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
        thanks: 'Thanks for reaching out',
      },
    },
  },
};

describe('LeadCaptureForm', () => {
  it('shows thanks after submit', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <LeadCaptureForm />
      </NextIntlClientProvider>
    );

    fireEvent.change(screen.getByLabelText(/^Name$/), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/^Email$/), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    expect(screen.getByText(/thanks for reaching out/i)).toBeInTheDocument();
  });
});
