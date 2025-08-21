import React from 'react';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FileText, Shield, Users, Handshake, Scale, CheckCircle } from "lucide-react";

const TermsAndConditionsPage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[60vh] bg-gradient-to-br from-fem-navy to-fem-terracotta flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
            style={{
              backgroundImage: 'url(/team-engineer-or-team-foreman-meeting-and-planning-2025-03-13-14-11-21-utc.jpg)'
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-br from-fem-navy/80 to-fem-terracotta/80 z-10"></div>
          <div className="relative z-20 text-center text-white px-4">
            <div className="w-20 h-20 bg-fem-gold rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Terms & <span className="text-fem-gold">Conditions</span>
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              Please read these terms and conditions carefully before using our platform.
            </p>
          </div>
        </section>

        {/* Terms Content Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none">
                <div className="bg-gray-50 p-6 rounded-lg mb-8">
                  <p className="text-gray-700 text-center">
                    <strong>Last updated:</strong> {new Date().toLocaleDateString()}
                  </p>
                </div>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-fem-navy mb-4 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-fem-terracotta" />
                    1. Acceptance of Terms
                  </h2>
                  <p className="text-gray-700 mb-4">
                    By accessing and using Faith Connect ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-fem-navy mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6 text-fem-terracotta" />
                    2. User Responsibilities
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-fem-terracotta mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">You must provide accurate and complete information when creating your account</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-fem-terracotta mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">You are responsible for maintaining the confidentiality of your account credentials</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-fem-terracotta mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">You must not use the platform for any illegal or unauthorized purpose</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-fem-terracotta mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">You must not violate any laws in your jurisdiction through your use of the platform</p>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-fem-navy mb-4 flex items-center gap-2">
                    <Handshake className="w-6 h-6 text-fem-terracotta" />
                    3. Business Listings and Content
                  </h2>
                  <div className="space-y-3">
                    <p className="text-gray-700">Business owners are responsible for the accuracy and legality of all content they post, including:</p>
                    <div className="ml-6 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                        <p className="text-gray-700">Business descriptions and contact information</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                        <p className="text-gray-700">Product and service offerings</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                        <p className="text-gray-700">Pricing information and availability</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                        <p className="text-gray-700">Images and media content</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-fem-navy mb-4 flex items-center gap-2">
                    <Scale className="w-6 h-6 text-fem-terracotta" />
                    4. Prohibited Activities
                  </h2>
                  <p className="text-gray-700 mb-4">Users are prohibited from:</p>
                  <div className="ml-6 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700">Posting false, misleading, or fraudulent information</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700">Harassing, threatening, or intimidating other users</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700">Spamming or sending unsolicited communications</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700">Attempting to gain unauthorized access to the platform</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700">Violating intellectual property rights of others</p>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-fem-navy mb-4">5. Privacy and Data Protection</h2>
                  <p className="text-gray-700 mb-4">
                    Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Platform, to understand our practices regarding the collection and use of your personal information.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-fem-navy mb-4">6. Intellectual Property</h2>
                  <p className="text-gray-700 mb-4">
                    The Platform and its original content, features, and functionality are and will remain the exclusive property of Faith Connect and its licensors. The Platform is protected by copyright, trademark, and other laws.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-fem-navy mb-4">7. Limitation of Liability</h2>
                  <p className="text-gray-700 mb-4">
                    Faith Connect shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Platform.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-fem-navy mb-4">8. Termination</h2>
                  <p className="text-gray-700 mb-4">
                    We may terminate or suspend your account and bar access to the Platform immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-fem-navy mb-4">9. Changes to Terms</h2>
                  <p className="text-gray-700 mb-4">
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-fem-navy mb-4">10. Governing Law</h2>
                  <p className="text-gray-700 mb-4">
                    These Terms shall be interpreted and governed by the laws of Kenya, without regard to its conflict of law provisions.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-fem-navy mb-4">11. Contact Information</h2>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-700 mb-2"><strong>Email:</strong> legal@faithconnect.org</p>
                    <p className="text-gray-700 mb-2"><strong>Phone:</strong> +254 700 000 000</p>
                    <p className="text-gray-700"><strong>Address:</strong> Faith Connect Headquarters, Nairobi, Kenya</p>
                  </div>
                </section>

                <div className="mt-12 p-6 bg-fem-navy text-white rounded-lg text-center">
                  <p className="text-lg">By using Faith Connect, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TermsAndConditionsPage;
