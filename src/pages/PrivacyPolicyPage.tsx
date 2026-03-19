import React from 'react';
import {
  Shield,
  Eye,
  Lock,
  UserCheck,
  Database,
  Globe,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PrivacyPolicyPage: React.FC = () => {
  const sections = [
    {
      title: 'Information We Collect',
      icon: <Database className="h-6 w-6 text-blue-600" />,
      content: [
        'Personal information such as name, email address, phone number, and shipping address',
        'Payment information (processed securely through our payment partners)',
        'Order history and preferences',
        'Device information and IP address',
        'Cookies and similar tracking technologies',
      ],
    },
    {
      title: 'How We Use Your Information',
      icon: <UserCheck className="h-6 w-6 text-green-600" />,
      content: [
        'Process and fulfill your orders',
        'Communicate with you about your orders and account',
        'Provide customer support',
        'Send promotional emails (with your consent)',
        'Improve our website and services',
        'Prevent fraud and ensure security',
      ],
    },
    {
      title: 'Information Sharing',
      icon: <Globe className="h-6 w-6 text-purple-600" />,
      content: [
        'We do not sell, trade, or rent your personal information to third parties',
        'We may share information with trusted service providers who help us operate our business',
        'We may disclose information when required by law or to protect our rights',
        'Anonymous, aggregated data may be shared for analytics purposes',
      ],
    },
    {
      title: 'Data Security',
      icon: <Lock className="h-6 w-6 text-red-600" />,
      content: [
        'We use industry-standard encryption to protect your data',
        'Secure payment processing through trusted partners',
        'Regular security audits and updates',
        'Limited access to personal information on a need-to-know basis',
        'Secure data storage and transmission protocols',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <a href="/" className="hover:text-green-600 transition-colors">
              Home
            </a>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 font-medium">Privacy Policy</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 bg-green-100 rounded-full">
                <Shield className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your privacy is important to us. This policy explains how we
              collect, use, and protect your personal information.
            </p>
            <div className="flex items-center justify-center mt-4 space-x-4">
              <span className="text-sm text-gray-500">
                Last updated:{' '}
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-500">Version 2.0</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Navigation
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {sections.map((section, index) => (
                <a
                  key={index}
                  href={`#section-${index}`}
                  className="text-sm text-gray-600 hover:text-green-600 transition-colors flex items-center"
                >
                  <ChevronRight className="h-4 w-4 mr-1" />
                  {section.title}
                </a>
              ))}
              <a
                href="#rights"
                className="text-sm text-gray-600 hover:text-green-600 transition-colors flex items-center"
              >
                <ChevronRight className="h-4 w-4 mr-1" />
                Your Rights
              </a>
              <a
                href="#contact"
                className="text-sm text-gray-600 hover:text-green-600 transition-colors flex items-center"
              >
                <ChevronRight className="h-4 w-4 mr-1" />
                Contact
              </a>
            </div>
          </div>

          {/* Introduction */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 ml-3">
                Our Commitment to Privacy
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              At RK InfoTech, we are committed to protecting your privacy and
              ensuring the security of your personal information. This Privacy
              Policy describes how we collect, use, disclose, and safeguard your
              information when you visit our website or make a purchase from us.
              Please read this privacy policy carefully. If you do not agree
              with the terms of this privacy policy, please do not access the
              site.
            </p>
          </div>

          {/* Main Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div
                key={index}
                id={`section-${index}`}
                className="bg-white rounded-2xl shadow-lg p-8 scroll-mt-24"
              >
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {section.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 ml-3">
                    {section.title}
                  </h2>
                </div>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start group">
                      <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 group-hover:scale-125 transition-transform"></div>
                      <p className="text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors">
                        {item}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Additional Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Cookies and Tracking
              </h3>
              <p className="text-gray-600 mb-4">
                We use cookies and similar tracking technologies to enhance your
                browsing experience and analyze website traffic.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></div>
                  Essential cookies for website functionality
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></div>
                  Analytics cookies to understand user behavior
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></div>
                  Marketing cookies for personalized ads
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></div>
                  You can control cookie preferences in your browser
                </li>
              </ul>
            </div>

            <div
              id="rights"
              className="bg-white rounded-2xl shadow-lg p-8 scroll-mt-24"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Your Rights
              </h3>
              <p className="text-gray-600 mb-4">
                You have certain rights regarding your personal information:
              </p>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></div>
                  Access your personal data
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></div>
                  Correct inaccurate information
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></div>
                  Request deletion of your data
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></div>
                  Opt-out of marketing communications
                </li>
              </ul>
            </div>
          </div>

          {/* Data Retention */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Data Retention
            </h3>
            <p className="text-gray-600 mb-4">
              We retain your personal information only for as long as necessary
              to fulfill the purposes outlined in this privacy policy:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Account Information
                </h4>
                <p className="text-gray-600 text-sm">
                  Retained while your account is active and for a reasonable
                  period after account closure.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Order History
                </h4>
                <p className="text-gray-600 text-sm">
                  Retained for 7 years for tax and legal compliance purposes.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Marketing Data
                </h4>
                <p className="text-gray-600 text-sm">
                  Retained until you unsubscribe or request deletion.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Analytics Data
                </h4>
                <p className="text-gray-600 text-sm">
                  Anonymized data may be retained indefinitely for business
                  insights.
                </p>
              </div>
            </div>
          </div>

          {/* Third-Party Services */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Third-Party Services
            </h3>
            <p className="text-gray-600 mb-4">
              We work with trusted third-party service providers to deliver our
              services:
            </p>
            <div className="space-y-4">
              <div className="border-l-4 border-green-600 pl-4">
                <h4 className="font-semibold text-gray-900">
                  Payment Processors
                </h4>
                <p className="text-gray-600 text-sm">
                  Razorpay and other payment gateways process your payment
                  information securely.
                </p>
              </div>
              <div className="border-l-4 border-blue-600 pl-4">
                <h4 className="font-semibold text-gray-900">
                  Shipping Partners
                </h4>
                <p className="text-gray-600 text-sm">
                  Shiprocket and courier services receive shipping information
                  to deliver your orders.
                </p>
              </div>
              <div className="border-l-4 border-purple-600 pl-4">
                <h4 className="font-semibold text-gray-900">
                  Analytics Services
                </h4>
                <p className="text-gray-600 text-sm">
                  Google Analytics helps us understand website usage patterns.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div
            id="contact"
            className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl shadow-lg p-8 mt-8 text-white text-center scroll-mt-24"
          >
            <h3 className="text-2xl font-bold mb-4">
              Questions About Privacy?
            </h3>
            <p className="text-green-100 mb-6">
              If you have any questions about this Privacy Policy or our data
              practices, please contact us.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-green-200" />
                <span>privacy@rkinfotech.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-green-200" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-green-200" />
                <span>123 Business Park, India</span>
              </div>
            </div>
          </div>

          {/* Updates Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mt-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Policy Updates
                </h3>
                <p className="text-yellow-700 text-sm leading-relaxed">
                  We may update this Privacy Policy from time to time. We will
                  notify you of any changes by posting the new Privacy Policy on
                  this page and updating the "Last updated" date. You are
                  advised to review this Privacy Policy periodically for any
                  changes.
                </p>
              </div>
            </div>
          </div>

          {/* Consent */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              By using our website, you consent to our Privacy Policy and agree
              to its terms.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
