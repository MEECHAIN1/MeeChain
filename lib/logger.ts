
/**
 * MeeChain MeeBot Centralized Logger
 * Interfaces with Rollbar for systematic error tracking and monitoring.
 */

declare global {
  interface Window {
    Rollbar: any;
  }
}

export const logger = {
  info: (message: string, data?: any) => {
    console.info(`[MEEBOT-INFO] ${message}`, data);
    if (window.Rollbar) {
      window.Rollbar.info(message, data);
    }
  },

  warn: (message: string, data?: any) => {
    console.warn(`[MEEBOT-WARN] ${message}`, data);
    if (window.Rollbar) {
      window.Rollbar.warning(message, data);
    }
  },

  error: (message: string, error?: any) => {
    console.error(`[MEEBOT-ERROR] ${message}`, error);
    if (window.Rollbar) {
      window.Rollbar.error(message, error);
    }
  },

  critical: (message: string, error?: any) => {
    console.error(`[MEEBOT-CRITICAL] ${message}`, error);
    if (window.Rollbar) {
      window.Rollbar.critical(message, error);
    }
  },

  ritual: (ritualName: string, success: boolean, data?: any) => {
    const status = success ? 'SUCCESS' : 'FAILED';
    const msg = `Ritual ${ritualName} performed: ${status}`;
    console.log(`[RITUAL] ${msg}`, data);
    if (window.Rollbar) {
      window.Rollbar.info(msg, { ritual: ritualName, success, ...data });
    }
  }
};
