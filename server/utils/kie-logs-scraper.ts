/**
 * Utility to scrape and parse the kie.ai/logs page for complete image generation history
 */

interface KieLogEntry {
  id: string;
  taskId: string;
  status: string;
  imageUrl?: string;
  error?: string;
  timestamp: number;
  prompt?: string;
  aspectRatio?: string;
  resolution?: string;
}

/**
 * Fetch complete history from kie.ai/logs page
 * This page shows all image generation history for the user
 */
export async function fetchCompleteLogsFromKie(
  apiKey: string,
): Promise<KieLogEntry[]> {
  try {
    console.log("[Logs Scraper] Fetching complete history from kie.ai/logs");
    console.log("[Logs Scraper] API Key:", apiKey.substring(0, 10) + "...");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch("https://kie.ai/logs", {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        Authorization: `Bearer ${apiKey}`,
        Cookie: `api_key=${apiKey}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log("[Logs Scraper] HTTP Status:", response.status);

    if (response.status === 401 || response.status === 403) {
      console.error("[Logs Scraper] Invalid API key or unauthorized");
      return [];
    }

    if (!response.ok) {
      console.error("[Logs Scraper] HTTP Error:", response.status);
      return [];
    }

    const html = await response.text();
    console.log("[Logs Scraper] HTML length:", html.length);

    // Parse logs from HTML
    const logs = parseLogsFromHtml(html);
    console.log("[Logs Scraper] Found", logs.length, "entries");

    return logs;
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("[Logs Scraper] Request timeout");
    } else {
      console.error("[Logs Scraper] Error:", error.message);
    }
    return [];
  }
}

/**
 * Parse log entries from HTML page
 * kie.ai/logs is a Next.js app, so we need to look for data in script tags
 */
function parseLogsFromHtml(html: string): KieLogEntry[] {
  const logs: KieLogEntry[] = [];

  // Try to find Next.js data in __NEXT_DATA__ or window.__data__
  try {
    // Look for __NEXT_DATA__ JSON block
    const nextDataMatch = html.match(/__NEXT_DATA__\s*=\s*({[\s\S]*?})<\/script>/);
    if (nextDataMatch) {
      console.log("[Logs Scraper] Found __NEXT_DATA__ block");
      try {
        const nextData = JSON.parse(nextDataMatch[1]);

        // Navigate through Next.js props structure
        const props = nextData?.props?.pageProps;

        if (props && props.logs && Array.isArray(props.logs)) {
          console.log(
            "[Logs Scraper] Found logs in pageProps.logs:",
            props.logs.length,
          );
          return parseLogEntries(props.logs);
        }

        if (props && props.tasks && Array.isArray(props.tasks)) {
          console.log(
            "[Logs Scraper] Found tasks in pageProps.tasks:",
            props.tasks.length,
          );
          return parseLogEntries(props.tasks);
        }

        if (props && props.history && Array.isArray(props.history)) {
          console.log(
            "[Logs Scraper] Found history in pageProps.history:",
            props.history.length,
          );
          return parseLogEntries(props.history);
        }

        // Try to find any array that might contain logs
        const allKeys = JSON.stringify(nextData);
        if (allKeys.includes("taskId") || allKeys.includes("imageUrl")) {
          console.log("[Logs Scraper] Found references to taskId/imageUrl in nextData");

          // Recursively search for arrays with log-like structure
          const foundLogs = findLogsInObject(nextData);
          if (foundLogs.length > 0) {
            console.log("[Logs Scraper] Found logs via recursive search:", foundLogs.length);
            return parseLogEntries(foundLogs);
          }
        }
      } catch (e) {
        console.error("[Logs Scraper] Error parsing __NEXT_DATA__:", e);
      }
    }

    // Try alternative data locations
    const logsDataMatch = html.match(/window\.__LOGS__\s*=\s*({[\s\S]*?});/);
    if (logsDataMatch) {
      console.log("[Logs Scraper] Found window.__LOGS__ block");
      const logsData = JSON.parse(logsDataMatch[1]);
      if (Array.isArray(logsData)) {
        return parseLogEntries(logsData);
      }
    }

    // Try to find data in meta tags or data attributes
    const dataScriptMatch = html.match(
      /<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/,
    );
    if (dataScriptMatch) {
      console.log("[Logs Scraper] Found JSON script tag");
      const data = JSON.parse(dataScriptMatch[1]);
      if (Array.isArray(data)) {
        return parseLogEntries(data);
      }
      if (data.logs && Array.isArray(data.logs)) {
        return parseLogEntries(data.logs);
      }
    }

    // HTML fallback: Try to parse image elements from DOM
    console.log("[Logs Scraper] Trying HTML DOM parsing fallback");
    return parseLogsFromDOM(html);
  } catch (error) {
    console.error("[Logs Scraper] Error in parseLogsFromHtml:", error);
    return [];
  }
}

/**
 * Recursively search for arrays in an object that might contain logs
 */
function findLogsInObject(obj: any, depth = 0): any[] {
  if (depth > 5) return []; // Prevent infinite recursion

  if (Array.isArray(obj) && obj.length > 0) {
    const first = obj[0];
    if (
      typeof first === "object" &&
      (first.taskId ||
        first.imageUrl ||
        first.prompt ||
        first.status ||
        first.id)
    ) {
      return obj;
    }
  }

  if (typeof obj === "object" && obj !== null) {
    for (const key of Object.keys(obj)) {
      const result = findLogsInObject(obj[key], depth + 1);
      if (result.length > 0) {
        return result;
      }
    }
  }

  return [];
}

/**
 * Parse individual log entries from array
 */
function parseLogEntries(entries: any[]): KieLogEntry[] {
  return entries
    .map((entry) => {
      try {
        // Handle different possible data structures
        const id = entry.id || entry.taskId || entry.task_id || Math.random().toString();
        const timestamp =
          entry.timestamp ||
          entry.created_at ||
          entry.createdAt ||
          entry.time ||
          Date.now();

        // Ensure timestamp is a number (milliseconds)
        const numTimestamp =
          typeof timestamp === "string" ? new Date(timestamp).getTime() : timestamp;

        // Get image URL from various possible paths
        let imageUrl: string | undefined;
        if (typeof entry.imageUrl === "string") {
          imageUrl = entry.imageUrl;
        } else if (typeof entry.image_url === "string") {
          imageUrl = entry.image_url;
        } else if (entry.resultUrls && Array.isArray(entry.resultUrls)) {
          imageUrl = entry.resultUrls[0];
        } else if (entry.result_urls && Array.isArray(entry.result_urls)) {
          imageUrl = entry.result_urls[0];
        } else if (entry.output && typeof entry.output === "string") {
          imageUrl = entry.output;
        } else if (
          entry.result &&
          typeof entry.result === "object" &&
          entry.result.imageUrl
        ) {
          imageUrl = entry.result.imageUrl;
        }

        // Get status
        const status = entry.status || entry.state || "unknown";

        // Get error message if failed
        let error: string | undefined;
        if (status === "fail" || status === "failed" || status === "error") {
          error =
            entry.error ||
            entry.failMsg ||
            entry.fail_msg ||
            entry.message ||
            "Generation failed";
        }

        // Get prompt
        const prompt =
          entry.prompt ||
          entry.input?.prompt ||
          entry.inputs?.prompt ||
          entry.description ||
          entry.text;

        // Get aspect ratio
        const aspectRatio =
          entry.aspectRatio ||
          entry.aspect_ratio ||
          entry.input?.aspect_ratio ||
          entry.inputs?.aspect_ratio;

        // Get resolution/quality
        const resolution =
          entry.resolution ||
          entry.quality ||
          entry.input?.resolution ||
          entry.inputs?.resolution;

        return {
          id,
          taskId: String(id),
          status: String(status),
          imageUrl,
          error,
          timestamp: numTimestamp,
          prompt,
          aspectRatio,
          resolution,
        };
      } catch (e) {
        console.error("[Logs Scraper] Error parsing entry:", e);
        return null;
      }
    })
    .filter((entry): entry is KieLogEntry => entry !== null);
}

/**
 * Fallback: Parse logs from DOM structure (if data is embedded as HTML elements)
 */
function parseLogsFromDOM(html: string): KieLogEntry[] {
  const logs: KieLogEntry[] = [];

  // Look for image elements that might represent logs
  const imageRegex = /<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/g;
  let match;

  while ((match = imageRegex.exec(html)) !== null) {
    const imageUrl = match[1];
    const alt = match[2];

    // Skip if it's a logo or icon
    if (
      imageUrl.includes("logo") ||
      imageUrl.includes("icon") ||
      alt.includes("logo")
    ) {
      continue;
    }

    // Try to extract prompt from surrounding text
    const start = Math.max(0, match.index - 500);
    const end = Math.min(html.length, match.index + 500);
    const context = html.substring(start, end);

    // Simple heuristic: look for text content nearby
    const promptMatch = context.match(/>([^<]{10,200})</);
    const prompt = promptMatch ? promptMatch[1].trim() : "Image";

    logs.push({
      id: `log-${logs.length}`,
      taskId: `task-${logs.length}`,
      status: "success",
      imageUrl,
      timestamp: Date.now() - logs.length * 60000, // Subtract time for each entry
      prompt,
    });
  }

  return logs;
}
