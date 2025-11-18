import React from 'react';
import { Award, Users, Clock, Star, ArrowRight, Truck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import { Awards } from '../components/ui/award';
import { OurStorySection } from '../components/OurStorySection';
import { BentoGrid, BentoCard } from '../components/ui/bento-grid';
import { TestimonialSection } from '../components/ui/testimonials';
import { TimelineDemo } from '../components/ui/timeline-demo';
import { GlobalReachDemo } from '../components/ui/global-reach-demo';
import { AboutScrollHero } from '../components/AboutScrollHero';

const AboutPage = () => {
  const stats = [
    { number: '30+', label: 'Years of Experience', icon: Clock },
    { number: '5000+', label: 'Happy Customers', icon: Users },
    { number: '10,000+', label: 'Products Available', icon: Award },
    { number: '99%', label: 'Customer Satisfaction', icon: Star },
  ];

  return (
    <PublicLayout>
      {/* Scroll Expansion Hero */}
      <AboutScrollHero />

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

          <BentoGrid className="max-w-6xl mx-auto min-h-[600px]">
            <BentoCard
              name="Expert Team"
              className="col-span-1 md:col-span-1 lg:col-span-1 min-h-[280px]"
              background={
                <img
                  className="absolute inset-0 h-full w-full object-cover"
                  src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format&fit=crop&q=80"
                  alt="Professional hardware experts team"
                />
              }
              Icon={Users}
              description="30+ years of combined industry expertise at your service."
              href="/about#team"
              cta="Meet Our Team"
            />
            <BentoCard
              name="Fast Delivery"
              className="col-span-1 md:col-span-1 lg:col-span-1 min-h-[280px]"
              background={
                <img
                  className="absolute inset-0 h-full w-full object-cover"
                  src="https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&auto=format&fit=crop&q=80"
                  alt="Fast delivery truck and logistics"
                />
              }
              Icon={Truck}
              description="Island-wide delivery network ensuring quick and reliable service."
              href="/contact"
              cta="Learn More"
            />
            <BentoCard
              name="Customer Satisfaction"
              className="col-span-1 md:col-span-2 lg:col-span-2 min-h-[280px]"
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

      {/* Global Reach Section */}
      <section className="bg-gray-50 border-t border-gray-200">
        <GlobalReachDemo />
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