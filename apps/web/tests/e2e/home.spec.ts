import { expect, test } from '@playwright/test';

test('redirects an unauthenticated visitor to Google login', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page).toHaveURL('/login');
  await expect(
    page.getByRole('heading', { name: 'Welcome back.' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Continue with Google' }),
  ).toHaveAttribute('href', '/auth/google?next=%2F');
});
