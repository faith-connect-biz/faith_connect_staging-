import React from 'react';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Shield, Database, Eye, Lock, Users, Globe, Cookie, Key } from "lucide-react";

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[60vh] bg-gradient-to-br from-fem-navy to-fem-terracotta flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
            style={{
              backgroundImage: 'url(/man-in-apron-packing-boxes-at-a-table-surrounded-2025-03-08-11-33-37-utc 2.jpg)'
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-br from-fem-navy/80 to-fem-terracotta/80 z-10"></div>
          <div className="relative z-20 text-center text-white px-4">
            <div className="w-20 h-20 bg-fem-gold rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Privacy <span className="text-fem-gold">Policy</span>
          </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              We are committed to protecting your personal data and ensuring your privacy.
            </p>
          </div>
        </section>
          
        {/* Privacy Policy Content Section */}
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
                  <h2 className="text-2xl font-bold text-fem-navy mb-4">1. Introduction</h2>
                  <p className="text-gray-700 mb-4">
                    Faith Connect ("we," "our," or "us") is a digital platform that provides a space for users to interact, post, and discover services and products. In delivering these services, we are committed to protecting your personal data and ensuring your privacy in compliance with the Data Protection Act, 2019 of Kenya and all applicable regulations.
                  </p>
                  <p className="text-gray-700 mb-4">
                    This Privacy Policy outlines the types of personal data we collect, how we collect it, the purposes for which we use it, how it is stored, your rights as a data subject, and how we protect your data. By using our platform, you acknowledge that you have read, understood, and agree to the terms of this Privacy Policy.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-fem-navy mb-4 flex items-center gap-2">
                    <Database className="w-6 h-6 text-fem-terracotta" />
                    2. Data Controller Information
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Faith Connect acts as the Data Controller within the meaning of the Data Protection Act, 2019. As a Data Controller, we determine the purpose and means of processing your personal data.
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 mb-2"><strong>Email:</strong> info@faithconnect.biz</p>
                    <p className="text-gray-700 mb-2"><strong>Phone:</strong> 0714777797</p>
                    <p className="text-gray-700 mb-2"><strong>Physical Address:</strong> Faith Connect Headquarters, Nairobi, Kenya</p>
                    <p className="text-gray-700"><strong>ODPC Registration Number:</strong> [To be provided]</p>
                  </div>
                </section>

            <section className="mb-8">
                  <h2 className="text-2xl font-bold text-fem-navy mb-4 flex items-center gap-2">
                    <Eye className="w-6 h-6 text-fem-terracotta" />
                    3. Data We Collect
                  </h2>
                  <p className="text-gray-700 mb-4">
                    We collect personal data that you voluntarily provide to us and data that we collect automatically as part of your interaction with our platform.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-fem-navy mb-3">3.1 Data Provided by You:</h3>
                  <p className="text-gray-700 mb-3">When you create an account or use our Service, we may ask you to provide specific personal data to enable us to deliver the Service effectively. This may include:</p>
                  <div className="ml-6 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700"><strong>Required Information:</strong> your name, phone number, email address, FEM partnership number etc.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700"><strong>Additional Profile Details:</strong> address information, working hours, and other optional profile details</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700"><strong>Business Verification Information:</strong> KRA pin certificate, business registration certificates, company incorporation certificates etc.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700"><strong>Identity Verification Data:</strong> National ID or Passport for account verification</p>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-fem-navy mb-3 mt-6">3.2 Data Collected Automatically:</h3>
                  <p className="text-gray-700 mb-3">We automatically collect certain information when you interact with our platform, including:</p>
                  <div className="ml-6 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700"><strong>Device and Technical Information:</strong> Language settings, IP address, time zone, device type and model, operating system, browser type</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700"><strong>Location Data:</strong> Approximate location derived from your IP address</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700"><strong>Usage Data:</strong> Pages visited, features used, search history, time spent on platform</p>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-fem-navy mb-4">4. Legal Basis for Collecting Personal Data</h2>
                  <p className="text-gray-700 mb-4">We rely on the following legal bases for collecting your personal data:</p>
                  <div className="ml-6 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700"><strong>Consent:</strong> Where you have given us explicit consent to collect your data for specific purposes</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700"><strong>Contractual Necessity:</strong> Where collection is necessary for the performance of a contract</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700"><strong>Legal Obligation:</strong> Where we are required to process data to comply with legal requirements</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700"><strong>Legitimate Interests:</strong> Where it's necessary for our legitimate interests, provided they don't override your rights</p>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-fem-navy mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6 text-fem-terracotta" />
                    5. Use of Your Personal Data
                  </h2>
                  <p className="text-gray-700 mb-4">We use your personal data to operate, manage, and improve the Faith Connect platform. Specifically, we use your data for the following purposes:</p>
                  <div className="ml-6 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700">To create and manage your account and user profile</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700">To verify your identity and the legitimacy of your business</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700">To allow you to post, edit, and manage listings</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700">To facilitate communication with other users on the platform</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700">To detect and prevent fraud, abuse, and impersonation</p>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-fem-navy mb-4">6. Disclosure of Personal Data</h2>
                  <p className="text-gray-700 mb-4">
                    We do not sell or rent your personal data to third parties. We require all third-party processors handling personal data on our behalf to process such data strictly in accordance with our instructions, maintain the confidentiality of the data, implement appropriate security measures, and comply with all applicable Kenyan data protection laws.
                  </p>
                  <p className="text-gray-700 mb-4">We may disclose your personal data in the following circumstances:</p>
                  <div className="ml-6 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700">To our platform administrators, developers, and customer support personnel for operational purposes</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700">To verified third-party service providers that support our operations</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700">To other users of the platform, but only to the extent necessary to facilitate legitimate transactions</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700">To law enforcement or government agencies when required by applicable law</p>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-fem-navy mb-4">7. Marketing and Promotional Communications</h2>
                  <p className="text-gray-700 mb-4">
                    We will only send you marketing and promotional communications where you have provided explicit, informed, and specific consent to receive them, in compliance with the Data Protection Act, 2019. Such consent may be withdrawn at any time through your account settings or by contacting us.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-fem-navy mb-4 flex items-center gap-2">
                    <Cookie className="w-6 h-6 text-fem-terracotta" />
                    8. Cookies and Tracking Technologies
                  </h2>
                  <p className="text-gray-700 mb-4">
                    We use cookies and similar tracking technologies to improve your experience, manage sessions, and understand usage patterns. A cookie is a small text file placed on your device that helps us recognize your browser or device upon returning to the Platform.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-fem-navy mb-3">8.1 Types of Cookies We Use:</h3>
                  <div className="ml-6 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700"><strong>Essential Cookies:</strong> Required to enable core features such as account login and navigation</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700"><strong>Performance Cookies:</strong> Collect anonymous data on how users interact with the Platform</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700"><strong>Functionality Cookies:</strong> Remember your preferences and enhance your experience</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700"><strong>Security Cookies:</strong> Help detect fraudulent activity and enforce account protection</p>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-fem-navy mb-4 flex items-center gap-2">
                    <Globe className="w-6 h-6 text-fem-terracotta" />
                    9. Cross-Border Data Transfers
                  </h2>
                  <p className="text-gray-700 mb-4">
                    We may transfer, store, or process your personal data in countries outside the Republic of Kenya, including but not limited to countries where our servers, service providers, or partners are located. Such transfers may be necessary for the operation of our platform, provision of services, customer support, system hosting, identity verification, analytics, and other legitimate business purposes.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-fem-navy mb-4">10. Data Retention</h2>
                  <p className="text-gray-700 mb-4">
                    We retain your personal data only as long as is necessary to fulfill the purposes outlined in this Privacy Policy or as required by law. When your account is closed or inactive for a prolonged period, we may anonymize or securely delete your data.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-fem-navy mb-4 flex items-center gap-2">
                    <Lock className="w-6 h-6 text-fem-terracotta" />
                    11. Data Security
                  </h2>
                  <p className="text-gray-700 mb-4">
                    As a registered user of the Faith Connect platform, you bear full responsibility for safeguarding the confidentiality of your account credentials, including your username and password. Any and all actions or activities conducted through your account shall be deemed to have been carried out by you, and you accept complete responsibility for such actions.
                  </p>
                  <p className="text-gray-700 mb-4">
                    We are committed to protecting the security and integrity of your personal data and have implemented appropriate technical, administrative, and physical safeguards designed to prevent your information from being accidentally lost, accessed, used, altered, or disclosed by unauthorized persons.
                  </p>
            </section>

            <section className="mb-8">
                  <h2 className="text-2xl font-bold text-fem-navy mb-4 flex items-center gap-2">
                    <Key className="w-6 h-6 text-fem-terracotta" />
                    12. Your Rights as a Data Subject
                  </h2>
                  <p className="text-gray-700 mb-4">Under the Kenyan Data Protection Act, you have the following rights:</p>
                  <div className="ml-6 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700"><strong>Right to Access:</strong> You may request access to the personal data we hold about you</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700"><strong>Right to Rectification:</strong> You may request corrections to any inaccurate or incomplete data</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700"><strong>Right to Erasure:</strong> You may request deletion of your data, subject to lawful retention requirements</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700"><strong>Right to Object:</strong> You may object to processing based on legitimate interests or direct marketing</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700"><strong>Right to Data Portability:</strong> You may request your personal data in a structured format</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700"><strong>Right to Withdraw Consent:</strong> Where processing is based on consent, you may withdraw it at any time</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700"><strong>Right to Lodge a Complaint:</strong> You may lodge a complaint with the ODPC if you believe your rights have been violated</p>
                    </div>
                  </div>
            </section>

            <section className="mb-8">
                  <h2 className="text-2xl font-bold text-fem-navy mb-4">13. Children's Privacy</h2>
                  <p className="text-gray-700 mb-4">
                    Faith Connect does not knowingly collect personal data from individuals under the age of 18 without verified parental or guardian consent. If we become aware that a child has provided us with personal data without consent, we will delete it immediately.
                  </p>
            </section>

            <section className="mb-8">
                  <h2 className="text-2xl font-bold text-fem-navy mb-4">14. Third-Party Links and Services</h2>
                  <p className="text-gray-700 mb-4">
                    Our platform may contain links to third-party websites, tools, or services. This Privacy Policy does not govern those third-party services, and we are not responsible for their content or privacy practices.
                  </p>
            </section>

            <section className="mb-8">
                  <h2 className="text-2xl font-bold text-fem-navy mb-4">15. Changes to This Privacy Policy</h2>
                  <p className="text-gray-700 mb-4">
                    We may update this Privacy Policy from time to time to reflect changes in our practices, legal requirements, or platform features. When we do, we will revise the "Last Updated" date at the top of this policy. If the changes are significant, we will notify you through the platform, by email, or via other reasonable means.
                  </p>
            </section>

            <section className="mb-8">
                  <h2 className="text-2xl font-bold text-fem-navy mb-4">16. Contact Us</h2>
                  <p className="text-gray-700 mb-4">If you have any questions, concerns, or feedback regarding this Privacy Policy or our data protection practices, please contact:</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 mb-2"><strong>Faith Connect Data Protection Officer</strong></p>
                    <p className="text-gray-700 mb-2"><strong>Email:</strong> info@faithconnect.biz</p>
                    <p className="text-gray-700 mb-2"><strong>Phone:</strong> 0714777797</p>
                    <p className="text-gray-700"><strong>Postal Address:</strong> Faith Connect Headquarters, Nairobi, Kenya</p>
              </div>
            </section>

            <div className="mt-12 p-6 bg-fem-navy text-white rounded-lg text-center">
              <p className="text-lg">By using Faith Connect Business Directory, you agree to this privacy policy.</p>
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

export default PrivacyPolicyPage;
