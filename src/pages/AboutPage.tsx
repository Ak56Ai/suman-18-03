import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { 
  Leaf, Heart, Shield, Award, Users, Globe, 
  MapPin, Sparkles, Droplets, Wind, Sun, 
  Mountain, Waves, Flower2, TreePine,
  Clock, CheckCircle, Star, TrendingUp,
  Instagram, Facebook, Twitter, Youtube,
  ChevronRight, Quote
} from 'lucide-react';

const AboutPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Component 1: Hero Section - Our Story
  const HeroSection = () => (
    <section className="relative min-h-[70vh] overflow-hidden">
      {/* Background with gradient and image */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 via-green-800/80 to-emerald-900/90 z-10" />
        <img
          src="https://images.pexels.com/photos/1645057/pexels-photo-1645057.jpeg"
          alt="Indian Himalayan Landscape"
          className="w-full h-full object-cover"
        />
      </div>
      
      <motion.div 
        style={{ y, opacity }}
        className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-[70vh] flex items-center"
      >
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-lg rounded-full px-4 py-2 mb-6">
              <Leaf className="w-4 h-4 text-green-300" />
              <span className="text-white text-sm font-medium">Since 2015</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Rooted in Nature,
              <span className="block bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent">
                Inspired by India
              </span>
            </h1>
            
            <p className="text-xl text-gray-200 mb-8 leading-relaxed">
              For generations, India's ancient wisdom of Ayurveda has harnessed nature's 
              healing power. We bring this 5000-year-old knowledge to your daily life, 
              crafting products that honor tradition while embracing modern wellness needs.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all transform hover:scale-105">
                Discover Our Story
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-all">
                Watch Video
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );

  // Component 2: Source Regions - India's Natural Treasures
  const SourceRegionsSection = () => {
    const regions = [
      {
        name: "Himalayan Foothills",
        location: "Uttarakhand, Himachal Pradesh",
        elevation: "1,500 - 3,000 meters",
        herbs: ["Ashwagandha", "Brahmi", "Shilajit", "Tulsi"],
        description: "Pure mountain herbs grown in pristine Himalayan soil, untouched by modern pollution.",
        icon: Mountain,
        color: "from-blue-500 to-cyan-500",
        image: "https://images.pexels.com/photos/2346075/pexels-photo-2346075.jpeg"
      },
      {
        name: "Kerala's Tropical Forests",
        location: "Western Ghats, Kerala",
        elevation: "0 - 500 meters",
        herbs: ["Turmeric", "Ginger", "Neem", "Aloe Vera"],
        description: "Rich biodiversity of tropical rainforests producing potent, aromatic herbs.",
        icon: Waves,
        color: "from-emerald-500 to-green-500",
        image: "https://images.pexels.com/photos/619669/pexels-photo-619669.jpeg"
      },
      {
        name: "Rajasthan's Arid Lands",
        location: "Thar Desert, Rajasthan",
        elevation: "100 - 300 meters",
        herbs: ["Guggul", "Kalonji", "Senna", "Moringa"],
        description: "Hardy desert plants with concentrated medicinal properties.",
        icon: Sun,
        color: "from-orange-500 to-red-500",
        image: "https://images.pexels.com/photos/5593176/pexels-photo-5593176.jpeg"
      },
      {
        name: "North East Hills",
        location: "Assam, Meghalaya, Sikkim",
        elevation: "500 - 2,000 meters",
        herbs: ["Cinnamon", "Cardamom", "Holy Basil", "Gotu Kola"],
        description: "Rare herbs from India's biodiversity hotspots.",
        icon: Wind,
        color: "from-purple-500 to-pink-500",
        image: "https://images.pexels.com/photos/670628/pexels-photo-670628.jpeg"
      }
    ];

    return (
      <section className="py-20 bg-gradient-to-b from-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-green-100 rounded-full px-4 py-2 mb-4">
              <MapPin className="w-4 h-4 text-green-600" />
              <span className="text-green-700 text-sm font-medium">From India's Heartlands</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Sourced from Nature's
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"> Best Kept Secrets</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We partner with local farmers and tribal communities across India to bring you 
              the purest, most potent herbs nature has to offer.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {regions.map((region, idx) => (
              <motion.div
                key={region.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={region.image}
                    alt={region.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${region.color} rounded-full px-3 py-1 mb-3`}>
                      <region.icon className="w-4 h-4 text-white" />
                      <span className="text-white text-xs font-medium">{region.location}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{region.name}</h3>
                    <p className="text-gray-200 text-sm mb-2">{region.description}</p>
                    <p className="text-green-300 text-xs">Elevation: {region.elevation}</p>
                  </div>
                </div>
                
                <div className="bg-white p-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {region.herbs.map((herb) => (
                      <span key={herb} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                        {herb}
                      </span>
                    ))}
                  </div>
                  <button className="text-green-600 font-semibold hover:text-green-700 inline-flex items-center gap-1">
                    Learn more about {region.name}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Component 3: Our Promise - 100% Natural & Authentic
  const PromiseSection = () => {
    const promises = [
      {
        icon: Leaf,
        title: "100% Natural",
        description: "No chemicals, pesticides, or synthetic additives. Pure nature in every product.",
        color: "bg-green-50",
        iconColor: "text-green-600"
      },
      {
        icon: Droplets,
        title: "No Preservatives",
        description: "Fresh, pure ingredients with natural preservation methods passed down generations.",
        color: "bg-blue-50",
        iconColor: "text-blue-600"
      },
      {
        icon: Shield,
        title: "Lab Tested",
        description: "Every batch tested for purity, potency, and safety in GMP-certified labs.",
        color: "bg-purple-50",
        iconColor: "text-purple-600"
      },
      {
        icon: Heart,
        title: "Ayurvedic Heritage",
        description: "Formulated using ancient Ayurvedic texts and traditional wisdom.",
        color: "bg-red-50",
        iconColor: "text-red-600"
      },
      {
        icon: Users,
        title: "Fair Trade",
        description: "Supporting local farmers with fair wages and sustainable practices.",
        color: "bg-orange-50",
        iconColor: "text-orange-600"
      },
      {
        icon: Globe,
        title: "Eco-Friendly",
        description: "Biodegradable packaging and carbon-neutral shipping practices.",
        color: "bg-teal-50",
        iconColor: "text-teal-600"
      }
    ];

    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-green-100 rounded-full px-4 py-2 mb-4">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-700 text-sm font-medium">Our Promise to You</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              100% Pure. 100% Natural.
              <span className="block text-green-600">100% Authentic</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We don't compromise on quality. Every product is crafted with integrity, 
              ensuring you get exactly what nature intended.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {promises.map((promise, idx) => (
              <motion.div
                key={promise.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className={`${promise.color} rounded-2xl p-8 hover:shadow-xl transition-all duration-300 group cursor-pointer`}
              >
                <div className={`${promise.iconColor} mb-4`}>
                  <promise.icon className="w-12 h-12 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{promise.title}</h3>
                <p className="text-gray-600 leading-relaxed">{promise.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Certificate Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-12 pt-8 border-t border-gray-200"
          >
            <div className="flex flex-wrap justify-center gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Award className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">USDA Organic</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Star className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">GMP Certified</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">ISO 22000</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Leaf className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">Cruelty Free</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  };

  // Component 4: Impact & Testimonials
  const ImpactSection = () => {
    const stats = [
      { value: "50,000+", label: "Happy Customers", icon: Users },
      { value: "100+", label: "Natural Ingredients", icon: Flower2 },
      { value: "15+", label: "Partner Communities", icon: TreePine },
      { value: "98%", label: "Customer Satisfaction", icon: TrendingUp }
    ];

    const testimonials = [
      {
        name: "Priya Sharma",
        location: "Mumbai, India",
        quote: "After trying countless products, I finally found something truly natural. My skin has never felt better!",
        avatar: "https://randomuser.me/api/portraits/women/1.jpg",
        rating: 5
      },
      {
        name: "Dr. Rajesh Kumar",
        location: "Ayurvedic Practitioner",
        quote: "The purity and potency of their herbs are exceptional. I recommend NaturZen to all my patients.",
        avatar: "https://randomuser.me/api/portraits/men/1.jpg",
        rating: 5
      },
      {
        name: "Sarah Johnson",
        location: "California, USA",
        quote: "Living in the US, finding authentic Ayurvedic products was hard. NaturZen changed that forever.",
        avatar: "https://randomuser.me/api/portraits/women/2.jpg",
        rating: 5
      }
    ];

    return (
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
                  <stat.icon className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Testimonials */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 mb-4 shadow-sm">
              <Quote className="w-4 h-4 text-green-600" />
              <span className="text-green-700 text-sm font-medium">What Our Customers Say</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Trusted by Wellness Seekers
              <span className="block text-green-600">Worldwide</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 italic mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.location}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transition-all transform hover:scale-105 inline-flex items-center gap-2">
              Join Our Wellness Community
              <Users className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>
    );
  };

  return (
    <div ref={containerRef} className="overflow-hidden">
      <HeroSection />
      <SourceRegionsSection />
      <PromiseSection />
      <ImpactSection />
      
      {/* Footer Note */}
      <div className="bg-gray-900 text-white py-8 text-center">
        <p className="text-sm text-gray-400">
          🌿 Crafted with love and respect for Mother Nature. Each product tells a story of India's rich herbal heritage.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;