// backend/scrapers/devfolio.js
// Step 2: Test scraper — extracts "Open" hackathons from Devfolio and prints
// them to the console. No database writes yet; this is just to confirm we
// can reliably pull the right data out of the page's real HTML structure.
//
// Run with: node scrapers/devfolio.js
 
const puppeteer = require('puppeteer');
 
async function scrapeDevfolioHackathons() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
 
  console.log('Opening devfolio.co/hackathons...');
  await page.goto('https://devfolio.co/hackathons', { waitUntil: 'networkidle2' });
 
  // Give the page's JS a moment to finish rendering the hackathon cards.
  await new Promise(resolve => setTimeout(resolve, 2000));
 
  const hackathons = await page.evaluate(() => {
    // Each hackathon card is an <h3> with a link inside, followed by its
    // details further down in the same card container. We select every
    // heading link under the hackathons list and walk up to its card.
    const results = [];
    const headingLinks = document.querySelectorAll('h3 a[href*="devfolio.co"]');
 
    headingLinks.forEach(link => {
      const title = link.textContent.trim();
      const url = link.href;
 
      // The card is the closest ancestor that also contains the
      // "Open" / "Upcoming" / "Ended" status text.
      const card = link.closest('article, div');
      const cardText = card ? card.innerText : '';
 
      results.push({ title, url, cardText });
    });
 
    return results;
  });
 
  await browser.close();
 
  console.log(`Found ${hackathons.length} hackathon cards.\n`);
  hackathons.forEach((h, i) => {
    console.log(`--- ${i + 1} ---`);
    console.log('Title:', h.title);
    console.log('URL:', h.url);
    console.log('Raw card text:', h.cardText.slice(0, 200).replace(/\n/g, ' | '));
    console.log('');
  });
}
 
scrapeDevfolioHackathons().catch(err => {
  console.error('Scraper failed:', err.message);
});
 