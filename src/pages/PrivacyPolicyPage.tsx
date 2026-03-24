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
  Cookie,
  FileText,
  Clock,
  Users,
  Share2,
  ShieldCheck,
  Server,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Sparkles,
  Heart,
  Leaf,
  Award,
  Fingerprint,
  Cloud,
  TrendingUp,
  Download,
  Settings,
  Bell,
  MessageSquare,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

const PrivacyPolicyPage: React.FC = () => {
  const sections = [
    {
      title: 'Information We Collect',
      icon: <Database className="h-6 w-6 text-blue-600" />,
      gradient: 'from-blue-50 to-cyan-50',
      iconBg: 'bg-blue-100',
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
      gradient: 'from-green-50 to-emerald-50',
      iconBg: 'bg-green-100',
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
      gradient: 'from-purple-50 to-pink-50',
      iconBg: 'bg-purple-100',
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
      gradient: 'from-red-50 to-orange-50',
      iconBg: 'bg-red-100',
      content: [
        'We use industry-standard encryption to protect your data',
        'Secure payment processing through trusted partners',
        'Regular security audits and updates',
        'Limited access to personal information on a need-to-know basis',
        'Secure data storage and transmission protocols',
      ],
    },
  ];

  const stats = [
    { label: 'Data Points Protected', value: '10,000+', icon: <Database className="h-5 w-5" /> },
    { label: 'Security Audits', value: 'Monthly', icon: <ShieldCheck className="h-5 w-5" /> },
    { label: 'GDPR Compliant', value: '100%', icon: <CheckCircle className="h-5 w-5" /> },
    { label: 'Trust Score', value: '4.9/5', icon: <Award className="h-5 w-5" /> },
  ];

  const cookiesInfo = [
    { name: 'Essential Cookies', purpose: 'Required for website functionality', duration: 'Session', icon: <Settings className="h-4 w-4" /> },
    { name: 'Analytics Cookies', purpose: 'Track user behavior for improvements', duration: '1 Year', icon: <TrendingUp className="h-4 w-4" /> },
    { name: 'Marketing Cookies', purpose: 'Personalized advertisements', duration: '2 Years', icon: <Bell className="h-4 w-4" /> },
    { name: 'Preference Cookies', purpose: 'Remember user preferences', duration: '1 Year', icon: <Heart className="h-4 w-4" /> },
  ];

  const thirdPartyServices = [
    { name: 'Razorpay', type: 'Payment Processing', icon: <CreditCard className="h-5 w-5" />, color: 'blue' },
    { name: 'Shiprocket', type: 'Shipping & Logistics', icon: <Truck className="h-5 w-5" />, color: 'green' },
    { name: 'Google Analytics', type: 'Analytics', icon: <TrendingUp className="h-5 w-5" />, color: 'yellow' },
    { name: 'AWS', type: 'Cloud Hosting', icon: <Cloud className="h-5 w-5" />, color: 'purple' },
  ];

  const userRights = [
    { title: 'Right to Access', description: 'Request a copy of your personal data', icon: <Eye className="h-5 w-5" />, color: 'blue' },
    { title: 'Right to Rectification', description: 'Correct inaccurate information', icon: <FileText className="h-5 w-5" />, color: 'green' },
    { title: 'Right to Erasure', description: 'Request deletion of your data', icon: <XCircle className="h-5 w-5" />, color: 'red' },
    { title: 'Right to Object', description: 'Opt-out of marketing communications', icon: <Bell className="h-5 w-5" />, color: 'orange' },
    { title: 'Right to Data Portability', description: 'Receive data in a structured format', icon: <Download className="h-5 w-5" />, color: 'purple' },
    { title: 'Right to Restrict Processing', description: 'Limit how we use your data', icon: <Settings className="h-5 w-5" />, color: 'indigo' },
  ];

  const dataRetention = [
    { type: 'Account Information', duration: 'Active account + 3 years', icon: <Users className="h-5 w-5" /> },
    { type: 'Order History', duration: '7 years (tax compliance)', icon: <Clock className="h-5 w-5" /> },
    { type: 'Marketing Data', duration: 'Until opt-out/deletion', icon: <Mail className="h-5 w-5" /> },
    { type: 'Analytics Data', duration: 'Anonymized - Indefinite', icon: <TrendingUp className="h-5 w-5" /> },
    { type: 'Support Tickets', duration: '3 years', icon: <MessageSquare className="h-5 w-5" /> },
    { type: 'Security Logs', duration: '1 year', icon: <Shield className="h-5 w-5" /> },
  ];

  const securityFeatures = [
    { feature: 'SSL Encryption', status: 'Active', icon: <Lock className="h-4 w-4" /> },
    { feature: 'PCI DSS Compliant', status: 'Certified', icon: <ShieldCheck className="h-4 w-4" /> },
    { feature: 'Two-Factor Authentication', status: 'Available', icon: <Fingerprint className="h-4 w-4" /> },
    { feature: 'Regular Security Audits', status: 'Quarterly', icon: <CheckCircle className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col">

      {/* Breadcrumb */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <a href="/" className="hover:text-green-600 transition-colors flex items-center gap-1">
              <Leaf className="w-3 h-3" />
              <span>Home</span>
            </a>
            <ChevronRight className="h-4 w-4" />
            <span className="text-green-600 font-medium">Privacy Policy</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative mb-16"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl opacity-5 blur-3xl" />
            <div className="relative bg-gradient-to-br from-white via-green-50/30 to-white rounded-3xl shadow-xl p-12 text-center overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-green-200 to-emerald-200 rounded-full opacity-20 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-200 to-cyan-200 rounded-full opacity-20 blur-3xl" />
              
              <div className="relative">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full px-6 py-2 mb-6 shadow-sm">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-green-700 font-medium">Your Privacy Matters</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                  Privacy &
                  <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Data Protection
                  </span>
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  We are committed to protecting your privacy and ensuring the security 
                  of your personal information. Learn how we handle your data with care.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full" />
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FileText className="h-4 w-4" />
                    Version 2.0
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
          >
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all group">
                <div className="inline-flex p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Quick Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Navigation className="h-5 w-5 text-green-600" />
              Quick Navigation
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {sections.map((section, index) => (
                <a
                  key={index}
                  href={`#section-${index}`}
                  className="text-sm text-gray-600 hover:text-green-600 transition-colors flex items-center gap-2 p-2 rounded-lg hover:bg-green-50"
                >
                  <ChevronRight className="h-3 w-3" />
                  {section.title}
                </a>
              ))}
              <a
                href="#rights"
                className="text-sm text-gray-600 hover:text-green-600 transition-colors flex items-center gap-2 p-2 rounded-lg hover:bg-green-50"
              >
                <ChevronRight className="h-3 w-3" />
                Your Rights
              </a>
              <a
                href="#contact"
                className="text-sm text-gray-600 hover:text-green-600 transition-colors flex items-center gap-2 p-2 rounded-lg hover:bg-green-50"
              >
                <ChevronRight className="h-3 w-3" />
                Contact Us
              </a>
            </div>
          </motion.div>

          {/* Main Sections */}
          <div className="space-y-8 mb-12">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                id={`section-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className={`bg-gradient-to-br ${section.gradient} rounded-2xl shadow-lg overflow-hidden scroll-mt-24`}
              >
                <div className="p-8">
                  <div className="flex items-center mb-6">
                    <div className={`p-3 ${section.iconBg} rounded-xl shadow-sm`}>
                      {section.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 ml-3">
                      {section.title}
                    </h2>
                  </div>
                  <div className="grid gap-3">
                    {section.content.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start group">
                        <div className="flex-shrink-0 w-5 h-5 bg-green-600 rounded-full mt-1 mr-3 flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 text-white" />
                        </div>
                        <p className="text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Cookies Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8"
          >
            <div className="flex items-center mb-6">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Cookie className="h-6 w-6 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 ml-3">
                Cookies and Tracking
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              We use cookies and similar tracking technologies to enhance your browsing experience, 
              analyze website traffic, and personalize content.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cookiesInfo.map((cookie, index) => (
                <div key={index} className="flex items-start p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="p-2 bg-white rounded-lg mr-3">
                    {cookie.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{cookie.name}</h4>
                    <p className="text-sm text-gray-600">{cookie.purpose}</p>
                    <p className="text-xs text-gray-400 mt-1">Duration: {cookie.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Third-Party Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8"
          >
            <div className="flex items-center mb-6">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Share2 className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 ml-3">
                Third-Party Services
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              We work with trusted third-party service providers to deliver our services:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {thirdPartyServices.map((service, index) => (
                <div key={index} className="flex items-center p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all">
                  <div className={`p-2 bg-${service.color}-100 rounded-lg mr-3`}>
                    {service.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{service.name}</h4>
                    <p className="text-sm text-gray-600">{service.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Your Rights Section */}
          <motion.div
            id="rights"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl shadow-lg p-8 mb-8 scroll-mt-24"
          >
            <div className="flex items-center mb-6">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Shield className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 ml-3">
                Your Privacy Rights
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              As a user, you have the following rights regarding your personal information:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userRights.map((right, index) => (
                <div key={index} className="bg-white rounded-xl p-4 hover:shadow-lg transition-all">
                  <div className={`p-2 bg-${right.color}-100 rounded-lg inline-block mb-3`}>
                    {right.icon}
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{right.title}</h4>
                  <p className="text-sm text-gray-600">{right.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Data Retention */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8"
          >
            <div className="flex items-center mb-6">
              <div className="p-3 bg-cyan-100 rounded-xl">
                <Clock className="h-6 w-6 text-cyan-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 ml-3">
                Data Retention
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              We retain your personal information only for as long as necessary to fulfill the purposes outlined in this privacy policy.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dataRetention.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-white rounded-lg">
                      {item.icon}
                    </div>
                    <h4 className="font-semibold text-gray-900">{item.type}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{item.duration}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Security Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-xl p-8 mb-8 text-white"
          >
            <div className="flex items-center mb-6">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Shield className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold ml-3">
                Security Features
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {securityFeatures.map((feature, index) => (
                <div key={index} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {feature.icon}
                      <span className="font-medium">{feature.feature}</span>
                    </div>
                    <span className="text-sm bg-green-500/30 px-2 py-1 rounded-full">
                      {feature.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            id="contact"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-xl p-8 mb-8 text-white scroll-mt-24"
          >
            <div className="text-center">
              <div className="inline-flex p-4 bg-white/10 rounded-2xl mb-6">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">
                Questions About Privacy?
              </h3>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                If you have any questions about this Privacy Policy or our data practices, 
                please don't hesitate to contact our privacy team.
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <a href="mailto:privacy@rkinfotech.com" className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                  <Mail className="h-5 w-5" />
                  <span>privacy@rkinfotech.com</span>
                </a>
                <a href="tel:+919876543210" className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                  <Phone className="h-5 w-5" />
                  <span>+91 98765 43210</span>
                </a>
                <div className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-xl">
                  <MapPin className="h-5 w-5" />
                  <span>123 Business Park, India</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Policy Updates Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-800 mb-2">
                  Policy Updates
                </h3>
                <p className="text-amber-700 text-sm leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes 
                  by posting the new Privacy Policy on this page and updating the "Last updated" date. 
                  You are advised to review this Privacy Policy periodically for any changes.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Consent */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
              <Heart className="h-4 w-4 text-green-500" />
              By using our website, you consent to our Privacy Policy and agree to its terms.
            </p>
          </div>
        </div>
      </main>

    </div>
  );
};

// Import missing icons
import { CreditCard, Truck, Navigation } from 'lucide-react';

export default PrivacyPolicyPage;