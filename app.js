import { app, errorHandler } from 'mu';
import { CronJob } from 'cron';
import { CRON_JOB_PATTERN } from './config';
import {
  STATUS_BUSY,
  STATUS_SUCCESS,
  STATUS_FAILED
} from './constants';
import {
  createJob,
  createTask,
  updateStatus,
  getFailedDownloads,
  createWarningEmail,
  addError
} from './queries';

app.get('/', function( req, res ) {
  res.send('Hello from download-url-warning :)');
} );

checkRequiredEnv();

// Cron jobs

new CronJob(CRON_JOB_PATTERN, async function() {
  const now = new Date().toISOString();
  console.log(`Check failed downloads triggered by cron job at ${now}`);
  try {
    await checkFailedDownloads();
  } catch (err) {
    console.log(`An error occurred during checking failed downloads at ${now}: ${err}`)
  }
}, null, true, "Europe/Brussels");

// Internal logic

function checkRequiredEnv() {
  if (!process.env.EMAIL_FROM || !process.env.EMAIL_TO) {
    throw new Error(
      "For this service to work the environment variables EMAIL_FROM and EMAIL_TO should be configured.\n");
  }
}

/**
 * Checks if some URL download have failed
 */
async function checkFailedDownloads() {
  const jobUri = await createJob();
  const taskUri = await createTask(jobUri);
  try {
    await updateStatus(jobUri, STATUS_BUSY);
    await updateStatus(taskUri, STATUS_BUSY);

    const failedDownloads = await getFailedDownloads(); 

    console.log(`${failedDownloads.length} failed url downloads to process.`);
    if (failedDownloads.length) {
      await createWarningEmail(taskUri, failedDownloads);
    }

    await updateStatus(jobUri, STATUS_SUCCESS);
    await updateStatus(taskUri, STATUS_SUCCESS);
  } catch (err) {
    console.log(`An error occurred when checking messages: ${err}`);
    await addError(jobUri, err);
    await updateStatus(jobUri, STATUS_FAILED);
    await updateStatus(taskUri, STATUS_FAILED);
  }
}

app.use(errorHandler);
