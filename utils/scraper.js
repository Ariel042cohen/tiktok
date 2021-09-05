(async function () {

  const fs = require('fs');
  // puppeteer-extra is a drop-in replacement for puppeteer,
  // it augments the installed puppeteer with plugin functionality const puppeteer = require('puppeteer-extra')
  const puppeteer = require('puppeteer-extra')

  // // add stealth plugin and use defaults (all evasion techniques)
  const StealthPlugin = require('puppeteer-extra-plugin-stealth')
  puppeteer.use(StealthPlugin())

  // const puppeteer = require('puppeteer');

  const args = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-infobars',
    '--window-position=0,0',
    '--ignore-certifcate-errors',
    '--ignore-certifcate-errors-spki-list',
    '--user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36"',
    '--lang=he-en-US,en'
  ];

  const options = {
    args,
    headless: true,
    ignoreHTTPSErrors: true,
    userDataDir: './tmp'
  };

  const browser = await puppeteer.launch(options);

  const scrapeMedium = async (username) => {
    var result = "";
    const page = await browser.newPage();
    const preloadFile = fs.readFileSync('./preload.js', 'utf8');
    await page.evaluateOnNewDocument(preloadFile);
    await page.setRequestInterception(true);
    scrape(page).then((link) => result = link);

    await page.goto('https://www.tiktok.com/@' + username, {
      waitUntil: 'networkidle0',
    });

    await page.goto(result);
    var htmlJson = await page.content();
    await page.close()
    var start = htmlJson.indexOf('>{');
    var end = htmlJson.lastIndexOf('}<');
    var jsonString = htmlJson.substring(start + 1, end + 1);
    var result = JSON.parse(jsonString);

    return result;
  }

  const scrape = (page) => {
    let counter = 0;
    return new Promise((resolve, reject) => {
      page.on('request', request => {
        console.log(counter);
        const request_url = request.url();
        if (request_url.includes('/api/item_list')) {
          resolve(request_url);
        }

        request.continue();

        counter += 1;
      });
    });
  };

  module.exports.scrapeMedium = scrapeMedium
})();