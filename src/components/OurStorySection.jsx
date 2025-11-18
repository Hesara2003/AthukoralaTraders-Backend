import React from 'react';
import { cn } from '../lib/utils';

export function OurStorySection() {
  return (
    <section className="overflow-hidden bg-white py-16">
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Content */}
          <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center gap-2 rounded-lg border bg-white p-1 pr-3 shadow-sm">
              <span className="bg-muted rounded-[calc(var(--radius)-0.25rem)] px-2 py-1 text-xs font-medium">
                Since 1995
              </span>
              <span className="text-sm">30+ Years of Excellence</span>
            </div>

            <h1 className="text-4xl font-bold md:text-5xl">
              Our Story
            </h1>
            
            <div className="space-y-4 text-gray-700 text-base leading-relaxed">
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
          
          {/* Right Image */}
          <div className="relative lg:block hidden">
            <div className="sticky top-24">
              <img
                className="rounded-2xl shadow-2xl w-full h-[600px] object-cover"
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&auto=format&fit=crop&q=80"
                alt="Hardware store with tools and equipment"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
