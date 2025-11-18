import { Hero7 } from "@/components/ui/modern-hero"

const demoData = {
  heading: "Transform Your Project with Modern Components",
  description:
    "Beautifully designed components built with React, TypeScript, Tailwind CSS and Shadcn UI. Ready to copy and paste directly into your project.",
  button: {
    text: "Explore Components",
    url: "#components",
  },
  reviews: {
    count: 150,
    avatars: [
      {
        src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        alt: "Developer 1",
      },
      {
        src: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        alt: "Developer 2",
      },
      {
        src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        alt: "Developer 3",
      },
      {
        src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        alt: "Developer 4",
      },
      {
        src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        alt: "Developer 5",
      },
    ],
  },
};

function Hero7Demo() {
  return <Hero7 {...demoData} />;
}

export { Hero7Demo };