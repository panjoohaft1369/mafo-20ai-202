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
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    console.log("[Balance] Fetching balance for API Key:", apiKey.substring(0, 10) + "...");

    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Set authentication headers
    await page.setExtraHTTPHeaders({
      "Authorization": `Bearer ${apiKey}`,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
    });

    console.log("[Balance] Navigating to https://kie.ai/billing...");

    // Navigate to billing page
    const response = await page.goto("https://kie.ai/billing", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    console.log("[Balance] Response status:", response?.status());
    console.log("[Balance] Page loaded, waiting for JavaScript to render...");

    // Wait for the page to fully render
    await page.waitForTimeout(5000);

    // Try waiting for specific text to appear
    try {
      await page.waitForFunction(
        () => document.body.innerText.includes("Balance Information"),
        { timeout: 10000 }
      );
      console.log("[Balance] Found 'Balance Information' text");
    } catch (e) {
      console.log("[Balance] Timeout waiting for Balance Information text");
    }

    // Get page HTML
    const pageHtml = await page.content();
    console.log("[Balance] Page HTML length:", pageHtml.length);
    console.log("[Balance] Has 'Balance Information':", pageHtml.includes("Balance Information"));

    // Extract the balance using JavaScript
    // Look specifically in the Balance Information section
    let balance = await page.evaluate(() => {
      // Method 1: Find span with just the number
      const allSpans = document.querySelectorAll("span");
      const candidates: number[] = [];

      for (const span of allSpans) {
        const text = span.textContent?.trim();

        // Only consider pure numbers
        if (text && /^\d+$/.test(text)) {
          const num = parseInt(text, 10);

          // Filter: reasonable balance numbers
          if (num > 0 && num < 10000) {
            candidates.push(num);
            console.log("[JS] Found number candidate:", num);
          }
        }
      }

      // Return first candidate (should be the balance)
      if (candidates.length > 0) {
        console.log("[JS] All candidates:", candidates);
        return candidates[0];
      }

      return 0;
    });

    console.log("[Balance] JavaScript extracted balance:", balance);

    // If JavaScript didn't work, try regex on HTML
    if (balance === 0) {
      console.log("[Balance] JavaScript returned 0, trying HTML regex...");

      // Look for the exact pattern from the screenshot
      // <span>65</span>credits or <span class="..."><span>65</span></span>credits
      const patterns = [
        />(\d+)<\/span><\/span>\s*<[^>]*>credits/i,
        />(\d+)<\/span>\s*credits/i,
        /Balance Information[\s\S]{0,500}>(\d+)</i,
        /<span[^>]*>(\d+)<\/span>/,
      ];

      for (const pattern of patterns) {
        const match = pageHtml.match(pattern);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (num > 0 && num < 10000) {
            balance = num;
            console.log("[Balance] HTML regex found balance:", balance, "using pattern:", pattern);
            break;
          }
        }
      }
    }

    // Last resort: find the number in the entire page text
    if (balance === 0) {
      console.log("[Balance] Trying text content extraction...");
      const textContent = await page.evaluate(() => document.body.innerText);

      // Find all numbers
      const numbers = textContent.match(/\d+/g) || [];
      console.log("[Balance] All numbers in page:", numbers);

      // Find first reasonable balance number
      for (const numStr of numbers) {
        const num = parseInt(numStr, 10);
        if (num > 0 && num < 10000) {
          balance = num;
          console.log("[Balance] Using text content number:", balance);
          break;
        }
      }
    }

    console.log("[Balance] FINAL BALANCE:", balance);

    // Take screenshot for debugging
    try {
      const screenshotPath = "/tmp/kie-billing-" + Date.now() + ".png";
      await page.screenshot({ path: screenshotPath });
      console.log("[Balance] Screenshot saved to:", screenshotPath);
    } catch (screenshotError) {
      console.log("[Balance] Could not save screenshot:", screenshotError);
    }

    await page.close();
    return balance;
  } catch (error: any) {
    console.error("[Balance] ERROR:", error.message);
    console.error("[Balance] Stack:", error.stack);

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
