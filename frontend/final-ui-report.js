const { chromium } = require('playwright');

async function generateFinalReport() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const report = {
    timestamp: new Date().toISOString(),
    testResults: {
      authentication: null,
      navigation: null,
      reactFlowRendering: null,
      nodeTypeSelector: null,
      uiResponsiveness: null
    },
    issues: [],
    recommendations: []
  };

  try {
    console.log('=== Generating Final UI Test Report ===');

    // Test 1: Authentication
    console.log('1. Testing Authentication...');
    try {
      await page.goto('http://localhost/login');
      await page.waitForLoadState('domcontentloaded');
      await page.screenshot({ path: 'test-screenshots/report-login.png' });
      
      await page.fill('input[placeholder="Username (max 50 characters)"]', 'admin');
      await page.fill('input[placeholder="Password"]', '1234');
      await page.click('button[type="submit"]');
      await page.waitForNavigation();
      
      const currentUrl = page.url();
      if (currentUrl.includes('/dashboard')) {
        report.testResults.authentication = 'PASS';
        console.log('   ✅ Authentication successful');
      } else {
        report.testResults.authentication = 'FAIL';
        console.log('   ❌ Authentication failed');
        report.issues.push('Login does not redirect to dashboard');
      }
    } catch (error) {
      report.testResults.authentication = 'ERROR';
      report.issues.push(`Authentication error: ${error.message}`);
    }

    // Test 2: Navigation to Workflow Editor
    console.log('2. Testing Navigation...');
    try {
      const newWorkflowButton = await page.$('text="New Workflow"');
      if (newWorkflowButton) {
        await newWorkflowButton.click();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        
        const currentUrl = page.url();
        if (currentUrl.includes('/workflow/new')) {
          report.testResults.navigation = 'PASS';
          console.log('   ✅ Navigation to workflow editor successful');
        } else {
          report.testResults.navigation = 'FAIL';
          report.issues.push('Navigation does not reach workflow editor');
        }
      } else {
        report.testResults.navigation = 'FAIL';
        report.issues.push('New Workflow button not found');
      }
    } catch (error) {
      report.testResults.navigation = 'ERROR';
      report.issues.push(`Navigation error: ${error.message}`);
    }

    await page.screenshot({ path: 'test-screenshots/report-workflow-editor.png', fullPage: true });

    // Test 3: React Flow Rendering
    console.log('3. Testing React Flow Rendering...');
    try {
      const reactFlowCheck = await page.evaluate(() => {
        return {
          reactFlowDiv: !!document.querySelector('.react-flow'),
          reactFlowRenderer: !!document.querySelector('.react-flow__renderer'),
          reactFlowViewport: !!document.querySelector('.react-flow__viewport'),
          reactFlowBackground: !!document.querySelector('.react-flow__background'),
          reactFlowControls: !!document.querySelector('.react-flow__controls'),
          reactFlowMinimap: !!document.querySelector('.react-flow__minimap'),
          canvasElements: document.querySelectorAll('canvas').length,
          totalElements: document.querySelectorAll('*').length
        };
      });

      if (reactFlowCheck.reactFlowDiv || reactFlowCheck.reactFlowRenderer || 
          reactFlowCheck.reactFlowViewport || reactFlowCheck.canvasElements > 0) {
        report.testResults.reactFlowRendering = 'PARTIAL';
        console.log('   ⚠️ React Flow partially rendered');
        report.issues.push('React Flow components not fully rendering');
      } else if (reactFlowCheck.totalElements > 50) {
        report.testResults.reactFlowRendering = 'FAIL';
        console.log('   ❌ React Flow not rendered, but page is loaded');
        report.issues.push('React Flow components completely missing from DOM');
      } else {
        report.testResults.reactFlowRendering = 'ERROR';
        console.log('   ❌ Page not properly loaded');
        report.issues.push('Workflow editor page not properly loaded');
      }

      console.log(`   Canvas elements: ${reactFlowCheck.canvasElements}`);
      console.log(`   Total DOM elements: ${reactFlowCheck.totalElements}`);
    } catch (error) {
      report.testResults.reactFlowRendering = 'ERROR';
      report.issues.push(`React Flow check error: ${error.message}`);
    }

    // Test 4: Node Type Selector
    console.log('4. Testing Node Type Selector...');
    try {
      const addNodeCheck = await page.evaluate(() => {
        return {
          addNodeButton: !!document.querySelector('button:has-text("Add Node")'),
          musashiElements: document.querySelectorAll('[class*="musashi"]').length,
          plusIcons: document.querySelectorAll('svg[data-lucide="plus"]').length,
          totalButtons: document.querySelectorAll('button').length,
          buttonTexts: Array.from(document.querySelectorAll('button')).map(btn => btn.textContent?.trim() || '').filter(text => text)
        };
      });

      if (addNodeCheck.addNodeButton) {
        report.testResults.nodeTypeSelector = 'PASS';
        console.log('   ✅ Node Type Selector rendered');
      } else {
        report.testResults.nodeTypeSelector = 'FAIL';
        console.log('   ❌ Node Type Selector not rendered');
        report.issues.push('NodeTypeSelector component not rendering in header');
      }

      console.log(`   Total buttons: ${addNodeCheck.totalButtons}`);
      console.log(`   Button texts: ${addNodeCheck.buttonTexts.join(', ')}`);
      console.log(`   Musashi styled elements: ${addNodeCheck.musashiElements}`);
    } catch (error) {
      report.testResults.nodeTypeSelector = 'ERROR';
      report.issues.push(`Node Type Selector check error: ${error.message}`);
    }

    // Test 5: UI Responsiveness
    console.log('5. Testing UI Responsiveness...');
    try {
      // Test different viewport sizes
      const viewports = [
        { width: 1920, height: 1080, name: 'Desktop' },
        { width: 1024, height: 768, name: 'Tablet' },
        { width: 375, height: 667, name: 'Mobile' }
      ];

      let responsiveScore = 0;

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(1000);
        
        const isUsable = await page.evaluate(() => {
          // Check if main elements are still visible and accessible
          const header = document.querySelector('header');
          const main = document.querySelector('[class*="flex-1"]') || document.querySelector('main');
          
          return {
            headerVisible: header && header.offsetHeight > 0,
            mainVisible: main && main.offsetHeight > 0,
            hasHorizontalScroll: document.body.scrollWidth > window.innerWidth,
            hasVerticalScroll: document.body.scrollHeight > window.innerHeight
          };
        });

        if (isUsable.headerVisible && isUsable.mainVisible && !isUsable.hasHorizontalScroll) {
          responsiveScore++;
        }

        await page.screenshot({ path: `test-screenshots/report-${viewport.name.toLowerCase()}.png` });
      }

      if (responsiveScore === 3) {
        report.testResults.uiResponsiveness = 'PASS';
        console.log('   ✅ UI is responsive across all tested viewport sizes');
      } else if (responsiveScore >= 2) {
        report.testResults.uiResponsiveness = 'PARTIAL';
        console.log('   ⚠️ UI is responsive on most viewport sizes');
        report.issues.push(`UI responsiveness issues on ${3-responsiveScore} viewport size(s)`);
      } else {
        report.testResults.uiResponsiveness = 'FAIL';
        console.log('   ❌ UI has significant responsiveness issues');
        report.issues.push('Major UI responsiveness problems across multiple viewport sizes');
      }

      // Reset to desktop for final screenshot
      await page.setViewportSize({ width: 1920, height: 1080 });
    } catch (error) {
      report.testResults.uiResponsiveness = 'ERROR';
      report.issues.push(`UI responsiveness test error: ${error.message}`);
    }

    // Generate recommendations based on findings
    if (report.testResults.reactFlowRendering !== 'PASS') {
      report.recommendations.push('Fix React Flow component rendering - check for JavaScript errors and dependency loading');
    }
    
    if (report.testResults.nodeTypeSelector !== 'PASS') {
      report.recommendations.push('Debug NodeTypeSelector component rendering - check CSS class loading and component lifecycle');
    }
    
    if (report.issues.length > 0) {
      report.recommendations.push('Implement error boundaries and loading states for better user experience');
      report.recommendations.push('Add comprehensive logging to track component rendering issues');
    }

    // Final screenshot
    await page.screenshot({ path: 'test-screenshots/report-final.png', fullPage: true });

    // Calculate overall score
    const testScores = Object.values(report.testResults);
    const passCount = testScores.filter(score => score === 'PASS').length;
    const totalTests = testScores.length;
    const overallScore = Math.round((passCount / totalTests) * 100);

    report.overallScore = `${overallScore}% (${passCount}/${totalTests} tests passing)`;

    console.log('\n=== FINAL REPORT SUMMARY ===');
    console.log(`Overall Score: ${report.overallScore}`);
    console.log('\nTest Results:');
    Object.entries(report.testResults).forEach(([test, result]) => {
      const icon = result === 'PASS' ? '✅' : result === 'PARTIAL' ? '⚠️' : '❌';
      console.log(`  ${icon} ${test}: ${result}`);
    });

    console.log('\nIssues Found:');
    report.issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue}`);
    });

    console.log('\nRecommendations:');
    report.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });

    // Save report to file
    const fs = require('fs');
    fs.writeFileSync('test-screenshots/ui-test-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n📝 Full report saved to: test-screenshots/ui-test-report.json');
    console.log('📸 Screenshots saved to: test-screenshots/');
    
    console.log('\n=== Report Generation Complete ===');

  } catch (error) {
    console.error('Report generation failed:', error);
    await page.screenshot({ path: 'test-screenshots/report-generation-error.png' });
  } finally {
    await browser.close();
  }
}

generateFinalReport().catch(console.error);