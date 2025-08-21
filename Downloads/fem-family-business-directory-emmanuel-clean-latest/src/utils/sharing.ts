export interface ShareData {
  title: string;
  text: string;
  url: string;
  image?: string;
}

export interface SocialMediaShare {
  name: string;
  icon: string;
  url: string;
  color: string;
}

export const socialMediaPlatforms: SocialMediaShare[] = [
  {
    name: 'Facebook',
    icon: '/317727_facebook_social media_social_icon.png',
    url: 'https://www.facebook.com/sharer/sharer.php?u={url}&quote={text}',
    color: '#1877F2'
  },
  {
    name: 'X (Twitter)',
    icon: 'X',
    url: 'https://twitter.com/intent/tweet?text={text}&url={url}',
    color: '#000000'
  },
  {
    name: 'WhatsApp',
    icon: '/5296520_bubble_chat_mobile_whatsapp_whatsapp logo_icon.png',
    url: 'https://wa.me/?text={text}%20{url}',
    color: '#25D366'
  },
  {
    name: 'Instagram',
    icon: '/6929237_instagram_icon.png',
    url: 'https://www.instagram.com/?url={url}',
    color: '#E4405F'
  },
  {
    name: 'LinkedIn',
    icon: '/6929238_linkedin_logo_icon.png',
    url: 'https://www.linkedin.com/sharing/share-offsite/?url={url}',
    color: '#0A66C2'
  },
  {
    name: 'Email',
    icon: '/7089163_gmail_google_icon.png',
    url: 'mailto:?subject={title}&body={text}%0A%0A{url}',
    color: '#EA4335'
  }
];

export const shareToSocialMedia = (platform: SocialMediaShare, data: ShareData): void => {
  const encodedUrl = encodeURIComponent(data.url);
  const encodedText = encodeURIComponent(data.text);
  const encodedTitle = encodeURIComponent(data.title);
  
  const shareUrl = platform.url
    .replace('{url}', encodedUrl)
    .replace('{text}', encodedText)
    .replace('{title}', encodedTitle);
  
  // Open in new window
  window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
};

export const shareToNative = async (data: ShareData): Promise<boolean> => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url,
      });
      return true;
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
      return false;
    }
  }
  return false;
};

export const copyToClipboard = async (data: ShareData): Promise<boolean> => {
  const shareText = `${data.title}\n\n${data.text}\n\n${data.url}`;
  
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

export const generateShareUrl = (data: ShareData): string => {
  return `${data.title}\n\n${data.text}\n\n${data.url}`;
};

export const shareToAllPlatforms = (data: ShareData): void => {
  // Try native sharing first
  shareToNative(data).then((success) => {
    if (!success) {
      // If native sharing fails, show social media options
      showSocialMediaOptions(data);
    }
  });
};

export const showSocialMediaOptions = (data: ShareData): void => {
  // This function can be used to show a custom modal with social media options
  // For now, we'll just copy to clipboard as a fallback
  copyToClipboard(data).then((success) => {
    if (success) {
      // Show success message (you can integrate this with your toast system)
      console.log('Link copied to clipboard!');
    }
  });
};

// QR Code sharing (if you want to add QR code functionality)
export const generateQRCodeUrl = (url: string): string => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
};

// SMS sharing
export const shareViaSMS = (data: ShareData): void => {
  const text = `${data.text} ${data.url}`;
  const smsUrl = `sms:?body=${encodeURIComponent(text)}`;
  window.open(smsUrl);
};

// Viber sharing
export const shareViaViber = (data: ShareData): void => {
  const text = `${data.text} ${data.url}`;
  const viberUrl = `viber://forward?text=${encodeURIComponent(text)}`;
  window.open(viberUrl);
};

// Pinterest sharing
export const shareViaPinterest = (data: ShareData): void => {
  const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(data.url)}&description=${encodeURIComponent(data.text)}`;
  window.open(pinterestUrl, '_blank', 'width=600,height=400');
};

// Reddit sharing
export const shareViaReddit = (data: ShareData): void => {
  const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(data.url)}&title=${encodeURIComponent(data.title)}`;
  window.open(redditUrl, '_blank', 'width=600,height=400');
};
