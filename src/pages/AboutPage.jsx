import React from 'react';
import { Award, Users, Target, Heart, Truck, ShieldCheck, Clock, Star, ArrowRight, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import { Awards } from '../components/ui/award';
import { RevealImageList } from '../components/ui/reveal-images';
import { OurStorySection } from '../components/OurStorySection';
import { BentoGrid, BentoCard } from '../components/ui/bento-grid';
import { TestimonialSection } from '../components/ui/testimonials';
import { TimelineDemo } from '../components/ui/timeline-demo';

const AboutPage = () => {
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
      <section className="relative bg-white text-gray-900 py-16 overflow-hidden">
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
      <section className="py-8 bg-white">
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
      <OurStorySection />

      {/* Why Choose Us - Bento Grid Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Why Choose Us</h2>
            <p className="text-sm text-gray-700 max-w-2xl mx-auto font-bold">
              Discover what makes Athukorala Traders your ideal hardware partner
            </p>
          </div>

          <BentoGrid className="lg:grid-rows-3 max-w-6xl mx-auto">
            <BentoCard
              name="Quality Assurance"
              className="col-span-3 lg:col-span-2"
              background={
                <img
                  className="absolute inset-0 h-full w-full object-cover"
                  src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80"
                  alt="Quality tools and equipment"
                />
              }
              Icon={ShieldCheck}
              description="Premium products from trusted manufacturers, rigorously tested for reliability and performance."
              href="/products"
              cta="Browse Products"
            />
            <BentoCard
              name="Expert Team"
              className="col-span-3 lg:col-span-1"
              background={
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200" />
              }
              Icon={Users}
              description="30+ years of combined industry expertise at your service."
              href="/about#team"
              cta="Meet Our Team"
            />
            <BentoCard
              name="Fast Delivery"
              className="col-span-3 lg:col-span-1"
              background={
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-purple-200" />
              }
              Icon={Truck}
              description="Island-wide delivery network ensuring quick and reliable service."
              href="/contact"
              cta="Learn More"
            />
            <BentoCard
              name="Customer Satisfaction"
              className="col-span-3 lg:col-span-2"
              background={
                <img
                  className="absolute inset-0 h-full w-full object-cover"
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop&q=80"
                  alt="Happy customers"
                />
              }
              Icon={Heart}
              description="5000+ satisfied customers trust us for their hardware needs. Join our growing family today."
              href="/contact"
              cta="Get in Touch"
            />
          </BentoGrid>
        </div>
      </section>

      {/* Awards & Recognition Section */}
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Awards & Recognition</h2>
            <p className="text-sm text-gray-700 max-w-2xl mx-auto font-bold">
              Celebrating our achievements and industry recognition
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="transform hover:scale-105 transition-transform duration-300">
              <Awards
                variant="badge"
                title="Excellence"
                subtitle="Industry Leadership Award"
                recipient="Sri Lanka Hardware Association"
                date="2023"
              />
            </div>
            
            <div className="transform hover:scale-105 transition-transform duration-300">
              <Awards
                variant="badge"
                title="Customer Choice"
                subtitle="Best Hardware Store"
                recipient="5000+ Happy Customers"
                date="2024"
              />
            </div>
            
            <div className="transform hover:scale-105 transition-transform duration-300">
              <Awards
                variant="badge"
                title="Quality Partner"
                subtitle="Authorized Dealer"
                recipient="Bosch, DeWalt, Stanley"
                date="2024"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Our Journey</h2>
            <p className="text-sm text-gray-700 max-w-2xl mx-auto font-bold">
              Three decades of growth, innovation, and unwavering commitment to our customers
            </p>
          </div>

          <div className="bg-white">
            <TimelineDemo />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Our Core Values</h2>
            <p className="text-sm text-gray-700 max-w-2xl mx-auto font-bold">
              The principles that guide our business and shape our relationships with customers
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <RevealImageList />
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
      <TestimonialSection
        title="Meet Our Team"
        subtitle="The experienced professionals who make Athukorala Traders your trusted hardware partner"
        testimonials={[
          {
            id: 1,
            quote: "With over 15 years in the hardware industry, I lead our team to deliver exceptional service and quality products to every customer.",
            name: "Rajitha Athukorala",
            role: "Managing Director",
            imageSrc: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80"
          },
          {
            id: 2,
            quote: "My passion is ensuring our customers find exactly what they need. Building relationships through trust and expertise is what drives me.",
            name: "Kasun Perera",
            role: "Sales Manager",
            imageSrc: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=800&auto=format&fit=crop&q=80"
          },
          {
            id: 3,
            quote: "Quality control is my priority. Every product that leaves our warehouse meets the highest standards of excellence.",
            name: "Dilshan Silva",
            role: "Operations Manager",
            imageSrc: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=800&auto=format&fit=crop&q=80"
          }
        ]}
      />

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
      <section className="py-8 bg-white">
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