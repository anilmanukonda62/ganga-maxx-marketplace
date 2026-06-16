import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import productsData from '../data/products.json';

// Custom inline brand SVGs to bypass bundler export mismatches and improve style fidelity
const FacebookIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const LinkedinIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11.75 20h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

export const Footer = () => {
  const categories = productsData.categories;

  // WhatsApp SVG Icon
  const WhatsAppIcon = () => (
    <svg
      className="w-5 h-5 fill-current"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.761.46 3.472 1.332 4.975L2 22l5.223-1.371a9.92 9.92 0 0 0 4.789 1.229H12c5.506 0 9.988-4.482 9.988-9.988 0-2.659-1.035-5.161-2.919-7.045A9.922 9.922 0 0 0 12.012 2zm0 1.637c2.233 0 4.331.87 5.906 2.445 1.576 1.576 2.444 3.673 2.444 5.906 0 4.603-3.743 8.347-8.347 8.347a8.307 8.307 0 0 1-4.237-1.15l-.304-.18-3.149.826.84-3.071-.197-.314a8.305 8.305 0 0 1-1.272-4.461c0-4.603 3.743-8.347 8.347-8.347v.002zm-3.666 4.31c-.2.001-.33.012-.48.064-.15.053-.29.13-.41.226-.37.3-.64.712-.76 1.189-.25.968.12 1.954.7 2.723 1.15 1.523 2.58 2.768 4.19 3.65.61.33 1.27.56 1.95.67.75.12 1.48-.12 1.93-.65.23-.27.35-.61.35-.96v-.27c0-.14-.08-.26-.21-.32-.34-.17-1.03-.51-1.19-.57-.16-.06-.28-.09-.4.09-.12.18-.46.57-.56.69-.1.12-.21.13-.37.05a5.13 5.13 0 0 1-1.42-.88c-.48-.42-.87-.93-1.15-1.5-.1-.17-.01-.26.07-.35l.4-.46c.09-.1.12-.21.06-.32-.06-.16-.57-1.37-.69-1.65-.12-.29-.25-.25-.37-.25h-.26z" />
    </svg>
  );

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      
      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Column 1: Logo, Tagline, Bio, Social */}
          <div className="flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-3 self-start">
              <img
                src={productsData.logo}
                alt="Ganga Maxx Marketplace Logo"
                className="h-12 w-12 object-contain rounded-lg border border-slate-800 bg-white p-0.5"
              />
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-white">
                  Ganga Maxx
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-green-500">
                  Marketplace
                </span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              B2B Cleaning & Hygiene Supplies for Institutions across Hyderabad & Telangana. Delivering premium, professional, and eco-friendly solutions to hotels, hospitals, and offices.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3.5 mt-2">
              <a
                href="#"
                className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-green-600 transition-all duration-300 flex items-center justify-center"
                aria-label="Facebook Page"
              >
                <FacebookIcon size={18} />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-green-600 transition-all duration-300 flex items-center justify-center"
                aria-label="Instagram Profile"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-green-600 transition-all duration-300 flex items-center justify-center"
                aria-label="LinkedIn Company Profile"
              >
                <LinkedinIcon size={18} />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-green-600 transition-all duration-300 flex items-center justify-center"
                aria-label="WhatsApp Channel"
              >
                <WhatsAppIcon />
              </a>
            </div>
          </div>

          {/* Column 2: Product Categories */}
          <div>
            <h4 className="text-white font-bold text-base tracking-wide mb-6 uppercase text-sm border-l-4 border-green-600 pl-3">
              Product Categories
            </h4>
            <ul className="flex flex-col gap-3.5 text-sm">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/products?category=${cat.id}`}
                    className="hover:text-green-400 flex items-center gap-2 hover:translate-x-1.5 transition-all duration-200"
                  >
                    <span>{cat.icon}</span>
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Useful Links */}
          <div>
            <h4 className="text-white font-bold text-base tracking-wide mb-6 uppercase text-sm border-l-4 border-green-600 pl-3">
              Useful Links
            </h4>
            <ul className="flex flex-col gap-3.5 text-sm">
              <li>
                <Link to="/" className="hover:text-green-400 hover:translate-x-1.5 transition-all duration-200 inline-block">
                  Home Page
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-green-400 hover:translate-x-1.5 transition-all duration-200 inline-block">
                  About Ganga Maxx
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-green-400 hover:translate-x-1.5 transition-all duration-200 inline-block">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/enquiry" className="hover:text-green-400 hover:translate-x-1.5 transition-all duration-200 inline-block">
                  Submit B2B Enquiry
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h4 className="text-white font-bold text-base tracking-wide mb-6 uppercase text-sm border-l-4 border-green-600 pl-3">
              Corporate Office
            </h4>
            <ul className="flex flex-col gap-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-green-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed text-slate-300">
                  Sri Ram Nagar Colony, Puppalaguda, Hyderabad, 500089
                </span>
              </li>
              <li className="flex flex-col gap-1.5">
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-green-500 shrink-0 mt-0.5" />
                  <div className="flex flex-col text-slate-300">
                    <a href="tel:+919110306090" className="hover:text-green-400">
                      +91 91103 06090
                    </a>
                    <a href="tel:+919110714545" className="hover:text-green-400">
                      +91 91107 14545
                    </a>
                    <a href="tel:+918801214584" className="hover:text-green-400">
                      +91 88012 14584
                    </a>
                  </div>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-green-500 shrink-0" />
                <a
                  href="mailto:Gangamaxxmarketplace@gmail.com"
                  className="hover:text-green-400 truncate text-slate-300"
                >
                  Gangamaxxmarketplace@gmail.com
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Footer Bottom Strip */}
      <div className="border-t border-slate-800 bg-slate-950/70 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="max-w-2xl leading-relaxed text-[11px] text-slate-400">
            <span className="font-semibold text-slate-400">Disclaimer:</span> Ganga Maxx Marketplace is a B2B reseller and supplier of professional housekeeping materials, cleaning chemicals, tools, and industrial floor cleaning machines. Brand names and logos are trademarks of their respective owners.
          </p>
          <p className="shrink-0 text-slate-400">
            &copy; 2026 Ganga Maxx Marketplace. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
