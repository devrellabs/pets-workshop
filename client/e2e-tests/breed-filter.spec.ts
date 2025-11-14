import { test, expect } from '@playwright/test';

test.describe('Breed Filter Component', () => {
  test('should display breed filter button', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForSelector('[id="breed-filter-button"]', { timeout: 10000 });
    
    // Check that the filter button is visible
    const filterButton = page.locator('[id="breed-filter-button"]');
    await expect(filterButton).toBeVisible();
    await expect(filterButton).toContainText('Select breeds...');
  });

  test('should open dropdown when filter button is clicked', async ({ page }) => {
    await page.goto('/');
    
    // Wait for and click the filter button
    const filterButton = page.locator('[id="breed-filter-button"]');
    await filterButton.waitFor({ state: 'visible' });
    await filterButton.click();
    
    // Check that dropdown panel is visible
    const dropdownPanel = page.locator('.dropdown-panel');
    await expect(dropdownPanel).toBeVisible();
    
    // Check for search input
    const searchInput = page.locator('.search-input');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', 'Search breeds...');
  });

  test('should display breeds in the dropdown', async ({ page }) => {
    await page.goto('/');
    
    // Open dropdown
    const filterButton = page.locator('[id="breed-filter-button"]');
    await filterButton.click();
    
    // Wait for breeds to load
    await page.waitForSelector('.breed-item', { timeout: 10000 });
    
    // Check that breed items are displayed
    const breedItems = page.locator('.breed-item');
    const count = await breedItems.count();
    expect(count).toBeGreaterThan(0);
    
    // Check for edge case breeds
    await expect(page.locator('text=Mixed Breed')).toBeVisible();
    await expect(page.locator('text=Unknown')).toBeVisible();
  });

  test('should allow selecting and deselecting breeds', async ({ page }) => {
    await page.goto('/');
    
    // Open dropdown
    await page.locator('[id="breed-filter-button"]').click();
    
    // Wait for breeds to load
    await page.waitForSelector('.breed-item', { timeout: 10000 });
    
    // Select first breed
    const firstBreedItem = page.locator('.breed-item').first();
    const firstBreedName = await firstBreedItem.locator('.breed-name').textContent();
    await firstBreedItem.click();
    
    // Check that checkbox is checked
    const checkbox = firstBreedItem.locator('.breed-checkbox');
    await expect(checkbox).toBeChecked();
    
    // Check that button text updates
    const filterButton = page.locator('[id="breed-filter-button"]');
    await expect(filterButton).toContainText(firstBreedName || '');
    
    // Deselect the breed
    await firstBreedItem.click();
    await expect(checkbox).not.toBeChecked();
    await expect(filterButton).toContainText('Select breeds...');
  });

  test('should filter breeds using search input', async ({ page }) => {
    await page.goto('/');
    
    // Open dropdown
    await page.locator('[id="breed-filter-button"]').click();
    await page.waitForSelector('.breed-item', { timeout: 10000 });
    
    // Get initial count
    const initialCount = await page.locator('.breed-item').count();
    
    // Type in search
    const searchInput = page.locator('.search-input');
    await searchInput.fill('Labrador');
    
    // Wait a moment for filtering
    await page.waitForTimeout(300);
    
    // Check that results are filtered
    const filteredCount = await page.locator('.breed-item').count();
    expect(filteredCount).toBeLessThan(initialCount);
    
    // Check that visible breed contains search term
    const visibleBreed = await page.locator('.breed-item').first().locator('.breed-name').textContent();
    expect(visibleBreed?.toLowerCase()).toContain('labrador');
  });

  test('should show empty state when no breeds match search', async ({ page }) => {
    await page.goto('/');
    
    // Open dropdown
    await page.locator('[id="breed-filter-button"]').click();
    await page.waitForSelector('.breed-item', { timeout: 10000 });
    
    // Type in search that won't match
    const searchInput = page.locator('.search-input');
    await searchInput.fill('NonexistentBreed12345');
    
    // Wait for empty message
    const emptyMessage = page.locator('.empty-message');
    await expect(emptyMessage).toBeVisible();
    await expect(emptyMessage).toContainText('No breeds found matching');
  });

  test('should show clear all button when breeds are selected', async ({ page }) => {
    await page.goto('/');
    
    // Open dropdown
    await page.locator('[id="breed-filter-button"]').click();
    await page.waitForSelector('.breed-item', { timeout: 10000 });
    
    // Select first breed
    await page.locator('.breed-item').first().click();
    
    // Check that clear all button appears
    const clearAllButton = page.locator('.clear-all-button');
    await expect(clearAllButton).toBeVisible();
    
    // Click clear all
    await clearAllButton.click();
    
    // Check that button text resets
    const filterButton = page.locator('[id="breed-filter-button"]');
    await expect(filterButton).toContainText('Select breeds...');
  });

  test('should close dropdown when clicking outside', async ({ page }) => {
    await page.goto('/');
    
    // Open dropdown
    await page.locator('[id="breed-filter-button"]').click();
    const dropdownPanel = page.locator('.dropdown-panel');
    await expect(dropdownPanel).toBeVisible();
    
    // Click outside
    await page.locator('h1').click();
    
    // Check that dropdown is closed
    await expect(dropdownPanel).not.toBeVisible();
  });

  test('should close dropdown when pressing Escape', async ({ page }) => {
    await page.goto('/');
    
    // Open dropdown
    await page.locator('[id="breed-filter-button"]').click();
    const dropdownPanel = page.locator('.dropdown-panel');
    await expect(dropdownPanel).toBeVisible();
    
    // Press Escape
    await page.keyboard.press('Escape');
    
    // Check that dropdown is closed
    await expect(dropdownPanel).not.toBeVisible();
  });

  test('should filter dogs when breeds are selected', async ({ page }) => {
    await page.goto('/');
    
    // Wait for dogs to load
    await page.waitForSelector('.grid', { timeout: 10000 });
    
    // Get initial dog count
    const initialDogCards = await page.locator('a[href^="/dog/"]').count();
    
    // Open dropdown and select a specific breed
    await page.locator('[id="breed-filter-button"]').click();
    await page.waitForSelector('.breed-item', { timeout: 10000 });
    
    // Select first non-edge-case breed
    const firstBreedItem = page.locator('.breed-item').first();
    await firstBreedItem.click();
    
    // Close dropdown by clicking outside
    await page.locator('h1').click();
    
    // Wait a moment for filtering
    await page.waitForTimeout(500);
    
    // Get filtered dog count
    const filteredDogCards = await page.locator('a[href^="/dog/"]').count();
    
    // Count should be less than or equal to initial (depending on how many dogs have that breed)
    expect(filteredDogCards).toBeLessThanOrEqual(initialDogCards);
  });

  test('should be keyboard accessible', async ({ page }) => {
    await page.goto('/');
    
    // Tab to the filter button
    await page.keyboard.press('Tab'); // Skip to first interactive element
    
    // Find and focus the filter button
    const filterButton = page.locator('[id="breed-filter-button"]');
    await filterButton.focus();
    
    // Press Enter to open
    await page.keyboard.press('Enter');
    
    // Check that dropdown is open
    const dropdownPanel = page.locator('.dropdown-panel');
    await expect(dropdownPanel).toBeVisible();
    
    // Press Escape to close
    await page.keyboard.press('Escape');
    await expect(dropdownPanel).not.toBeVisible();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    
    // Check filter button ARIA attributes
    const filterButton = page.locator('[id="breed-filter-button"]');
    await expect(filterButton).toHaveAttribute('aria-haspopup', 'listbox');
    await expect(filterButton).toHaveAttribute('aria-label', 'Select dog breeds to filter');
    
    // Open dropdown
    await filterButton.click();
    await expect(filterButton).toHaveAttribute('aria-expanded', 'true');
    
    // Check dropdown ARIA attributes
    const dropdownPanel = page.locator('.dropdown-panel');
    await expect(dropdownPanel).toHaveAttribute('role', 'listbox');
    await expect(dropdownPanel).toHaveAttribute('aria-label', 'Breed selection');
    
    // Check search input
    const searchInput = page.locator('.search-input');
    await expect(searchInput).toHaveAttribute('aria-label', 'Search for breeds');
  });
});
