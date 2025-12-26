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
  let browser: Browser | null = null;

  try {
    console.log("[Balance] Fetching balance for API Key:", apiKey.substring(0, 10) + "...");

    browser = await getBrowser();
    const page = await browser.newPage();

    // Set authentication cookie or header
    await page.setExtraHTTPHeaders({
      "Authorization": `Bearer ${apiKey}`,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    });

    // Set cookie if needed
    await page.setCookie({
      name: "api_key",
      value: apiKey,
      domain: "kie.ai",
      path: "/",
    });

    console.log("[Balance] Navigating to https://kie.ai/billing...");

    // Navigate to the billing page
    await page.goto("https://kie.ai/billing", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    console.log("[Balance] Page loaded, waiting for content...");

    // Wait for the balance to be displayed (look for the span with the number)
    await page.waitForSelector("span", { timeout: 5000 }).catch(() => {
      console.log("[Balance] Timeout waiting for span, continuing...");
    });

    // Extract balance using JavaScript
    const balance = await page.evaluate(() => {
      // Look for the balance pattern: <span>65</span>
      // First, try to find all spans with text content that looks like a number
      const spans = document.querySelectorAll("span");
      let foundBalance = 0;

      for (const span of spans) {
        const text = span.textContent?.trim();
        if (text && /^\d+$/.test(text)) {
          const num = parseInt(text, 10);
          // Balance is usually 1-4 digits and less than 10000
          // Skip very large numbers (prices) and 0
          if (num > 0 && num < 10000) {
            foundBalance = num;
            console.log("[JS] Found candidate balance:", num);
            break;
          }
        }
      }

      return foundBalance;
    });

    console.log("[Balance] Extracted balance:", balance);
    await page.close();

    return balance;
  } catch (error: any) {
    console.error("[Balance] Error fetching balance:", error.message);
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
