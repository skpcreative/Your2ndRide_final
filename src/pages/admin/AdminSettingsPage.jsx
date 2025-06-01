import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Assuming Tabs is created
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Save, Image as ImageIcon, Palette, Phone, Mail, Globe } from 'lucide-react';

const AdminSettingsPage = () => {
  const { toast } = useToast();
  const [siteSettings, setSiteSettings] = useState({
    logoUrl: '',
    bannerImageUrl: '',
    heroTextHeadline: 'Find Your Next Ride, Effortlessly.',
    heroTextSubheadline: 'Your2ndRide connects buyers and sellers of quality pre-owned vehicles.',
    contactEmail: 'support@your2ndride.com',
    contactPhone: '+1 (555) RIDE-NOW',
    footerText: `© ${new Date().getFullYear()} Your2ndRide. All rights reserved.`,
    primaryColor: '#6D28D9', // Default primary (purple)
    accentColor: '#EC4899', // Default accent (pink)
  });
  const [tempLogoFile, setTempLogoFile] = useState(null);
  const [tempBannerFile, setTempBannerFile] = useState(null);

  useEffect(() => {
    // Load settings from localStorage or API
    const loadedSettings = JSON.parse(localStorage.getItem('siteSettings'));
    if (loadedSettings) {
      setSiteSettings(prev => ({ ...prev, ...loadedSettings }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSiteSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      if (fieldName === 'logoUrl') setTempLogoFile(file);
      if (fieldName === 'bannerImageUrl') setTempBannerFile(file);
      // For preview, you might use URL.createObjectURL(file) and set it to a temp state
      // For actual save, you'd upload this file and get back a URL
      setSiteSettings(prev => ({ ...prev, [fieldName]: `preview_${file.name}` })); // Placeholder for preview
    }
  };

  const handleSaveSettings = (category) => {
    // In a real app, you'd send this to a backend.
    // For now, save to localStorage.
    localStorage.setItem('siteSettings', JSON.stringify(siteSettings));
    
    // Simulate file upload for logo/banner if temp files exist
    if (tempLogoFile) {
      console.log("Uploading logo:", tempLogoFile.name);
      // siteSettings.logoUrl would be updated with the actual URL from server
      setTempLogoFile(null);
    }
    if (tempBannerFile) {
      console.log("Uploading banner:", tempBannerFile.name);
      // siteSettings.bannerImageUrl would be updated with the actual URL from server
      setTempBannerFile(null);
    }

    toast({
      title: "Settings Saved! ✨",
      description: `${category} settings have been updated successfully.`,
    });
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
      <h1 className="text-3xl md:text-4xl font-bold text-primary">Site Settings</h1>

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
              <div>
                <Label htmlFor="logoUrl" className="text-lg">Site Logo</Label>
                <Input type="file" id="logoUrl" name="logoUrl" onChange={(e) => handleFileChange(e, 'logoUrl')} accept="image/png, image/jpeg, image/svg+xml" className="mt-1"/>
                {siteSettings.logoUrl && !tempLogoFile && <img  src={siteSettings.logoUrl} alt="Current Logo" className="mt-2 h-16 border p-1 rounded bg-gray-100" />}
                {tempLogoFile && <img  src={URL.createObjectURL(tempLogoFile)} alt="New Logo Preview" className="mt-2 h-16 border p-1 rounded bg-gray-100" />}
                <p className="text-xs text-muted-foreground mt-1">Recommended: SVG or transparent PNG, max 200x80px.</p>
              </div>
              <div>
                <Label htmlFor="footerText" className="text-lg">Footer Text</Label>
                <Textarea id="footerText" name="footerText" value={siteSettings.footerText} onChange={handleInputChange} className="mt-1" rows={3}/>
              </div>
              <Button onClick={() => handleSaveSettings('General')} className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                <Save className="mr-2 h-4 w-4"/> Save General Settings
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
              <div>
                <Label htmlFor="bannerImageUrl" className="text-lg">Homepage Banner/Hero Image</Label>
                <Input type="file" id="bannerImageUrl" name="bannerImageUrl" onChange={(e) => handleFileChange(e, 'bannerImageUrl')} accept="image/jpeg, image/png, image/webp" className="mt-1"/>
                {siteSettings.bannerImageUrl && !tempBannerFile && <img  src={siteSettings.bannerImageUrl} alt="Current Banner" className="mt-2 max-h-48 w-auto border p-1 rounded bg-gray-100 object-contain" />}
                {tempBannerFile && <img  src={URL.createObjectURL(tempBannerFile)} alt="New Banner Preview" className="mt-2 max-h-48 w-auto border p-1 rounded bg-gray-100 object-contain" />}
                <p className="text-xs text-muted-foreground mt-1">Recommended: High-resolution JPEG or WEBP, 1920x600px.</p>
              </div>
              <div>
                <Label htmlFor="heroTextHeadline" className="text-lg">Hero Section Headline</Label>
                <Input id="heroTextHeadline" name="heroTextHeadline" value={siteSettings.heroTextHeadline} onChange={handleInputChange} className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="heroTextSubheadline" className="text-lg">Hero Section Subheadline</Label>
                <Textarea id="heroTextSubheadline" name="heroTextSubheadline" value={siteSettings.heroTextSubheadline} onChange={handleInputChange} className="mt-1" rows={3}/>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor" className="text-lg">Primary Color</Label>
                  <Input type="color" id="primaryColor" name="primaryColor" value={siteSettings.primaryColor} onChange={handleInputChange} className="mt-1 h-12"/>
                </div>
                <div>
                  <Label htmlFor="accentColor" className="text-lg">Accent Color</Label>
                  <Input type="color" id="accentColor" name="accentColor" value={siteSettings.accentColor} onChange={handleInputChange} className="mt-1 h-12"/>
                </div>
              </div>
              <Button onClick={() => handleSaveSettings('Appearance')} className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                <Save className="mr-2 h-4 w-4"/> Save Appearance Settings
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
                <Label htmlFor="contactEmail" className="text-lg">Contact Email</Label>
                <Input type="email" id="contactEmail" name="contactEmail" value={siteSettings.contactEmail} onChange={handleInputChange} className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="contactPhone" className="text-lg">Contact Phone</Label>
                <Input type="tel" id="contactPhone" name="contactPhone" value={siteSettings.contactPhone} onChange={handleInputChange} className="mt-1"/>
              </div>
              {/* Add fields for address, social media links etc. */}
              <Button onClick={() => handleSaveSettings('Contact')} className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                <Save className="mr-2 h-4 w-4"/> Save Contact Info
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
               <Button onClick={() => handleSaveSettings('Advanced')} className="bg-gradient-to-r from-destructive to-red-700 text-primary-foreground" disabled>
                <Save className="mr-2 h-4 w-4"/> Save Advanced Settings (Disabled)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default AdminSettingsPage;