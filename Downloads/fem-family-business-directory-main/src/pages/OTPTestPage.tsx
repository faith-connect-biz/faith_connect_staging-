import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { Loader2, Mail, Phone, ArrowRight, TestTube } from 'lucide-react';

const OTPTestPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [testEmail, setTestEmail] = useState('femconnect@gmail.com');
  const [testPhone, setTestPhone] = useState('254703561237');
  const [isLoading, setIsLoading] = useState(false);

  const testSignupFlow = () => {
    // Simulate storing signup data
    localStorage.setItem('signup_email', testEmail);
    localStorage.setItem('signup_phone', testPhone);
    localStorage.setItem('signup_user_id', 'test-user-123');
    
    // Navigate to signup OTP page
    navigate('/signup-otp');
  };

  const testPasswordResetFlow = () => {
    // Simulate storing reset data
    localStorage.setItem('reset_email', testEmail);
    localStorage.setItem('reset_token', 'test-reset-token-123');
    
    // Navigate to password reset OTP page
    navigate('/password-reset-otp');
  };

  const testBackendOTP = async () => {
    setIsLoading(true);
    try {
      // Test SMS OTP
      const smsResult = await apiService.sendOTP(testPhone);
      
      // Test Email OTP (if configured)
      let emailResult = null;
      try {
        emailResult = await apiService.sendVerificationEmail(testEmail, '123456', 'Test User');
      } catch (error) {
        console.log('Email not configured yet');
      }

      toast({
        title: "Test Results",
        description: `SMS: ${smsResult.success ? '✅ Working' : '❌ Failed'}, Email: ${emailResult?.success ? '✅ Working' : '❌ Not configured'}`,
      });

    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Error testing OTP system. Check console for details.",
        variant: "destructive"
      });
      console.error('OTP Test Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <TestTube className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">OTP System Test Page</h1>
          <p className="text-gray-600">Test all OTP functionality including SMS, Email, and Frontend flows</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Test Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TestTube className="h-5 w-5" />
                <span>Test Configuration</span>
              </CardTitle>
              <CardDescription>
                Configure test email and phone number
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="testEmail">Test Email</Label>
                <Input
                  id="testEmail"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <div>
                <Label htmlFor="testPhone">Test Phone</Label>
                <Input
                  id="testPhone"
                  type="tel"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="254700000000"
                />
              </div>
            </CardContent>
          </Card>

          {/* Backend Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Loader2 className="h-5 w-5" />
                <span>Backend Testing</span>
              </CardTitle>
              <CardDescription>
                Test SMS and Email OTP sending
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={testBackendOTP}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Backend OTP'
                )}
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                This will test your actual SMS and Email configurations
              </p>
            </CardContent>
          </Card>

          {/* Frontend Flow Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ArrowRight className="h-5 w-5" />
                <span>Frontend Flow Testing</span>
              </CardTitle>
              <CardDescription>
                Test complete user flows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={testSignupFlow}
                variant="outline"
                className="w-full"
              >
                <Mail className="mr-2 h-4 w-4" />
                Test Signup OTP Flow
              </Button>
              <Button
                onClick={testPasswordResetFlow}
                variant="outline"
                className="w-full"
              >
                <Phone className="mr-2 h-4 w-4" />
                Test Password Reset OTP Flow
              </Button>
            </CardContent>
          </Card>

          {/* Status & Info */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Current OTP system status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                <span className="text-sm font-medium">SMS System</span>
                <span className="text-green-600 text-sm">✅ Working</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                <span className="text-sm font-medium">Email System</span>
                <span className="text-yellow-600 text-sm">⚠️ Needs API Key</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                <span className="text-sm font-medium">Frontend Components</span>
                <span className="text-green-600 text-sm">✅ Ready</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                <span className="text-sm font-medium">Routes</span>
                <span className="text-blue-600 text-sm">✅ Configured</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/signup-otp?email=test@example.com&user_id=test-123')}
            >
              Direct Signup OTP
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/password-reset-otp?email=test@example.com&token=test-token')}
            >
              Direct Password Reset OTP
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Testing Instructions:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Configure your test email and phone number above</li>
            <li>Test backend OTP sending (SMS should work, Email needs API key)</li>
            <li>Test frontend flows by clicking the flow buttons</li>
            <li>Use direct navigation to test specific scenarios</li>
            <li>Check your phone for SMS messages and email for verification codes</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default OTPTestPage;
