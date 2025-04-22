import puppeteer from "puppeteer";
import fetch from "node-fetch"; // Import node-fetch for HTTP requests

export async function GET(request) {
  let browser;
  try {
    const url = new URL(request.url).searchParams.get("url");
    if (!url) {
      return createJsonResponse({ error: "URL is required" }, 400);
    }

    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
      ],
    });

    const page = await browser.newPage();
    const requests = [];
    const jsFiles = [];
    // const responseHeaders = [];
    const sourceMaps = [];

    // Block unnecessary resources to improve performance
    // await page.setRequestInterception(true);
    page.on("request", (req) => {
        requests.push({
          url: req.url(),
          method: req.method(),
          headers: req.headers(),
        });
    });

    page.on("response", async (res) => {
      const url = res.url();
      // const headers = res.headers();
      // responseHeaders.push({ url, headers });

      if (url.endsWith(".js")) {
        jsFiles.push(url);

        // Attempt to fetch .map file if available using node-fetch
        const mapUrl = url + ".map";
        try {
          const mapResponse = await fetch(mapUrl);
          if (mapResponse.ok) {
            const mapContent = await mapResponse.text();
            sourceMaps.push({ url: mapUrl, content: mapContent });
          } else {
            console.log("Map file not found:", mapUrl);
          }
        } catch (error) {
          console.error("Error fetching map file:", mapUrl, error);
        }
      }
    });

    await page.goto(url, { waitUntil: "networkidle2" });
    const htmlContent = await page.content();

    return createJsonResponse({
      requests,
      jsFiles,
      htmlContent,
      // responseHeaders,
      sourceMaps, // Include source map content in the response
    });
  } catch (error) {
    return createJsonResponse({ error: "Failed to process the request." + error }, 500);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

function createJsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
