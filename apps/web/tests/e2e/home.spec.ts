import { expect, test } from '@playwright/test';

test('renders the home page', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'The workspace is ready.' }),
  ).toBeVisible();

  const pageExceedsViewport = await page.evaluate(
    () => document.documentElement.scrollHeight > window.innerHeight,
  );
  expect(pageExceedsViewport).toBe(true);

  const menu = page.getByRole('complementary', { name: 'Application menu' });
  const initialMenuPosition = await menu.boundingBox();
  await page.evaluate(() => window.scrollTo(0, 500));
  const scrolledMenuPosition = await menu.boundingBox();

  expect(initialMenuPosition?.y).toBe(0);
  expect(scrolledMenuPosition?.y).toBe(0);
});

test('restores the menu preference after returning', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Toggle application menu' }).click();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('hektor-menu-state')))
    .toBe('expanded');

  await page
    .getByRole('button', { name: 'Collapse application menu to icons' })
    .click();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('hektor-menu-state')))
    .toBe('icons');

  await page.getByRole('button', { name: 'Toggle application menu' }).click();

  await page.reload();
  await page.getByRole('button', { name: 'Toggle application menu' }).click();

  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('hektor-menu-state')))
    .toBe('hidden');
});
