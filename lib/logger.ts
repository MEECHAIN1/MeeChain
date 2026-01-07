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
   * @param ritualName - The name of the ritual (e.g., 'SUMMON', 'STAKE')
   * @param success - Whether the ritual reached manifestation
   * @param data - The Telemetry Context (Neural Data Packet)
   */
  ritual: (ritualName: string, success: boolean, data?: any) => {
    const status = success ? 'MANIFESTED' : 'DISRUPTED';
    const msg = `[RITUAL] ${ritualName}: ${status}`;
    
    // Enrich with standard telemetry if not present
    const enrichedData = {
      timestamp: Date.now(),
      protocolVersion: '4.2.0',
      ...data
    };

    console.log(`${msg}`, enrichedData);
    
    if (window.Rollbar) {
      if (success) {
        window.Rollbar.info(msg, enrichedData);
      } else {
        window.Rollbar.warning(msg, enrichedData);
      }
    }
  }
};