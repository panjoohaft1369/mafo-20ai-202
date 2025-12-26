/**
 * Balance fetcher utility for kie.ai
 * Tries multiple approaches to fetch the current credit balance
 */

export async function fetchBalanceFromBilling(apiKey: string): Promise<number> {
  try {
    console.log("[Balance] Fetching balance for API Key:", apiKey.substring(0, 10) + "...");

    // Strategy 1: Try various API endpoints where balance might be exposed
    const apiEndpoints = [
      "https://api.kie.ai/api/v1/user",
      "https://api.kie.ai/api/v1/user/info",
      "https://api.kie.ai/api/v1/user/balance",
      "https://api.kie.ai/api/v1/user/credits",
      "https://api.kie.ai/api/v1/account",
      "https://api.kie.ai/api/v1/account/balance",
      "https://api.kie.ai/api/v1/me",
      "https://api.kie.ai/api/v1/profile",
      "https://kie.ai/api/v1/user",
      "https://kie.ai/api/user",
      "https://kie.ai/api/balance",
      "https://kie.ai/api/billing",
      "https://kie.ai/api/account",
    ];

    for (const fullUrl of apiEndpoints) {
      try {
        console.log(`[Balance] Trying API endpoint: ${fullUrl}`);
        const response = await fetch(fullUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "User-Agent": "MAFO-Client/1.0",
          },
          timeout: 10000,
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`[Balance] API response from ${fullUrl}:`, JSON.stringify(data).substring(0, 300));

          // Try to extract balance from various paths
          const balance =
            data?.balance ||
            data?.credits ||
            data?.creditsRemaining ||
            data?.credit ||
            data?.data?.balance ||
            data?.data?.credits ||
            data?.data?.creditsRemaining ||
            data?.user?.balance ||
            data?.user?.credits ||
            data?.account?.balance ||
            data?.account?.credits;

          if (typeof balance === "number" && balance >= 0) {
            console.log(`[Balance] ✓ Found balance: ${balance}`);
            return balance;
          }
        } else {
          console.log(`[Balance] HTTP ${response.status} from ${fullUrl}`);
        }
      } catch (e: any) {
        console.log(`[Balance] Error with ${fullUrl}: ${e.message}`);
      }
    }

    // Strategy 2: Try fetching the billing HTML page and look for balance data
    console.log("[Balance] Trying HTML scraping from /billing page...");
    const billingResponse = await fetch("https://kie.ai/billing", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Referer": "https://kie.ai/",
      },
      timeout: 15000,
    });

    if (billingResponse.ok) {
      const html = await billingResponse.text();
      console.log("[Balance] HTML length:", html.length);

      // Look for __NEXT_DATA__ which contains the initial page state
      const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
      if (nextDataMatch && nextDataMatch[1]) {
        try {
          const nextData = JSON.parse(nextDataMatch[1]);
          const nextDataStr = JSON.stringify(nextData);

          // Search for any numeric value near keywords like balance, credit, remaining
          // This regex looks for patterns like "balance": 65 or "credits": 100
          const patterns = [
            /"balance"\s*:\s*(\d+)/gi,
            /"credits"\s*:\s*(\d+)/gi,
            /"creditsRemaining"\s*:\s*(\d+)/gi,
            /"currentBalance"\s*:\s*(\d+)/gi,
            /"credit"\s*:\s*(\d+)/gi,
            /"remaining"\s*:\s*(\d+)/gi,
          ];

          let foundValues: number[] = [];

          for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(nextDataStr)) !== null) {
              const num = parseInt(match[1], 10);
              if (num >= 0 && num < 1000000) {
                foundValues.push(num);
              }
            }
          }

          console.log("[Balance] Found potential balance values:", [...new Set(foundValues)].sort((a, b) => b - a).slice(0, 5));

          // Filter for reasonable balance values (not 0, not too large)
          const reasonableValues = foundValues.filter(v => v > 0 && v < 100000);
          if (reasonableValues.length > 0) {
            // Return the first reasonable value found
            const balance = reasonableValues[0];
            console.log("[Balance] Selected balance:", balance);
            return balance;
          }
        } catch (e) {
          console.log("[Balance] Error parsing __NEXT_DATA__:", e);
        }
      }

      // Fallback: Look for pattern "credits" with a number near it
      console.log("[Balance] Looking for number followed by 'credits' keyword...");

      // Look for the specific pattern: number + "credits" (case-insensitive)
      const creditsPattern = />(\d+)<\/span>\s*<[^>]*>\s*credits/i;
      const creditsMatch = html.match(creditsPattern);
      if (creditsMatch && creditsMatch[1]) {
        const num = parseInt(creditsMatch[1], 10);
        if (num > 0 && num < 100000) {
          console.log("[Balance] Found balance from credits pattern:", num);
          return num;
        }
      }

      // Try another pattern: look for "currentBalance" or "balance" in JSON
      const jsonBalancePattern = /["'](?:currentBalance|balance|creditsRemaining|credits)["']\s*:\s*(\d+)/i;
      const jsonMatch = html.match(jsonBalancePattern);
      if (jsonMatch && jsonMatch[1]) {
        const num = parseInt(jsonMatch[1], 10);
        if (num > 0 && num < 100000) {
          console.log("[Balance] Found balance from JSON pattern:", num);
          return num;
        }
      }

      // Last resort: extract all reasonable numbers from scripts containing "balance" or "credit"
      console.log("[Balance] Searching script tags for balance-related numbers...");
      const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
      let scriptMatch;
      let balanceRelatedNumbers: number[] = [];

      while ((scriptMatch = scriptRegex.exec(html)) !== null) {
        const scriptContent = scriptMatch[1];

        // Only look in scripts that mention balance or credit
        if (scriptContent.toLowerCase().includes("balance") || scriptContent.toLowerCase().includes("credit")) {
          // Look for numbers that appear after a colon (JSON key-value pairs)
          const matches = scriptContent.match(/:\s*(\d+)[,}]/g);
          if (matches) {
            matches.forEach(m => {
              const num = parseInt(m.replace(/[^\d]/g, ""), 10);
              if (num >= 10 && num < 100000) {  // Reasonable balance range
                balanceRelatedNumbers.push(num);
              }
            });
          }
        }
      }

      if (balanceRelatedNumbers.length > 0) {
        // Get unique values and sort by how "likely" they are to be a balance
        const unique = [...new Set(balanceRelatedNumbers)];
        // Prefer numbers in a reasonable balance range (10-10000)
        const inRange = unique.filter(n => n >= 10 && n <= 10000);
        if (inRange.length > 0) {
          const balance = inRange[0];
          console.log("[Balance] Extracted balance from balance-related scripts:", balance);
          return balance;
        } else if (unique.length > 0) {
          const balance = unique[0];
          console.log("[Balance] Extracted balance from scripts:", balance);
          return balance;
        }
      }
    }

    console.log("[Balance] FINAL BALANCE: 0 (could not extract)");
    return 0;
  } catch (error: any) {
    console.error("[Balance] Error:", error.message);
    return 0;
  }
}
