import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Smartphone, Mail, Shield, Users, Building2 } from 'lucide-react';

const AuthDemoPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-fem-gray via-white to-fem-lightgold py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-fem-navy mb-4">
              Modern Passwordless Authentication 🔐
            </h1>
            <p className="text-xl text-fem-darkgray mb-8">
              Experience our secure OTP-based authentication flow
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-fem-terracotta to-fem-gold rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-fem-navy">Phone Authentication</h3>
                <p className="text-fem-darkgray">Login using your phone number with SMS OTP</p>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-sm text-fem-darkgray space-y-2 mb-6">
                  <li>• Enter your phone number</li>
                  <li>• Receive SMS verification code</li>
                  <li>• Enter 6-digit OTP</li>
                  <li>• Access your account instantly</li>
                </ul>
                <Link to="/login">
                  <Button className="w-full bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90">
                    Try Phone Login
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-fem-navy to-fem-terracotta rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-fem-navy">Email Authentication</h3>
                <p className="text-fem-darkgray">Login using your email address with email OTP</p>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-sm text-fem-darkgray space-y-2 mb-6">
                  <li>• Enter your email address</li>
                  <li>• Receive email verification code</li>
                  <li>• Enter 6-digit OTP</li>
                  <li>• Access your account instantly</li>
                </ul>
                <Link to="/login">
                  <Button className="w-full bg-gradient-to-r from-fem-navy to-fem-terracotta hover:from-fem-navy/90 hover:to-fem-terracotta/90">
                    Try Email Login
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-fem-terracotta to-fem-gold rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-fem-navy">Secure</h4>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-fem-darkgray">
                  No passwords to remember or compromise. OTP codes expire in 5 minutes.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-fem-navy to-fem-terracotta rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-fem-navy">Community Member</h4>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-fem-darkgray">
                  Join as a community member to discover and connect with faith-based businesses.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-fem-gold to-fem-terracotta rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-fem-navy">Business Owner</h4>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-fem-darkgray">
                  Register as a business owner to list your services and connect with the community.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="py-8">
                <h3 className="text-2xl font-bold text-fem-navy mb-4">
                  Ready to Get Started?
                </h3>
                <p className="text-fem-darkgray mb-6">
                  Experience the future of authentication with our passwordless OTP system
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/login">
                    <Button size="lg" className="bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90">
                      Start Authentication Flow
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/">
                    <Button size="lg" variant="outline" className="border-fem-gold/50 hover:border-fem-terracotta text-fem-navy">
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDemoPage;
