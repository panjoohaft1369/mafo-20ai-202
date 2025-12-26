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

    // Strategy 1: Look for JSON-like data in the HTML
    // Try to find "currentBalance" or similar JSON keys
    const jsonPatterns = [
      /"currentBalance"\s*:\s*(\d+)/i,
      /"balance"\s*:\s*(\d+)/i,
      /"credit"\s*:\s*(\d+)/i,
      /"credits"\s*:\s*(\d+)/i,
      /"creditsRemaining"\s*:\s*(\d+)/i,
    ];

    for (const pattern of jsonPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (num > 0 && num < 100000) {
          balance = num;
          console.log("[Balance] Found in JSON:", balance, "Pattern:", pattern.toString());
          break;
        }
      }
    }

    // Strategy 2: Look for window data or script tags containing balance
    if (balance === 0) {
      console.log("[Balance] No JSON pattern matched, searching script tags...");

      // Find all script tags
      const scriptMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
      if (scriptMatch) {
        for (const script of scriptMatch) {
          // Look for JSON-like data
          const jsonMatches = script.match(/"[^"]*"\s*:\s*\d+/g);
          if (jsonMatches) {
            for (const match of jsonMatches) {
              const numMatch = match.match(/(\d+)$/);
              if (numMatch && numMatch[1]) {
                const num = parseInt(numMatch[1], 10);
                if (num > 10 && num < 100000 && num !== 2024) {
                  balance = num;
                  console.log("[Balance] Found in script data:", balance);
                  break;
                }
              }
            }
          }
          if (balance > 0) break;
        }
      }
    }

    // Strategy 3: Parse as much JSON-like content as possible
    if (balance === 0) {
      console.log("[Balance] Trying deep JSON parsing...");

      // Look for large JSON objects that might contain balance
      const jsonMatch = html.match(/\{[^{}]*"[^"]*"\s*:\s*\d+[^{}]*\}/);
      if (jsonMatch) {
        try {
          // Try to extract and parse JSON
          const jsonStr = jsonMatch[0];
          // Simple regex extraction of key-value pairs
          const pairs = jsonStr.match(/"(\w+)"\s*:\s*(\d+)/g) || [];

          for (const pair of pairs) {
            const match = pair.match(/"(\w+)"\s*:\s*(\d+)/);
            if (match && (match[1].toLowerCase().includes("balance") ||
                         match[1].toLowerCase().includes("credit"))) {
              const num = parseInt(match[2], 10);
              if (num > 0 && num < 100000) {
                balance = num;
                console.log("[Balance] Extracted from JSON pair:", balance);
                break;
              }
            }
          }
        } catch (e) {
          console.log("[Balance] JSON parsing error:", e);
        }
      }
    }

    // Strategy 4: Look for the exact rendered pattern in case it's there
    if (balance === 0) {
      const patterns = [
        />(\d+)<\/span><\/span>\s*<[^>]*>credits/i,
        />(\d+)<\/span>[^<]*credits/i,
        /Balance\s+Information[\s\S]{0,500}>(\d{1,3})</i,
      ];

      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (num > 0 && num < 10000) {
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
