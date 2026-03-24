import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Search,
  HelpCircle,
  ChevronRight,
  Mail,
  Phone,
  MessageCircle,
  Package,
  CreditCard,
  Truck,
  RotateCcw,
  ShoppingBag,
  Globe,
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const FAQPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs: FAQ[] = [
    {
      id: 1,
      question: 'How do I place an order?',
      answer:
        'To place an order, browse our products, add items to your cart, and proceed to checkout. You can pay using various methods including credit/debit cards, UPI, or choose Cash on Delivery.',
      category: 'ordering',
    },
    {
      id: 2,
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit and debit cards, UPI payments, net banking, and Cash on Delivery (COD) for eligible orders.',
      category: 'payment',
    },
    {
      id: 3,
      question: 'How long does shipping take?',
      answer:
        'Standard shipping takes 3-5 business days, while express shipping takes 1-2 business days. Same-day delivery is available in select cities.',
      category: 'shipping',
    },
    {
      id: 4,
      question: 'Can I track my order?',
      answer:
        "Yes! Once your order is shipped, you'll receive a tracking number via email and SMS. You can also track your order on our Shipping Info page.",
      category: 'shipping',
    },
    {
      id: 5,
      question: 'What is your return policy?',
      answer:
        'We offer a 7-day return policy for most items. Products must be in original condition with tags attached. Visit our Returns & Exchanges page to initiate a return.',
      category: 'returns',
    },
    {
      id: 6,
      question: 'How do I return an item?',
      answer:
        "To return an item, go to our Returns & Exchanges page, enter your order number, select the reason for return, and submit the request. We'll guide you through the process.",
      category: 'returns',
    },
    {
      id: 7,
      question: 'When will I receive my refund?',
      answer:
        'Refunds are processed within 5-7 business days after we receive the returned item. The amount will be credited to your original payment method.',
      category: 'returns',
    },
    {
      id: 8,
      question: 'Do you offer Cash on Delivery?',
      answer:
        'Yes, we offer Cash on Delivery (COD) for orders across India. COD charges may apply based on your location and order value.',
      category: 'payment',
    },
    {
      id: 9,
      question: 'How can I change or cancel my order?',
      answer:
        'You can change or cancel your order within 1 hour of placing it. Contact our customer support immediately or visit your account dashboard.',
      category: 'ordering',
    },
    {
      id: 10,
      question: 'Are your products authentic?',
      answer:
        'Yes, all our products are 100% authentic and sourced directly from authorized distributors and manufacturers.',
      category: 'products',
    },
    {
      id: 11,
      question: 'Do you have a mobile app?',
      answer:
        'Currently, we operate through our website. However, our website is mobile-optimized for the best shopping experience on your phone.',
      category: 'general',
    },
    {
      id: 12,
      question: 'How can I contact customer support?',
      answer:
        'You can reach our customer support through the Contact Us page, email us at support@rkinfotech.com, or call us at +91 98765 43210.',
      category: 'general',
    },
    {
      id: 13,
      question: 'Do you ship internationally?',
      answer:
        'Currently, we only ship within India. International shipping may be available in the future.',
      category: 'shipping',
    },
    {
      id: 14,
      question: 'What if I receive a damaged product?',
      answer:
        "If you receive a damaged product, please contact us immediately with photos of the damage. We'll arrange for a replacement or full refund.",
      category: 'products',
    },
    {
      id: 15,
      question: 'Can I modify my shipping address?',
      answer:
        'You can modify your shipping address within 1 hour of placing the order. After that, please contact customer support for assistance.',
      category: 'shipping',
    },
  ];

  const categories = [
    { value: 'all', label: 'All Questions', icon: <Sparkles className="h-5 w-5" />, color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
    { value: 'ordering', label: 'Ordering', icon: <Package className="h-5 w-5" />, color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { value: 'payment', label: 'Payment', icon: <CreditCard className="h-5 w-5" />, color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-50', textColor: 'text-green-600' },
    { value: 'shipping', label: 'Shipping', icon: <Truck className="h-5 w-5" />, color: 'from-orange-500 to-amber-500', bgColor: 'bg-orange-50', textColor: 'text-orange-600' },
    { value: 'returns', label: 'Returns', icon: <RotateCcw className="h-5 w-5" />, color: 'from-red-500 to-rose-500', bgColor: 'bg-red-50', textColor: 'text-red-600' },
    { value: 'products', label: 'Products', icon: <ShoppingBag className="h-5 w-5" />, color: 'from-indigo-500 to-purple-500', bgColor: 'bg-indigo-50', textColor: 'text-indigo-600' },
    { value: 'general', label: 'General', icon: <MessageSquare className="h-5 w-5" />, color: 'from-gray-500 to-gray-600', bgColor: 'bg-gray-50', textColor: 'text-gray-600' },
  ];

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  // Get category counts
  const getCategoryCount = (category: string) => {
    if (category === 'all') return faqs.length;
    return faqs.filter((faq) => faq.category === category).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col">

      {/* Breadcrumb */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <a href="/" className="hover:text-green-600 transition-colors flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Home</span>
            </a>
            <ChevronRight className="h-4 w-4" />
            <span className="text-green-600 font-medium">FAQ</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-green-100 rounded-full px-4 py-2 mb-4">
              <HelpCircle className="h-4 w-4 text-green-600" />
              <span className="text-green-700 text-sm font-medium">Help Center</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Questions
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about our products and services
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white shadow-lg hover:shadow-xl"
              />
            </div>
          </motion.div>

          {/* Category Cards - Replaces Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-12"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {categories.map((category) => (
                <motion.button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative group cursor-pointer transition-all duration-300 ${
                    selectedCategory === category.value
                      ? 'scale-105'
                      : 'hover:scale-102'
                  }`}
                >
                  <div
                    className={`p-4 rounded-2xl text-center transition-all duration-300 ${
                      selectedCategory === category.value
                        ? `bg-gradient-to-br ${category.color} shadow-lg`
                        : `bg-white ${category.bgColor} hover:shadow-lg`
                    }`}
                  >
                    <div
                      className={`inline-flex p-3 rounded-xl mb-3 transition-all duration-300 ${
                        selectedCategory === category.value
                          ? 'bg-white/20'
                          : `bg-white ${category.bgColor}`
                      }`}
                    >
                      <div
                        className={selectedCategory === category.value ? 'text-white' : category.textColor}
                      >
                        {category.icon}
                      </div>
                    </div>
                    <h3
                      className={`text-sm font-semibold mb-1 ${
                        selectedCategory === category.value
                          ? 'text-white'
                          : 'text-gray-700'
                      }`}
                    >
                      {category.label}
                    </h3>
                    <p
                      className={`text-xs ${
                        selectedCategory === category.value
                          ? 'text-white/80'
                          : 'text-gray-500'
                      }`}
                    >
                      {getCategoryCount(category.value)} questions
                    </p>
                  </div>
                  {selectedCategory === category.value && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="w-3 h-3 bg-white rotate-45 border-r border-b border-gray-200"></div>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Results Summary */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-green-600 rounded-full"></div>
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredFAQs.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{faqs.length}</span> FAQs
              </p>
            </div>
            {(searchTerm || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" />
                Reset Filters
              </button>
            )}
          </div>

          {/* FAQ List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            {filteredFAQs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-lg p-12 text-center"
              >
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-6 inline-flex mb-4">
                  <HelpCircle className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No FAQs Found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  We couldn't find any FAQs matching your search criteria. Try different keywords or browse other categories.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-md"
                >
                  Browse All FAQs
                </button>
              </motion.div>
            ) : (
              filteredFAQs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-200 group"
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-1.5 rounded-lg ${
                          faq.category === 'ordering' ? 'bg-blue-100' :
                          faq.category === 'payment' ? 'bg-green-100' :
                          faq.category === 'shipping' ? 'bg-orange-100' :
                          faq.category === 'returns' ? 'bg-red-100' :
                          faq.category === 'products' ? 'bg-indigo-100' :
                          'bg-gray-100'
                        }`}>
                          {faq.category === 'ordering' && <Package className="h-4 w-4 text-blue-600" />}
                          {faq.category === 'payment' && <CreditCard className="h-4 w-4 text-green-600" />}
                          {faq.category === 'shipping' && <Truck className="h-4 w-4 text-orange-600" />}
                          {faq.category === 'returns' && <RotateCcw className="h-4 w-4 text-red-600" />}
                          {faq.category === 'products' && <ShoppingBag className="h-4 w-4 text-indigo-600" />}
                          {faq.category === 'general' && <MessageSquare className="h-4 w-4 text-gray-600" />}
                        </div>
                        <span
                          className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full capitalize ${
                            faq.category === 'ordering'
                              ? 'bg-blue-100 text-blue-800'
                              : faq.category === 'payment'
                              ? 'bg-green-100 text-green-800'
                              : faq.category === 'shipping'
                              ? 'bg-orange-100 text-orange-800'
                              : faq.category === 'returns'
                              ? 'bg-red-100 text-red-800'
                              : faq.category === 'products'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {faq.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                        {faq.question}
                      </h3>
                    </div>
                    <motion.div
                      animate={{ rotate: openFAQ === faq.id ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className={`p-2 rounded-full transition-all ${
                        openFAQ === faq.id ? 'bg-green-100' : 'bg-gray-100 group-hover:bg-gray-200'
                      }`}
                    >
                      <ChevronDown
                        className={`h-5 w-5 transition-colors ${
                          openFAQ === faq.id ? 'text-green-600' : 'text-gray-500'
                        }`}
                      />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {openFAQ === faq.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 border-t border-gray-100">
                          <div className="prose prose-sm max-w-none text-gray-600 pt-4">
                            <p className="leading-relaxed">{faq.answer}</p>

                            {/* Related Links */}
                            {(faq.category === 'shipping' ||
                              faq.category === 'returns') && (
                              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                                <p className="text-sm text-blue-800 font-medium mb-2">
                                  📌 Related Information:
                                </p>
                                <a
                                  href={
                                    faq.category === 'shipping'
                                      ? '/shipping'
                                      : '/returns'
                                  }
                                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                                >
                                  Visit our{' '}
                                  {faq.category === 'shipping'
                                    ? 'Shipping Info'
                                    : 'Returns & Exchanges'}{' '}
                                  page for more details
                                  <ChevronRight className="h-3 w-3" />
                                </a>
                              </div>
                            )}

                            {/* Helpful? */}
                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                              <p className="text-xs text-gray-400">Was this helpful?</p>
                              <div className="flex space-x-2">
                                <button className="px-3 py-1 text-xs bg-gray-100 hover:bg-green-100 hover:text-green-700 rounded-full transition-all">
                                  👍 Yes
                                </button>
                                <button className="px-3 py-1 text-xs bg-gray-100 hover:bg-red-100 hover:text-red-700 rounded-full transition-all">
                                  👎 No
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </motion.div>

          {/* Contact Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl shadow-2xl p-10 mt-12 text-center text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <MessageCircle className="h-14 w-14 mx-auto mb-4 text-white opacity-90" />
              <h2 className="text-3xl font-bold mb-3">Still have questions?</h2>
              <p className="text-green-100 mb-8 max-w-md mx-auto">
                Can't find what you're looking for? Our customer support team is here to help you 24/7!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.a
                  href="/contact"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-6 py-3 bg-white text-green-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Contact Support
                </motion.a>
                <div className="flex flex-col sm:flex-row gap-3 text-sm">
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                    <Mail className="h-4 w-4" />
                    <span>support@rkinfotech.com</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                    <Phone className="h-4 w-4" />
                    <span>+91 98765 43210</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Help */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center mt-8"
          >
            <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-green-500" />
              Need immediate assistance? Try our{' '}
              <a
                href="/contact"
                className="text-green-600 hover:text-green-700 font-medium hover:underline inline-flex items-center gap-1"
              >
                live chat
                <ChevronRight className="h-3 w-3" />
              </a>{' '}
              for instant support.
            </p>
          </motion.div>
        </div>
      </main>

    </div>
  );
};

export default FAQPage;