import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold text-fem-navy mb-8 text-center">
            Privacy Policy
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-fem-navy mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 mb-4">When you register with Faith Connect Business Directory, we collect personal information including name, contact details, business information, and usage data.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-fem-navy mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">We use your information to provide services, connect you with businesses, send updates, improve our platform, and ensure security.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-fem-navy mb-4">3. Information Sharing</h2>
              <p className="text-gray-700 mb-4">We do not sell your personal information. We may share information with your consent, other users, service providers, or when required by law.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-fem-navy mb-4">4. Data Security</h2>
              <p className="text-gray-700 mb-4">We implement encryption, access controls, and regular security assessments to protect your information.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-fem-navy mb-4">5. Your Rights</h2>
              <p className="text-gray-700 mb-4">You have the right to access, correct, delete, and export your data, as well as opt-out of marketing communications.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-fem-navy mb-4">6. Contact Us</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Email:</strong> privacy@faithconnect.org</p>
                <p className="text-gray-700"><strong>Phone:</strong> +254 700 000 000</p>
                <p className="text-gray-700"><strong>Address:</strong> Faith Connect Headquarters, Nairobi, Kenya</p>
              </div>
            </section>

            <div className="mt-12 p-6 bg-fem-navy text-white rounded-lg text-center">
              <p className="text-lg">By using Faith Connect Business Directory, you agree to this privacy policy.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
