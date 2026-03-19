import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Search,
  Circle as HelpCircle,
  ChevronRight,
  Mail,
  Phone,
  MessageCircle,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

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
    { value: 'all', label: 'All Categories' },
    { value: 'ordering', label: 'Ordering' },
    { value: 'payment', label: 'Payment' },
    { value: 'shipping', label: 'Shipping' },
    { value: 'returns', label: 'Returns' },
    { value: 'products', label: 'Products' },
    { value: 'general', label: 'General' },
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
            <span className="text-gray-900 font-medium">FAQ</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 bg-green-100 rounded-full">
                <HelpCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about our products and services
            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label} ({getCategoryCount(category.value)})
                  </option>
                ))}
              </select>
            </div>

            {/* Popular Topics */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-2">Popular topics:</p>
              <div className="flex flex-wrap gap-2">
                {['ordering', 'payment', 'shipping', 'returns'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${
                      selectedCategory === cat
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)} (
                    {getCategoryCount(cat)})
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Results Summary */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">
              Showing {filteredFAQs.length} of {faqs.length} FAQs
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-sm text-green-600 hover:text-green-700"
              >
                Clear search
              </button>
            )}
          </div>

          {/* FAQ List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            {filteredFAQs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-lg p-12 text-center"
              >
                <div className="bg-gray-100 rounded-full p-4 inline-flex mb-4">
                  <HelpCircle className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No FAQs Found
                </h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any FAQs matching your search criteria.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Reset Filters
                </button>
              </motion.div>
            ) : (
              filteredFAQs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 group"
                  >
                    <div className="flex-1 pr-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                        {faq.question}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-medium rounded-full capitalize ${
                            faq.category === 'ordering'
                              ? 'bg-blue-100 text-blue-800'
                              : faq.category === 'payment'
                              ? 'bg-purple-100 text-purple-800'
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
                        <span className="text-xs text-gray-400">
                          FAQ #{faq.id}
                        </span>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: openFAQ === faq.id ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className={`p-2 rounded-full ${
                        openFAQ === faq.id ? 'bg-green-100' : 'bg-gray-100'
                      }`}
                    >
                      <ChevronDown
                        className={`h-5 w-5 ${
                          openFAQ === faq.id
                            ? 'text-green-600'
                            : 'text-gray-500'
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
                              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-800 font-medium mb-2">
                                  Related Information:
                                </p>
                                <a
                                  href={
                                    faq.category === 'shipping'
                                      ? '/shipping'
                                      : '/returns'
                                  }
                                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  Visit our{' '}
                                  {faq.category === 'shipping'
                                    ? 'Shipping Info'
                                    : 'Returns & Exchanges'}{' '}
                                  page for more details
                                </a>
                              </div>
                            )}

                            {/* Helpful? */}
                            <div className="mt-4 flex items-center justify-between">
                              <p className="text-xs text-gray-400">
                                Was this helpful?
                              </p>
                              <div className="flex space-x-2">
                                <button className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                                  Yes
                                </button>
                                <button className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                                  No
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

          {/* Category Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
          >
            {categories.slice(1).map((category) => (
              <div
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`bg-white rounded-xl shadow-md p-4 cursor-pointer transition-all duration-300 ${
                  selectedCategory === category.value
                    ? 'ring-2 ring-green-600 bg-green-50'
                    : 'hover:shadow-lg hover:bg-gray-50'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {getCategoryCount(category.value)}
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {category.label}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Contact Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl shadow-lg p-8 mt-12 text-center text-white"
          >
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-white opacity-90" />
            <h2 className="text-2xl font-bold mb-3">Still have questions?</h2>
            <p className="text-green-100 mb-6 max-w-md mx-auto">
              Can't find what you're looking for? Our customer support team is
              here to help you!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-6 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Contact Support
              </motion.a>
              <div className="flex items-center text-sm text-green-100">
                <Mail className="h-4 w-4 mr-1" />
                <span>support@rkinfotech.com</span>
              </div>
              <div className="flex items-center text-sm text-green-100">
                <Phone className="h-4 w-4 mr-1" />
                <span>+91 98765 43210</span>
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
            <p className="text-gray-500 text-sm">
              Can't find the answer? Try our{' '}
              <a
                href="/contact"
                className="text-green-600 hover:text-green-700 font-medium hover:underline"
              >
                live chat
              </a>{' '}
              for instant assistance.
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQPage;
