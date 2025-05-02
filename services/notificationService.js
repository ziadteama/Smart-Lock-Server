// services/notificationService.js

export const logEvent = async (userId, message) => {
    console.log(`[${new Date().toISOString()}] User ${userId}: ${message}`);
    // Optionally write to DB or emit socket/event
  };
  