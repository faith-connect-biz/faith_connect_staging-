/**
 * Auto-save utility functions for form data persistence
 * Automatically saves user input to localStorage and restores on page reload
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { toast } from '@/hooks/use-toast';

// Configuration
const AUTO_SAVE_DELAY = 2000; // 2 seconds debounce
const AUTO_SAVE_PREFIX = 'autosave_';
const MAX_STORAGE_AGE = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface AutoSaveMetadata {
  timestamp: number;
  formId: string;
  version: string;
}

interface AutoSaveData<T = any> {
  data: T;
  metadata: AutoSaveMetadata;
}

/**
 * Generate storage key for auto-save data
 * @param formId - Unique identifier for the form
 * @param userId - Optional user ID for user-specific storage
 * @returns Storage key string
 */
export const getAutoSaveKey = (formId: string, userId?: string | number): string => {
  const userSuffix = userId ? `_${userId}` : '';
  return `${AUTO_SAVE_PREFIX}${formId}${userSuffix}`;
};

/**
 * Save form data to localStorage with metadata
 * @param formId - Unique identifier for the form
 * @param data - Form data to save
 * @param userId - Optional user ID
 * @param version - Optional version string for data compatibility
 */
export const saveFormData = <T>(
  formId: string, 
  data: T, 
  userId?: string | number, 
  version: string = '1.0'
): void => {
  try {
    const key = getAutoSaveKey(formId, userId);
    const autoSaveData: AutoSaveData<T> = {
      data,
      metadata: {
        timestamp: Date.now(),
        formId,
        version
      }
    };
    
    localStorage.setItem(key, JSON.stringify(autoSaveData));
    console.log(`Auto-saved form data for ${formId}`);
  } catch (error) {
    console.error('Error saving form data:', error);
    // If localStorage is full, try to clear old auto-save data
    clearOldAutoSaveData();
  }
};

/**
 * Load form data from localStorage
 * @param formId - Unique identifier for the form
 * @param userId - Optional user ID
 * @param maxAge - Maximum age in milliseconds (default: 24 hours)
 * @returns Saved form data or null if not found/expired
 */
export const loadFormData = <T>(
  formId: string, 
  userId?: string | number, 
  maxAge: number = MAX_STORAGE_AGE
): T | null => {
  try {
    const key = getAutoSaveKey(formId, userId);
    const savedData = localStorage.getItem(key);
    
    if (!savedData) return null;
    
    const autoSaveData: AutoSaveData<T> = JSON.parse(savedData);
    
    // Check if data is too old
    const age = Date.now() - autoSaveData.metadata.timestamp;
    if (age > maxAge) {
      localStorage.removeItem(key);
      return null;
    }
    
    console.log(`Loaded auto-saved form data for ${formId}`);
    return autoSaveData.data;
  } catch (error) {
    console.error('Error loading form data:', error);
    return null;
  }
};

/**
 * Clear saved form data
 * @param formId - Unique identifier for the form
 * @param userId - Optional user ID
 */
export const clearFormData = (formId: string, userId?: string | number): void => {
  try {
    const key = getAutoSaveKey(formId, userId);
    localStorage.removeItem(key);
    console.log(`Cleared auto-saved form data for ${formId}`);
  } catch (error) {
    console.error('Error clearing form data:', error);
  }
};

/**
 * Clear all old auto-save data (older than maxAge)
 * @param maxAge - Maximum age in milliseconds
 */
export const clearOldAutoSaveData = (maxAge: number = MAX_STORAGE_AGE): void => {
  try {
    const keysToRemove: string[] = [];
    const now = Date.now();
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(AUTO_SAVE_PREFIX)) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const autoSaveData: AutoSaveData = JSON.parse(data);
            const age = now - autoSaveData.metadata.timestamp;
            if (age > maxAge) {
              keysToRemove.push(key);
            }
          }
        } catch (error) {
          // Invalid data, mark for removal
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`Cleared ${keysToRemove.length} old auto-save entries`);
  } catch (error) {
    console.error('Error clearing old auto-save data:', error);
  }
};

/**
 * Hook for automatic form data saving and loading
 * @param formId - Unique identifier for the form
 * @param formData - Current form data
 * @param setFormData - Function to update form data
 * @param userId - Optional user ID
 * @param options - Configuration options
 */
export const useAutoSave = <T>(
  formId: string,
  formData: T,
  setFormData: (data: T) => void,
  userId?: string | number,
  options: {
    delay?: number;
    maxAge?: number;
    showToast?: boolean;
    excludeFields?: string[];
  } = {}
) => {
  const {
    delay = AUTO_SAVE_DELAY,
    maxAge = MAX_STORAGE_AGE,
    showToast = false,
    excludeFields = []
  } = options;

  const timeoutRef = useRef<NodeJS.Timeout>();
  const initialLoadRef = useRef(false);
  const lastSavedDataRef = useRef<string>('');

  // Load saved data on mount
  useEffect(() => {
    if (!initialLoadRef.current) {
      const savedData = loadFormData<T>(formId, userId, maxAge);
      if (savedData) {
        // Filter out excluded fields
        const filteredData = { ...savedData };
        excludeFields.forEach(field => {
          delete (filteredData as any)[field];
        });
        
        setFormData({ ...formData, ...filteredData });
        
        if (showToast) {
          toast({
            title: "Draft Restored",
            description: "Your previous work has been restored. Continue where you left off!",
            duration: 5000,
          });
        }
      }
      initialLoadRef.current = true;
    }
  }, [formId, userId, maxAge, excludeFields, showToast]);

  // Auto-save with debouncing
  const debouncedSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      // Filter out excluded fields and empty values
      const dataToSave = { ...formData };
      excludeFields.forEach(field => {
        delete (dataToSave as any)[field];
      });

      // Only save if data has actually changed
      const currentDataStr = JSON.stringify(dataToSave);
      if (currentDataStr !== lastSavedDataRef.current) {
        saveFormData(formId, dataToSave, userId);
        lastSavedDataRef.current = currentDataStr;
      }
    }, delay);
  }, [formData, formId, userId, delay, excludeFields]);

  // Trigger auto-save when form data changes
  useEffect(() => {
    if (initialLoadRef.current) {
      debouncedSave();
    }
  }, [formData, debouncedSave]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Manual save function
  const manualSave = useCallback(() => {
    const dataToSave = { ...formData };
    excludeFields.forEach(field => {
      delete (dataToSave as any)[field];
    });
    saveFormData(formId, dataToSave, userId);
    
    if (showToast) {
      toast({
        title: "Draft Saved",
        description: "Your progress has been saved automatically.",
        duration: 3000,
      });
    }
  }, [formData, formId, userId, excludeFields, showToast]);

  // Clear saved data function
  const clearSavedData = useCallback(() => {
    clearFormData(formId, userId);
    lastSavedDataRef.current = '';
  }, [formId, userId]);

  return {
    manualSave,
    clearSavedData,
    hasSavedData: () => loadFormData(formId, userId, maxAge) !== null
  };
};

/**
 * Hook for showing auto-save status indicator
 * @param formId - Unique identifier for the form
 * @param userId - Optional user ID
 */
export const useAutoSaveStatus = (formId: string, userId?: string | number) => {
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);

  useEffect(() => {
    const checkSaveTime = () => {
      try {
        const key = getAutoSaveKey(formId, userId);
        const savedData = localStorage.getItem(key);
        
        if (savedData) {
          const autoSaveData: AutoSaveData = JSON.parse(savedData);
          setLastSaveTime(autoSaveData.metadata.timestamp);
        }
      } catch (error) {
        console.error('Error checking save time:', error);
      }
    };

    checkSaveTime();
    
    // Check every 30 seconds
    const interval = setInterval(checkSaveTime, 30000);
    
    return () => clearInterval(interval);
  }, [formId, userId]);

  const getStatusText = useCallback(() => {
    if (!lastSaveTime) return 'No draft saved';
    
    const now = Date.now();
    const diffInMinutes = Math.floor((now - lastSaveTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Draft saved just now';
    if (diffInMinutes === 1) return 'Draft saved 1 minute ago';
    if (diffInMinutes < 60) return `Draft saved ${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return 'Draft saved 1 hour ago';
    if (diffInHours < 24) return `Draft saved ${diffInHours} hours ago`;
    
    return 'Draft saved over a day ago';
  }, [lastSaveTime]);

  return {
    lastSaveTime,
    statusText: getStatusText(),
    hasDraft: lastSaveTime !== null
  };
};