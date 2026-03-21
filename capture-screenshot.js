const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set viewport to 1200x630 (Open Graph dimensions)
  await page.setViewportSize({ width: 1200, height: 630 });
  
  // Navigate to the app
  await page.goto('http://localhost:5176/');
  
  // Wait for content to load
  await page.waitForTimeout(1500);
  
  // Take screenshot
  await page.screenshot({ 
    path: 'public/og-image.png',
    type: 'png'
  });
  
  await browser.close();
  console.log('✓ Screenshot saved to public/og-image.png');
})();
