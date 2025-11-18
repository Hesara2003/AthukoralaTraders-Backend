import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactHeroProps {
  button?: {
    text: string;
    url?: string;
    onClick?: () => void;
  };
}

const ContactHero = ({
  button = {
    text: "Contact Us Now",
  },
}: ContactHeroProps) => {
  const handleButtonClick = () => {
    if (button.onClick) {
      button.onClick();
    } else if (button.url) {
      window.open(button.url, '_blank');
    } else {
      // Scroll to contact form
      const contactForm = document.querySelector('form');
      contactForm?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Minimal Icon */}
          <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-8">
            <Mail className="w-6 h-6 text-white" />
          </div>
          
          {/* Clean Heading */}
          <h1 className="text-5xl font-light text-gray-900 mb-6 tracking-tight">
            Get in Touch
          </h1>
          
          {/* Simple Description */}
          <p className="text-xl text-gray-600 leading-relaxed mb-12 font-light">
            Have questions about our products or need expert advice? We're here to help.
          </p>

          {/* Minimal CTA */}
          <Button 
            className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full font-medium transition-colors"
            onClick={handleButtonClick}
          >
            {button.text}
          </Button>
        </div>
      </div>
    </section>
  );
};

export { ContactHero };