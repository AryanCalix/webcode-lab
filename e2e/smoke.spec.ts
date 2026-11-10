import { expect, test } from '@playwright/test';

test('halaman login menampilkan judul aplikasi', async ({ page }) => {
  await page.goto('/login');

  await expect(page).toHaveTitle(/WebCode Lab/);
  await expect(page.getByRole('heading', { name: 'WebCode Lab', exact: true })).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
});

test('demo mahasiswa dapat membuka modul belajar', async ({ page }) => {
  await page.goto('/login');

  await page.getByRole('button', { name: 'Mahasiswa', exact: true }).click();
  await page.getByRole('button', { name: 'Masuk', exact: true }).click();

  await expect(page.getByRole('heading', { name: /Halo,/ })).toBeVisible({ timeout: 30_000 });

  await page.getByRole('link', { name: 'Modul' }).first().click();
  await expect(page.getByRole('heading', { name: 'Modul Belajar' })).toBeVisible({ timeout: 30_000 });

  const firstModuleLink = page.locator('main a[href^="/student/modules/"]').first();
  await firstModuleLink.click();
  await expect(page.getByText('Daftar materi')).toBeVisible({ timeout: 30_000 });

  await expect(page.getByText('Bahasa JavaScript').first()).toBeVisible({ timeout: 30_000 });
});
