import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Camera, Send, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';

interface PhotoRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId?: string;
  businessName?: string;
}

export const PhotoRequestModal: React.FC<PhotoRequestModalProps> = ({
  isOpen,
  onClose,
  businessId,
  businessName
}) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!notes.trim()) {
      toast({
        title: "Notes required",
        description: "Please provide some details about your photo request.",
        variant: "destructive"
      });
      return;
    }

    // If no businessId is provided, this is a general photography request
    if (!businessId) {
      try {
        setIsSubmitting(true);
        // For general requests, we'll send directly to enquiries@faithconnect.biz
        // This will be handled by the backend when businessId is empty
        await apiService.createPhotoRequest({
          business: "", // Empty business ID for general requests
          notes: notes.trim()
        });
        
        setIsSubmitted(true);
        toast({
          title: "Request sent successfully!",
          description: "Your photography request has been sent to our team.",
        });
        
        // Close modal after a short delay to show success state
        setTimeout(() => {
          onClose();
          setIsSubmitted(false);
          setNotes('');
        }, 2000);
        
      } catch (error: any) {
        console.error('Error submitting photo request:', error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to submit photo request. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    try {
      setIsSubmitting(true);
      await apiService.createPhotoRequest({
        business: businessId,
        notes: notes.trim()
      });
      
      setIsSubmitted(true);
      toast({
        title: "Request sent successfully!",
        description: "Your photo request has been sent to the business owner.",
      });
      
      // Close modal after a short delay to show success state
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setNotes('');
      }, 2000);
      
    } catch (error: any) {
      console.error('Error submitting photo request:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit photo request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setIsSubmitted(false);
      setNotes('');
    }
  };

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Request Sent!</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              {businessName ? (
                <>Your photo request has been successfully sent to <strong>{businessName}</strong>.</>
              ) : (
                <>Your photography request has been successfully sent to our team.</>
              )}
            </p>
            <p className="text-sm text-gray-500">
              {businessName ? (
                "The business owner will review your request and get back to you soon."
              ) : (
                "Our team will review your request and get back to you soon."
              )}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>Request Professional Photos</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center py-4">
            <Camera className="h-12 w-12 text-fem-terracotta mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {businessName ? (
                <>Request Professional Photos from {businessName}</>
              ) : (
                <>Request Photography Services</>
              )}
            </h3>
            <p className="text-sm text-gray-600">
              {businessName ? (
                "Let the business owner know what type of professional photos you need. They'll review your request and get back to you."
              ) : (
                "Tell us about your photography needs and we'll forward your request to our team at enquiries@faithconnect.biz"
              )}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              What photos do you need? *
            </Label>
            <Textarea
              id="notes"
              placeholder="Describe the type of professional photos you're looking for... (e.g., family portraits, event photography, product photos, etc.)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Be specific about your needs to help the business owner understand your requirements.
            </p>
          </div>
          
          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !notes.trim()}
              className="flex-1 bg-fem-terracotta hover:bg-fem-terracotta/90"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
