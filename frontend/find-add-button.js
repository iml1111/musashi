const { chromium } = require('playwright');

async function findAddButton() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('=== Finding Add Button ===');

    // Login first
    await page.goto('http://localhost/login');
    await page.waitForLoadState('domcontentloaded');
    await page.fill('input[placeholder="Username (max 50 characters)"]', 'admin');
    await page.fill('input[placeholder="Password"]', '1234');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();

    // Go to workflow editor
    const newWorkflowButton = await page.$('text="New Workflow"');
    if (newWorkflowButton) {
      await newWorkflowButton.click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);
    }

    // Take screenshot of current state
    await page.screenshot({ path: 'test-screenshots/find-button-state.png', fullPage: true });

    // Get detailed button information
    console.log('\n=== Detailed Button Analysis ===');
    const buttonDetails = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.map((btn, index) => ({
        index,
        text: btn.textContent?.trim() || '',
        innerHTML: btn.innerHTML,
        className: btn.className,
        id: btn.id,
        type: btn.type,
        disabled: btn.disabled,
        parentClass: btn.parentElement?.className || '',
        hasPlus: btn.querySelector('svg[data-lucide="plus"]') !== null,
        hasIcon: btn.querySelector('svg') !== null
      }));
    });

    buttonDetails.forEach(btn => {
      if (btn.text.includes('Add') || btn.hasPlus || btn.text.includes('Node')) {
        console.log(`🎯 POTENTIAL ADD BUTTON ${btn.index}:`);
        console.log(`   Text: "${btn.text}"`);
        console.log(`   HTML: ${btn.innerHTML.substring(0, 100)}`);
        console.log(`   Class: ${btn.className}`);
        console.log(`   Has Plus: ${btn.hasPlus}`);
        console.log(`   Has Icon: ${btn.hasIcon}`);
        console.log(`   Parent: ${btn.parentClass}`);
      } else {
        console.log(`Button ${btn.index}: "${btn.text}" (${btn.hasIcon ? 'has icon' : 'no icon'})`);
      }
    });

    // Check the header structure more specifically
    console.log('\n=== Header Structure Analysis ===');
    const headerInfo = await page.evaluate(() => {
      const header = document.querySelector('header') || document.querySelector('.bg-white.border-b');
      if (!header) return { found: false };
      
      const rightSection = header.querySelector('.flex.items-center.space-x-4') || 
                          header.querySelector('.flex.items-center.gap-2') ||
                          header.querySelector('.flex.items-center:last-child');
                          
      return {
        found: true,
        headerHTML: header.innerHTML.substring(0, 1000),
        rightSectionFound: !!rightSection,
        rightSectionHTML: rightSection ? rightSection.innerHTML.substring(0, 500) : 'Not found'
      };
    });

    console.log('Header found:', headerInfo.found);
    if (headerInfo.found) {
      console.log('Right section found:', headerInfo.rightSectionFound);
      console.log('Right section HTML:', headerInfo.rightSectionHTML);
    }

    // Look for any element with "musashi" color classes (Add Node should be musashi colored)
    console.log('\n=== Looking for Musashi-styled elements ===');
    const musashiElements = await page.$$('[class*="musashi"]');
    console.log(`Found ${musashiElements.length} elements with musashi styling`);
    
    for (let i = 0; i < musashiElements.length; i++) {
      const element = musashiElements[i];
      const tagName = await element.evaluate(el => el.tagName);
      const text = await element.textContent();
      const classes = await element.getAttribute('class');
      console.log(`   ${tagName}: "${text}" (${classes})`);
    }

    // Check if NodeTypeSelector component exists in the DOM
    console.log('\n=== Looking for NodeTypeSelector related elements ===');
    const possibleSelectors = [
      'button:has-text("Add Node")',
      'button[class*="musashi"]',
      'button[class*="bg-musashi"]',
      'button:has([data-lucide="plus"])',
      'svg[data-lucide="plus"]',
    ];

    for (const selector of possibleSelectors) {
      try {
        const elements = await page.$$(selector);
        console.log(`${selector}: ${elements.length} found`);
        
        if (elements.length > 0) {
          for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const text = await element.textContent();
            const isVisible = await element.isVisible();
            console.log(`   Element ${i}: "${text}" (visible: ${isVisible})`);
          }
        }
      } catch (error) {
        console.log(`${selector}: Error - ${error.message}`);
      }
    }

    console.log('=== Search Complete ===');
    
  } catch (error) {
    console.error('Search failed:', error);
    await page.screenshot({ path: 'test-screenshots/search-error.png' });
  } finally {
    await browser.close();
  }
}

findAddButton().catch(console.error);