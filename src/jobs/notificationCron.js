import cron from "node-cron";
import { createPendingExpiryWarnings } from "../services/notification.service.js";

let expiryWarningJobStarted = false;

export const startNotificationCronJobs = () => {
    if (expiryWarningJobStarted) return;
    expiryWarningJobStarted = true;

    cron.schedule("*/5 * * * *", async () => {
        try {
            const result = await createPendingExpiryWarnings();
            if (result.createdCount > 0) {
                console.log(
                    `[NotificationCron] Created ${result.createdCount} expiry warning notification(s).`
                );
            }
        } catch (error) {
            console.error("[NotificationCron] Failed to create expiry warnings:", error.message);
        }
    });
};
