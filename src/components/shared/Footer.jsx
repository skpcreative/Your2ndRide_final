import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { siteSettings } = useSiteSettings();

  return (
    <footer className="bg-muted/50 text-muted-foreground py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <Link to="/" className="flex items-center space-x-2 text-primary mb-4">
              {siteSettings.logo_url ? (
                <img src={siteSettings.logo_url} alt="Your2ndRide Logo" className="h-10 w-auto" />
              ) : (
                <>
                  <Car className="h-8 w-8" />
                  <span className="text-2xl font-bold text-foreground">Your<span className="text-accent">2nd</span>Ride</span>
                </>
              )}
            </Link>
            <p className="text-sm">
              {siteSettings.footer_text || 'Your premier platform for buying and selling pre-owned vehicles. Find your next ride or sell your current one with ease and confidence.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="font-semibold text-foreground mb-4">Quick Links</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/buy" className="hover:text-primary transition-colors">Buy a Vehicle</Link></li>
              <li><Link to="/sell" className="hover:text-primary transition-colors">Sell Your Vehicle</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Support</Link></li>
              <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <p className="font-semibold text-foreground mb-4">Contact Us</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <span className="mr-2">📧</span> 
                <a href={`mailto:${siteSettings.contact_email || 'info@your2ndride.com'}`} className="hover:text-primary transition-colors">
                  {siteSettings.contact_email || 'info@your2ndride.com'}
                </a>
              </li>
              <li className="flex items-center">
                <span className="mr-2">📞</span>
                <a href={`tel:${siteSettings.contact_phone || ''}`} className="hover:text-primary transition-colors">
                  {siteSettings.contact_phone || ''}
                </a>
              </li>
              {siteSettings.contact_address && (
                <li className="flex items-center">
                  <span className="mr-2">📍</span>
                  <span>{siteSettings.contact_address}</span>
                </li>
              )}
            </ul>
            <div className="flex space-x-4 mt-6">
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Facebook size={20} /></a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Twitter size={20} /></a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Instagram size={20} /></a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin size={20} /></a>
            </div>
          </div>

          {/* Newsletter/Legal */}
          <div>
            <p className="font-semibold text-foreground mb-4">Stay Updated</p>
            <p className="text-sm mb-3">Subscribe to our newsletter for the latest deals and updates.</p>
            {/* Placeholder for a newsletter signup form - to be implemented with shadcn/ui Input and Button */}
            <ul className="space-y-1 text-xs mt-4">
              <li><Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm">
          <p>{siteSettings.footer_text || `© ${currentYear} Your2ndRide. All rights reserved.`}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;