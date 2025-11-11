import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Mail, ArrowRight, Loader2, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { toast } from 'sonner';
import { Navbar } from '@/components/layout/Navbar';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setOTPData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+254');
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('phone');

  const validateEmail = (email: string) => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email) && !email.includes('..') && !email.endsWith('.');
  };

  const validatePhone = (phone: string) => {
    const normalized = phone.replace(/\s/g, '');
    const kenyaRegex = /^\+254\d{9}$/;
    return kenyaRegex.test(normalized);
  };

  const handleSendOTP = async () => {
    const contact = activeTab === 'email' ? email.trim() : phone.trim();
    
    if (!contact.trim()) {
      toast.error(`Please enter your ${activeTab}`);
      return;
    }

    if (activeTab === 'email' && !validateEmail(contact)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (activeTab === 'phone' && !validatePhone(contact)) {
      toast.error('Please enter a valid Kenyan phone number (e.g., +254712345678)');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.sendOTP(contact, activeTab);

      if (response.success) {
        const otpContext = {
          contact,
          method: activeTab,
          userId: response.userId,
          requiresProfileCompletion: response.requiresProfileCompletion,
          otp: response.otp,
        };

        setOTPData(otpContext);

        if (response.requiresProfileCompletion) {
          toast.success('Let’s create your Faith Connect account.');
          navigate('/new-account', {
            state: {
              contact,
              method: activeTab,
            },
          });
          return;
        }

        toast.success(`OTP sent to your ${activeTab}`);
        if (response.otp) {
          console.info(`DEV OTP for ${contact}: ${response.otp}`);
        }
        navigate('/verify-otp');
      } else {
        toast.error(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendOTP();
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Orange background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-radial from-fem-terracotta/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-radial from-fem-terracotta/20 to-transparent rounded-full blur-3xl" />
      </div>
      <Navbar />
      <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8 pt-20 relative z-10 min-h-screen">

      <Card className="w-full max-w-md sm:max-w-lg relative z-10 shadow-2xl border-0 bg-white/15 backdrop-blur-xl border border-white/20 mx-4 sm:mx-0">
        <CardHeader className="text-center pb-6 pt-8 px-6 sm:px-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-fem-navy mb-3">
            Welcome to Faith Connect😎
          </h1>
          <p className="text-fem-darkgray text-sm sm:text-base leading-relaxed">
            Sign in instantly using your phone number or email
          </p>
        </CardHeader>

        <CardContent className="px-6 sm:px-8 pb-8 space-y-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'email' | 'phone')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/10 backdrop-blur-sm p-1 rounded-xl border border-white/20">
              <TabsTrigger 
                value="phone"
                className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:shadow-lg data-[state=active]:text-fem-terracotta rounded-lg transition-all duration-500 backdrop-blur-sm"
              >
                <Phone className="w-4 h-4" />
                Phone
              </TabsTrigger>
              <TabsTrigger 
                value="email" 
                className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:shadow-lg data-[state=active]:text-fem-terracotta rounded-lg transition-all duration-500 backdrop-blur-sm"
              >
                <Mail className="w-4 h-4" />
                Email
              </TabsTrigger>
            </TabsList>

            <TabsContent value="phone" className="space-y-6 mt-0">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-fem-navy">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fem-darkgray w-4 h-4 sm:w-5 sm:h-5" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g., +254712345678"
                    value={phone}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, '');

                      if (!digitsOnly) {
                        setPhone('+254');
                        return;
                      }

                      let formatted: string;
                      if (digitsOnly.startsWith('254')) {
                        formatted = '+254' + digitsOnly.slice(3);
                      } else if (digitsOnly.startsWith('0')) {
                        formatted = '+254' + digitsOnly.slice(1);
                      } else {
                        formatted = '+254' + digitsOnly;
                      }

                      setPhone(formatted);
                    }}
                    onKeyPress={handleKeyPress}
                    className="pl-10 h-12 sm:h-14 border-white/20 focus:border-fem-terracotta focus:ring-fem-terracotta rounded-xl bg-white/10 backdrop-blur-sm text-sm sm:text-base"
                    disabled={isLoading}
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="email" className="space-y-6 mt-0">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-fem-navy">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fem-darkgray w-4 h-4 sm:w-5 sm:h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 h-12 sm:h-14 border-white/20 focus:border-fem-terracotta focus:ring-fem-terracotta rounded-xl bg-white/10 backdrop-blur-sm text-sm sm:text-base"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Add proper spacing before the button */}
          <div className="mt-8">
            <Button
              onClick={handleSendOTP}
              disabled={
                isLoading ||
                (activeTab === 'email'
                  ? !email.trim()
                  : phone === '+254' || phone.trim().length <= 4)
              }
              size="lg"
              className="w-full bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 border border-white/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                  Checking your details...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </>
              )}
            </Button>
          </div>

          <div className="mt-6 text-center">
                <p className="text-xs text-fem-darkgray">
                  By continuing, you agree to our{' '}
                  <a href="/terms-and-conditions" className="text-fem-terracotta hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy-policy" className="text-fem-terracotta hover:underline">
                    Privacy Policy
                  </a>
                </p>
              </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default LoginPage;


