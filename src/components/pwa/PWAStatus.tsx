import React from 'react';
import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Database,
  Bell
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PWAStatusProps {
  variant?: 'minimal' | 'detailed' | 'floating';
  showNotifications?: boolean;
  className?: string;
}

export const PWAStatus: React.FC<PWAStatusProps> = ({
  variant = 'detailed',
  showNotifications = true,
  className = ''
}) => {
  const {
    isOnline,
    isSyncing,
    hasOfflineActions,
    offlineActionCount,
    syncOfflineData,
    clearCache,
    requestNotificationPermission
  } = usePWA();

  const handleSync = async () => {
    if (hasOfflineActions) {
      await syncOfflineData();
    } else {
      toast({
        title: "No Actions to Sync",
        description: "All data is up to date",
      });
    }
  };

  const handleClearCache = async () => {
    await clearCache();
  };

  const handleEnableNotifications = async () => {
    await requestNotificationPermission();
  };

  // Minimal variant - just status indicator
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {isOnline ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
        {hasOfflineActions && (
          <Badge variant="secondary" className="text-xs">
            {offlineActionCount}
          </Badge>
        )}
      </div>
    );
  }

  // Floating variant - fixed position indicator
  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-3 space-y-2">
          {/* Online/Offline Status */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 dark:text-green-400">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600 dark:text-red-400">Offline</span>
              </>
            )}
          </div>

          {/* Sync Status */}
          {isSyncing && (
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
              <span className="text-sm text-blue-600 dark:text-blue-400">Syncing...</span>
            </div>
          )}

          {/* Offline Actions */}
          {hasOfflineActions && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-orange-600 dark:text-orange-400">
                {offlineActionCount} pending
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSync}
                disabled={isSyncing}
                className="h-6 px-2 text-xs"
              >
                Sync
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-1 pt-1 border-t">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClearCache}
              className="h-6 px-2 text-xs"
              title="Clear Cache"
            >
              <Database className="w-3 h-3" />
            </Button>
            {showNotifications && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleEnableNotifications}
                className="h-6 px-2 text-xs"
                title="Enable Notifications"
              >
                <Bell className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Detailed variant - full status display
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border p-4 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Connection Status</h3>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <Wifi className="w-3 h-3 mr-1" />
              Online
            </Badge>
          ) : (
            <Badge variant="destructive">
              <WifiOff className="w-3 h-3 mr-1" />
              Offline
            </Badge>
          )}
        </div>
      </div>

      {/* Status Details */}
      <div className="space-y-3">
        {/* Sync Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2">
            {isSyncing ? (
              <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
            ) : hasOfflineActions ? (
              <Clock className="w-4 h-4 text-orange-500" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
            <span className="text-sm font-medium">
              {isSyncing ? 'Syncing...' : hasOfflineActions ? 'Pending Actions' : 'All Synced'}
            </span>
          </div>
          {hasOfflineActions && (
            <Badge variant="secondary">
              {offlineActionCount} {offlineActionCount === 1 ? 'action' : 'actions'}
            </Badge>
          )}
        </div>

        {/* Offline Actions List */}
        {hasOfflineActions && (
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Offline Actions Pending
              </span>
            </div>
            <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
              You have {offlineActionCount} action{offlineActionCount === 1 ? '' : 's'} that will sync when you're back online.
            </p>
            <Button
              size="sm"
              onClick={handleSync}
              disabled={isSyncing || !isOnline}
              className="w-full"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Now
                </>
              )}
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCache}
            className="flex-1"
          >
            <Database className="w-4 h-4 mr-2" />
            Clear Cache
          </Button>
          {showNotifications && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEnableNotifications}
              className="flex-1"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PWAStatus;
