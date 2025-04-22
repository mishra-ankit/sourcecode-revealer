import puppeteer from "puppeteer";

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

    // Block unnecessary resources to improve performance
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (["image", "stylesheet", "font"].includes(req.resourceType())) {
        req.abort();
      } else {
        requests.push({
          url: req.url(),
          method: req.method(),
          headers: req.headers(),
        });
        req.continue();
      }
    });

    await page.goto(url, { waitUntil: "domcontentloaded" });

    return createJsonResponse({ requests });
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
