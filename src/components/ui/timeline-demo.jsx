import React from "react";
import { Timeline } from "./timeline";

const buildImage = (url, alt) => (
  <img
    key={url}
    src={`${url}?auto=format&fit=crop&w=800&q=80`}
    alt={alt}
    loading="lazy"
    className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
  />
);

export const TimelineDemo = () => {
  const timelineData = [
    {
      title: "2024",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
            Expanded our digital product catalog and introduced guided project builders for contractors.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e",
                alt: "Team collaborating at warehouse",
              },
              {
                url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
                alt: "Hardware tools on desk",
              },
              {
                url: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef",
                alt: "Engineer reviewing plans",
              },
              {
                url: "https://images.unsplash.com/photo-1503602642458-232111445657",
                alt: "Modern storefront",
              },
            ].map((img) => buildImage(img.url, img.alt))}
          </div>
        </div>
      ),
    },
    {
      title: "Early 2023",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
            Completed a nationwide delivery network upgrade and piloted predictive inventory planning.
          </p>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
            These investments shortened lead times for large-scale construction partners across Sri Lanka.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
                alt: "Technician inspecting hardware",
              },
              {
                url: "https://images.unsplash.com/photo-1519764622345-23439dd774f8",
                alt: "Delivery fleet",
              },
              {
                url: "https://images.unsplash.com/photo-1447933601403-0c6688de566e",
                alt: "Operations center",
              },
              {
                url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
                alt: "Inventory shelves",
              },
            ].map((img) => buildImage(img.url, img.alt))}
          </div>
        </div>
      ),
    },
    {
      title: "Changelog",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-4">
            Latest drops pushed to the Athukorala platform this quarter:
          </p>
          <div className="mb-8 space-y-2 text-neutral-700 dark:text-neutral-300 text-xs md:text-sm">
            {[
              "AI-assisted BOM generator",
              "Island-wide service ticket tracking",
              "Staff onboarding playbooks",
              "Express pickup lockers",
              "Partner-learning portal",
            ].map((item) => (
              <div key={item} className="flex gap-2 items-center">
                <span role="img" aria-label="check">
                  ✅
                </span>
                {item}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
                alt: "Showroom display",
              },
              {
                url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173",
                alt: "Team workshop",
              },
              {
                url: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a",
                alt: "Inventory planning board",
              },
              {
                url: "https://images.unsplash.com/photo-1416339442236-8ceb164046f8",
                alt: "Customer service desk",
              },
            ].map((img) => buildImage(img.url, img.alt))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      <Timeline data={timelineData} />
    </div>
  );
};
