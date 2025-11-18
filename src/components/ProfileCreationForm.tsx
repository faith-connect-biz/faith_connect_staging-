import React, { useState } from 'react';
import { Button } from './ui/button';

interface ProfileCreationFormProps {
  onSuccess?: (profile: any) => void;
  onError?: (error: string) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://faithconnectbackend-staging.up.railway.app';

export const ProfileCreationForm: React.FC<ProfileCreationFormProps> = ({ onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    user_type: 'community' as 'community' | 'business',
    partnership_number: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setError(null);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to S3 using presigned URL
  const uploadImageToS3 = async (file: File): Promise<string> => {
    try {
      setIsUploading(true);

      // Step 1: Get presigned URL from backend
      console.log('Getting presigned URL for file:', file.name);
      const presignedResponse = await fetch(`${API_BASE_URL}/api/profile-photo-upload-url-unauthenticated`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: formData.email || formData.phone || '', // Need identifier for unauthenticated upload
          auth_method: formData.email ? 'email' : 'phone',
          file_name: file.name,
          content_type: file.type,
        }),
      });

      if (!presignedResponse.ok) {
        const errorData = await presignedResponse.json();
        throw new Error(errorData.error || 'Failed to get presigned URL');
      }

      const { presigned_url, s3_url, file_key } = await presignedResponse.json();
      const upload_url = presigned_url;
      const file_url = s3_url;
      console.log('Received presigned URL:', upload_url);
      console.log('File will be accessible at:', file_url);

      // Step 2: Upload file directly to S3 using presigned URL
      console.log('Uploading file to S3...');
      const uploadResponse = await fetch(upload_url, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to S3');
      }

      console.log('File uploaded successfully to S3');
      setUploadedImageUrl(file_url);
      return file_url;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      console.error('Image upload error:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate required fields
    if (!formData.first_name || !formData.last_name || !formData.partnership_number) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload image first if selected
      let imageUrl = null;
      if (selectedFile) {
        imageUrl = await uploadImageToS3(selectedFile);
      }

      // Create profile with image URL
      console.log('Creating profile...');
      const profileResponse = await fetch(`${API_BASE_URL}/api/auth/complete-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          user_type: formData.user_type,
          partnership_number: formData.partnership_number,
          image_url: imageUrl,
        }),
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(errorData.error || 'Failed to create profile');
      }

      const result = await profileResponse.json();
      console.log('Profile created successfully:', result);

      setSuccess('Profile created successfully!');

      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        user_type: 'community',
        partnership_number: '',
      });
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadedImageUrl(null);

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result.profile);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.error('Form submission error:', errorMessage);
      setError(errorMessage);

      // Call error callback if provided
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create User Profile</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* First Name */}
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Partnership Number */}
          <div>
            <label htmlFor="partnership_number" className="block text-sm font-medium text-gray-700 mb-2">
              Partnership Number *
            </label>
            <input
              type="text"
              id="partnership_number"
              name="partnership_number"
              value={formData.partnership_number}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isSubmitting}
              placeholder="e.g., FEM12345"
            />
          </div>

          {/* User Type */}
          <div>
            <label htmlFor="user_type" className="block text-sm font-medium text-gray-700 mb-2">
              User Type *
            </label>
            <select
              id="user_type"
              name="user_type"
              value={formData.user_type}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isSubmitting}
            >
              <option value="community">Community</option>
              <option value="business">Business</option>
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="profile_image" className="block text-sm font-medium text-gray-700 mb-2">
              Profile Image
            </label>
            <input
              type="file"
              id="profile_image"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting || isUploading}
            />
            <p className="mt-1 text-sm text-gray-500">
              Maximum file size: 5MB. Accepted formats: JPG, PNG, GIF
            </p>

            {/* Image Preview */}
            {previewUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <img
                  src={previewUrl}
                  alt="Profile preview"
                  className="w-32 h-32 object-cover rounded-full border-2 border-gray-300"
                />
              </div>
            )}

            {isUploading && (
              <div className="mt-2">
                <p className="text-sm text-blue-600">Uploading image...</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                </div>
              </div>
            )}

            {uploadedImageUrl && !isUploading && (
              <div className="mt-2">
                <p className="text-sm text-green-600">✓ Image uploaded successfully</p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Profile...
                </span>
              ) : (
                'Create Profile'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileCreationForm;
