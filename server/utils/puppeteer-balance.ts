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

    // Look for where the balance might be - search for it after Balance Information
    const balanceIndex = html.toLowerCase().indexOf("balance information");
    if (balanceIndex !== -1) {
      const balanceContext = html.substring(balanceIndex, Math.min(balanceIndex + 2000, html.length));
      console.log("[Balance] FULL Balance Information Context (2000 chars):");
      console.log(balanceContext);

      // Also look for the exact number 65
      const num65Index = html.indexOf("65");
      if (num65Index !== -1) {
        console.log("[Balance] Found '65' at index:", num65Index);
        console.log("[Balance] Context around 65:", html.substring(num65Index - 100, num65Index + 100));
      }
    }

    let balance = 0;

    // The HTML contains embedded JSON/data that's rendered by JavaScript
    // Let's try to extract it from the HTML

    // Strategy 1: Look for __NEXT_DATA__ which contains Next.js initial state
    console.log("[Balance] Looking for __NEXT_DATA__...");
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (nextDataMatch && nextDataMatch[1]) {
      try {
        const nextDataJson = JSON.parse(nextDataMatch[1]);
        console.log("[Balance] Found __NEXT_DATA__, searching for balance...");

        // Convert to string to search through all keys/values
        const nextDataStr = JSON.stringify(nextDataJson);

        // Look for balance/credits values
        const balancePatterns = [
          /"currentBalance"\s*:\s*(\d+)/,
          /"balance"\s*:\s*(\d+)/,
          /"creditsRemaining"\s*:\s*(\d+)/,
          /"credits"\s*:\s*(\d+)/,
          /"credit"\s*:\s*(\d+)/,
        ];

        for (const pattern of balancePatterns) {
          const match = nextDataStr.match(pattern);
          if (match && match[1]) {
            const num = parseInt(match[1], 10);
            if (num >= 0 && num < 1000000) {
              balance = num;
              console.log("[Balance] Found in __NEXT_DATA__:", balance);
              break;
            }
          }
        }
      } catch (e) {
        console.log("[Balance] Error parsing __NEXT_DATA__:", e);
      }
    }

    // Strategy 2: Search for window.__data__ or similar patterns
    if (balance === 0) {
      console.log("[Balance] Looking for window.__data__ or props...");
      const windowDataMatch = html.match(/window\.__(\w+)\s*=\s*({[\s\S]*?});\s*<\/script>/);
      if (windowDataMatch && windowDataMatch[2]) {
        try {
          const windowData = JSON.parse(windowDataMatch[2]);
          const windowDataStr = JSON.stringify(windowData);

          const patterns = [
            /"currentBalance"\s*:\s*(\d+)/,
            /"balance"\s*:\s*(\d+)/,
            /"creditsRemaining"\s*:\s*(\d+)/,
          ];

          for (const pattern of patterns) {
            const match = windowDataStr.match(pattern);
            if (match && match[1]) {
              const num = parseInt(match[1], 10);
              if (num >= 0 && num < 1000000) {
                balance = num;
                console.log("[Balance] Found in window data:", balance);
                break;
              }
            }
          }
        } catch (e) {
          console.log("[Balance] Error parsing window data:", e);
        }
      }
    }

    // Strategy 3: Look for any JSON object in script tags with balance-related keys
    if (balance === 0) {
      console.log("[Balance] Scanning all script tags for balance data...");

      // Find all script tags
      const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
      if (scriptMatches) {
        for (const script of scriptMatches) {
          // Look for JSON objects with numeric values
          const jsonMatches = script.match(/\{[\s\S]*?["'](\w*balance\w*|credit\w*|remaining\w*)["']\s*:\s*(\d+)[\s\S]*?\}/gi);

          if (jsonMatches) {
            for (const jsonMatch of jsonMatches) {
              // Try to extract the number
              const numMatch = jsonMatch.match(/["'](\w*balance\w*|credit\w*|remaining\w*)["']\s*:\s*(\d+)/i);
              if (numMatch && numMatch[2]) {
                const num = parseInt(numMatch[2], 10);
                if (num >= 0 && num < 1000000) {
                  balance = num;
                  console.log("[Balance] Found in script object:", balance, "Key:", numMatch[1]);
                  break;
                }
              }
            }
            if (balance > 0) break;
          }
        }
      }
    }

    // Strategy 4: Look for JSON-like data patterns anywhere in HTML
    if (balance === 0) {
      console.log("[Balance] Looking for JSON patterns with balance keywords...");

      const patterns = [
        /"currentBalance"\s*:\s*(\d+)/i,
        /"balance"\s*:\s*(\d+)/i,
        /"creditsRemaining"\s*:\s*(\d+)/i,
        /"credits"\s*:\s*(\d+)/i,
        /"credit"\s*:\s*(\d+)/i,
      ];

      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (num >= 0 && num < 1000000) {
            balance = num;
            console.log("[Balance] Found with regex:", balance);
            break;
          }
        }
      }
    }

    // Strategy 5: Look for the exact rendered pattern in case it's there
    if (balance === 0) {
      console.log("[Balance] Looking for HTML span pattern...");
      const patterns = [
        />(\d+)<\/span><\/span>\s*<[^>]*>credits/i,
        />(\d+)<\/span>[^<]*credits/i,
        /Balance\s+Information[\s\S]{0,1000}>(\d{1,3})</i,
        /<span[^>]*>(\d+)<\/span>\s*credits/i,
      ];

      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (num >= 0 && num < 10000) {
            balance = num;
            console.log("[Balance] Regex found:", balance);
            break;
          }
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
