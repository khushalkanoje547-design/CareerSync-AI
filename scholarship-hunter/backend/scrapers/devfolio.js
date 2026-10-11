// backend/scrapers/devfolio.js
// Step 4: writes scraped hackathons into the RawOpportunity staging
// collection (not the live Opportunity collection — Step 5 handles
// promoting clean, de-duplicated records into that).
//
// Run with: node scrapers/devfolio.js
 
require('dotenv').config();
const mongoose = require('mongoose');
const puppeteer = require('puppeteer');
const RawOpportunity = require('../models/RawOpportunity');
 
const EXCLUDED_SUBDOMAINS = ['guide', 'status', 'assets', 'cdn', 'www', 'blog', 'help', 'api', 'support'];
 
function extractSubdomain(url) {
  const match = url.match(/^https:\/\/([a-z0-9-]+)\.devfolio\.co\/?$/i);
  return match ? match[1].toLowerCase() : null;
}
 
function parseDateText(text) {
  const match = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{2})/);
  if (!match) return null;
  const [, day, month, year] = match;
  return new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day));
}
 
async function scrapeDevfolioHackathons() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
 
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );
 
  console.log('Opening devfolio.co/hackathons...');
  await page.goto('https://devfolio.co/hackathons', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForSelector('a[href*=".devfolio.co/"]', { timeout: 10000 }).catch(() => {});
 
  const rawResults = await page.evaluate(() => {
    const hackathonLinkPattern = /^https:\/\/[a-z0-9-]+\.devfolio\.co\/?$/i;
    const allLinks = Array.from(document.querySelectorAll('a[href]'));
    const seen = new Set();
    const links = [];
 
    allLinks.forEach(link => {
      if (hackathonLinkPattern.test(link.href) && link.textContent.trim() && !seen.has(link.href)) {
        seen.add(link.href);
        links.push({ title: link.textContent.trim(), url: link.href });
      }
    });
 
    const fullText = document.body.innerText;
    return { links, fullText };
  });
 
  await browser.close();
 
  const { links, fullText } = rawResults;
 
  const cards = links.map((link, i) => {
    const startIdx = fullText.indexOf(link.title);
    const nextLink = links[i + 1];
    const endIdx = nextLink ? fullText.indexOf(nextLink.title, startIdx + link.title.length) : fullText.length;
    const cardText = startIdx >= 0 ? fullText.slice(startIdx, endIdx > startIdx ? endIdx : undefined) : '';
    return { ...link, cardText };
  });
 
  const openHackathons = [];
 
  cards.forEach(card => {
    const subdomain = extractSubdomain(card.url);
    if (!subdomain || EXCLUDED_SUBDOMAINS.includes(subdomain)) return;
 
    const isApplyNow = /apply now/i.test(card.cardText);
    if (!isApplyNow) return;
 
    const deadline = parseDateText(card.cardText);
    if (!deadline) return;
 
    const mode = /\bonline\b/i.test(card.cardText) ? 'Online' : (/\boffline\b/i.test(card.cardText) ? 'Offline' : 'any');
 
    openHackathons.push({
      source: 'devfolio',
      title: card.title,
      type: 'hackathon',
      eligibleBranches: ['any'],
      eligibleYears: [1, 2, 3, 4],
      eligibleCategories: ['any'],
      location: mode === 'Online' ? 'any' : mode,
      deadline,
      link: card.url,
      description: `${mode} hackathon on Devfolio. Scraped automatically — verify exact eligibility and deadline on the official page.`
    });
  });
 
  return openHackathons;
}
 
async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected.');
 
  const hackathons = await scrapeDevfolioHackathons();
  console.log(`Scraped ${hackathons.length} open hackathons with confirmed dates.`);
 
  let inserted = 0;
  let skipped = 0;
 
  for (const h of hackathons) {
    // Avoid piling up duplicate staging rows if this scraper runs more than
    // once before Step 5's cleanup has promoted/cleared them.
    const alreadyStaged = await RawOpportunity.findOne({ link: h.link, promoted: false });
    if (alreadyStaged) {
      skipped++;
      continue;
    }
    await RawOpportunity.create(h);
    inserted++;
  }
 
  console.log(`${inserted} new records staged, ${skipped} already staged (skipped).`);
 
  await mongoose.disconnect();
}
 
run().catch(err => {
  console.error('Scraper failed:', err.message);
  process.exit(1);
});
 