import { test, expect } from '@playwright/test';

test.describe('Platform admin auth surface', () => {
  test('sign-in page loads', async ({ page }) => {
    await page.goto('/en/sign-in');
    await expect(page.locator('body')).toBeVisible();
  });
});
