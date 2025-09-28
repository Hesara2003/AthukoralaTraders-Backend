import React from 'react';
import { Award, Users, Target, Heart, Truck, ShieldCheck, Clock, Star, ArrowRight, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';

const AboutPage = () => {
  const milestones = [
    { year: '1995', title: 'Company Founded', description: 'Started as a small hardware shop in Colombo' },
    { year: '2000', title: 'First Expansion', description: 'Expanded to include industrial equipment' },
    { year: '2010', title: 'Digital Transformation', description: 'Launched online catalog and e-commerce platform' },
    { year: '2015', title: 'Warehouse Expansion', description: 'Built modern 50,000 sq ft warehouse facility' },
    { year: '2020', title: 'Island-wide Delivery', description: 'Extended delivery network across Sri Lanka' },
    { year: '2025', title: 'Modern Platform', description: 'Launched advanced e-commerce and inventory system' },
  ];

  const teamMembers = [
    {
      name: 'Sunil Athukorala',
      position: 'Founder & CEO',
      description: 'With over 30 years in the hardware industry, Sunil leads our company with vision and dedication.',
      image: '/api/placeholder/300/300'
    },
    {
      name: 'Priya Athukorala',
      position: 'Operations Director',
      description: 'Priya oversees daily operations and ensures our high standards of customer service.',
      image: '/api/placeholder/300/300'
    },
    {
      name: 'Chaminda Perera',
      position: 'Sales Manager',
      description: 'Chaminda brings 15+ years of sales expertise and deep product knowledge to our team.',
      image: '/api/placeholder/300/300'
    },
    {
      name: 'Nuwan Silva',
      position: 'Technical Advisor',
      description: 'Nuwan provides technical expertise and helps customers choose the right solutions.',
      image: '/api/placeholder/300/300'
    }
  ];

  const values = [
    {
      icon: ShieldCheck,
      title: 'Quality Assurance',
      description: 'We source only the highest quality products from trusted manufacturers and rigorously test everything we sell.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Heart,
      title: 'Customer First',
      description: 'Our customers are at the heart of everything we do. Their success is our success.',
      color: 'bg-red-100 text-red-600'
    },
    {
      icon: Users,
      title: 'Expert Knowledge',
      description: 'Our team brings decades of combined experience in hardware, construction, and industrial equipment.',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Truck,
      title: 'Reliable Service',
      description: 'From fast delivery to after-sales support, we ensure reliable service at every touchpoint.',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: Target,
      title: 'Innovation',
      description: 'We continuously innovate our processes and embrace new technologies to serve you better.',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for excellence in everything we do, from product quality to customer service.',
      color: 'bg-yellow-100 text-yellow-600'
    }
  ];

  const stats = [
    { number: '30+', label: 'Years of Experience', icon: Clock },
    { number: '5000+', label: 'Happy Customers', icon: Users },
    { number: '10,000+', label: 'Products Available', icon: Award },
    { number: '99%', label: 'Customer Satisfaction', icon: Star },
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-20 overflow-hidden">
        {/* Background Images */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
             style={{backgroundImage: 'url(/images/hero-backgrounds/about-hero-bg.jpg), url(/images/about-hero-store.svg)'}}></div>
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 to-blue-800/40"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Floating decorative elements */}
          <div className="absolute top-10 left-10 w-16 h-16 bg-white/10 rounded-full animate-pulse opacity-60"></div>
          <div className="absolute bottom-16 right-16 w-20 h-20 bg-yellow-400/20 rounded-full animate-bounce opacity-70"></div>
          <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-blue-300/20 rounded-full animate-ping"></div>
          
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl mb-6 shadow-2xl transform rotate-12">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">About Athukorala Traders</h1>
            <p className="text-xl text-blue-100 leading-relaxed mb-8 max-w-3xl mx-auto">
              For over three decades, we've been Sri Lanka's trusted partner for quality hardware, 
              tools, and equipment. From humble beginnings to becoming a leading supplier, 
              our commitment to excellence has never wavered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-6">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 rounded-xl px-6 py-3 text-blue-100 shadow-lg">
                <Award className="w-5 h-5 text-yellow-400" />
                <span className="font-medium">Trusted Since 1995</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-xl px-6 py-3 text-green-100 shadow-lg">
                <Users className="w-5 h-5 text-green-300" />
                <span className="font-medium">5000+ Happy Customers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                  <stat.icon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="prose prose-lg text-gray-600">
                <p className="mb-6">
                  Founded in 1995 by Sunil Athukorala, our company began as a small hardware shop 
                  in the heart of Colombo. With a passion for quality tools and an unwavering 
                  commitment to customer service, we quickly earned the trust of local contractors 
                  and DIY enthusiasts.
                </p>
                <p className="mb-6">
                  Over the years, we've expanded our inventory to include everything from basic 
                  hand tools to sophisticated industrial equipment. Our growth has been driven 
                  by one simple principle: provide our customers with the best products at 
                  competitive prices, backed by expert knowledge and reliable service.
                </p>
                <p>
                  Today, we're proud to serve thousands of customers across Sri Lanka, from 
                  individual homeowners to large construction companies. Our journey continues 
                  as we embrace new technologies and expand our reach while staying true to 
                  our founding values.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Our Mission</h3>
                    <p className="text-gray-600">To be Sri Lanka's most trusted hardware partner, providing quality products and expert service.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Our Vision</h3>
                    <p className="text-gray-600">To modernize the hardware industry in Sri Lanka through innovation and exceptional service.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Our Values</h3>
                    <p className="text-gray-600">Integrity, quality, innovation, and customer satisfaction guide every decision we make.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three decades of growth, innovation, and unwavering commitment to our customers
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {milestones.map((milestone, index) => (
                <div key={index} className="relative bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 border border-gray-100">
                  <div className="absolute -top-4 left-6 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                    {milestone.year}
                  </div>
                  <div className="pt-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide our business and shape our relationships with customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${value.color}`}>
                  <value.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The experienced professionals who make Athukorala Traders your trusted hardware partner
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-200 border border-gray-100">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-3">{member.position}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications & Partnerships */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Certifications & Partnerships</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              We work with leading brands and maintain industry certifications to ensure quality
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">ISO Certified</h3>
              <p className="text-blue-100">Quality management system certified to international standards</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Authorized Dealer</h3>
              <p className="text-blue-100">Official dealer for 50+ international and local brands</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Industry Recognition</h3>
              <p className="text-blue-100">Multiple awards for customer service and business excellence</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to Work With Us?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Experience the difference that three decades of expertise and commitment can make. 
              Join thousands of satisfied customers who trust us for their hardware needs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Browse Products
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 border-2 border-blue-600 hover:bg-blue-600 hover:text-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200"
              >
                Contact Us
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default AboutPage;