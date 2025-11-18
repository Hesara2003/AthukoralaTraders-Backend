import React from 'react';
import { motion } from "motion/react";
import { TestimonialsColumn } from './ui/testimonials-columns';

const testimonials = [
  {
    text: "Athukorala Traders has been our go-to supplier for 10 years. Their quality hardware and timely delivery keep our construction projects on schedule.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "Rohan Silva",
    role: "Construction Manager",
  },
  {
    text: "The range of power tools and equipment is outstanding. Their expert advice helped us choose the perfect tools for our workshop.",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    name: "Priya Fernando",
    role: "Workshop Owner",
  },
  {
    text: "Exceptional customer service! They guided us through every purchase and their after-sales support is simply the best in the industry.",
    image: "https://randomuser.me/api/portraits/men/22.jpg",
    name: "Kasun Perera",
    role: "Electrical Contractor",
  },
  {
    text: "Reliable, authentic products at competitive prices. Their fast delivery service has saved our projects multiple times.",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
    name: "Dilani Jayawardena",
    role: "Interior Designer",
  },
  {
    text: "From small repairs to major renovations, Athukorala Traders has everything. Their knowledgeable staff makes shopping easy.",
    image: "https://randomuser.me/api/portraits/men/46.jpg",
    name: "Nuwan Bandara",
    role: "Property Developer",
  },
  {
    text: "Quality guaranteed! Every product we've purchased has exceeded expectations. Their warranty support gives us peace of mind.",
    image: "https://randomuser.me/api/portraits/women/28.jpg",
    name: "Sanduni Wickramasinghe",
    role: "Building Maintenance Lead",
  },
  {
    text: "Best hardware store in Sri Lanka! Their extensive inventory and professional service keep us coming back for every project.",
    image: "https://randomuser.me/api/portraits/men/58.jpg",
    name: "Chaminda Rathnayake",
    role: "Plumbing Contractor",
  },
  {
    text: "The team understands our industrial needs perfectly. Fast quotes, competitive pricing, and reliable delivery make them our trusted partner.",
    image: "https://randomuser.me/api/portraits/women/36.jpg",
    name: "Nimalka Senanayake",
    role: "Factory Operations Manager",
  },
  {
    text: "Outstanding service and product quality! Athukorala Traders consistently delivers authentic brands and expert technical support.",
    image: "https://randomuser.me/api/portraits/men/12.jpg",
    name: "Ashan Gunasekara",
    role: "Civil Engineer",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export const Testimonials = () => {
  return (
    <section className="bg-gray-50 py-20 relative">
      <div className="container z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          <div className="flex justify-center">
            <div className="border border-blue-600 text-blue-600 py-1 px-4 rounded-lg text-sm font-semibold">
              Testimonials
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5 text-gray-900 text-center">
            What Our Customers Say
          </h2>
          <p className="text-center mt-5 opacity-75 text-gray-600 text-lg">
            Trusted by contractors, builders, and businesses across Sri Lanka.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
};
