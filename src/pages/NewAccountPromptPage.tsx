import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';

interface LocationState {
  contact: string;
  method: 'email' | 'phone';
}

const maskEmail = (email: string) => {
  const [username, domain] = email.split('@');
  if (!domain) return email;
  const visible = username.slice(0, 2);
  const masked = '*'.repeat(Math.max(username.length - 2, 0));
  return `${visible}${masked}@${domain}`;
};

const maskPhone = (phone: string) => {
  if (phone.length <= 4) return phone;
  const visibleStart = phone.slice(0, 3);
  const visibleEnd = phone.slice(-3);
  const masked = '*'.repeat(Math.max(phone.length - 6, 0));
  return `${visibleStart}${masked}${visibleEnd}`;
};

const NewAccountPromptPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state || {}) as LocationState;

  useEffect(() => {
    if (!state.contact || !state.method) {
      navigate('/login', { replace: true });
    }
  }, [state.contact, state.method, navigate]);

  const displayContact =
    state.method === 'email'
      ? maskEmail(state.contact)
      : maskPhone(state.contact);

  return (
    <div className="min-h-screen bg-white relative">
      <Navbar />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-radial from-fem-terracotta/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-radial from-fem-terracotta/20 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex items-center justify-center px-4 py-24">
        <Card className="w-full max-w-xl shadow-2xl border-0 bg-white">
          <CardHeader className="text-center space-y-4 pt-10">
            <div className="mx-auto w-16 h-16 rounded-full bg-fem-terracotta/10 flex items-center justify-center text-fem-terracotta text-3xl">
              ✨
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-fem-navy">
                Welcome to Faith Connect!
              </h1>
              <p className="text-fem-darkgray text-sm sm:text-base max-w-md mx-auto">
               Looks like this is your first time here. Let’s get you set up.
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 px-6 pb-10">
            <div className="rounded-2xl border border-fem-terracotta/20 bg-fem-terracotta/5 p-6 text-center space-y-2">
              <p className="text-sm uppercase tracking-wide text-fem-terracotta font-semibold">
                Signing in with
              </p>
              <p className="text-lg font-semibold text-fem-navy">
                {displayContact}
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-fem-terracotta hover:underline"
              >
                Use a different {state.method}
              </button>
            </div>

            <Button
              size="lg"
              className="w-full h-12 text-base font-semibold rounded-full bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => navigate('/verify-otp')}
            >
              Proceed to create an account
            </Button>

            <div className="text-center space-y-1">
              <p className="text-sm text-fem-darkgray font-semibold">
                Already a member?
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-fem-terracotta hover:underline"
              >
                Sign in with another email or phone
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewAccountPromptPage;

