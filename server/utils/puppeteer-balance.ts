/**
 * Balance fetcher utility for kie.ai
 * Tries multiple approaches to fetch the current credit balance
 */

import * as fs from "fs";
import * as path from "path";

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

      // Save HTML for debugging (optional, commented out to avoid spam)
      // const debugPath = path.join(process.cwd(), "public", "kie-billing-debug.html");
      // fs.writeFileSync(debugPath, html);
      // console.log("[Balance] Saved HTML for debugging to:", debugPath);

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

          const uniqueValues = [...new Set(foundValues)].sort((a, b) => b - a);
          console.log("[Balance] Found potential balance values:", uniqueValues.slice(0, 5));

          // Filter for reasonable balance values (not 0, not too large)
          const reasonableValues = foundValues.filter(v => v > 0 && v < 100000);
          if (reasonableValues.length > 0) {
            // Return the first reasonable value found
            const balance = reasonableValues[0];
            console.log("[Balance] Selected balance from __NEXT_DATA__:", balance);
            return balance;
          }
        } catch (e) {
          console.log("[Balance] Error parsing __NEXT_DATA__:", e);
        }
      }

      // Fallback: Search through the entire HTML for the balance pattern
      console.log("[Balance] Searching HTML for balance-related keywords and numbers...");

      // Look for any occurrence of a 1-3 digit number followed by "credits"
      const creditsPatterns = [
        />\s*(\d{1,3})\s*<[^>]*>\s*credits/i,
        />(\d{1,3})<\/span>\s*<[^>]*>\s*credits/i,
        /"balance"\s*:\s*(\d+)/i,
        /"credits"\s*:\s*(\d+)/i,
        /"creditsRemaining"\s*:\s*(\d+)/i,
      ];

      for (const pattern of creditsPatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (num > 0 && num < 100000) {
            console.log("[Balance] ✓ Found balance via pattern:", num);
            return num;
          }
        }
      }

      // Last resort: Look for any reasonable number in a JSON context
      console.log("[Balance] Searching all script tags for balance data...");
      const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
      let scriptMatch;
      let balanceNumbers: number[] = [];

      while ((scriptMatch = scriptRegex.exec(html)) !== null) {
        const scriptContent = scriptMatch[1];

        // Only process large script blocks that might contain data
        if (scriptContent.length > 100 && (scriptContent.includes("balance") || scriptContent.includes("credit"))) {
          // Try to find JSON patterns with balance/credit keywords
          const jsonPatterns = [
            /"balance"\s*:\s*(\d+)/gi,
            /"credits?\s*:\s*(\d+)/gi,
            /"remaining"\s*:\s*(\d+)/gi,
          ];

          for (const pattern of jsonPatterns) {
            let jsonMatch;
            while ((jsonMatch = pattern.exec(scriptContent)) !== null) {
              const num = parseInt(jsonMatch[1], 10);
              if (num > 0 && num < 100000) {
                balanceNumbers.push(num);
              }
            }
          }
        }
      }

      if (balanceNumbers.length > 0) {
        // Get unique values and select the most reasonable one
        const unique = [...new Set(balanceNumbers)].sort((a, b) => a - b);
        // Prefer numbers in a reasonable balance range (10-10000)
        const inRange = unique.filter(n => n >= 10 && n <= 10000);
        if (inRange.length > 0) {
          console.log("[Balance] ✓ Found balance from script tags:", inRange[0]);
          return inRange[0];
        } else if (unique.length > 0 && unique[0] > 0) {
          console.log("[Balance] ✓ Found balance from scripts:", unique[0]);
          return unique[0];
        }
      }
    }

    console.log("[Balance] Could not extract balance - returning 0");
    return 0;
  } catch (error: any) {
    console.error("[Balance] Fatal error:", error.message);
    return 0;
  }
}
