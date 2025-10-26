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
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-16 overflow-hidden">
        {/* Background Images */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
             style={{backgroundImage: 'url(/images/hero-backgrounds/about-hero-bg.jpg), url(/images/about-hero-store.svg)'}}></div>
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 to-blue-800/40"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl mb-4 shadow-lg border-2 border-yellow-500">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black mb-4 leading-tight">About Athukorala Traders</h1>
            <p className="text-base text-blue-100 leading-relaxed mb-6 max-w-3xl mx-auto">
              For over three decades, we've been Sri Lanka's trusted partner for quality hardware, 
              tools, and equipment. From humble beginnings to becoming a leading supplier, 
              our commitment to excellence has never wavered.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center mb-4">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-lg px-5 py-2 text-white shadow-md font-bold text-sm">
                <Award className="w-4 h-4 text-yellow-300" />
                <span>Trusted Since 1995</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-lg px-5 py-2 text-white shadow-md font-bold text-sm">
                <Users className="w-4 h-4 text-green-300" />
                <span>5000+ Happy Customers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center bg-white p-5 rounded-2xl border-2 border-gray-200 shadow-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-3 border-2 border-blue-700">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">{stat.number}</div>
                <div className="text-gray-700 text-sm font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="bg-gray-50 p-5 rounded-2xl border-2 border-gray-200 shadow-lg">
              <h2 className="text-3xl font-black text-gray-900 mb-4">Our Story</h2>
              <div className="text-gray-700 text-sm space-y-3">
                <p>
                  Founded in 1995 by Sunil Athukorala, our company began as a small hardware shop 
                  in the heart of Colombo. With a passion for quality tools and an unwavering 
                  commitment to customer service, we quickly earned the trust of local contractors 
                  and DIY enthusiasts.
                </p>
                <p>
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
            <div className="bg-white rounded-2xl p-5 border-2 border-gray-200 shadow-lg">
              <div className="space-y-4">
                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                  <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-green-700">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Our Mission</h3>
                    <p className="text-gray-700 text-sm">To be Sri Lanka's most trusted hardware partner, providing quality products and expert service.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-blue-700">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Our Vision</h3>
                    <p className="text-gray-700 text-sm">To modernize the hardware industry in Sri Lanka through innovation and exceptional service.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                  <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-purple-700">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Our Values</h3>
                    <p className="text-gray-700 text-sm">Integrity, quality, innovation, and customer satisfaction guide every decision we make.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Our Journey</h2>
            <p className="text-sm text-gray-700 max-w-2xl mx-auto font-bold">
              Three decades of growth, innovation, and unwavering commitment to our customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {milestones.map((milestone, index) => (
              <div key={index} className="relative bg-white rounded-2xl p-5 border-2 border-gray-200 shadow-lg">
                <div className="absolute -top-3 left-4 bg-blue-600 text-white px-4 py-1 rounded-lg text-sm font-black border-2 border-blue-700">
                  {milestone.year}
                </div>
                <div className="pt-3">
                  <h3 className="text-lg font-black text-gray-900 mb-2">{milestone.title}</h3>
                  <p className="text-gray-700 text-sm">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Our Values</h2>
            <p className="text-sm text-gray-700 max-w-2xl mx-auto font-bold">
              The principles that guide our business and shape our relationships with customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {values.map((value, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-5 text-center border-2 border-gray-200 shadow-lg">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${value.color} border-2`}>
                  <value.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-700 leading-relaxed text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Meet Our Team</h2>
            <p className="text-sm text-gray-700 max-w-2xl mx-auto font-bold">
              The experienced professionals who make Athukorala Traders your trusted hardware partner
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl p-5 text-center border-2 border-gray-200 shadow-lg">
                <div className="w-20 h-20 bg-blue-600 rounded-xl mx-auto mb-3 flex items-center justify-center border-2 border-blue-700">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-1">{member.name}</h3>
                <p className="text-blue-600 font-bold mb-2 text-sm">{member.position}</p>
                <p className="text-gray-700 text-xs leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications & Partnerships */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Certifications & Partnerships</h2>
            <p className="text-sm text-gray-700 max-w-2xl mx-auto font-bold">
              We work with leading brands and maintain industry certifications to ensure quality
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center bg-gray-50 p-5 rounded-2xl border-2 border-gray-200 shadow-lg">
              <div className="w-12 h-12 bg-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-3 border-2 border-yellow-700">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-black mb-2 text-gray-900">ISO Certified</h3>
              <p className="text-gray-700 text-sm">Quality management system certified to international standards</p>
            </div>
            <div className="text-center bg-gray-50 p-5 rounded-2xl border-2 border-gray-200 shadow-lg">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-3 border-2 border-green-700">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-black mb-2 text-gray-900">Authorized Dealer</h3>
              <p className="text-gray-700 text-sm">Official dealer for 50+ international and local brands</p>
            </div>
            <div className="text-center bg-gray-50 p-5 rounded-2xl border-2 border-gray-200 shadow-lg">
              <div className="w-12 h-12 bg-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-3 border-2 border-yellow-700">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-black mb-2 text-gray-900">Industry Recognition</h3>
              <p className="text-gray-700 text-sm">Multiple awards for customer service and business excellence</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-lg">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Ready to Work With Us?</h2>
            <p className="text-sm text-gray-700 mb-5 font-bold">
              Experience the difference that three decades of expertise and commitment can make. 
              Join thousands of satisfied customers who trust us for their hardware needs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black text-sm transition-all duration-200 shadow-lg border-2 border-blue-700"
              >
                Browse Products
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 border-2 border-blue-600 hover:bg-blue-600 hover:text-white text-blue-600 px-6 py-3 rounded-xl font-black text-sm transition-all duration-200"
              >
                Contact Us
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default AboutPage;