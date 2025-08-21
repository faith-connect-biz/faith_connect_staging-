import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { 
  X, 
  Share2, 
  Copy, 
  Smartphone, 
  Link as LinkIcon,
  Check,
  Facebook,
  MessageCircle,
  Instagram,
  Linkedin,
  Mail
} from "lucide-react";
import { 
  socialMediaPlatforms, 
  shareToSocialMedia, 
  shareToNative, 
  copyToClipboard,
  type ShareData 
} from "@/utils/sharing";
import { toast } from "@/hooks/use-toast";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareData: ShareData;
}

const ShareModal = ({ isOpen, onClose, shareData }: ShareModalProps) => {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Check if icon is an image file or Lucide icon name
  const isImageIcon = (iconName: string) => {
    return iconName.startsWith('/');
  };

  // Map icon names to Lucide icon components (for fallback)
  const getLucideIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      X: X,
    };
    return icons[iconName] || Share2;
  };

  const handleNativeShare = async () => {
    setIsSharing(true);
    try {
      const success = await shareToNative(shareData);
      if (success) {
        onClose();
        toast({
          title: "Shared successfully!",
          description: "Your content has been shared.",
        });
      } else {
        toast({
          title: "Sharing not supported",
          description: "Native sharing is not available on this device.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Sharing failed",
        description: "There was an error sharing your content.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const success = await copyToClipboard(shareData);
      if (success) {
        setCopied(true);
        toast({
          title: "Link copied!",
          description: "Share link has been copied to your clipboard.",
        });
        setTimeout(() => setCopied(false), 2000);
      } else {
        toast({
          title: "Copy failed",
          description: "Failed to copy link to clipboard.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "There was an error copying the link.",
        variant: "destructive",
      });
    }
  };

  const handleSocialShare = (platform: typeof socialMediaPlatforms[0]) => {
    shareToSocialMedia(platform, shareData);
    toast({
      title: `Sharing to ${platform.name}`,
      description: `Opening ${platform.name} in a new window.`,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <CardHeader className="bg-gradient-to-r from-fem-navy to-fem-terracotta text-white text-center pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8"></div>
                <CardTitle className="text-xl font-bold">Share This</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 rounded-full p-2 h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="w-16 h-16 bg-fem-gold rounded-full flex items-center justify-center mx-auto">
                <Share2 className="w-8 h-8 text-white" />
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* Content Preview */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-fem-navy mb-2 line-clamp-2">
                  {shareData.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {shareData.text}
                </p>
                <div className="mt-2 text-xs text-gray-500 truncate">
                  {shareData.url}
                </div>
              </div>

              {/* Native Share Button */}
              <Button
                onClick={handleNativeShare}
                disabled={isSharing}
                className="w-full bg-gradient-to-r from-fem-terracotta to-fem-navy hover:from-fem-terracotta/90 hover:to-fem-navy/90 text-white font-semibold py-3 mb-4"
              >
                <Smartphone className="w-5 h-5 mr-2" />
                {isSharing ? "Sharing..." : "Share"}
              </Button>

              {/* Copy Link Button */}
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="w-full border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white font-semibold py-3 mb-6"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>

              {/* Social Media Platforms */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 text-center mb-4">
                  Share on Social Media
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {socialMediaPlatforms.slice(0, 6).map((platform) => {
                    return (
                      <Button
                        key={platform.name}
                        onClick={() => handleSocialShare(platform)}
                        variant="ghost"
                        className="flex flex-col items-center p-3 h-auto hover:bg-gray-100 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform overflow-hidden">
                          {isImageIcon(platform.icon) ? (
                            <img 
                              src={platform.icon} 
                              alt={`${platform.name} icon`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div 
                              className="w-full h-full rounded-full flex items-center justify-center"
                              style={{ backgroundColor: platform.color }}
                            >
                              {(() => {
                                const IconComponent = getLucideIcon(platform.icon);
                                return <IconComponent className="w-5 h-5 text-white" />;
                              })()}
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                          {platform.name}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Additional Options */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2">
                    Share this amazing content with your network!
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                    <LinkIcon className="w-3 h-3" />
                    <span>Multiple sharing options available</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
