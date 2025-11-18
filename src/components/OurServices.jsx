import React from 'react';
import InteractiveBentoGallery from './ui/interactive-bento-gallery';

const serviceItems = [
  {
    id: 1,
    type: "image",
    title: "Technical Consultation",
    desc: "Expert advice on product selection and usage for your projects",
    url: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
    span: "md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2",
  },
  {
    id: 2,
    type: "image",
    title: "Fast Delivery",
    desc: "Island-wide delivery with real-time tracking and same-day options",
    url: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088",
    span: "md:col-span-2 md:row-span-2 col-span-1 sm:col-span-2 sm:row-span-2",
  },
  {
    id: 3,
    type: "image",
    title: "Bulk Orders",
    desc: "Special pricing and dedicated support for large construction projects",
    url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122",
    span: "md:col-span-1 md:row-span-3 sm:col-span-2 sm:row-span-2",
  },
  {
    id: 4,
    type: "image",
    title: "Equipment Rental",
    desc: "Rent premium power tools and equipment for short-term projects",
    url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1",
    span: "md:col-span-2 md:row-span-2 sm:col-span-1 sm:row-span-2",
  },
  {
    id: 5,
    type: "image",
    title: "Custom Orders",
    desc: "Source specialized hardware and materials for unique requirements",
    url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837",
    span: "md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2",
  },
  {
    id: 6,
    type: "image",
    title: "Installation Support",
    desc: "Professional installation guidance and on-site technical assistance",
    url: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789",
    span: "md:col-span-2 md:row-span-2 sm:col-span-1 sm:row-span-2",
  },
  {
    id: 7,
    type: "image",
    title: "Warranty & Service",
    desc: "Comprehensive warranty coverage and after-sales support",
    url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d",
    span: "md:col-span-1 md:row-span-2 sm:col-span-1 sm:row-span-2",
  },
];

export function OurServices() {
  return (
    <section className="bg-white py-20">
      <InteractiveBentoGallery
        mediaItems={serviceItems}
        title="Our Services"
        description="Explore our comprehensive range of services designed to support your projects"
      />
    </section>
  );
}
