/**
 * Puppeteer utility to fetch actual balance from kie.ai/billing
 * This renders the JavaScript and extracts the balance number
 */

import puppeteer, { Browser } from "puppeteer";

let browserInstance: Browser | null = null;

/**
 * Get or create a Puppeteer browser instance
 */
async function getBrowser(): Promise<Browser> {
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }

  console.log("[Puppeteer] Launching browser...");
  browserInstance = await puppeteer.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH || "/root/.cache/puppeteer/chrome/linux-127.0.6533.88/chrome-linux64/chrome",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  console.log("[Puppeteer] Browser launched successfully");
  return browserInstance;
}

/**
 * Fetch balance from kie.ai/billing using Puppeteer
 * Renders the page so JavaScript executes and balance appears
 */
export async function fetchBalanceFromBilling(apiKey: string): Promise<number> {
  const page = await getBrowser().then((browser) => browser.newPage()).catch(null);

  if (!page) {
    console.error("[Balance] Failed to create page");
    return 0;
  }

  try {
    console.log("[Balance] Fetching balance for API Key:", apiKey.substring(0, 10) + "...");

    // Set authentication headers
    await page.setExtraHTTPHeaders({
      "Authorization": `Bearer ${apiKey}`,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    });

    console.log("[Balance] Navigating to https://kie.ai/billing...");

    // Navigate to billing page with proper waiting
    await page.goto("https://kie.ai/billing", {
      waitUntil: "networkidle0",
      timeout: 45000,
    });

    console.log("[Balance] Page loaded, waiting for balance to render...");

    // Wait a bit for JavaScript to render content
    await page.waitForTimeout(3000);

    // Take a screenshot for debugging
    const screenshotPath = "/tmp/kie-billing-" + Date.now() + ".png";
    await page.screenshot({ path: screenshotPath });
    console.log("[Balance] Screenshot saved to:", screenshotPath);

    // Get page HTML for debugging
    const pageHtml = await page.content();
    const htmlLength = pageHtml.length;
    console.log("[Balance] Page HTML length:", htmlLength);

    // Check if we're authenticated (look for Balance Information text)
    const hasBalanceSection = pageHtml.includes("Balance Information");
    console.log("[Balance] Has Balance Information section:", hasBalanceSection);

    // Try to find the balance using multiple strategies
    let balance = 0;

    // Strategy 1: Look for text pattern in page content
    const textContent = await page.evaluate(() => document.body.innerText);
    console.log("[Balance] Page text content (first 1000 chars):", textContent.substring(0, 1000));

    // Strategy 2: Look in the HTML directly for the balance number
    const numberMatch = pageHtml.match(/>(\d{1,4})<\/span><\/span>\s*<[^>]*>credits/i);
    if (numberMatch && numberMatch[1]) {
      balance = parseInt(numberMatch[1], 10);
      console.log("[Balance] Found balance from HTML regex:", balance);
    }

    // Strategy 3: Use page.evaluate to find balance more intelligently
    if (balance === 0) {
      console.log("[Balance] Trying JavaScript extraction...");
      balance = await page.evaluate(() => {
        // Log all text nodes to see what's on the page
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );

        const numbers: number[] = [];
        let node;
        while ((node = walker.nextNode())) {
          const text = node.textContent?.trim();
          if (text && /^\d+$/.test(text)) {
            const num = parseInt(text, 10);
            if (num > 0 && num < 10000) {
              numbers.push(num);
            }
          }
        }

        console.log("[JS] Found numbers:", numbers);

        // Return the first reasonable number (usually the balance)
        return numbers.length > 0 ? numbers[0] : 0;
      });

      console.log("[Balance] JavaScript found balance:", balance);
    }

    // Strategy 4: Wait for a specific selector and extract
    if (balance === 0) {
      try {
        const spanText = await page.evaluate(() => {
          const spans = Array.from(document.querySelectorAll("span"));
          const results: string[] = [];
          for (const span of spans) {
            const text = span.textContent?.trim();
            if (text && /^\d+$/.test(text)) {
              const num = parseInt(text, 10);
              if (num > 0 && num < 10000) {
                results.push(text);
              }
            }
          }
          return results;
        });

        console.log("[Balance] Found span numbers:", spanText);
        if (spanText.length > 0) {
          balance = parseInt(spanText[0], 10);
          console.log("[Balance] Using first span number:", balance);
        }
      } catch (e) {
        console.error("[Balance] Error evaluating spans:", e);
      }
    }

    console.log("[Balance] Final extracted balance:", balance);
    await page.close();

    return balance;
  } catch (error: any) {
    console.error("[Balance] Error fetching balance:", error.message);
    console.error("[Balance] Error stack:", error.stack);

    try {
      await page.close();
    } catch (closeError) {
      console.error("[Balance] Error closing page:", closeError);
    }

    return 0;
  }
}

/**
 * Close the browser instance (useful for cleanup)
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    console.log("[Puppeteer] Closing browser...");
    await browserInstance.close();
    browserInstance = null;
  }
}
