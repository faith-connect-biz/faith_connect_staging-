import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { ImageImporter, ImportedImage } from '@/utils/imageImporter';
import { Download, Upload, Image as ImageIcon, X, CheckCircle, AlertCircle } from 'lucide-react';

interface ImageImportModalProps {
  businessId: string;
  onImagesImported: (images: ImportedImage[]) => void;
  trigger?: React.ReactNode;
}

export const ImageImportModal: React.FC<ImageImportModalProps> = ({
  businessId,
  onImagesImported,
  trigger
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [urls, setUrls] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportedImage[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleImport = async () => {
    if (!urls.trim()) {
      toast({
        title: "Error",
        description: "Please enter at least one image URL",
        variant: "destructive"
      });
      return;
    }

    const imageUrls = urls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url && ImageImporter.isValidImageUrl(url));

    if (imageUrls.length === 0) {
      toast({
        title: "Error",
        description: "No valid image URLs found",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    setErrors([]);
    setImportResults([]);

    try {
      const results = await ImageImporter.importMultipleImages(imageUrls, businessId, 'image');
      
      if (results.length > 0) {
        setImportResults(results);
        onImagesImported(results);
        
        toast({
          title: "Success",
          description: `Successfully imported ${results.length} images`,
        });
        
        // Close modal after successful import
        setTimeout(() => setIsOpen(false), 2000);
      } else {
        toast({
          title: "Warning",
          description: "No images were successfully imported",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Error",
        description: "Failed to import images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUrls(e.target.value);
  };

  const resetForm = () => {
    setUrls('');
    setImportResults([]);
    setErrors([]);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Import Images
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Import Images from URLs
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="urls">
              Image URLs (one per line)
            </Label>
            <Textarea
              id="urls"
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.png&#10;https://example.com/image3.jpeg"
              value={urls}
              onChange={handleUrlChange}
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter one image URL per line. Supported formats: JPG, PNG, GIF, WebP
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleImport} 
              disabled={isImporting || !urls.trim()}
              className="flex-1"
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Images
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={resetForm}
              disabled={isImporting}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Import Results */}
          {importResults.length > 0 && (
            <div className="border rounded-lg p-4 bg-green-50">
              <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Import Results
              </h4>
              <div className="space-y-2">
                {importResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-green-700 truncate flex-1">
                      {result.originalUrl}
                    </span>
                    <Badge variant="secondary" className="ml-2">
                      ✓ Imported
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="border rounded-lg p-4 bg-red-50">
              <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Import Errors
              </h4>
              <div className="space-y-1">
                {errors.map((error, index) => (
                  <p key={index} className="text-sm text-red-700">
                    {error}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="border rounded-lg p-4 bg-blue-50">
            <h4 className="font-medium text-blue-800 mb-2">💡 Tips for importing images</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use high-quality images (recommended: 800x600 or larger)</li>
              <li>• Ensure images are publicly accessible</li>
              <li>• Supported formats: JPG, PNG, GIF, WebP</li>
              <li>• Images will be stored in your S3 bucket</li>
              <li>• You can import multiple images at once</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
