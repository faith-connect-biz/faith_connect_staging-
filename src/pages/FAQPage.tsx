import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQPage: React.FC = () => {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const faqData: FAQItem[] = [
    {
      question: "What is Faith Connect Business Directory?",
      answer: "Faith Connect Business Directory is a platform that connects faith-based businesses with community members. It allows businesses to showcase their services and helps community members find trusted businesses within their faith community.",
      category: "General"
    },
    {
      question: "How do I register my business?",
      answer: "To register your business, click on 'Register Business' in the navigation menu. You'll need to provide business details, contact information, and verify your faith community membership. The process takes about 5-10 minutes.",
      category: "Business"
    },
    {
      question: "How do I join as a community member?",
      answer: "Click on 'Register' in the navigation menu and select 'Community Member'. You'll need to provide your name, contact information, and faith community details. Registration is free and takes just a few minutes.",
      category: "Community"
    },
    {
      question: "Is there a cost to use the platform?",
      answer: "No, both business registration and community membership are completely free. We believe in supporting our faith community without financial barriers.",
      category: "General"
    },
    {
      question: "How do I contact a business?",
      answer: "Once you find a business you're interested in, you can view their profile, see contact information, and reach out directly. Some businesses also offer direct messaging through the platform.",
      category: "Community"
    },
    {
      question: "Can I update my business information?",
      answer: "Yes! Business owners can log in and update their business information, add new services, upload photos, and manage their profile at any time through the 'Manage Business' section.",
      category: "Business"
    },
    {
      question: "How do you verify businesses?",
      answer: "We verify businesses through faith community membership confirmation, business registration documents, and community feedback. This ensures all businesses on our platform are legitimate and faith-aligned.",
      category: "Business"
    },
    {
      question: "What types of businesses can join?",
      answer: "Any faith-based business can join, including retail, services, professional services, food and beverage, health and wellness, and more. The key requirement is that the business owner shares our faith values.",
      category: "Business"
    },
    {
      question: "How do I report an issue?",
      answer: "If you encounter any issues, you can contact us through the 'About' page or email us directly at support@faithconnect.org. We typically respond within 24 hours.",
      category: "General"
    },
    {
      question: "Can I remove my business listing?",
      answer: "Yes, business owners can deactivate or remove their listing at any time through their business management dashboard. You can also temporarily hide your listing if needed.",
      category: "Business"
    },
    {
      question: "How do I find businesses in my area?",
      answer: "Use the search and filter options on the Business Directory page. You can search by location, category, service type, or business name. The platform also shows businesses near your location.",
      category: "Community"
    },
    {
      question: "What if I forget my password?",
      answer: "Click on 'Sign In' and then 'Forgot Password'. Enter your email address and we'll send you a password reset link. Make sure to check your spam folder if you don't receive it.",
      category: "General"
    }
  ];

  const categories = ['General', 'Business', 'Community'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-fem-navy mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600">
              Find answers to common questions about Faith Connect Business Directory
            </p>
          </div>

          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category} className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-fem-navy mb-6 border-b border-gray-200 pb-2">
                  {category} Questions
                </h2>
                
                <div className="space-y-4">
                  {faqData
                    .filter((item) => item.category === category)
                    .map((item, index) => {
                      const globalIndex = faqData.findIndex((faq) => faq === item);
                      const isOpen = openItems.has(globalIndex);
                      
                      return (
                        <div key={globalIndex} className="border border-gray-200 rounded-lg">
                          <button
                            onClick={() => toggleItem(globalIndex)}
                            className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-semibold text-fem-navy">
                              {item.question}
                            </span>
                            {isOpen ? (
                              <ChevronUp className="h-5 w-5 text-fem-terracotta" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-fem-terracotta" />
                            )}
                          </button>
                          
                          {isOpen && (
                            <div className="px-6 pb-4">
                              <p className="text-gray-700 leading-relaxed">
                                {item.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-fem-navy text-white rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              Still Have Questions?
            </h3>
            <p className="text-lg mb-6">
              Can't find the answer you're looking for? We're here to help!
            </p>
            <div className="space-y-2 text-lg">
              <p><strong>Email:</strong> support@faithconnect.org</p>
              <p><strong>Phone:</strong> +254 700 000 000</p>
              <p><strong>Response Time:</strong> Within 24 hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
