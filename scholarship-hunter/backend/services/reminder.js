// backend/scheduler.js
// Step 7: runs the scraper pipeline automatically once a day.
// This is a SEPARATE process from server.js — start it with `node scheduler.js`
// in its own terminal, alongside (not instead of) `npm run dev`.
 
require('dotenv').config();
const cron = require('node-cron');
const mongoose = require('mongoose');
const { execFile } = require('child_process');
const path = require('path');
const { sendDeadlineReminders } = require('./services/reminder');
 
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
 
// Reminders need their own DB connection since, unlike the scraper scripts
// (which run as separate processes and manage their own connect/disconnect),
// this runs in-process inside the scheduler itself.
async function runReminderJob() {
  console.log(`\n========== Reminder job run: ${new Date().toISOString()} ==========`);
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await sendDeadlineReminders();
  } catch (err) {
    console.error('Reminder job failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
  console.log('========== Reminder job complete ==========\n');
}
 
// Scraper pipeline: once a day at 3:00 AM.
cron.schedule('0 3 * * *', runScraperPipeline);
 
// Reminder job: once a day at 8:00 AM — after the scraper run, and at a
// reasonable hour for a student to actually see the email.
cron.schedule('0 8 * * *', runReminderJob);
 
console.log('Scheduler started.');
console.log('Scraper pipeline runs daily at 3:00 AM. Deadline reminders run daily at 8:00 AM.');
console.log('(This process must stay running for the schedules to fire — leave this terminal open.)');
 
// Uncomment either line below to test immediately on startup, without
// waiting for the actual scheduled time:
// runScraperPipeline();
// runReminderJob();
 