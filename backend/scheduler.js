import cron from 'node-cron';
import { checkOverdueTasks } from './services/notificationService.js';

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running overdue tasks check...');
  await checkOverdueTasks();
});

// Also run when the server starts
checkOverdueTasks().catch(console.error); 