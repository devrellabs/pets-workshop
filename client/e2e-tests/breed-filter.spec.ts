import { test, expect } from '@playwright/test';

test.describe('Breed Filter Integration', () => {
  test('should display breed filter component', async ({ page }) => {
    // Mock breeds API
    await page.route('/api/breeds', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          'Golden Retriever',
          'Labrador Retriever',
          'German Shepherd',
          'Beagle'
        ])
      });
    });

    // Mock dogs API - all dogs
    await page.route('/api/dogs', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'Buddy', breed: 'Golden Retriever' },
          { id: 2, name: 'Max', breed: 'Labrador Retriever' },
          { id: 3, name: 'Luna', breed: 'German Shepherd' }
        ])
      });
    });

    await page.goto('/');
    
    // Check that breed filter is displayed
    await expect(page.getByText('Filter by Breed')).toBeVisible();
    await expect(page.getByText('Select breeds...')).toBeVisible();
  });

  test('should filter dogs by selected breed', async ({ page }) => {
    // Track API calls
    let lastRequestUrl = '';

    // Mock breeds API
    await page.route('/api/breeds', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          'Golden Retriever',
          'Labrador Retriever',
          'German Shepherd'
        ])
      });
    });

    // Mock dogs API with dynamic filtering
    await page.route('/api/dogs*', route => {
      lastRequestUrl = route.request().url();
      const url = new URL(route.request().url());
      const breeds = url.searchParams.get('breeds');
      
      let dogs = [
        { id: 1, name: 'Buddy', breed: 'Golden Retriever' },
        { id: 2, name: 'Max', breed: 'Labrador Retriever' },
        { id: 3, name: 'Luna', breed: 'German Shepherd' }
      ];

      if (breeds) {
        const selectedBreeds = breeds.split(',');
        dogs = dogs.filter(dog => selectedBreeds.includes(dog.breed));
      }

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(dogs)
      });
    });

    await page.goto('/');
    
    // Wait for initial load
    await expect(page.getByText('Buddy')).toBeVisible();
    await expect(page.getByText('Max')).toBeVisible();
    await expect(page.getByText('Luna')).toBeVisible();

    // Open breed filter dropdown
    await page.getByText('Select breeds...').click();
    
    // Wait for dropdown to be visible
    await expect(page.getByText('Golden Retriever').nth(1)).toBeVisible();
    
    // Select "Golden Retriever"
    await page.getByText('Golden Retriever').nth(1).click();
    
    // Wait for filtered results
    await page.waitForTimeout(500); // Wait for debounce
    
    // Check that only Golden Retriever is shown
    await expect(page.getByText('Buddy')).toBeVisible();
    await expect(page.getByText('Max')).not.toBeVisible();
    await expect(page.getByText('Luna')).not.toBeVisible();
    
    // Verify API was called with breed parameter
    expect(lastRequestUrl).toContain('breeds=Golden%20Retriever');
  });

  test('should filter dogs by multiple breeds', async ({ page }) => {
    // Mock breeds API
    await page.route('/api/breeds', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          'Golden Retriever',
          'Labrador Retriever',
          'German Shepherd'
        ])
      });
    });

    // Mock dogs API with dynamic filtering
    await page.route('/api/dogs*', route => {
      const url = new URL(route.request().url());
      const breeds = url.searchParams.get('breeds');
      
      let dogs = [
        { id: 1, name: 'Buddy', breed: 'Golden Retriever' },
        { id: 2, name: 'Max', breed: 'Labrador Retriever' },
        { id: 3, name: 'Luna', breed: 'German Shepherd' }
      ];

      if (breeds) {
        const selectedBreeds = breeds.split(',');
        dogs = dogs.filter(dog => selectedBreeds.includes(dog.breed));
      }

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(dogs)
      });
    });

    await page.goto('/');
    
    // Wait for initial load
    await expect(page.getByText('Buddy')).toBeVisible();

    // Open breed filter dropdown
    await page.getByText('Select breeds...').click();
    
    // Select "Golden Retriever"
    await page.getByText('Golden Retriever').nth(1).click();
    
    // Select "Labrador Retriever"
    await page.getByText('Labrador Retriever').nth(1).click();
    
    // Wait for filtered results
    await page.waitForTimeout(500);
    
    // Check that both Golden and Labrador are shown
    await expect(page.getByText('Buddy')).toBeVisible();
    await expect(page.getByText('Max')).toBeVisible();
    await expect(page.getByText('Luna')).not.toBeVisible();
  });

  test('should show empty state when no dogs match filter', async ({ page }) => {
    // Mock breeds API
    await page.route('/api/breeds', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          'Golden Retriever',
          'Beagle'
        ])
      });
    });

    // Mock dogs API - Beagle has no dogs
    await page.route('/api/dogs*', route => {
      const url = new URL(route.request().url());
      const breeds = url.searchParams.get('breeds');
      
      let dogs = [
        { id: 1, name: 'Buddy', breed: 'Golden Retriever' }
      ];

      if (breeds && breeds.includes('Beagle')) {
        dogs = [];
      } else if (breeds) {
        const selectedBreeds = breeds.split(',');
        dogs = dogs.filter(dog => selectedBreeds.includes(dog.breed));
      }

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(dogs)
      });
    });

    await page.goto('/');
    
    // Wait for initial load
    await expect(page.getByText('Buddy')).toBeVisible();

    // Open breed filter dropdown
    await page.getByText('Select breeds...').click();
    
    // Select "Beagle" (no dogs)
    await page.getByText('Beagle').nth(1).click();
    
    // Wait for filtered results
    await page.waitForTimeout(500);
    
    // Check empty state message
    await expect(page.getByText('No dogs found matching the selected breeds.')).toBeVisible();
    await expect(page.getByText('Try selecting different breeds or clearing the filters.')).toBeVisible();
  });

  test('should clear filters', async ({ page }) => {
    // Mock breeds API
    await page.route('/api/breeds', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          'Golden Retriever',
          'Labrador Retriever'
        ])
      });
    });

    // Mock dogs API with dynamic filtering
    await page.route('/api/dogs*', route => {
      const url = new URL(route.request().url());
      const breeds = url.searchParams.get('breeds');
      
      let dogs = [
        { id: 1, name: 'Buddy', breed: 'Golden Retriever' },
        { id: 2, name: 'Max', breed: 'Labrador Retriever' }
      ];

      if (breeds) {
        const selectedBreeds = breeds.split(',');
        dogs = dogs.filter(dog => selectedBreeds.includes(dog.breed));
      }

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(dogs)
      });
    });

    await page.goto('/');
    
    // Wait for initial load
    await expect(page.getByText('Buddy')).toBeVisible();

    // Open breed filter dropdown
    await page.getByText('Select breeds...').click();
    
    // Select "Golden Retriever"
    await page.getByText('Golden Retriever').nth(1).click();
    
    // Wait for filtered results
    await page.waitForTimeout(500);
    
    // Verify filter is applied
    await expect(page.getByText(/Clear filters \(1\)/)).toBeVisible();

    // Clear filters
    await page.getByText(/Clear filters/).click();
    
    // Wait for results to refresh
    await page.waitForTimeout(500);
    
    // Check that all dogs are shown again
    await expect(page.getByText('Buddy')).toBeVisible();
    await expect(page.getByText('Max')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock breeds API with error
    await page.route('/api/breeds', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    // Mock dogs API
    await page.route('/api/dogs', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'Buddy', breed: 'Golden Retriever' }
        ])
      });
    });

    await page.goto('/');
    
    // Check that error is displayed for breeds
    await expect(page.getByText(/Failed to fetch breeds/)).toBeVisible();
    
    // Dogs should still load
    await expect(page.getByText('Buddy')).toBeVisible();
  });
});
