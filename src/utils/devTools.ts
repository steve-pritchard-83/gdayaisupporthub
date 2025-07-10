// Development and debugging utilities for vibe coding

import { DEBUG } from './constants';

/**
 * Enhanced console logging with levels and timestamps
 */
export const logger = {
  debug: (...args: any[]) => {
    if (DEBUG.enabled) {
      console.debug(`[${new Date().toLocaleTimeString()}] [DEBUG]`, ...args);
    }
  },
  
  info: (...args: any[]) => {
    if (DEBUG.enabled) {
      console.info(`[${new Date().toLocaleTimeString()}] [INFO]`, ...args);
    }
  },
  
  warn: (...args: any[]) => {
    console.warn(`[${new Date().toLocaleTimeString()}] [WARN]`, ...args);
  },
  
  error: (...args: any[]) => {
    console.error(`[${new Date().toLocaleTimeString()}] [ERROR]`, ...args);
  },
  
  group: (label: string, fn: () => void) => {
    if (DEBUG.enabled) {
      console.group(label);
      fn();
      console.groupEnd();
    }
  }
};

/**
 * Performance monitoring for React components
 */
export const perf = {
  mark: (name: string) => {
    if (DEBUG.performance_monitoring && performance.mark) {
      performance.mark(name);
    }
  },
  
  measure: (name: string, startMark: string, endMark?: string) => {
    if (DEBUG.performance_monitoring && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
        const measures = performance.getEntriesByName(name, 'measure');
        const latestMeasure = measures[measures.length - 1];
        logger.debug(`Performance: ${name} took ${latestMeasure.duration.toFixed(2)}ms`);
      } catch (error) {
        logger.warn('Performance measurement failed:', error);
      }
    }
  },
  
  time: <T>(label: string, fn: () => T): T => {
    if (DEBUG.performance_monitoring) {
      const start = performance.now();
      const result = fn();
      const end = performance.now();
      logger.debug(`${label} took ${(end - start).toFixed(2)}ms`);
      return result;
    }
    return fn();
  },
  
  timeAsync: async <T>(label: string, fn: () => Promise<T>): Promise<T> => {
    if (DEBUG.performance_monitoring) {
      const start = performance.now();
      const result = await fn();
      const end = performance.now();
      logger.debug(`${label} took ${(end - start).toFixed(2)}ms`);
      return result;
    }
    return await fn();
  }
};

/**
 * Storage debugging utilities
 */
export const storageDebug = {
  inspect: () => {
    if (!DEBUG.enabled) return;
    
    logger.group('Local Storage Contents', () => {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('gdayai_')) {
          try {
            const value = JSON.parse(localStorage.getItem(key) || '');
            logger.debug(`${key}:`, value);
          } catch (error) {
            logger.debug(`${key}:`, localStorage.getItem(key));
          }
        }
      });
    });
  },
  
  clear: (confirm = true) => {
    if (!DEBUG.enabled) return;
    
    if (confirm && !window.confirm('Clear all application data?')) {
      return;
    }
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('gdayai_')) {
        localStorage.removeItem(key);
      }
    });
    
    logger.info('Application data cleared');
    window.location.reload();
  },
  
  export: () => {
    if (!DEBUG.enabled) return;
    
    const data: Record<string, any> = {};
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('gdayai_')) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    });
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gdayai-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
};

/**
 * Component debugging helpers
 */
export const componentDebug = {
  logRender: (componentName: string, props?: any, state?: any) => {
    if (DEBUG.enabled) {
      logger.group(`🔄 ${componentName} rendered`, () => {
        if (props) logger.debug('Props:', props);
        if (state) logger.debug('State:', state);
      });
    }
  },
  
  logEffect: (componentName: string, effectName: string, dependencies?: any[]) => {
    if (DEBUG.enabled) {
      logger.debug(`⚡ ${componentName} - ${effectName}`, dependencies ? { deps: dependencies } : '');
    }
  },
  
  highlightElement: (element: HTMLElement, color = '#ff0000', duration = 2000) => {
    if (!DEBUG.enabled) return;
    
    const originalBorder = element.style.border;
    element.style.border = `2px solid ${color}`;
    element.style.transition = 'border 0.3s ease';
    
    setTimeout(() => {
      element.style.border = originalBorder;
    }, duration);
  }
};

/**
 * Feature flags for rapid development
 */
export const featureFlags = {
  get: (flag: string, defaultValue = false): boolean => {
    if (!DEBUG.enabled) return defaultValue;
    
    const stored = localStorage.getItem(`gdayai_feature_${flag}`);
    return stored ? JSON.parse(stored) : defaultValue;
  },
  
  set: (flag: string, value: boolean) => {
    if (!DEBUG.enabled) return;
    
    localStorage.setItem(`gdayai_feature_${flag}`, JSON.stringify(value));
    logger.info(`Feature flag '${flag}' set to:`, value);
  },
  
  list: () => {
    if (!DEBUG.enabled) return {};
    
    const flags: Record<string, boolean> = {};
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('gdayai_feature_')) {
        const flagName = key.replace('gdayai_feature_', '');
        flags[flagName] = JSON.parse(localStorage.getItem(key) || 'false');
      }
    });
    
    return flags;
  }
};

/**
 * Make dev tools available globally in development
 */
if (DEBUG.enabled && typeof window !== 'undefined') {
  (window as any).gdayaiDevTools = {
    logger,
    perf,
    storage: storageDebug,
    component: componentDebug,
    features: featureFlags
  };
  
  logger.info('🛠️ Dev tools available globally as window.gdayaiDevTools');
} 