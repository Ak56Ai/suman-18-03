import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  ChevronRight,
  Leaf,
  Heart,
  Award,
  Sparkles,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Flower2,
  Sun,
  Wind,
  Droplets,
   Globe,
   Quote
} from 'lucide-react';
import toast from 'react-hot-toast';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Here you would typically send the form data to your backend
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(
        "✨ Thank you for reaching out! Our wellness team will respond within 24 hours.",
        {
          icon: '🌿',
          duration: 4000,
        }
      );
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      toast.error('Unable to send message. Please try again or call us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col">

      {/* Breadcrumb with Nature Touch */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <a href="/" className="hover:text-green-600 transition-colors flex items-center gap-1">
              <Leaf className="w-3 h-3" />
              <span>Home</span>
            </a>
            <ChevronRight className="h-4 w-4" />
            <span className="text-green-600 font-medium">Connect with Nature</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Ayurvedic Touch */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 bg-green-100 rounded-full px-4 py-2 mb-4">
                <Heart className="w-4 h-4 text-green-600" />
                <span className="text-green-700 text-sm font-medium">Namaste 🙏</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Let's Begin Your
                <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Wellness Journey
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Have questions about our authentic Ayurvedic products? Our wellness experts 
                are here to guide you on your path to natural living.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information - Enhanced with Nature Theme */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-2xl shadow-lg p-8 h-full relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-50 to-emerald-50 rounded-bl-full opacity-50" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-50 to-emerald-50 rounded-tr-full opacity-50" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-6">
                    <Flower2 className="w-6 h-6 text-green-600" />
                    <h2 className="text-2xl font-bold text-gray-900">
                      Connect with Us
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start group">
                      <div className="flex-shrink-0">
                        <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg group-hover:from-green-600 group-hover:to-emerald-600 transition-all duration-300">
                          <Phone className="h-6 w-6 text-green-600 group-hover:text-white transition-colors duration-300" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Wellness Helpline
                        </h3>
                        <p className="text-gray-600 hover:text-green-600 transition-colors">
                          +91 98765 43210
                        </p>
                        <p className="text-gray-600 hover:text-green-600 transition-colors">
                          +91 87654 32109
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Mon-Sat, 9 AM - 7 PM</p>
                      </div>
                    </div>

                    <div className="flex items-start group">
                      <div className="flex-shrink-0">
                        <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg group-hover:from-green-600 group-hover:to-emerald-600 transition-all duration-300">
                          <Mail className="h-6 w-6 text-green-600 group-hover:text-white transition-colors duration-300" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Email Us
                        </h3>
                        <p className="text-gray-600 hover:text-green-600 transition-colors">
                          wellness@naturzen.com
                        </p>
                        <p className="text-gray-600 hover:text-green-600 transition-colors">
                          support@naturzen.com
                        </p>
                        <p className="text-xs text-gray-500 mt-1">24/7 Support</p>
                      </div>
                    </div>

                    <div className="flex items-start group">
                      <div className="flex-shrink-0">
                        <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg group-hover:from-green-600 group-hover:to-emerald-600 transition-all duration-300">
                          <MapPin className="h-6 w-6 text-green-600 group-hover:text-white transition-colors duration-300" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Our Ashram
                        </h3>
                        <p className="text-gray-600">
                          NaturZen Wellness Center
                          <br />
                          Rishikesh, Uttarakhand - 249201
                          <br />
                          India
                        </p>
                        <p className="text-xs text-green-600 mt-1">Located in the Yoga Capital</p>
                      </div>
                    </div>

                    <div className="flex items-start group">
                      <div className="flex-shrink-0">
                        <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg group-hover:from-green-600 group-hover:to-emerald-600 transition-all duration-300">
                          <Clock className="h-6 w-6 text-green-600 group-hover:text-white transition-colors duration-300" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Darshan Hours
                        </h3>
                        <p className="text-gray-600">
                          Monday - Friday: 9:00 AM - 7:00 PM
                          <br />
                          Saturday: 10:00 AM - 5:00 PM
                          <br />
                          Sunday: 10:00 AM - 2:00 PM
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Social Media Links */}
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Follow Our Journey</h3>
                    <div className="flex gap-3">
                      <a href="#" className="p-2 bg-green-50 rounded-full hover:bg-green-600 group transition-all">
                        <Instagram className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
                      </a>
                      <a href="#" className="p-2 bg-green-50 rounded-full hover:bg-green-600 group transition-all">
                        <Facebook className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
                      </a>
                      <a href="#" className="p-2 bg-green-50 rounded-full hover:bg-green-600 group transition-all">
                        <Twitter className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
                      </a>
                      <a href="#" className="p-2 bg-green-50 rounded-full hover:bg-green-600 group transition-all">
                        <Youtube className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
                      </a>
                    </div>
                  </div>

                  {/* Map Preview */}
                  <div className="mt-6">
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg h-48 overflow-hidden relative group">
                      <iframe
                        title="NaturZen Location"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d27590.82682224527!2d78.26735065!3d30.1182331!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39093e8e5f2f5e5d%3A0x7c5b5a5b5b5b5b5b!2sRishikesh%2C%20Uttarakhand!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        className="group-hover:scale-110 transition-transform duration-500"
                      ></iframe>
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form - Enhanced with Natural Elements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-2xl shadow-lg p-8 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-green-50 to-transparent rounded-bl-full" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-emerald-50 to-transparent rounded-tr-full" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full">
                      <MessageCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Send a Message
                      </h2>
                      <p className="text-gray-600">
                        Share your wellness journey with us
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name <span className="text-green-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white focus:bg-white"
                          placeholder="Enter your full name"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address <span className="text-green-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white focus:bg-white"
                          placeholder="Enter your email"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white focus:bg-white"
                          placeholder="Enter your phone number"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subject <span className="text-green-500">*</span>
                        </label>
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white focus:bg-white"
                          disabled={loading}
                        >
                          <option value="">Select a subject</option>
                          <option value="general">General Wellness Inquiry</option>
                          <option value="order">Order Support</option>
                          <option value="product">Ayurvedic Product Information</option>
                          <option value="consultation">Ayurvedic Consultation</option>
                          <option value="billing">Billing & Payment</option>
                          <option value="feedback">Feedback & Suggestions</option>
                          <option value="partnership">Partnership Opportunities</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Message <span className="text-green-500">*</span>
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white focus:bg-white resize-none"
                        placeholder="Share your wellness goals, questions, or feedback..."
                        disabled={loading}
                        maxLength={1000}
                      />
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500">
                          {formData.message.length}/1000 characters
                        </p>
                        {formData.message.length > 800 && (
                          <p className="text-xs text-orange-500 flex items-center gap-1">
                            <Wind className="w-3 h-3" />
                            Approaching character limit
                          </p>
                        )}
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Sending your message...
                        </div>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Send Message
                          <Sparkles className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </motion.button>

                    <p className="text-xs text-center text-gray-500 mt-4">
                      By sending this message, you agree to our privacy policy. We respect your privacy and will never share your information.
                    </p>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>

          {/* FAQ Section - Enhanced with Ayurvedic Wisdom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-green-100 rounded-full px-4 py-2 mb-4">
                <Sun className="w-4 h-4 text-green-600" />
                <span className="text-green-700 text-sm font-medium">Wisdom from the Vedas</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-600">Find answers to common questions about our natural products</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Clock,
                  question: 'How quickly do you respond?',
                  answer: 'Our wellness experts typically respond within 24 hours during business days. For urgent matters, please call our helpline.',
                },
                {
                  icon: Globe,
                  question: 'Do you ship internationally?',
                  answer: 'Yes! We deliver our authentic Ayurvedic products worldwide with free shipping on orders over $50.',
                },
                {
                  icon: Heart,
                  question: 'Can I get Ayurvedic consultation?',
                  answer: "Absolutely! Our certified Ayurvedic practitioners offer free consultations. Just mention it in your message, and we'll schedule a call.",
                },
                {
                  icon: Leaf,
                  question: 'Are products 100% natural?',
                  answer: 'Yes! Every product is certified 100% natural, chemical-free, and tested for purity in GMP-certified labs.',
                },
                {
                  icon: Award,
                  question: 'Do you offer refunds?',
                  answer: 'We offer a 30-day money-back guarantee. If you\'re not satisfied, we\'ll refund your purchase - no questions asked.',
                },
                {
                  icon: Droplets,
                  question: 'How are products sourced?',
                  answer: 'We source herbs directly from local farmers in the Himalayas, Kerala, and other pristine regions of India.',
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-600 transition-colors">
                      <faq.icon className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Testimonial Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-center text-white"
          >
            <Quote className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-xl md:text-2xl font-medium mb-4">
              "The wisdom of Ayurveda meets the purity of nature. Let us guide you on your wellness journey."
            </p>
            <p className="text-green-100">- The NaturZen Team</p>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;