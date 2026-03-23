import { describe, it, expect } from 'vitest';
import { contactLeadRequestSchema } from './contact';

describe('contactLeadRequestSchema', () => {
  it('accepts minimal valid payload', () => {
    const r = contactLeadRequestSchema.safeParse({
      name: 'Ada',
      email: 'ada@example.com',
      message: 'Hello',
      locale: 'en',
    });
    expect(r.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const r = contactLeadRequestSchema.safeParse({
      name: 'Ada',
      email: 'not-an-email',
      locale: 'en',
    });
    expect(r.success).toBe(false);
  });
});
