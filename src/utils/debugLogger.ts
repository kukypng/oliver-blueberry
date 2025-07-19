/**
 * Debug logger utility for production environment
 * Only logs when in development mode
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const debugLog = (message: string, ...args: any[]) => {
  if (isDevelopment) {
    console.log(`[DEBUG] ${message}`, ...args);
  }
};

export const debugError = (message: string, error?: any) => {
  if (isDevelopment) {
    console.error(`[DEBUG ERROR] ${message}`, error);
  }
};

export const debugWarn = (message: string, ...args: any[]) => {
  if (isDevelopment) {
    console.warn(`[DEBUG WARN] ${message}`, ...args);
  }
};

export const debugInfo = (message: string, ...args: any[]) => {
  if (isDevelopment) {
    console.info(`[DEBUG INFO] ${message}`, ...args);
  }
};