import { useState, useEffect, useCallback } from 'react';
import { pwaService, OfflineActionType, OfflineAction } from '@/services/pwaService';
import { toast } from '@/hooks/use-toast';

export interface PWAStatus {
  isOnline: boolean;
  isSyncing: boolean;
  hasOfflineActions: boolean;
  offlineActionCount: number;
}

export interface PWAActions {
  addOfflineAction: (action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>) => Promise<void>;
  syncOfflineData: () => Promise<void>;
  clearCache: () => Promise<void>;
  requestNotificationPermission: () => Promise<boolean>;
  sendNotification: (title: string, options?: NotificationOptions) => Promise<void>;
}

export const usePWA = (): PWAStatus & PWAActions => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasOfflineActions, setHasOfflineActions] = useState(false);
  const [offlineActionCount, setOfflineActionCount] = useState(0);

  // Check offline actions count
  const checkOfflineActions = useCallback(async () => {
    try {
      const actions = await pwaService.getOfflineActions();
      setHasOfflineActions(actions.length > 0);
      setOfflineActionCount(actions.length);
    } catch (error) {
      console.error('Error checking offline actions:', error);
    }
  }, []);

  // Add offline action
  const addOfflineAction = useCallback(async (action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>) => {
    try {
      await pwaService.addOfflineAction(action);
      await checkOfflineActions();
      
      toast({
        title: "Action Queued",
        description: "This action will sync when you're back online",
        variant: "default"
      });
    } catch (error) {
      console.error('Error adding offline action:', error);
      toast({
        title: "Error",
        description: "Failed to queue offline action",
        variant: "destructive"
      });
    }
  }, [checkOfflineActions]);

  // Sync offline data
  const syncOfflineData = useCallback(async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      await pwaService.syncOfflineData();
      await checkOfflineActions();
      
      if (offlineActionCount > 0) {
        toast({
          title: "Sync Complete",
          description: `Successfully synced ${offlineActionCount} offline actions`,
        });
      }
    } catch (error) {
      console.error('Error syncing offline data:', error);
      toast({
        title: "Sync Failed",
        description: "Some actions failed to sync. They will retry later.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, offlineActionCount, checkOfflineActions]);

  // Clear cache
  const clearCache = useCallback(async () => {
    try {
      await pwaService.clearCache();
      await checkOfflineActions();
      
      toast({
        title: "Cache Cleared",
        description: "All cached data has been removed",
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast({
        title: "Error",
        description: "Failed to clear cache",
        variant: "destructive"
      });
    }
  }, [checkOfflineActions]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await pwaService.requestNotificationPermission();
      if (granted) {
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive notifications from FaithConnect",
        });
      } else {
        toast({
          title: "Notifications Disabled",
          description: "You can enable notifications in your browser settings",
          variant: "default"
        });
      }
      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, []);

  // Send notification
  const sendNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    try {
      await pwaService.sendNotification(title, options);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }, []);

  // Setup network listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when coming back online
      setTimeout(() => {
        syncOfflineData();
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncOfflineData]);

  // Check offline actions on mount and when online status changes
  useEffect(() => {
    checkOfflineActions();
  }, [checkOfflineActions, isOnline]);

  // Periodic check for offline actions
  useEffect(() => {
    const interval = setInterval(checkOfflineActions, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [checkOfflineActions]);

  return {
    isOnline,
    isSyncing,
    hasOfflineActions,
    offlineActionCount,
    addOfflineAction,
    syncOfflineData,
    clearCache,
    requestNotificationPermission,
    sendNotification
  };
};

// Hook for specific offline action types
export const useOfflineAction = (actionType: OfflineActionType) => {
  const { addOfflineAction, isOnline } = usePWA();

  const queueOfflineAction = useCallback(async (
    payload: any,
    url: string,
    method: string = 'POST'
  ) => {
    if (isOnline) {
      // If online, try to execute immediately
      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            // Add auth token if available
            ...(localStorage.getItem('authToken') && {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            })
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        console.log('Online request failed, queuing offline action:', error);
        // Fall back to offline action
        await addOfflineAction({
          type: actionType,
          payload,
          url,
          method
        });
        throw error;
      }
    } else {
      // If offline, queue the action
      await addOfflineAction({
        type: actionType,
        payload,
        url,
        method
      });
    }
  }, [addOfflineAction, isOnline, actionType]);

  return { queueOfflineAction, isOnline };
};

// Hook for business-related offline actions
export const useBusinessOfflineActions = () => {
  const createBusiness = useOfflineAction(OfflineActionType.CREATE_BUSINESS);
  const updateBusiness = useOfflineAction(OfflineActionType.UPDATE_BUSINESS);
  const createService = useOfflineAction(OfflineActionType.CREATE_SERVICE);
  const updateService = useOfflineAction(OfflineActionType.UPDATE_SERVICE);
  const deleteService = useOfflineAction(OfflineActionType.DELETE_SERVICE);
  const createProduct = useOfflineAction(OfflineActionType.CREATE_PRODUCT);
  const updateProduct = useOfflineAction(OfflineActionType.UPDATE_PRODUCT);
  const deleteProduct = useOfflineAction(OfflineActionType.DELETE_PRODUCT);

  return {
    createBusiness,
    updateBusiness,
    createService,
    updateService,
    deleteService,
    createProduct,
    updateProduct,
    deleteProduct
  };
};

// Hook for user-related offline actions
export const useUserOfflineActions = () => {
  const createReview = useOfflineAction(OfflineActionType.CREATE_REVIEW);
  const updateProfile = useOfflineAction(OfflineActionType.UPDATE_PROFILE);

  return {
    createReview,
    updateProfile
  };
};
