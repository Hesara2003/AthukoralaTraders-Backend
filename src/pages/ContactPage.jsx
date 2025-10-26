import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';
import PublicLayout from '../components/PublicLayout';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
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
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-12 overflow-hidden">
        {/* Background Images */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
             style={{backgroundImage: 'url(/images/hero-backgrounds/contact-hero-bg.jpg), url(/images/contact-hero-service.svg)'}}></div>
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/35"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-xl mb-4 shadow-lg border-2 border-green-400">
              <Mail className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-black mb-4">Get in Touch</h1>
            <p className="text-base text-blue-100 leading-relaxed mb-4">
              Have questions about our products or need expert advice? We're here to help! 
              Our knowledgeable team is ready to assist you with all your hardware needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-lg px-4 py-2 text-white shadow-md font-bold text-sm">
                <Clock className="w-4 h-4 text-green-300" />
                <span>Quick Response</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-lg px-4 py-2 text-white shadow-md font-bold text-sm">
                <Phone className="w-4 h-4 text-orange-300" />
                <span>24/7 Emergency Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {contactInfo.map((info, index) => (
              <div key={index} className="bg-white rounded-2xl p-5 text-center shadow-lg border-2 border-gray-200">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 border-2 ${info.color.replace('text-', 'bg-').replace('-600', '-600')} ${info.color.replace('text-', 'border-').replace('-600', '-700')}`}>
                  <info.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2">{info.title}</h3>
                <div className="space-y-1">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-700 text-sm">{detail}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Form */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 mb-2">Send Us a Message</h2>
                <p className="text-gray-700 leading-relaxed text-sm">
                  Fill out the form below and we'll get back to you as soon as possible. 
                  For urgent matters, please call us directly.
                </p>
              </div>

              {/* Form Status Message */}
              {formStatus && (
                <div className={`mb-4 p-3 rounded-xl border-2 ${
                  formStatus.type === 'success' 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center gap-2">
                    {formStatus.type === 'success' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    <span className="font-bold text-sm">{formStatus.message}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-black text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-black text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-black text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                      placeholder="+94 77 123 4567"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-black text-gray-700 mb-1">
                      Department
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                    >
                      <option value="">Select a department</option>
                      {departments.map((dept) => (
                        <option key={dept.value} value={dept.value}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-black text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical text-sm"
                    placeholder="Please provide details about your inquiry, including specific products or services you're interested in..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all duration-200 border-2 ${
                    isSubmitting
                      ? 'bg-gray-400 border-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 border-blue-700 hover:bg-blue-700'
                  } text-white shadow-lg`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Map & Additional Info */}
            <div className="space-y-4">
              {/* Map Placeholder */}
              <div className="bg-gray-100 rounded-2xl h-48 flex items-center justify-center border-2 border-gray-200">
                <div className="text-center text-gray-500">
                  <MapPin className="w-10 h-10 mx-auto mb-2" />
                  <p className="font-black text-sm">Interactive Map</p>
                  <p className="text-xs">123 Hardware Street, Colombo 03</p>
                </div>
              </div>

              {/* Quick Contact */}
              <div className="bg-blue-50 rounded-2xl p-5 border-2 border-blue-200">
                <h3 className="text-lg font-black text-gray-900 mb-3">Quick Contact</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="font-black text-gray-900 text-sm">Call Now</p>
                      <p className="text-gray-700 text-xs">+94 11 234 5678</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="font-black text-gray-900 text-sm">Email</p>
                      <p className="text-gray-700 text-xs">info@athukolaratraders.lk</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-orange-50 rounded-2xl p-5 border-2 border-orange-200">
                <h3 className="text-lg font-black text-gray-900 mb-3">Emergency Support</h3>
                <p className="text-gray-700 mb-2 text-sm">
                  For urgent technical support or emergency orders outside business hours:
                </p>
                <div className="flex items-center gap-2 text-orange-700 font-black text-sm">
                  <Phone className="w-4 h-4" />
                  <span>+94 77 123 4567</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">Available 24/7 for registered customers</p>
              </div>

              {/* Office Hours */}
              <div className="bg-green-50 rounded-2xl p-5 border-2 border-green-200">
                <h3 className="text-lg font-black text-gray-900 mb-3">Office Hours</h3>
                <div className="space-y-1.5 text-gray-700 text-sm">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="font-black">8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-black">8:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="font-black text-red-600">Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-gray-900 mb-2">Frequently Asked Questions</h2>
              <p className="text-gray-700 text-sm font-bold">Common questions about our products and services</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div key={index} className="bg-white rounded-xl p-5 shadow-lg border-2 border-gray-200">
                  <h3 className="font-black text-gray-900 mb-2 text-sm">{faq.question}</h3>
                  <p className="text-gray-700 leading-relaxed text-xs">{faq.answer}</p>
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