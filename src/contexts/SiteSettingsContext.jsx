import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Create context
const SiteSettingsContext = createContext();

// Default settings
const defaultSettings = {
  id: 'site-settings',
  logo_url: '',
  banner_image_url: '',
  hero_text_headline: 'Find Your Next Ride, Effortlessly.',
  hero_text_subheadline: 'Your2ndRide connects buyers and sellers of quality pre-owned vehicles.',
  contact_email: 'support@your2ndride.com',
  contact_phone: '+1 (555) RIDE-NOW',
  contact_address: '123 Main St, Springfield, USA', // NEW FIELD
  footer_text: `© ${new Date().getFullYear()} Your2ndRide. All rights reserved.`,
  primary_color: '#6D28D9', // Default primary (purple)
  accent_color: '#EC4899', // Default accent (pink)
  updated_at: new Date().toISOString()
};

export const SiteSettingsProvider = ({ children }) => {
  const [siteSettings, setSiteSettings] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch settings from Supabase
  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'site-settings')
        .single();

      if (error) {
        console.log('Settings not found in Supabase:', error);
        // If no settings exist yet, we'll use the defaults
        if (error.code === 'PGRST116') {
          console.log('Using default site settings');
        } else {
          console.error('Error fetching site settings:', error);
        }
        return;
      }
      
      if (data) {
        console.log('Site settings loaded from Supabase:', data);
        setSiteSettings(data);
      }
    } catch (err) {
      console.error('Unexpected error loading site settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchSettings();

    // Subscribe to changes in the site_settings table
    const subscription = supabase
      .channel('site_settings_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'site_settings', filter: `id=eq.site-settings` }, 
        (payload) => {
          console.log('Site settings changed:', payload);
          if (payload.new) {
            setSiteSettings(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Apply CSS variables for theme colors
  useEffect(() => {
    if (siteSettings) {
      document.documentElement.style.setProperty('--color-primary', siteSettings.primary_color);
      document.documentElement.style.setProperty('--color-accent', siteSettings.accent_color);
    }
  }, [siteSettings]);

  return (
    <SiteSettingsContext.Provider value={{ siteSettings, isLoading, fetchSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

// Custom hook to use the site settings context
export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};
