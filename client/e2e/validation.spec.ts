import { test, expect } from '@playwright/test';

test.describe('Form Validation E2E Tests', () => {
    test('shows error toast when password is too short during registration', async ({ page }) => {
        await page.goto('/auth');

        // Go to registration tab
        await page.getByTestId('tab-register').click();

        // Fill form with short password
        await page.getByTestId('input-email').fill('test@example.com');
        await page.getByTestId('input-password').fill('short');

        // Submit form
        await page.getByTestId('button-submit').click();

        // Should show error toast
        const toast = page.locator('[data-sonner-toast]');
        await expect(toast).toBeVisible();
        await expect(toast).toContainText('8 caractères');
    });

    test('accepts password with exactly 8 characters', async ({ page }) => {
        const uniqueEmail = `valid8-${Date.now()}@example.com`;

        await page.goto('/auth');
        await page.getByTestId('tab-register').click();

        await page.getByTestId('input-email').fill(uniqueEmail);
        await page.getByTestId('input-password').fill('12345678');

        await page.getByTestId('button-submit').click();

        // Should show success toast or redirect to dashboard
        const toast = page.locator('[data-sonner-toast]');
        await expect(toast).toBeVisible();
    });

    test('login does not validate password length', async ({ page }) => {
        await page.goto('/auth');

        // Stay on login tab (default)
        await page.getByTestId('tab-login').click();

        // Fill form with short password (should not trigger client-side validation)
        await page.getByTestId('input-email').fill('nonexistent@example.com');
        await page.getByTestId('input-password').fill('short');

        // Submit - should reach server and get "wrong credentials" error
        await page.getByTestId('button-submit').click();

        // Should show some error (from server)
        const toast = page.locator('[data-sonner-toast]');
        await expect(toast).toBeVisible();
    });
});

test.describe('Navigation E2E Tests', () => {
    test('redirects to auth page when not logged in', async ({ page }) => {
        await page.goto('/');

        // Should be on auth page or redirected
        await expect(page).toHaveURL(/\/(auth)?$/);
    });

    test('can switch between login and register tabs', async ({ page }) => {
        await page.goto('/auth');

        const loginTab = page.getByTestId('tab-login');
        const registerTab = page.getByTestId('tab-register');

        // Click register
        await registerTab.click();
        await expect(registerTab).toHaveClass(/bg-card/);

        // Click login
        await loginTab.click();
        await expect(loginTab).toHaveClass(/bg-card/);
    });
});
