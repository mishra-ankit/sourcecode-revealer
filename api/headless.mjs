import puppeteer from "puppeteer";

export async function GET(request) {
  let browser;
  try {
    const url = new URL(request.url).searchParams.get("url");
    if (!url) {
      return new Response(JSON.stringify({ error: "URL is required" }), { status: 400 });
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

    page.on("request", (req) => {
      requests.push({
        url: req.url(),
        method: req.method(),
        headers: req.headers(),
      });
    });

    await page.goto(url);

    return new Response(JSON.stringify({ requests }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to process the request." + error }), { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
