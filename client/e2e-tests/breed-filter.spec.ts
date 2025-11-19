import { test, expect } from '@playwright/test';

test.describe('Breed Filter Component', () => {
  test('should display breed filter dropdown', async ({ page }) => {
    await page.goto('/');
    
    // Check that the breed filter button is visible
    await expect(page.getByRole('button', { name: 'Toggle breed filter dropdown' })).toBeVisible();
    
    // Check default text
    await expect(page.getByText('Select breeds...')).toBeVisible();
  });

  test('should open dropdown when clicked', async ({ page }) => {
    await page.goto('/');
    
    // Click the breed filter button
    await page.getByRole('button', { name: 'Toggle breed filter dropdown' }).click();
    
    // Check that dropdown is open with search box
    await expect(page.getByPlaceholder('Search breeds...')).toBeVisible();
    
    // Check that breed options are visible
    await expect(page.getByRole('option', { name: 'Golden Retriever' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Labrador Retriever' })).toBeVisible();
  });

  test('should display all breeds in alphabetical order', async ({ page }) => {
    await page.goto('/');
    
    // Open dropdown
    await page.getByRole('button', { name: 'Toggle breed filter dropdown' }).click();
    
    // Get all options
    const options = await page.getByRole('option').allTextContents();
    
    // Check that breeds are in alphabetical order (first few)
    expect(options[0]).toBe('American Staffordshire Terrier');
    expect(options[1]).toBe('Australian Shepherd');
    expect(options[2]).toBe('Beagle');
    
    // Check for Mixed Breed and Unknown at the end
    expect(options).toContain('Mixed Breed');
    expect(options).toContain('Unknown');
  });

  test('should filter dogs when a breed is selected', async ({ page }) => {
    await page.goto('/');
    
    // Wait for dogs to load
    await page.waitForSelector('.grid', { timeout: 10000 });
    
    // Open dropdown
    await page.getByRole('button', { name: 'Toggle breed filter dropdown' }).click();
    
    // Select French Bulldog
    await page.getByRole('option', { name: 'French Bulldog' }).click();
    
    // Check that the button text updates
    await expect(page.getByText('1 breed selected')).toBeVisible();
    
    // Check that badge is displayed
    await expect(page.getByText('French Bulldog').first()).toBeVisible();
    
    // Check that only French Bulldogs are displayed in the list
    const dogCards = await page.locator('.grid a').all();
    for (const card of dogCards) {
      const breedText = await card.locator('p').first().textContent();
      expect(breedText).toBe('French Bulldog');
    }
  });

  test('should support multiple breed selection', async ({ page }) => {
    await page.goto('/');
    
    // Wait for dogs to load
    await page.waitForSelector('.grid', { timeout: 10000 });
    
    // Open dropdown
    await page.getByRole('button', { name: 'Toggle breed filter dropdown' }).click();
    
    // Select multiple breeds
    await page.getByRole('option', { name: 'Labrador Retriever' }).click();
    await page.getByRole('option', { name: 'Golden Retriever' }).click();
    
    // Check that the button text updates
    await expect(page.getByText('2 breeds selected')).toBeVisible();
    
    // Check that both badges are displayed
    const badges = await page.getByRole('list', { name: 'Selected breeds' }).getByRole('listitem').all();
    expect(badges.length).toBe(2);
    
    // Verify dogs shown are only from selected breeds
    const dogCards = await page.locator('.grid a').all();
    for (const card of dogCards) {
      const breedText = await card.locator('p').first().textContent();
      expect(['Labrador Retriever', 'Golden Retriever']).toContain(breedText || '');
    }
  });

  test('should allow removing breeds via badge', async ({ page }) => {
    await page.goto('/');
    
    // Wait for dogs to load
    await page.waitForSelector('.grid', { timeout: 10000 });
    
    // Open dropdown and select a breed
    await page.getByRole('button', { name: 'Toggle breed filter dropdown' }).click();
    await page.getByRole('option', { name: 'Beagle' }).click();
    
    // Verify breed is selected
    await expect(page.getByText('1 breed selected')).toBeVisible();
    
    // Remove the breed via badge
    await page.getByRole('button', { name: 'Remove Beagle filter' }).click();
    
    // Check that selection is cleared
    await expect(page.getByText('Select breeds...')).toBeVisible();
    
    // All dogs should be shown again (count should be higher)
    const dogCards = await page.locator('.grid a').all();
    expect(dogCards.length).toBeGreaterThan(3);
  });

  test('should clear all selections', async ({ page }) => {
    await page.goto('/');
    
    // Wait for dogs to load
    await page.waitForSelector('.grid', { timeout: 10000 });
    
    // Open dropdown and select multiple breeds
    await page.getByRole('button', { name: 'Toggle breed filter dropdown' }).click();
    await page.getByRole('option', { name: 'Poodle' }).click();
    await page.getByRole('option', { name: 'Boxer' }).click();
    
    // Verify breeds are selected
    await expect(page.getByText('2 breeds selected')).toBeVisible();
    
    // Click clear all
    await page.getByRole('button', { name: 'Clear all breed filters' }).click();
    
    // Check that all selections are cleared
    await expect(page.getByText('Select breeds...')).toBeVisible();
  });

  test('should search/filter breeds', async ({ page }) => {
    await page.goto('/');
    
    // Open dropdown
    await page.getByRole('button', { name: 'Toggle breed filter dropdown' }).click();
    
    // Type in search box
    await page.getByPlaceholder('Search breeds...').fill('retriever');
    
    // Check that only retriever breeds are shown
    await expect(page.getByRole('option', { name: 'Golden Retriever' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Labrador Retriever' })).toBeVisible();
    
    // Check that non-matching breeds are not shown
    await expect(page.getByRole('option', { name: 'Beagle' })).not.toBeVisible();
  });

  test('should handle empty search results', async ({ page }) => {
    await page.goto('/');
    
    // Open dropdown
    await page.getByRole('button', { name: 'Toggle breed filter dropdown' }).click();
    
    // Type search that matches nothing
    await page.getByPlaceholder('Search breeds...').fill('xyz123');
    
    // Check that no results message is shown
    await expect(page.getByText(/No breeds found matching/)).toBeVisible();
  });

  test('should show checkboxes with visual indication', async ({ page }) => {
    await page.goto('/');
    
    // Open dropdown
    await page.getByRole('button', { name: 'Toggle breed filter dropdown' }).click();
    
    // Select a breed
    await page.getByRole('option', { name: 'Siberian Husky' }).click();
    
    // Check that the option is marked as selected
    const siberianOption = page.getByRole('option', { name: 'Siberian Husky' });
    await expect(siberianOption).toHaveAttribute('aria-selected', 'true');
  });

  test('should be keyboard accessible', async ({ page }) => {
    await page.goto('/');
    
    // Focus on the breed filter button
    await page.getByRole('button', { name: 'Toggle breed filter dropdown' }).focus();
    
    // Open with Enter key
    await page.keyboard.press('Enter');
    
    // Check that dropdown opened
    await expect(page.getByPlaceholder('Search breeds...')).toBeVisible();
  });

  test('should handle loading state', async ({ page }) => {
    // Intercept breeds API to delay response
    await page.route('/api/breeds', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
    
    await page.goto('/');
    
    // Open dropdown
    await page.getByRole('button', { name: 'Toggle breed filter dropdown' }).click();
    
    // Check for loading state
    await expect(page.getByText('Loading breeds...')).toBeVisible();
    
    // Wait for breeds to load
    await expect(page.getByRole('option', { name: 'Golden Retriever' })).toBeVisible({ timeout: 5000 });
  });

  test('should handle API error gracefully', async ({ page }) => {
    // Intercept breeds API to return error
    await page.route('/api/breeds', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    await page.goto('/');
    
    // Open dropdown
    await page.getByRole('button', { name: 'Toggle breed filter dropdown' }).click();
    
    // Check that error message is displayed
    await expect(page.getByText(/Failed to fetch breeds/)).toBeVisible();
  });
});
