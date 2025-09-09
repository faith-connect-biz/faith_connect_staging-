import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallPromptProps {
  className?: string;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ className = '' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      // Check if running in standalone mode (installed)
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return;
      }
      
      // Check if user has previously dismissed the prompt
      const hasDismissed = localStorage.getItem('pwa-install-dismissed');
      const dismissedDate = hasDismissed ? new Date(hasDismissed) : null;
      const daysSinceDismissed = dismissedDate ? 
        (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24) : null;
      
      // Show prompt if not dismissed or dismissed more than 7 days ago
      if (!hasDismissed || (daysSinceDismissed && daysSinceDismissed > 7)) {
        setShowPrompt(true);
      }
    };

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      checkIfInstalled();
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      toast({
        title: "App Installed!",
        description: "FaithConnect has been added to your home screen.",
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check installation status on mount
    checkIfInstalled();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast({
          title: "Installing...",
          description: "FaithConnect is being added to your home screen.",
        });
      } else {
        // User dismissed the prompt
        handleDismiss();
      }
      
      // Clear the deferred prompt
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error showing install prompt:', error);
      toast({
        title: "Installation Error",
        description: "Unable to show installation prompt. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember dismissal for 7 days
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  };

  const handleNotNow = () => {
    setShowPrompt(false);
    // Remember dismissal for 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    localStorage.setItem('pwa-install-dismissed', threeDaysFromNow.toISOString());
  };

  // Don't show if already installed or no prompt available
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto ${className}`}>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 relative">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          aria-label="Close install prompt"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              Install FaithConnect
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
              Add to your home screen for quick access and a better experience.
            </p>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleInstall}
                className="flex-1 text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                Install
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleNotNow}
                className="text-xs px-3"
              >
                Not Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
