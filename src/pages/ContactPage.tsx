import { useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import { ContactHero } from '../components/ContactHero';
import { ContactGlobeSection } from '../components/ContactGlobeSection';

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormStatus {
  type: 'success' | 'error';
  message: string;
}

const ContactPage = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState<FormStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFormStatus({ type: 'success', message: 'Thank you! Your message has been sent successfully. We\'ll get back to you within 24 hours.' });
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      setFormStatus({ type: 'error', message: 'Sorry, there was an error sending your message. Please try again or contact us directly.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Visit Our Store',
      details: ['123 Hardware Street', 'Colombo 03, Sri Lanka', 'Near Liberty Plaza'],
      color: 'text-blue-600'
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: ['+94 11 234 5678', '+94 77 123 4567', 'WhatsApp Available'],
      color: 'text-green-600'
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: ['info@athukolaratraders.lk', 'sales@athukolaratraders.lk', 'support@athukolaratraders.lk'],
      color: 'text-purple-600'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: ['Mon - Fri: 8:00 AM - 6:00 PM', 'Saturday: 8:00 AM - 4:00 PM', 'Sunday: Closed'],
      color: 'text-orange-600'
    }
  ];

  const departments = [
    { name: 'General Inquiry', value: 'general' },
    { name: 'Sales & Quotations', value: 'sales' },
    { name: 'Technical Support', value: 'support' },
    { name: 'Bulk Orders', value: 'bulk' },
    { name: 'Returns & Warranty', value: 'returns' },
    { name: 'Partnership', value: 'partnership' }
  ];

  return (
    <PublicLayout>
      {/* Modern Hero Section */}
      <ContactHero />

      {/* Globe Section */}
      <ContactGlobeSection />

      {/* Contact Info Cards */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {contactInfo.map((info, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <info.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">{info.title}</h3>
                  <div className="space-y-1">
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-gray-600 text-sm">{detail}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-light text-gray-900 mb-4">Send Message</h2>
              <p className="text-gray-600">
                We'll get back to you within 24 hours.
              </p>
            </div>

            {/* Form Status Message */}
            {formStatus && (
              <div className={`mb-6 p-4 rounded ${
                formStatus.type === 'success' 
                  ? 'bg-green-50 text-green-800' 
                  : 'bg-red-50 text-red-800'
              }`}>
                <p className="text-sm">{formStatus.message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-gray-900 focus:ring-0 bg-transparent text-gray-900 placeholder-gray-500 transition-colors"
                    placeholder="Full Name *"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-gray-900 focus:ring-0 bg-transparent text-gray-900 placeholder-gray-500 transition-colors"
                    placeholder="Email Address *"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-gray-900 focus:ring-0 bg-transparent text-gray-900 placeholder-gray-500 transition-colors"
                    placeholder="Phone Number"
                  />
                </div>
                <div>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-gray-900 focus:ring-0 bg-transparent text-gray-900 transition-colors"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.value} value={dept.value}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-gray-900 focus:ring-0 bg-transparent text-gray-900 placeholder-gray-500 resize-none transition-colors"
                  placeholder="Message *"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-full font-medium transition-colors ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 hover:bg-gray-800'
                } text-white`}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-light text-gray-900 text-center mb-16">Common Questions</h2>

            <div className="space-y-12">
              {[
                {
                  question: "Do you provide delivery services?",
                  answer: "Yes, we offer island-wide delivery with tracking. Free delivery for orders over Rs. 50,000 within Colombo."
                },
                {
                  question: "What payment methods do you accept?",
                  answer: "We accept cash, credit/debit cards, bank transfers, and mobile payments for your convenience."
                },
                {
                  question: "Do you offer bulk discounts?",
                  answer: "Yes, we provide special pricing for bulk orders. Contact our sales team for custom quotations."
                },
                {
                  question: "What's your return policy?",
                  answer: "We offer 30-day returns for unused items in original packaging with receipt."
                },
                {
                  question: "Do you provide technical support?",
                  answer: "Yes, our technical team provides installation guidance and product support for all customers."
                },
                {
                  question: "Can I track my order?",
                  answer: "Yes, you'll receive tracking information via SMS and email once your order is dispatched."
                }
              ].map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{faq.question}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default ContactPage;