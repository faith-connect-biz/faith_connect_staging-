import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileCreationForm from '@/components/ProfileCreationForm';

const CreateProfilePage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = (profile: any) => {
    console.log('Profile created:', profile);
    // You can navigate to a success page or dashboard
    // navigate('/dashboard');
  };

  const handleError = (error: string) => {
    console.error('Profile creation error:', error);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <ProfileCreationForm onSuccess={handleSuccess} onError={handleError} />
    </div>
  );
};

export default CreateProfilePage;
