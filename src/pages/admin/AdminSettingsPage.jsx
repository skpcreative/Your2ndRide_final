import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Save, Image as ImageIcon, Palette, Phone, Mail, Globe, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const AdminSettingsPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [siteSettings, setSiteSettings] = useState({
    id: 'site-settings',
    logo_url: '',
    banner_image_url: '',
    hero_text_headline: 'Find Your Next Ride, Effortlessly.',
    hero_text_subheadline: 'Your2ndRide connects buyers and sellers of quality pre-owned vehicles.',
    contact_email: 'support@your2ndride.com',
    contact_phone: '+1 (555) RIDE-NOW',
    footer_text: `© ${new Date().getFullYear()} Your2ndRide. All rights reserved.`,
    primary_color: '#6D28D9', // Default primary (purple)
    accent_color: '#EC4899', // Default accent (pink)
    updated_at: new Date().toISOString()
  });
  const [tempLogoFile, setTempLogoFile] = useState(null);
  const [tempBannerFile, setTempBannerFile] = useState(null);

  // Fetch settings from Supabase
  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'site-settings')
        .single();

      if (error) {
        console.log('Settings not found in Supabase, will create on first save:', error);
        // If no settings exist yet (PGRST116 is "The result contains 0 rows")
        if (error.code === 'PGRST116') {
          // We'll use the default settings and create them on first save
          console.log('Using default settings until first save');
          return;
        }
        
        // For other errors, show an error message
        toast({
          title: "Error",
          description: "Failed to load site settings: " + error.message,
          variant: "destructive"
        });
        return;
      }
      
      if (data) {
        console.log('Settings loaded from Supabase:', data);
        setSiteSettings(data);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Error",
        description: "Failed to load settings: " + err.message,
        variant: "destructive"
      });
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
          console.log('Settings changed:', payload);
          if (payload.new) {
            setSiteSettings(payload.new);
            toast({
              title: "Settings Updated",
              description: "Site settings have been updated by another admin.",
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSiteSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      if (fieldName === 'logo_url') setTempLogoFile(file);
      if (fieldName === 'banner_image_url') setTempBannerFile(file);
      // For preview only - actual upload happens on save
      setSiteSettings(prev => ({ ...prev, [fieldName]: URL.createObjectURL(file) }));
    }
  };

  // Function to upload files to Supabase Storage
  const uploadFile = async (file, bucket, path) => {
    if (!file) return null;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${path}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return urlData.publicUrl;
    } catch (error) {
      console.error(`Error uploading ${bucket}/${path}:`, error);
      toast({
        title: "Upload Failed",
        description: `Could not upload file: ${error.message}`,
        variant: "destructive"
      });
      return null;
    }
  };

  const handleSaveSettings = async (category) => {
    try {
      setIsSaving(true);
      let updatedSettings = { ...siteSettings };
      updatedSettings.updated_at = new Date().toISOString();
      
      // Handle file uploads if any
      if (tempLogoFile) {
        const logoUrl = await uploadFile(tempLogoFile, 'site-assets', 'logos');
        if (logoUrl) updatedSettings.logo_url = logoUrl;
        setTempLogoFile(null);
      }
      
      if (tempBannerFile) {
        const bannerUrl = await uploadFile(tempBannerFile, 'site-assets', 'banners');
        if (bannerUrl) updatedSettings.banner_image_url = bannerUrl;
        setTempBannerFile(null);
      }
      
      // Save settings to Supabase
      const { data, error } = await supabase
        .from('site_settings')
        .upsert(updatedSettings, { onConflict: 'id' })
        .select();
        
      if (error) {
        console.error('Error saving to Supabase:', error);
        toast({
          title: "Save Failed",
          description: `Could not save settings: ${error.message}`,
          variant: "destructive"
        });
        return;
      }
      
      console.log('Settings saved to Supabase:', data);
      setSiteSettings(updatedSettings);
      
      toast({
        title: "Settings Saved! ✨",
        description: `${category} settings have been updated successfully.`,
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Save Failed",
        description: `Could not save settings: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">Site Settings</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchSettings} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Refresh Settings
              </>
            )}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw className="h-12 w-12 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading settings...</span>
        </div>
      ) : (
        <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="shadow-lg border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center"><Globe className="mr-2 h-6 w-6 text-primary"/>General Settings</CardTitle>
              <CardDescription>Manage basic site information and branding.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="logo_url" className="text-lg">Site Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                    {siteSettings.logo_url ? (
                      <img src={siteSettings.logo_url} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <Input id="logo_url" name="logo_url" type="file" onChange={(e) => handleFileChange(e, 'logo_url')} accept="image/png, image/jpeg, image/svg+xml" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Recommended: SVG or transparent PNG, max 200x80px.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="footer_text" className="text-lg">Footer Text</Label>
                <Textarea id="footer_text" name="footer_text" value={siteSettings.footer_text} onChange={handleInputChange} className="mt-1" rows={3}/>
              </div>
              <Button 
                onClick={() => handleSaveSettings('General')} 
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin"/> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4"/> Save General Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="shadow-lg border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center"><Palette className="mr-2 h-6 w-6 text-primary"/>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of your site, including hero section and colors.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="banner_image_url" className="text-lg">Banner Image</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-12 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                      {siteSettings.banner_image_url ? (
                        <img src={siteSettings.banner_image_url} alt="Banner" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <Input id="banner_image_url" name="banner_image_url" type="file" onChange={(e) => handleFileChange(e, 'banner_image_url')} accept="image/*" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hero_text_headline" className="text-lg">Hero Headline</Label>
                  <Input id="hero_text_headline" name="hero_text_headline" value={siteSettings.hero_text_headline} onChange={handleInputChange} className="mt-1"/>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hero_text_subheadline" className="text-lg">Hero Subheadline</Label>
                  <Textarea id="hero_text_subheadline" name="hero_text_subheadline" value={siteSettings.hero_text_subheadline} onChange={handleInputChange} className="mt-1" rows={3}/>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary_color" className="text-lg">Primary Color</Label>
                    <Input type="color" id="primary_color" name="primary_color" value={siteSettings.primary_color} onChange={handleInputChange} className="mt-1 h-12"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accent_color" className="text-lg">Accent Color</Label>
                    <Input type="color" id="accent_color" name="accent_color" value={siteSettings.accent_color} onChange={handleInputChange} className="mt-1 h-12"/>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => handleSaveSettings('Appearance')} 
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin"/> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4"/> Save Appearance Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card className="shadow-lg border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center"><Phone className="mr-2 h-6 w-6 text-primary"/>Contact Information</CardTitle>
              <CardDescription>Manage contact details displayed on the site.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="contact_email" className="text-lg">Contact Email</Label>
                <Input type="email" id="contact_email" name="contact_email" value={siteSettings.contact_email} onChange={handleInputChange} className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="contact_phone" className="text-lg">Contact Phone</Label>
                <Input type="tel" id="contact_phone" name="contact_phone" value={siteSettings.contact_phone} onChange={handleInputChange} className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="contact_address" className="text-lg">Contact Address</Label>
                <Textarea id="contact_address" name="contact_address" value={siteSettings.contact_address || ''} onChange={handleInputChange} className="mt-1" rows={2} placeholder="123 Main St, Springfield, USA"/>
              </div>
              {/* Add fields for address, social media links etc. */}
              <Button 
                onClick={() => handleSaveSettings('Contact')} 
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin"/> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4"/> Save Contact Info
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced">
          <Card className="shadow-lg border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center text-destructive"><ImageIcon className="mr-2 h-6 w-6"/>Advanced Settings</CardTitle>
              <CardDescription>Manage integrations, API keys, and other advanced configurations. (Placeholder)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground italic">Advanced settings for integrations (e.g., Supabase, Stripe, Analytics) will be configured here. This section is currently a placeholder.</p>
              <div>
                <Label htmlFor="someApiKey" className="text-lg">Example API Key</Label>
                <Input id="someApiKey" name="someApiKey" placeholder="Enter API Key..." className="mt-1" disabled/>
              </div>
               <Button 
                onClick={() => handleSaveSettings('Advanced')} 
                className="bg-gradient-to-r from-destructive to-red-700 text-primary-foreground" 
                disabled={true}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin"/> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4"/> Save Advanced Settings (Disabled)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      )}
    </motion.div>
  );
};

export default AdminSettingsPage;