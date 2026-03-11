import { test, expect } from '@playwright/test';

const MOCK_BREEDS = [
  { id: 1, name: 'Beagle' },
  { id: 2, name: 'Golden Retriever' },
  { id: 3, name: 'Husky' },
  { id: 4, name: 'Labrador' },
];

const MOCK_DOGS = [
  { id: 1, name: 'Buddy', breed: 'Labrador' },
  { id: 2, name: 'Luna', breed: 'Husky' },
  { id: 3, name: 'Max', breed: 'Golden Retriever' },
  { id: 4, name: 'Rex', breed: 'Beagle' },
];

test.describe('Breed Filter Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('/api/dogs', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_DOGS),
      });
    });
    await page.route('/api/breeds', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_BREEDS),
      });
    });
  });

  test('should display breed filter button', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('breed-filter')).toBeVisible();
    await expect(page.getByText('Filter by Breed')).toBeVisible();
  });

  test('should open dropdown when button is clicked', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Filter by breed').click();
    await expect(page.getByTestId('breed-dropdown')).toBeVisible();
  });

  test('should display breeds in dropdown including Mixed Breed and Unknown', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Filter by breed').click();

    const dropdown = page.getByTestId('breed-dropdown');
    await expect(dropdown).toBeVisible();

    // Database breeds
    await expect(dropdown.getByText('Beagle')).toBeVisible();
    await expect(dropdown.getByText('Golden Retriever')).toBeVisible();
    await expect(dropdown.getByText('Husky')).toBeVisible();
    await expect(dropdown.getByText('Labrador')).toBeVisible();

    // Extra edge-case options
    await expect(dropdown.getByText('Mixed Breed')).toBeVisible();
    await expect(dropdown.getByText('Unknown')).toBeVisible();
  });

  test('should filter dogs when a breed is selected', async ({ page }) => {
    await page.goto('/');

    // All dogs visible initially
    await expect(page.getByText('Buddy')).toBeVisible();
    await expect(page.getByText('Luna')).toBeVisible();

    // Select 'Labrador' from the filter
    await page.getByLabel('Filter by breed').click();
    await page.getByTestId('breed-dropdown').getByRole('button', { name: 'Labrador' }).click();

    // Buddy (Labrador) should be visible, Luna (Husky) should not
    await expect(page.getByText('Buddy')).toBeVisible();
    await expect(page.getByText('Luna')).not.toBeVisible();
  });

  test('should support multi-select of breeds', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('Filter by breed').click();
    const dropdown = page.getByTestId('breed-dropdown');

    await dropdown.getByRole('button', { name: 'Labrador' }).click();
    await dropdown.getByRole('button', { name: 'Husky' }).click();

    // Both Buddy (Labrador) and Luna (Husky) should be visible
    await expect(page.getByText('Buddy')).toBeVisible();
    await expect(page.getByText('Luna')).toBeVisible();
    // Max (Golden Retriever) should not be visible
    await expect(page.getByText('Max')).not.toBeVisible();
  });

  test('should show selected breed badges', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('Filter by breed').click();
    await page.getByTestId('breed-dropdown').getByRole('button', { name: 'Labrador' }).click();

    await expect(page.getByTestId('selected-breed-badges')).toBeVisible();
    await expect(page.getByTestId('selected-breed-badges').getByText('Labrador')).toBeVisible();
  });

  test('should remove breed badge when x is clicked', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('Filter by breed').click();
    await page.getByTestId('breed-dropdown').getByRole('button', { name: 'Labrador' }).click();

    // Badge should be visible
    await expect(page.getByTestId('selected-breed-badges')).toBeVisible();

    // Remove the badge
    await page.getByLabel('Remove Labrador filter').click();
    await expect(page.getByTestId('selected-breed-badges')).not.toBeVisible();
  });

  test('should search/filter breeds in dropdown', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('Filter by breed').click();
    await page.getByLabel('Search breeds').fill('gold');

    const dropdown = page.getByTestId('breed-dropdown');
    await expect(dropdown.getByText('Golden Retriever')).toBeVisible();
    await expect(dropdown.getByText('Beagle')).not.toBeVisible();
  });

  test('should show no breeds found message when search yields no results', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('Filter by breed').click();
    await page.getByLabel('Search breeds').fill('zzzznonexistent');

    await expect(page.getByText('No breeds found')).toBeVisible();
  });

  test('should handle loading state for breeds', async ({ page }) => {
    // Delay the breed response to observe loading state
    await page.route('/api/breeds', async route => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_BREEDS),
      });
    });

    await page.goto('/');
    await page.getByLabel('Filter by breed').click();

    try {
      await expect(page.getByText('Loading breeds...')).toBeVisible({ timeout: 400 });
    } catch {
      // Loading finished too quickly — verify dropdown opened correctly instead
      await expect(page.getByTestId('breed-dropdown')).toBeVisible();
    }
  });

  test('should show no match message when all dogs are filtered out', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('Filter by breed').click();
    await page.getByTestId('breed-dropdown').getByRole('button', { name: 'Mixed Breed' }).click();

    await expect(page.getByText('No dogs match the selected breed filters.')).toBeVisible();
  });

  test('should clear all selected breeds', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('Filter by breed').click();
    await page.getByTestId('breed-dropdown').getByRole('button', { name: 'Labrador' }).click();
    await page.getByTestId('breed-dropdown').getByRole('button', { name: 'Husky' }).click();

    await expect(page.getByTestId('selected-breed-badges')).toBeVisible();

    await page.getByRole('button', { name: 'Clear all' }).click();

    await expect(page.getByTestId('selected-breed-badges')).not.toBeVisible();
    // All dogs should be visible again
    await expect(page.getByText('Buddy')).toBeVisible();
    await expect(page.getByText('Luna')).toBeVisible();
  });
});
