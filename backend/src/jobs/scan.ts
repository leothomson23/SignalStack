import cron from 'node-cron';
import { scanDueAssets } from '../services/scanner';

let scanJob: cron.ScheduledTask | null = null;

/**
 * Start the background asset scanning job.
 * Runs every 30 minutes to check for assets that need re-scanning.
 */
export function startScanJob(): void {
  if (scanJob) {
    console.log('[ScanJob] Job already running, skipping duplicate start');
    return;
  }

  console.log('[ScanJob] Starting background scan scheduler (every 30 minutes)');

  scanJob = cron.schedule('*/30 * * * *', async () => {
    console.log('[ScanJob] Running scheduled scan cycle...');
    try {
      await scanDueAssets();
      console.log('[ScanJob] Scan cycle completed');
    } catch (err) {
      console.error('[ScanJob] Scan cycle failed:', err);
    }
  });

  // Run an initial scan 10 seconds after startup
  setTimeout(async () => {
    console.log('[ScanJob] Running initial scan on startup...');
    try {
      await scanDueAssets();
    } catch (err) {
      console.error('[ScanJob] Initial scan failed:', err);
    }
  }, 10000);
}

/**
 * Stop the background scan job (for graceful shutdown)
 */
export function stopScanJob(): void {
  if (scanJob) {
    scanJob.stop();
    scanJob = null;
    console.log('[ScanJob] Background scan job stopped');
  }
}
