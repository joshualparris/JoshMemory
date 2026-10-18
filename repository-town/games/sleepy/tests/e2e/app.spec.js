const { test, expect } = require('@playwright/test');

test('bedtime library loads correctly', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/Sylvie's Sleepy Stories/i).first()).toBeVisible();
});
