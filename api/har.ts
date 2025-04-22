import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import PuppeteerHar from 'puppeteer-har';

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    const har = new PuppeteerHar(page);
    await har.start();
    await page.goto(url, { waitUntil: 'networkidle0' });
    const harData = await har.stop();

    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(harData));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate HAR' });
  } finally {
    if (browser) await browser.close();
  }
}
