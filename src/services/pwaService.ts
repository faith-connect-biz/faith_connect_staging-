import { toast } from '@/hooks/use-toast';

// IndexedDB configuration
const DB_NAME = 'FaithConnectDB';
const DB_VERSION = 1;
const STORES = {
  OFFLINE_ACTIONS: 'offlineActions',
  CACHED_BUSINESSES: 'cachedBusinesses',
  CACHED_SERVICES: 'cachedServices',
  CACHED_PRODUCTS: 'cachedProducts',
  USER_DATA: 'userData',
  AUTH_TOKEN: 'authToken',
  OFFLINE_NOTIFICATIONS: 'offlineNotifications'
};

// Offline action types
export enum OfflineActionType {
  CREATE_BUSINESS = 'CREATE_BUSINESS',
  UPDATE_BUSINESS = 'UPDATE_BUSINESS',
  CREATE_SERVICE = 'CREATE_SERVICE',
  UPDATE_SERVICE = 'UPDATE_SERVICE',
  DELETE_SERVICE = 'DELETE_SERVICE',
  CREATE_PRODUCT = 'CREATE_PRODUCT',
  UPDATE_PRODUCT = 'UPDATE_PRODUCT',
  DELETE_PRODUCT = 'DELETE_PRODUCT',
  CREATE_REVIEW = 'CREATE_REVIEW',
  UPDATE_PROFILE = 'UPDATE_PROFILE'
}

// Offline action interface
export interface OfflineAction {
  id: string;
  type: OfflineActionType;
  payload: any;
  url: string;
  method: string;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

// PWA Service class
class PWAService {
  private db: IDBDatabase | null = null;
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;

  constructor() {
    this.initDatabase();
    this.setupNetworkListeners();
    this.registerServiceWorker();
  }

  // Initialize IndexedDB
  private async initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create stores
        if (!db.objectStoreNames.contains(STORES.OFFLINE_ACTIONS)) {
          const offlineStore = db.createObjectStore(STORES.OFFLINE_ACTIONS, { keyPath: 'id' });
          offlineStore.createIndex('timestamp', 'timestamp', { unique: false });
          offlineStore.createIndex('type', 'type', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.CACHED_BUSINESSES)) {
          const businessStore = db.createObjectStore(STORES.CACHED_BUSINESSES, { keyPath: 'id' });
          businessStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.CACHED_SERVICES)) {
          const serviceStore = db.createObjectStore(STORES.CACHED_SERVICES, { keyPath: 'id' });
          serviceStore.createIndex('businessId', 'businessId', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.CACHED_PRODUCTS)) {
          const productStore = db.createObjectStore(STORES.CACHED_PRODUCTS, { keyPath: 'id' });
          productStore.createIndex('businessId', 'businessId', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.USER_DATA)) {
          db.createObjectStore(STORES.USER_DATA, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(STORES.AUTH_TOKEN)) {
          db.createObjectStore(STORES.AUTH_TOKEN, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(STORES.OFFLINE_NOTIFICATIONS)) {
          const notificationStore = db.createObjectStore(STORES.OFFLINE_NOTIFICATIONS, { keyPath: 'id' });
          notificationStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // Setup network status listeners
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Network: Online');
      this.syncOfflineData();
      toast({
        title: "Connection Restored",
        description: "Syncing offline data...",
      });
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Network: Offline');
      toast({
        title: "You're Offline",
        description: "Changes will sync when connection is restored",
        variant: "default"
      });
    });
  }

  // Register service worker - DISABLED
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('SW registered: ', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, show update notification
                console.log('New content is available; please refresh.');
              }
            });
          }
        });
        
        return;
      } catch (error) {
        console.error('SW registration failed: ', error);
        return;
      }
    }
  }

  // Show update notification
  private showUpdateNotification(): void {
    toast({
      title: "App Update Available",
      description: "A new version is available. Please refresh the page to update.",
    });
  }

  // Add offline action to queue
  public async addOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    if (!this.db) {
      await this.initDatabase();
    }

    const offlineAction: OfflineAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: 3
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.OFFLINE_ACTIONS], 'readwrite');
      const store = transaction.objectStore(STORES.OFFLINE_ACTIONS);
      const request = store.add(offlineAction);

      request.onsuccess = () => {
        console.log('Offline action queued:', action.type);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to queue offline action:', request.error);
        reject(request.error);
      };
    });
  }

  // Get all offline actions
  public async getOfflineActions(): Promise<OfflineAction[]> {
    if (!this.db) {
      await this.initDatabase();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.OFFLINE_ACTIONS], 'readonly');
      const store = transaction.objectStore(STORES.OFFLINE_ACTIONS);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('Failed to get offline actions:', request.error);
        reject(request.error);
      };
    });
  }

  // Remove offline action
  public async removeOfflineAction(id: string): Promise<void> {
    if (!this.db) {
      await this.initDatabase();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.OFFLINE_ACTIONS], 'readwrite');
      const store = transaction.objectStore(STORES.OFFLINE_ACTIONS);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('Offline action removed:', id);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to remove offline action:', request.error);
        reject(request.error);
      };
    });
  }

  // Update offline action retry count
  public async updateOfflineActionRetry(id: string, retryCount: number): Promise<void> {
    if (!this.db) {
      await this.initDatabase();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.OFFLINE_ACTIONS], 'readwrite');
      const store = transaction.objectStore(STORES.OFFLINE_ACTIONS);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const action = getRequest.result;
        if (action) {
          action.retryCount = retryCount;
          const putRequest = store.put(action);
          
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Sync offline data
  public async syncOfflineData(): Promise<void> {
    if (!this.isOnline || this.syncInProgress) {
      return;
    }

    this.syncInProgress = true;
    console.log('Starting offline data sync...');

    try {
      const offlineActions = await this.getOfflineActions();
      
      if (offlineActions.length === 0) {
        console.log('No offline actions to sync');
        return;
      }

      console.log(`Syncing ${offlineActions.length} offline actions`);

      for (const action of offlineActions) {
        try {
          await this.processOfflineAction(action);
          await this.removeOfflineAction(action.id);
          console.log('Successfully synced action:', action.type);
        } catch (error) {
          console.error('Failed to sync action:', action.type, error);
          
          if (action.retryCount < action.maxRetries) {
            await this.updateOfflineActionRetry(action.id, action.retryCount + 1);
          } else {
            console.error('Max retries reached for action:', action.type);
            await this.removeOfflineAction(action.id);
          }
        }
      }

      console.log('Offline sync completed');
    } catch (error) {
      console.error('Error during offline sync:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Process individual offline action
  private async processOfflineAction(action: OfflineAction): Promise<void> {
    const token = await this.getAuthToken();
    
    const response = await fetch(action.url, {
      method: action.method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(action.payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Cache business data
  public async cacheBusiness(business: any): Promise<void> {
    if (!this.db) {
      await this.initDatabase();
    }

    const cachedBusiness = {
      ...business,
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.CACHED_BUSINESSES], 'readwrite');
      const store = transaction.objectStore(STORES.CACHED_BUSINESSES);
      const request = store.put(cachedBusiness);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get cached business
  public async getCachedBusiness(id: string): Promise<any | null> {
    if (!this.db) {
      await this.initDatabase();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.CACHED_BUSINESSES], 'readonly');
      const store = transaction.objectStore(STORES.CACHED_BUSINESSES);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Store auth token
  public async storeAuthToken(token: string): Promise<void> {
    if (!this.db) {
      await this.initDatabase();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.AUTH_TOKEN], 'readwrite');
      const store = transaction.objectStore(STORES.AUTH_TOKEN);
      const request = store.put({ id: 'auth', token, timestamp: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get auth token
  public async getAuthToken(): Promise<string | null> {
    if (!this.db) {
      await this.initDatabase();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.AUTH_TOKEN], 'readonly');
      const store = transaction.objectStore(STORES.AUTH_TOKEN);
      const request = store.get('auth');

      request.onsuccess = () => {
        resolve(request.result?.token || null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Clear all cached data
  public async clearCache(): Promise<void> {
    if (!this.db) {
      await this.initDatabase();
    }

    const stores = Object.values(STORES);
    
    for (const storeName of stores) {
      await new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }

    console.log('Cache cleared');
  }

  // Get offline status
  public isOffline(): boolean {
    return !this.isOnline;
  }

  // Get sync status
  public isSyncing(): boolean {
    return this.syncInProgress;
  }

  // Request notification permission
  public async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Send push notification
  public async sendNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (await this.requestNotificationPermission()) {
      try {
        // Try to send notification immediately
        new Notification(title, {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          ...options
        });
      } catch (error) {
        console.log('Failed to send notification immediately, storing for offline delivery:', error);
        // Store notification for offline delivery
        await this.storeOfflineNotification({ title, options });
      }
    }
  }

  // Store notification for offline delivery
  public async storeOfflineNotification(notification: { title: string; options?: NotificationOptions }): Promise<void> {
    if (!this.db) {
      await this.initDatabase();
    }

    const offlineNotification = {
      id: crypto.randomUUID(),
      ...notification,
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.OFFLINE_NOTIFICATIONS], 'readwrite');
      const store = transaction.objectStore(STORES.OFFLINE_NOTIFICATIONS);
      const request = store.add(offlineNotification);

      request.onsuccess = () => {
        console.log('Offline notification stored:', notification.title);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to store offline notification:', request.error);
        reject(request.error);
      };
    });
  }

  // Get offline notifications
  public async getOfflineNotifications(): Promise<any[]> {
    if (!this.db) {
      await this.initDatabase();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.OFFLINE_NOTIFICATIONS], 'readonly');
      const store = transaction.objectStore(STORES.OFFLINE_NOTIFICATIONS);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('Failed to get offline notifications:', request.error);
        reject(request.error);
      };
    });
  }

  // Remove offline notification
  public async removeOfflineNotification(id: string): Promise<void> {
    if (!this.db) {
      await this.initDatabase();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.OFFLINE_NOTIFICATIONS], 'readwrite');
      const store = transaction.objectStore(STORES.OFFLINE_NOTIFICATIONS);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('Offline notification removed:', id);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to remove offline notification:', request.error);
        reject(request.error);
      };
    });
  }

  // Sync offline notifications
  public async syncOfflineNotifications(): Promise<void> {
    if (!this.isOnline) {
      return;
    }

    try {
      const notifications = await this.getOfflineNotifications();
      
      if (notifications.length === 0) {
        return;
      }

      console.log(`Syncing ${notifications.length} offline notifications`);

      for (const notification of notifications) {
        try {
          // Show the notification
          new Notification(notification.title, {
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            ...(notification.options || {})
          });
          
          // Remove from storage
          await this.removeOfflineNotification(notification.id);
        } catch (error) {
          console.error('Error syncing notification:', error);
        }
      }
    } catch (error) {
      console.error('Error syncing offline notifications:', error);
    }
  }
}

// Export singleton instance
export const pwaService = new PWAService();
