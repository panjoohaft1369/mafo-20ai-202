/**
 * Balance fetcher utility for kie.ai/billing
 * Uses HTTP requests with regex parsing to extract balance
 */

/**
 * Fetch balance from kie.ai/billing using Puppeteer
 * Renders the page so JavaScript executes and balance appears
 */
/**
 * Fetch balance from kie.ai/billing using HTTP requests and regex parsing
 */
export async function fetchBalanceFromBilling(apiKey: string): Promise<number> {
  try {
    console.log("[Balance] Fetching balance for API Key:", apiKey.substring(0, 10) + "...");

    // Fetch the billing page with proper headers
    const response = await fetch("https://kie.ai/billing", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      },
      timeout: 30000,
    });

    console.log("[Balance] Response status:", response.status);
    console.log("[Balance] Response OK:", response.ok);

    if (!response.ok) {
      console.error("[Balance] Non-OK response:", response.status);
      return 0;
    }

    const html = await response.text();
    console.log("[Balance] HTML length:", html.length);
    console.log("[Balance] Has 'Balance Information':", html.includes("Balance Information"));

    // Log some of the Balance Information section
    const balanceIndex = html.toLowerCase().indexOf("balance information");
    if (balanceIndex !== -1) {
      const snippet = html.substring(balanceIndex, Math.min(balanceIndex + 400, html.length));
      console.log("[Balance] Balance Information snippet:", snippet.substring(0, 300));
    }

    let balance = 0;

    // Strategy 1: Look for pattern <span>NUMBER</span>credits
    const patterns = [
      // Exact pattern from screenshot: <span>65</span>credits
      /Balance\s+Information[\s\S]{0,300}>(\d+)<\/span><\/span>\s*<[^>]*>credits/i,
      /Balance\s+Information[\s\S]{0,300}>(\d+)<\/span>\s*credits/i,
      // More flexible pattern
      />(\d+)<\/span><\/span>[^<]*credits/i,
      />(\d+)<\/span>[^<]{0,50}credits/i,
      // Direct number before "credits"
      />(\d+)<[^>]*credits/i,
      // Fallback: any number in Balance section
      /Balance\s+Information[\s\S]{0,500}>(\d{1,4})</i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (num > 0 && num < 10000) {
          balance = num;
          console.log("[Balance] Pattern matched, found balance:", balance, "Pattern:", pattern.toString());
          break;
        }
      }
    }

    // Strategy 2: If no pattern worked, extract ALL numbers and find the most likely balance
    if (balance === 0) {
      console.log("[Balance] No pattern matched, trying comprehensive number extraction...");

      // Find all numbers in the page
      const numberMatches = html.match(/\b(\d{1,4})\b/g) || [];
      const numbers = numberMatches.map((n) => parseInt(n, 10));
      const uniqueNumbers = Array.from(new Set(numbers));

      console.log("[Balance] All unique numbers found (first 30):", uniqueNumbers.slice(0, 30));

      // Try to find the balance by looking for numbers in the Balance Information section
      const balanceStart = html.toLowerCase().indexOf("balance information");
      if (balanceStart !== -1) {
        const balanceEnd = balanceStart + 1000;
        const balanceSection = html.substring(balanceStart, balanceEnd);
        const balanceNumbers = balanceSection.match(/\b(\d{1,4})\b/g) || [];

        console.log("[Balance] Numbers in Balance Information section:", balanceNumbers);

        for (const numStr of balanceNumbers) {
          const num = parseInt(numStr, 10);
          if (num > 0 && num < 1000) {
            // Prefer numbers less than 1000 as they're more likely to be balance
            balance = num;
            console.log("[Balance] Using number from Balance section:", balance);
            break;
          }
        }
      }
    }

    // Strategy 3: If still 0, use first reasonable number found
    if (balance === 0 && html.includes("Balance Information")) {
      const allNumbers = html.match(/\d+/g) || [];
      for (const numStr of allNumbers) {
        const num = parseInt(numStr, 10);
        if (num > 0 && num < 10000) {
          balance = num;
          console.log("[Balance] Using first reasonable number found:", balance);
          break;
        }
      }
    }

    console.log("[Balance] FINAL BALANCE:", balance);
    return balance;
  } catch (error: any) {
    console.error("[Balance] Error:", error.message);
    console.error("[Balance] Stack:", error.stack);
    return 0;
  }
}
