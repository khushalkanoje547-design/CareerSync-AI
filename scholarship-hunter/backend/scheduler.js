// backend/scheduler.js
// Step 7: runs the scraper pipeline automatically once a day.
// This is a SEPARATE process from server.js — start it with `node scheduler.js`
// in its own terminal, alongside (not instead of) `npm run dev`.
 
require('dotenv').config();
const cron = require('node-cron');
const { execFile } = require('child_process');
const path = require('path');
 
function runScript(relativePath, label) {
  return new Promise((resolve) => {
    const fullPath = path.join(__dirname, relativePath);
    console.log(`[${new Date().toISOString()}] Starting: ${label}`);
 
    execFile('node', [fullPath], (err, stdout, stderr) => {
      if (stdout) console.log(stdout.trim());
      if (stderr) console.error(stderr.trim());
      if (err) {
        console.error(`[${new Date().toISOString()}] ${label} failed:`, err.message);
      } else {
        console.log(`[${new Date().toISOString()}] Finished: ${label}`);
      }
      resolve(); // always resolve — one failed run shouldn't crash the scheduler
    });
  });
}
 
async function runScraperPipeline() {
  console.log(`\n========== Scraper pipeline run: ${new Date().toISOString()} ==========`);
  await runScript('scrapers/devfolio.js', 'Devfolio scraper');
  await runScript('scrapers/promote.js', 'Promote staged opportunities');
  console.log('========== Pipeline run complete ==========\n');
}
 
// Runs once a day at 3:00 AM server time — low-traffic hours, and well
// clear of any daytime testing/demo sessions.
cron.schedule('0 3 * * *', runScraperPipeline);
 
console.log('Scheduler started. Scraper pipeline will run daily at 3:00 AM.');
console.log('(This process must stay running for the schedule to fire — leave this terminal open.)');
 
// Uncomment the line below to run the pipeline once immediately on startup,
// useful for testing the scheduler itself without waiting for 3 AM:
// runScraperPipeline();
 