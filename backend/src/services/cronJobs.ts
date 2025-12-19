/**
 * Cron Job Scheduler
 * 
 * Schedules and runs background jobs for the application
 * Currently includes:
 * - Daily reminder job (runs at 8:00 AM UTC)
 * - Overdue check job (runs every 4 hours)
 */

import cron from 'node-cron';
import ReminderService from '../services/reminderService';

// Track if jobs are running to prevent overlaps
let isReminderJobRunning = false;
let isOverdueJobRunning = false;

/**
 * Daily Reminder Job
 * Runs every day at 8:00 AM UTC
 * Processes all active reminder rules and sends notifications
 */
const dailyReminderJob = cron.schedule('0 8 * * *', async () => {
    if (isReminderJobRunning) {
        console.log('[Cron] Daily reminder job already running, skipping...');
        return;
    }

    isReminderJobRunning = true;
    console.log('[Cron] Starting daily reminder job at', new Date().toISOString());

    try {
        const results = await ReminderService.runDailyReminderJob();
        console.log('[Cron] Daily reminder job completed:', results);
    } catch (error) {
        console.error('[Cron] Daily reminder job failed:', error);
    } finally {
        isReminderJobRunning = false;
    }
}, {
    scheduled: false, // Don't start automatically, we'll start it manually
    timezone: 'UTC'
});

/**
 * Overdue Check Job
 * Runs every 4 hours
 * Checks for newly overdue tasks and sends escalations
 */
const overdueCheckJob = cron.schedule('0 */4 * * *', async () => {
    if (isOverdueJobRunning) {
        console.log('[Cron] Overdue check job already running, skipping...');
        return;
    }

    isOverdueJobRunning = true;
    console.log('[Cron] Starting overdue check at', new Date().toISOString());

    try {
        const results = await ReminderService.processOverdueTasks();
        console.log('[Cron] Overdue check completed:', results);
    } catch (error) {
        console.error('[Cron] Overdue check failed:', error);
    } finally {
        isOverdueJobRunning = false;
    }
}, {
    scheduled: false,
    timezone: 'UTC'
});

/**
 * Start all cron jobs
 */
export function startCronJobs() {
    console.log('[Cron] Starting cron job scheduler...');

    dailyReminderJob.start();
    console.log('[Cron] Daily reminder job scheduled (8:00 AM UTC)');

    overdueCheckJob.start();
    console.log('[Cron] Overdue check job scheduled (every 4 hours)');

    console.log('[Cron] All jobs started successfully');
}

/**
 * Stop all cron jobs
 */
export function stopCronJobs() {
    console.log('[Cron] Stopping all cron jobs...');
    dailyReminderJob.stop();
    overdueCheckJob.stop();
    console.log('[Cron] All jobs stopped');
}

/**
 * Manually run the daily reminder job (for testing)
 */
export async function runReminderJobNow() {
    if (isReminderJobRunning) {
        throw new Error('Job is already running');
    }

    isReminderJobRunning = true;
    try {
        return await ReminderService.runDailyReminderJob();
    } finally {
        isReminderJobRunning = false;
    }
}

/**
 * Manually run the overdue check (for testing)
 */
export async function runOverdueCheckNow() {
    if (isOverdueJobRunning) {
        throw new Error('Job is already running');
    }

    isOverdueJobRunning = true;
    try {
        return await ReminderService.processOverdueTasks();
    } finally {
        isOverdueJobRunning = false;
    }
}

export default {
    startCronJobs,
    stopCronJobs,
    runReminderJobNow,
    runOverdueCheckNow
};
