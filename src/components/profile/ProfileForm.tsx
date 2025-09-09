
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAutoSave, useAutoSaveStatus } from '@/utils/autoSaveUtils';

export const ProfileForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    churchMembership: "",
    membershipNumber: "",
    bio: "",
    skills: ""
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  
  // Auto-save functionality
  const { clearSavedData } = useAutoSave(
    'profile_form',
    formData,
    setFormData,
    undefined, // No user ID needed
    {
      delay: 2000,
      showToast: true,
      excludeFields: [] // Save all text fields
    }
  );
  
  const { statusText } = useAutoSaveStatus('profile_form');
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };
  
  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResume(e.target.files[0]);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      
      // Clear auto-save data after successful submission
      clearSavedData();
      
      toast({
        title: "Profile Created!",
        description: "Your profile has been successfully created.",
      });
    }, 1500);
  };
  
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-fem-navy">Create Your Profile</h2>
        <span className="text-xs text-gray-400 italic">{statusText}</span>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="firstName" className="text-fem-navy">First Name*</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="lastName" className="text-fem-navy">Last Name*</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="email" className="text-fem-navy">Email*</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="phone" className="text-fem-navy">Phone Number*</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              required
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your number will be kept private and masked when contacting businesses.
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-lg font-semibold text-fem-navy mb-4">Faith Connect Membership</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="churchMembership" className="text-fem-navy">Faith Connect Branch*</Label>
              <Input
                id="churchMembership"
                value={formData.churchMembership}
                onChange={(e) => handleInputChange("churchMembership", e.target.value)}
                placeholder="e.g. Faith Connect - Atlanta"
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                This is used to verify your faith community membership.
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-lg font-semibold text-fem-navy mb-4">Professional Information</h3>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="bio" className="text-fem-navy">
                About Me*
                <span className="text-sm text-gray-500 font-normal ml-1">
                  (Brief professional bio)
                </span>
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Share a brief description of your professional background, experience, and career goals..."
                required
                className="mt-1 min-h-32"
              />
            </div>
            
            <div>
              <Label htmlFor="skills" className="text-fem-navy">
                Skills*
                <span className="text-sm text-gray-500 font-normal ml-1">
                  (Comma separated)
                </span>
              </Label>
              <Textarea
                id="skills"
                value={formData.skills}
                onChange={(e) => handleInputChange("skills", e.target.value)}
                placeholder="e.g. Painting, Drywall Repair, Customer Service"
                required
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="photo" className="text-fem-navy">
                  Profile Photo
                  <span className="text-sm text-gray-500 font-normal ml-1">
                    (Optional)
                  </span>
                </Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: Square image, at least 300x300px
                </p>
              </div>
              
              <div>
                <Label htmlFor="resume" className="text-fem-navy">
                  Resume/CV*
                </Label>
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeChange}
                  required
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Accepted formats: PDF, DOC, DOCX (Max 5MB)
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-6">
          <div className="rounded-lg bg-fem-gold/10 p-4 border border-fem-gold/20 mb-6">
            <h3 className="font-semibold text-fem-navy mb-2">Privacy Notice</h3>
            <p className="text-sm text-gray-600">
              Your contact information will be masked when communicating with businesses.
              Your profile will only be visible to verified faith community members and businesses.
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-fem-terracotta hover:bg-fem-terracotta/90 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Profile..." : "Create Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
};
