import { test, expect } from '@playwright/test';

// Use describe.serial so tests run in order (registration before login)
test.describe.serial('Authentication End-to-End Tests', () => {
    // Unique email to avoid conflicts during multiple test runs
    const uniqueEmail = `testuser-${Date.now()}@example.com`;
    const password = 'securePassword123!';

    test('displays localhost:5173 and clicks the Signup button without relying on text', async ({ page }) => {
        await page.goto('/');

        // Check that the registration tab is present (via its immutable data-testid, not the text "Inscription")
        const registerTab = page.getByTestId('tab-register');
        await expect(registerTab).toBeVisible();

        // Click on it
        await registerTab.click();

        // The registration tab should be selected
        // We can verify that the submit button is visible
        const submitBtn = page.getByTestId('button-submit');
        await expect(submitBtn).toBeVisible();
    });

    test('fills the registration form, submits it, and verifies the success toast', async ({ page }) => {
        await page.goto('/auth');

        // Go to the registration tab
        await page.getByTestId('tab-register').click();

        // Fill the form with test attributes
        await page.getByTestId('input-email').fill(uniqueEmail);
        await page.getByTestId('input-password').fill(password);

        // Submit the form
        await page.getByTestId('button-submit').click();

        // Verify that the notification toast is displayed. 
        // Sonner uses the data-sonner-toast attribute or Toaster class by default
        const toast = page.locator('[data-sonner-toast]');
        await expect(toast).toBeVisible();
    });

    test('logs into the created account and verifies the Dashboard is displayed', async ({ page }) => {
        await page.goto('/auth');

        // Go to the login tab (selected by default but forced just in case)
        await page.getByTestId('tab-login').click();

        // Fill with the credentials created in the previous test
        await page.getByTestId('input-email').fill(uniqueEmail);
        await page.getByTestId('input-password').fill(password);

        // Submit the login
        await page.getByTestId('button-submit').click();

        // Verify that the Dashboard is displayed thanks to the immutable tag added on the title
        const dashboardTitle = page.getByTestId('dashboard-title');
        await expect(dashboardTitle).toBeVisible();
    });
});
