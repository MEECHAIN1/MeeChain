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

  /**
   * Performs a "Ritual Stamp" for systematic telemetry.
   */
  ritual: (ritualName: string, success: boolean, data?: any) => {
    const status = success ? 'MANIFESTED' : 'DISRUPTED';
    const msg = `[RITUAL] ${ritualName}: ${status}`;
    
    const enrichedData = {
      timestamp: Date.now(),
      protocolVersion: '5.0.0',
      ...data
    };

    console.log(`%c${msg}`, 'color: #f59e0b; font-weight: bold', enrichedData);
    
    if (window.Rollbar) {
      if (success) {
        window.Rollbar.info(msg, enrichedData);
      } else {
        window.Rollbar.warning(msg, enrichedData);
      }
    }
  },

  /**
   * Specialized logging for AI Oracle Prophecies.
   */
  prophecy: (query: string, data: { response: string, sources: any[], [key: string]: any }) => {
    const msg = `[PROPHECY] Manifested response for: "${query.slice(0, 50)}..."`;
    
    console.log(`%c${msg}`, 'color: #818cf8; font-weight: bold', data);
    
    if (window.Rollbar) {
      window.Rollbar.info(msg, {
        query,
        ...data,
        timestamp: Date.now()
      });
    }
  }
};