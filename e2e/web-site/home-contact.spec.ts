import { test, expect } from '@playwright/test';

test.describe('Public website core', () => {
  test('locale home loads', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('body')).toBeVisible();
  });

  test('contact page loads', async ({ page }) => {
    await page.goto('/en/contact');
    await expect(page.locator('body')).toBeVisible();
  });
});
