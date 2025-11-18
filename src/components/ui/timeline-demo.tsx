import { Timeline, type TimelineEntry } from "./timeline";

const buildImage = (url: string, alt: string) => (
  <img
    key={url}
    src={`${url}?auto=format&fit=crop&w=800&q=80`}
    alt={alt}
    loading="lazy"
    className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
  />
);

export const TimelineDemo = () => {
  const timelineData: TimelineEntry[] = [
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
                url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd",
                alt: "Power tools and drilling equipment",
              },
              {
                url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
                alt: "Hardware tools and screws",
              },
              {
                url: "https://images.unsplash.com/photo-1609205434513-da0cf5e7a546",
                alt: "Construction tools and measuring equipment",
              },
              {
                url: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3",
                alt: "Industrial hardware and bolts",
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
                url: "https://images.unsplash.com/photo-1563453392212-326d32d2d12f",
                alt: "Wrench and socket sets",
              },
              {
                url: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3",
                alt: "Nuts bolts and fasteners",
              },
              {
                url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13",
                alt: "Electrical components and wires",
              },
              {
                url: "https://images.unsplash.com/photo-1609205434513-da0cf5e7a546",
                alt: "Measuring tools and levels",
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
                url: "https://images.unsplash.com/photo-1609205434513-da0cf5e7a546",
                alt: "Hand tools and hardware",
              },
              {
                url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd",
                alt: "Power drill and bits",
              },
              {
                url: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3",
                alt: "Mechanical components",
              },
              {
                url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
                alt: "Hardware fasteners and screws",
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
