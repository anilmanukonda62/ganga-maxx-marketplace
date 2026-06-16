import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, MapPin, Send, CheckCircle, MessageCircle } from 'lucide-react';

// Custom inline brand SVGs to bypass bundler export mismatches and improve style fidelity
const FacebookIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const LinkedinIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11.75 20h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

export const Contact = () => {
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Inputs change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const API_URL = '/api';
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Server returned an error');
      }

      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });

      // Automatically hide success alert after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error('Contact Message submission failed:', error);
      alert(`Failed to send message: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Page Heading */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white sm:text-4xl">
          Contact Us
        </h1>
        <div className="w-16 h-1 bg-green-600 mx-auto mt-4 rounded-full" />
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Get in touch with Ganga Maxx Marketplace. Speak to our sales representatives or send us a message below. We serve all Telangana districts.
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Contact details + Embedded Map */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Information Card */}
          <div className="bg-white dark:bg-slate-900/60 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white border-l-4 border-green-600 pl-3">
              Office Information
            </h3>

            <ul className="space-y-5 text-sm">
              <li className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0 border border-green-100/30">
                  <MapPin size={16} />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold block uppercase">HQ Address</span>
                  <span className="text-slate-700 dark:text-slate-300 leading-relaxed mt-0.5 inline-block">
                    Sri Ram Nagar Colony, Puppalaguda, Hyderabad, 500089
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0 border border-green-100/30">
                  <Phone size={16} />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold block uppercase">Phone Numbers</span>
                  <div className="flex flex-col text-slate-700 dark:text-slate-300 mt-0.5">
                    <a href="tel:+919110306090" className="hover:text-green-600 transition-colors">
                      +91 91103 06090
                    </a>
                    <a href="tel:+919110714545" className="hover:text-green-600 transition-colors">
                      +91 91107 14545
                    </a>
                    <a href="tel:+918801214584" className="hover:text-green-600 transition-colors">
                      +91 88012 14584
                    </a>
                  </div>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0 border border-green-100/30">
                  <Mail size={16} />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold block uppercase">Corporate Email</span>
                  <a
                    href="mailto:Gangamaxxmarketplace@gmail.com"
                    className="text-slate-700 dark:text-slate-300 mt-0.5 inline-block hover:text-green-600 transition-colors break-all"
                  >
                    Gangamaxxmarketplace@gmail.com
                  </a>
                </div>
              </li>
            </ul>

            {/* Social media connections */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-xs text-slate-400 font-semibold uppercase block mb-3.5">
                Connect Online
              </span>
              <div className="flex items-center gap-3">
                <a href="#" className="p-2.5 rounded-lg bg-slate-50 hover:bg-green-600 text-slate-500 hover:text-white dark:bg-slate-800 dark:text-slate-400 transition-all duration-300 flex items-center justify-center">
                  <FacebookIcon size={16} />
                </a>
                <a href="#" className="p-2.5 rounded-lg bg-slate-50 hover:bg-green-600 text-slate-500 hover:text-white dark:bg-slate-800 dark:text-slate-400 transition-all duration-300 flex items-center justify-center">
                  <InstagramIcon size={16} />
                </a>
                <a href="#" className="p-2.5 rounded-lg bg-slate-50 hover:bg-green-600 text-slate-500 hover:text-white dark:bg-slate-800 dark:text-slate-400 transition-all duration-300 flex items-center justify-center">
                  <LinkedinIcon size={16} />
                </a>
                <a href="#" className="p-2.5 rounded-lg bg-slate-50 hover:bg-green-600 text-slate-500 hover:text-white dark:bg-slate-800 dark:text-slate-400 transition-all duration-300 flex items-center justify-center">
                  <MessageCircle size={16} />
                </a>
              </div>
            </div>

          </div>

          {/* Embedded Google Map */}
          <div className="w-full h-64 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800/80 shadow-sm relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15231.815949576405!2d78.3718042457813!3d17.414006509657074!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9405d4df4d43%3A0xe5566f120d5718df!2sPuppalaguda%2C%20Hyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1718270000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ganga Maxx location Puppalaguda Map"
            />
          </div>

        </div>

        {/* Right Column: Contact form */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-slate-900/60 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white border-l-4 border-green-600 pl-3 mb-6">
              Send us a Message
            </h3>

            {/* Success Notification Alert */}
            <AnimatePresence>
              {submitSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-3 text-emerald-800 dark:text-emerald-400 text-sm overflow-hidden"
                >
                  <CheckCircle size={18} className="shrink-0 text-emerald-500 mt-0.5" />
                  <div>
                    <span className="font-bold">Thank you!</span> Your message has been sent successfully. A Ganga Maxx representative will follow up with you within 24 hours.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 dark:focus:ring-green-400/50 text-slate-800 dark:text-white"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 dark:focus:ring-green-400/50 text-slate-800 dark:text-white"
                    placeholder="name@institution.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 dark:focus:ring-green-400/50 text-slate-800 dark:text-white"
                  placeholder="e.g. Monthly chemical contract request"
                />
              </div>

              <div>
                <label htmlFor="message" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  Message / Requirements *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 dark:focus:ring-green-400/50 text-slate-800 dark:text-white resize-none"
                  placeholder="Outline your detailed specifications or institutional queries..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 font-bold text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 rounded-xl shadow-md disabled:bg-slate-400 dark:disabled:bg-slate-800 transition-all duration-200"
              >
                <Send size={15} />
                {isSubmitting ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
};
