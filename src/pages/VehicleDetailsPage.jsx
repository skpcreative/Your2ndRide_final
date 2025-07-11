import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '../components/ui/use-toast';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Heart, 
  Share2, 
  DollarSign, 
  CalendarDays, 
  MapPin, 
  MessageSquare, 
  UserCircle, 
  ImageOff,
  ChevronLeft,
  ChevronRight,
  Car,
  Fuel,
  Phone,
  MessageCircle,
  Mail,
  Settings,
  Gauge,
  Palette, 
  RotateCw, 
  Shield, 
  Clock,
  Star
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// Helper function to get fallback image based on vehicle type
const getFallbackImage = (make, model) => {
  // Default fallback
  let fallbackImage = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1470&auto=format&fit=crop';
  
  const makeModelLower = `${make} ${model}`.toLowerCase();
  
  // Check for vehicle types based on make/model keywords
  if (makeModelLower.includes('truck') || makeModelLower.includes('pickup') || 
      make?.toLowerCase() === 'ford' && (model?.toLowerCase().includes('f-') || model?.toLowerCase().includes('ranger')) ||
      make?.toLowerCase() === 'chevrolet' && (model?.toLowerCase().includes('silverado') || model?.toLowerCase().includes('colorado')) ||
      make?.toLowerCase() === 'ram' || make?.toLowerCase() === 'gmc' && model?.toLowerCase().includes('sierra')) {
    fallbackImage = 'https://images.unsplash.com/photo-1659363421537-c8ab2fd9b4a9?q=80&w=1470&auto=format&fit=crop';
  } else if (makeModelLower.includes('suv') || 
             make?.toLowerCase() === 'jeep' || 
             model?.toLowerCase().includes('explorer') || 
             model?.toLowerCase().includes('tahoe') || 
             model?.toLowerCase().includes('suburban')) {
    fallbackImage = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1470&auto=format&fit=crop';
  } else if (makeModelLower.includes('luxury') || 
             make?.toLowerCase() === 'mercedes' || 
             make?.toLowerCase() === 'bmw' || 
             make?.toLowerCase() === 'audi' || 
             make?.toLowerCase() === 'lexus') {
    fallbackImage = 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=1469&auto=format&fit=crop';
  } else if (makeModelLower.includes('sport') || 
             make?.toLowerCase() === 'porsche' || 
             make?.toLowerCase() === 'ferrari' || 
             make?.toLowerCase() === 'lamborghini' || 
             model?.toLowerCase().includes('mustang') || 
             model?.toLowerCase().includes('corvette')) {
    fallbackImage = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1470&auto=format&fit=crop';
  } else if (makeModelLower.includes('electric') || 
             make?.toLowerCase() === 'tesla' || 
             model?.toLowerCase().includes('leaf') || 
             model?.toLowerCase().includes('bolt')) {
    fallbackImage = 'https://images.unsplash.com/photo-1593941707882-a5bba53b0998?q=80&w=1472&auto=format&fit=crop';
  }
  
  return fallbackImage;
};

const VehicleDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [similarVehicles, setSimilarVehicles] = useState([]);
  const [activeTab, setActiveTab] = useState('details');
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState(null);

  useEffect(() => {
    // Check if the vehicle is in the user's wishlist
    const checkWishlistStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !id) return;
        
        const { data, error } = await supabase
          .from('wishlist')
          .select('id')
          .eq('user_id', user.id)
          .eq('listing_id', id)
          .maybeSingle();
          
        if (error) {
          console.error('Error checking wishlist status:', error);
          return;
        }
        
        if (data) {
          setIsInWishlist(true);
          setWishlistItemId(data.id);
          console.log('Vehicle is in wishlist, wishlist item ID:', data.id);
        } else {
          setIsInWishlist(false);
          setWishlistItemId(null);
          console.log('Vehicle is not in wishlist');
        }
      } catch (error) {
        console.error('Error in checkWishlistStatus:', error);
      }
    };

    const fetchVehicleDetails = async () => {
      setLoading(true);
      try {
        // Validate ID is present
        if (!id) {
          console.error('No vehicle ID provided');
          toast({ title: "Error", description: "No vehicle ID provided.", variant: "destructive" });
          setLoading(false);
          navigate('/buy'); // Redirect to buy page if no ID
          return;
        }

        console.log('Fetching vehicle details for ID:', id);
        
        // First check if the ID exists in the listings table
        const { data: checkData, error: checkError } = await supabase
          .from('listings')
          .select('id')
          .eq('id', id)
          .maybeSingle();
          
        if (checkError) {
          console.error('Error checking if vehicle exists:', checkError);
          toast({ title: "Database Error", description: "Error connecting to database.", variant: "destructive" });
          setLoading(false);
          return;
        }
        
        if (!checkData) {
          console.error('Vehicle not found with ID:', id);
          toast({ title: "Not Found", description: "The vehicle you're looking for doesn't exist or has been removed.", variant: "destructive" });
          setLoading(false);
          navigate('/buy'); // Redirect to buy page
          return;
        }
        
        // Fetch the main vehicle details without the join first
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .or('status.eq.approved,status.eq.active') // Show approved or active listings
          .single();

        if (error) {
          console.error('Error fetching vehicle details:', error);
          toast({ title: "Error", description: "Could not load vehicle details: " + error.message, variant: "destructive" });
          setLoading(false);
          return;
        }
        
        if (!data) {
          console.error('No data returned for vehicle ID:', id);
          toast({ title: "Not Available", description: "This vehicle listing is no longer available.", variant: "destructive" });
          setLoading(false);
          return;
        }

        console.log('Vehicle data fetched:', data);
        
        console.log('Raw photo_urls from database:', data.photo_urls);
        
        // Process image URLs with better error handling
        let galleryImages = [];
        try {
          if (data.photo_urls && Array.isArray(data.photo_urls)) {
            console.log('Processing', data.photo_urls.length, 'photo URLs');
            
            galleryImages = data.photo_urls
              .filter(url => url && typeof url === 'string' && url.trim() !== '')
              .map(url => {
                // Check if it's already a full URL
                if (url.startsWith('http')) {
                  console.log('Using existing URL:', url);
                  return url;
                } 
                // Check if it's a Supabase storage path
                else {
                  try {
                    // Handle both with and without leading slash
                    const cleanPath = url.startsWith('/') ? url.substring(1) : url;
                    const publicUrl = supabase.storage.from('vehicle-assets').getPublicUrl(cleanPath).data.publicUrl;
                    console.log('Generated public URL:', publicUrl, 'from path:', cleanPath);
                    return publicUrl;
                  } catch (err) {
                    console.error('Error getting public URL for', url, err);
                    return null;
                  }
                }
              })
              .filter(Boolean); // Remove any null values
          }
        } catch (err) {
          console.error('Error processing photo URLs:', err);
        }
        
        console.log('Processed gallery images:', galleryImages);
        
        // If no valid images, use the fallback
        if (!galleryImages || galleryImages.length === 0) {
          const fallback = getFallbackImage(data.make, data.model);
          console.log('Using fallback image:', fallback);
          galleryImages = [fallback];
        }
        
        // Format vehicle data
        const formattedVehicle = {
          ...data,
          name: `${data.make || ''} ${data.model || ''} ${data.year || ''}`.trim() || 'Unnamed Vehicle',
          galleryImages,
          // Add additional formatted fields
          formattedPrice: data.price ? `$${data.price.toLocaleString()}` : 'Contact for price',
          formattedMileage: data.mileage ? `${data.mileage.toLocaleString()} miles` : 'N/A',
          formattedDate: new Date(data.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          isNew: data.status === 'approved' || 
                 (new Date(data.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        };

        setVehicle(formattedVehicle);
        
        // Fetch seller info separately
        if (data.user_id) {
          try {
            console.log('Fetching seller info for user ID:', data.user_id);
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('full_name, avatar_url, phone, email')
              .eq('id', data.user_id)
              .single();
            
            if (profileError) {
              console.error('Error fetching seller profile:', profileError);
            } else if (profileData) {
              console.log('Seller profile fetched:', profileData);
              setSellerInfo({
                id: data.user_id,
                name: profileData.full_name || 'Anonymous Seller',
                memberSince: profileData.created_at,
                avatarUrl: profileData.avatar_url,
                phone: profileData.phone,
                email: profileData.email
              });
            } else {
              console.log('No seller profile found for user ID:', data.user_id);
              setSellerInfo({
                id: data.user_id,
                name: 'Anonymous Seller',
                memberSince: null,
                avatarUrl: null,
                phone: null,
                email: null
              });
            }
          } catch (profileErr) {
            console.error('Unexpected error fetching seller profile:', profileErr);
          }
        } else {
          console.log('No user_id available to fetch seller info');
        }
        
        // Fetch similar vehicles (same make or model, but not the same vehicle)
        try {
          // Make sure we have make or model to search for
          if (!data.make && !data.model) {
            console.log('No make or model data to find similar vehicles');
          } else {
            console.log('Searching for similar vehicles with make:', data.make, 'and model:', data.model);
            
            // Use filter() instead of string interpolation for safer queries
            let query = supabase
              .from('listings')
              .select('*')
              .neq('id', id)
              .or('status.eq.approved,status.eq.active')
              .limit(4);
              
            // Apply make filter if available
            if (data.make) {
              query = query.eq('make', data.make);
            }
            
            // Execute the query
            const { data: similarData, error: similarError } = await query;
            
            if (similarError) {
              console.error('Error fetching similar vehicles:', similarError);
            } else if (similarData && similarData.length > 0) {
              console.log('Found', similarData.length, 'similar vehicles');
              
              // Format similar vehicles
              const formattedSimilar = similarData.map(vehicle => {
                // Process image for similar vehicle
                let mainImage = getFallbackImage(vehicle.make, vehicle.model);
                
                try {
                  if (vehicle.photo_urls && Array.isArray(vehicle.photo_urls) && vehicle.photo_urls.length > 0) {
                    const validPhotos = vehicle.photo_urls.filter(url => url && typeof url === 'string' && url.trim() !== '');
                    
                    if (validPhotos.length > 0) {
                      const firstPhoto = validPhotos[0];
                      
                      if (firstPhoto.startsWith('http')) {
                        mainImage = firstPhoto;
                      } else {
                        // Handle both with and without leading slash
                        const cleanPath = firstPhoto.startsWith('/') ? firstPhoto.substring(1) : firstPhoto;
                        mainImage = supabase.storage.from('vehicle-assets').getPublicUrl(cleanPath).data.publicUrl;
                      }
                    }
                  }
                } catch (err) {
                  console.error('Error processing image for similar vehicle ID:', vehicle.id, err);
                  // Keep using the fallback image
                }
                
                return {
                  ...vehicle,
                  name: `${vehicle.make || ''} ${vehicle.model || ''} ${vehicle.year || ''}`.trim() || 'Unnamed Vehicle',
                  mainImage,
                  formattedPrice: vehicle.price ? `$${vehicle.price.toLocaleString()}` : 'Contact for price',
                  isNew: vehicle.status === 'approved' || 
                         (new Date(vehicle.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
                };
              });
              
              setSimilarVehicles(formattedSimilar);
            } else {
              console.log('No similar vehicles found');
              setSimilarVehicles([]);
            }
          }
        } catch (error) {
          console.error('Error in similar vehicles fetch:', error);
          setSimilarVehicles([]);
        }
      } catch (error) {
        console.error('Unexpected error in fetchVehicleDetails:', error);
        toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
      } finally {
        setLoading(false);
        setSelectedImageIndex(0);
      }
    };

    if (id) {
      fetchVehicleDetails();
      checkWishlistStatus();
    } else {
      // No ID provided, redirect to buy page
      navigate('/buy');
    }
  }, [id, toast, navigate]);

  const handleAddToWishlist = async () => {
    if (!vehicle) {
      toast({ title: "Error", description: "No vehicle data available.", variant: "destructive" });
      return;
    }
    
    try {
      // If already in wishlist, remove it
      if (isInWishlist && wishlistItemId) {
        handleRemoveFromWishlist(wishlistItemId);
        return;
      }
      
      // Show loading toast
      toast({ title: "Processing", description: "Adding to wishlist..." });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Login Required", description: "Please sign in to add vehicles to your wishlist.", variant: "destructive" });
        // Could redirect to login page here
        return;
      }

      // Add to wishlist - ensure we're using the correct table name 'wishlist'
      const { data, error } = await supabase
        .from('wishlist')
        .insert({
          user_id: user.id,
          listing_id: vehicle.id,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error adding to wishlist:', error);
        throw new Error(error.message);
      }
      
      // Update state to reflect wishlist status
      setIsInWishlist(true);
      setWishlistItemId(data.id);
      
      toast({ 
        title: "Added to Wishlist", 
        description: "Vehicle has been added to your wishlist.",
        variant: "success" 
      });
      
    } catch (error) {
      console.error('Error in wishlist operation:', error);
      toast({ 
        title: "Error", 
        description: "Could not complete wishlist operation: " + (error.message || "Please try again."), 
        variant: "destructive" 
      });
    }
  };
  
  const handleRemoveFromWishlist = async (wishlistId) => {
    try {
      // Show loading toast
      toast({ title: "Processing", description: "Removing from wishlist..." });
      
      // Ensure we're using the correct table name 'wishlist'
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', wishlistId);
        
      if (error) {
        console.error('Error removing from wishlist:', error);
        throw new Error(error.message);
      }
      
      // Update state to reflect wishlist status
      setIsInWishlist(false);
      setWishlistItemId(null);
      
      toast({ 
        title: "Removed from Wishlist", 
        description: "Vehicle has been removed from your wishlist.",
        variant: "success" 
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({ 
        title: "Error", 
        description: "Could not remove from wishlist: " + (error.message || "Please try again."), 
        variant: "destructive" 
      });
    }
  };

  // Get contact options for the seller
  const getContactOptions = () => {
    const options = [];

    // Always add WhatsApp chat using vehicle.contact_phone if available
    if (vehicle?.contact_phone) {
      // Remove non-digit characters
      const formattedPhone = vehicle.contact_phone.replace(/\D/g, '');
      // WhatsApp requires country code, so if not present, you may want to prepend your default country code (e.g., '91' for India)
      const phoneWithCountryCode = formattedPhone.startsWith('0') || formattedPhone.length < 10
        ? `91${formattedPhone.replace(/^0+/, '')}` // Default to India if not present
        : formattedPhone;
      const message = encodeURIComponent(`Hi, I'm interested in your ${vehicle?.name || 'vehicle'} listed on Your2ndRide.`);
      options.push({
        type: 'whatsapp',
        label: 'Chat on WhatsApp',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        ),
        url: `https://wa.me/${phoneWithCountryCode}?text=${message}`,
        color: 'bg-green-600 hover:bg-green-700'
      });
    }
    
    // Message text
    const message = encodeURIComponent(`Hi, I'm interested in your ${vehicle?.name || 'vehicle'} listed on Your2ndRide.`);
    
    // Add WhatsApp option if phone is available
    if (sellerInfo?.phone) {
      // Format phone number by removing any non-digit characters
      const formattedPhone = sellerInfo.phone.replace(/\D/g, '');
      
      // Make sure the phone number starts with a country code (default to +1 if none)
      const phoneWithCountryCode = formattedPhone.startsWith('+') 
        ? formattedPhone 
        : (formattedPhone.startsWith('1') ? `+${formattedPhone}` : `+1${formattedPhone}`);
      
      options.push({
        type: 'whatsapp',
        label: 'WhatsApp',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        ),
        url: `https://wa.me/${phoneWithCountryCode}?text=${message}`,
        color: 'bg-green-600 hover:bg-green-700'
      });
    }
    
    // Add Email option if email is available
    if (sellerInfo?.email) {
      options.push({
        type: 'email',
        label: 'Email',
        icon: <Mail className="h-5 w-5" />,
        url: `mailto:${sellerInfo.email}?subject=Inquiry about ${encodeURIComponent(vehicle?.name || 'your vehicle')} on Your2ndRide&body=${message}`,
        color: 'bg-blue-600 hover:bg-blue-700'
      });
    }
    
    // Add SMS option if phone is available
    if (sellerInfo?.phone) {
      const formattedPhone = sellerInfo.phone.replace(/\D/g, '');
      options.push({
        type: 'sms',
        label: 'Send SMS',
        icon: <MessageCircle className="h-5 w-5" />,
        url: `sms:${formattedPhone}?body=${encodeURIComponent(`Hi, I'm interested in your ${vehicle?.name || 'vehicle'} listed on Your2ndRide.`)}`,
        color: 'bg-purple-600 hover:bg-purple-700'
      });
    }
    
    // Add phone call option if phone is available
    if (sellerInfo?.phone) {
      const formattedPhone = sellerInfo.phone.replace(/\D/g, '');
      options.push({
        type: 'call',
        label: 'Call Seller',
        icon: <Phone className="h-5 w-5" />,
        url: `tel:${formattedPhone}`,
        color: 'bg-primary hover:bg-primary/90'
      });
    }
    
    // We already added the chat option at the beginning, so no fallback needed
    
    return options;
  };
  
  const toggleWishlist = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Login Required",
          description: "Please log in to add vehicles to your wishlist.",
          variant: "destructive"
        });
        return;
      }
      
      if (isInWishlist) {
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('id', wishlistItemId)
          .eq('user_id', user.id);
          
        if (error) {
          console.error('Error removing from wishlist:', error);
          toast({
            title: "Error",
            description: `Could not remove from wishlist: ${error.message}`,
            variant: "destructive"
          });
          return;
        }
        
        setIsInWishlist(false);
        setWishlistItemId(null);
        toast({
          title: "Removed from Wishlist",
          description: `${vehicle.name} has been removed from your wishlist.`
        });
      } else {
        // Add to wishlist
        const { data, error } = await supabase
          .from('wishlist')
          .insert({
            user_id: user.id,
            listing_id: id,
            created_at: new Date().toISOString()
          })
          .select('id')
          .single();
          
        if (error) {
          console.error('Error adding to wishlist:', error);
          toast({
            title: "Error",
            description: `Could not add to wishlist: ${error.message}`,
            variant: "destructive"
          });
          return;
        }
        
        setIsInWishlist(true);
        setWishlistItemId(data.id);
        toast({
          title: "Added to Wishlist",
          description: `${vehicle.name} has been added to your wishlist.`
        });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };

  const handleShare = () => {
    try {
      const url = window.location.href;
      const vehicleName = vehicle?.name || 'this vehicle';
      
      // Try to use the Web Share API if available
      if (navigator.share) {
        navigator.share({
          title: `Check out ${vehicleName} on Your2ndRide`,
          text: `I found ${vehicleName} on Your2ndRide and thought you might be interested!`,
          url: url
        })
        .then(() => {
          toast({ title: "Shared", description: "Thanks for sharing!" });
        })
        .catch((error) => {
          // If user cancels, don't show an error
          if (error.name !== 'AbortError') {
            // Fallback to clipboard if sharing fails
            navigator.clipboard.writeText(url);
            toast({ title: "Link Copied", description: "Vehicle link copied to clipboard." });
          }
        });
      } else {
        // Fallback for browsers that don't support the Web Share API
        navigator.clipboard.writeText(url);
        toast({ 
          title: "Link Copied", 
          description: "Vehicle link copied to clipboard. Share it with friends!" 
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({ 
        title: "Sharing Failed", 
        description: "Could not share this listing. Please try again.", 
        variant: "destructive" 
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading vehicle details...</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-md mx-auto bg-background rounded-lg shadow-lg p-8 border border-muted">
          <ImageOff className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Vehicle Not Found</h2>
          <p className="text-muted-foreground mb-6">This vehicle listing may have been removed or is no longer available.</p>
          <Button asChild>
            <Link to="/buy">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Listings
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <div className="mb-4">
        <Button variant="ghost" asChild className="group">
          <Link to="/buy">
            <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Listings
          </Link>
        </Button>
      </div>
      
      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        {/* Main card */}
        <Card className="overflow-hidden shadow-2xl border-primary/20 mb-8">
          <CardHeader className="bg-gradient-to-r from-primary to-accent p-6 text-primary-foreground">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {vehicle.isNew && (
                    <Badge className="bg-green-600 text-white hover:bg-green-700">
                      NEW
                    </Badge>
                  )}
                  <CardTitle className="text-3xl md:text-4xl font-bold">{vehicle.name}</CardTitle>
                </div>
                <CardDescription className="text-lg text-primary-foreground/90">
                  {vehicle.formattedPrice} • {vehicle.formattedMileage}
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleAddToWishlist} 
                  className={`border-primary-foreground ${isInWishlist ? 'bg-white/20 text-white' : 'bg-transparent text-primary-foreground'} hover:bg-white/20`}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="outline" size="icon" onClick={handleShare} className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-white/20">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
              {/* Image gallery - Takes up 2/3 on desktop */}
              <div className="lg:col-span-2 p-4 md:p-6">
                <motion.div 
                  className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4 shadow-lg flex items-center justify-center"
                  key={selectedImageIndex} 
                  initial={{ opacity: 0.8, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {vehicle.galleryImages && vehicle.galleryImages.length > 0 ? (
                    // Main image
                    <img    
                      className="max-h-full max-w-full object-contain p-2 bg-white"
                      alt={`${vehicle.name} - Image ${selectedImageIndex + 1}`} 
                      src={vehicle.galleryImages[selectedImageIndex]}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getFallbackImage(vehicle.make, vehicle.model);
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground">
                      <ImageOff size={64} />
                      <p>No image available</p>
                    </div>
                  )}
                </motion.div>
                
                {/* Thumbnails */}
                {vehicle.galleryImages && vehicle.galleryImages.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {vehicle.galleryImages.map((imgUrl, index) => (
                      <button 
                        key={index} 
                        onClick={() => setSelectedImageIndex(index)} 
                        className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${selectedImageIndex === index ? 'border-primary ring-2 ring-primary' : 'border-transparent hover:border-primary/50'}`}
                      >
                        <img 
                          className="w-full h-full object-contain p-1 bg-white" 
                          alt={`${vehicle.name} thumbnail ${index + 1}`} 
                          src={imgUrl}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getFallbackImage(vehicle.make, vehicle.model);
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}

{/* Right sidebar with price and actions */}
              <div className="p-6 bg-muted/20 lg:bg-muted/10 border-t lg:border-t-0 lg:border-l border-muted">
                <div className="space-y-6 sticky top-4">
                  {/* Price section */}
                  <div className="bg-background rounded-lg p-4 shadow-sm border border-muted">
                    <p className="text-3xl md:text-4xl font-bold text-primary flex items-center">
                      <DollarSign className="mr-1 h-7 w-7 opacity-70" />
                      {vehicle.formattedPrice.replace('$', '')}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {vehicle.price_negotiable ? 'Price negotiable' : 'Fixed price'}
                    </p>
                  </div>

                  {/* Quick specs */}
                  <div className="bg-background rounded-lg p-4 shadow-sm border border-muted">
                    <h3 className="font-semibold mb-3 text-foreground">Quick Specs</h3>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-muted-foreground">
                          <CalendarDays className="mr-2 h-4 w-4 text-primary/80" /> Year
                        </div>
                        <span className="font-medium">{vehicle.year || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-muted-foreground">
                          <Gauge className="mr-2 h-4 w-4 text-primary/80" /> Mileage
                        </div>
                        <span className="font-medium">{vehicle.formattedMileage}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-muted-foreground">
                          <Fuel className="mr-2 h-4 w-4 text-primary/80" /> Fuel
                        </div>
                        <span className="font-medium">{vehicle.fuel_type || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-muted-foreground">
                          <Settings className="mr-2 h-4 w-4 text-primary/80" /> Transmission
                        </div>
                        <span className="font-medium">{vehicle.transmission || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-background rounded-lg p-4 shadow-sm border border-muted">
                    <h3 className="font-semibold mb-2 text-foreground">Description</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4">
                      {vehicle.description || 'No description provided.'}
                    </p>
                    {vehicle.description && vehicle.description.length > 150 && (
                      <Button variant="link" size="sm" className="px-0 mt-1" onClick={() => setActiveTab('details')}>
                        Read more
                      </Button>
                    )}
                  </div>

                  {/* Location */}
                  <div className="bg-background rounded-lg p-4 shadow-sm border border-muted">
                    <h3 className="font-semibold mb-2 text-foreground flex items-center">
                      <MapPin className="mr-2 h-4 w-4 text-primary/80" /> Location
                    </h3>
                    <p className="text-sm">{vehicle.location || vehicle.zip_code || 'Location not specified'}</p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col space-y-3 pt-2">
                    {/* Contact Options */}
                    <div className="flex flex-col space-y-2">
                      <h3 className="font-semibold text-sm text-muted-foreground mb-0">Contact Seller:</h3>
                      {getContactOptions().length > 0 ? (
                        getContactOptions().map((option, index) => (
                          option.isInternalLink ? (
                            <Button 
                              key={index}
                              size="lg" 
                              className={`w-full text-white ${option.color}`}
                              asChild
                            >
                              <Link to={option.url}>
                                {option.icon}
                                <span className="ml-2">{option.label}</span>
                              </Link>
                            </Button>
                          ) : (
                            <Button 
                              key={index}
                              size="lg" 
                              className={`w-full text-white ${option.color}`}
                              onClick={() => window.open(option.url, '_blank')}
                            >
                              {option.icon}
                              <span className="ml-2">{option.label}</span>
                            </Button>
                          )
                        ))
                      ) : (
                        <Button 
                          size="lg" 
                          className="w-full bg-primary hover:bg-primary/90 text-white"
                          asChild
                        >
                          <Link to={`/chat/${vehicle.user_id}?listingId=${vehicle.id}`}>
                            <MessageSquare className="mr-2 h-5 w-5" /> Contact via Chat
                          </Link>
                        </Button>
                      )}
                    </div>
                    <Button size="lg" variant="ghost" className="w-full" onClick={handleShare}>
                      <Share2 className="mr-2 h-5 w-5" /> Share Listing
                    </Button>
                  </div>
                </div>
              </div>
                
                {/* Tabs for vehicle details */}
                <div className="mt-8">
                  <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
                    
                    {/* Details Tab */}
                    <TabsContent value="details" className="p-4 bg-background rounded-md mt-2">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center">
                              <Car className="mr-2 h-5 w-5 text-primary" /> Vehicle Information
                            </h3>
                            <div className="grid grid-cols-2 gap-y-3 text-sm">
                              <div className="font-medium">Make:</div>
                              <div>{vehicle.make || 'N/A'}</div>
                              <div className="font-medium">Model:</div>
                              <div>{vehicle.model || 'N/A'}</div>
                              <div className="font-medium">Year:</div>
                              <div>{vehicle.year || 'N/A'}</div>
                              <div className="font-medium">Mileage:</div>
                              <div>{vehicle.formattedMileage}</div>
                              <div className="font-medium">Body Type:</div>
                              <div>{vehicle.body_type || 'N/A'}</div>
                              <div className="font-medium">Exterior Color:</div>
                              <div>{vehicle.exterior_color || 'N/A'}</div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center">
                              <Fuel className="mr-2 h-5 w-5 text-primary" /> Performance
                            </h3>
                            <div className="grid grid-cols-2 gap-y-3 text-sm">
                              <div className="font-medium">Fuel Type:</div>
                              <div>{vehicle.fuel_type || 'N/A'}</div>
                              <div className="font-medium">Transmission:</div>
                              <div>{vehicle.transmission || 'N/A'}</div>
                              <div className="font-medium">Drive Type:</div>
                              <div>{vehicle.drive_type || 'N/A'}</div>
                              <div className="font-medium">Engine:</div>
                              <div>{vehicle.engine || 'N/A'}</div>
                              <div className="font-medium">Horsepower:</div>
                              <div>{vehicle.horsepower ? `${vehicle.horsepower} hp` : 'N/A'}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center">
                            <MapPin className="mr-2 h-5 w-5 text-primary" /> Location
                          </h3>
                          <p className="text-sm">{vehicle.location || vehicle.zip_code || 'Location not specified'}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center">
                            <Clock className="mr-2 h-5 w-5 text-primary" /> Listing Details
                          </h3>
                          <div className="grid grid-cols-2 gap-y-3 text-sm">
                            <div className="font-medium">Listed On:</div>
                            <div>{vehicle.formattedDate}</div>
                            <div className="font-medium">Status:</div>
                            <div>
                              <Badge className={vehicle.status === 'approved' ? 'bg-green-600' : 'bg-blue-600'}>
                                {vehicle.status === 'approved' ? 'New Listing' : 'Active'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              
            </div>
          </CardContent>
        </Card>
        
        
      </motion.div>
    </div>
  );
};

export default VehicleDetailsPage;