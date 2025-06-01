
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, CalendarDays, Zap, MapPin, UserCircle, MessageSquare, Heart, Share2, ImageOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const VehicleDetailsPage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [sellerInfo, setSellerInfo] = useState(null);

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles:user_id ( full_name, created_at )
        `)
        .eq('id', id)
        .eq('status', 'active') // Only show active listings
        .single();

      if (error || !data) {
        console.error('Error fetching vehicle details:', error);
        setVehicle(null);
        toast({ title: "Error", description: "Could not load vehicle details or vehicle not found.", variant: "destructive" });
      } else {
        setVehicle({
          ...data,
          name: `${data.make} ${data.model} ${data.year}`, // Construct name
          galleryImages: data.photo_urls && data.photo_urls.length > 0 ? data.photo_urls : [],
        });
        if (data.profiles) {
          setSellerInfo({ name: data.profiles.full_name, memberSince: data.profiles.created_at });
        }
        setSelectedImageIndex(0);
      }
      setLoading(false);
    };

    if (id) {
      fetchVehicleDetails();
    }
  }, [id, toast]);

  const handleAddToWishlist = async () => {
    if (!vehicle) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Login Required", description: "Please log in to add to wishlist.", variant: "destructive" });
      return;
    }

    // Check if already in wishlist
    const { data: existingWishlistItem, error: checkError } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', vehicle.id)
      .maybeSingle();

    if (checkError) {
      toast({ title: "Error", description: "Could not check wishlist.", variant: "destructive" });
      return;
    }

    if (existingWishlistItem) {
      toast({ title: "Already in Wishlist!", description: `${vehicle.name} is already in your wishlist.`, variant: "default" });
    } else {
      const { error: insertError } = await supabase
        .from('wishlist')
        .insert({ user_id: user.id, listing_id: vehicle.id });
      
      if (insertError) {
        toast({ title: "Error", description: "Could not add to wishlist.", variant: "destructive" });
      } else {
        toast({ title: "Added to Wishlist! ❤️", description: `${vehicle.name} has been added to your wishlist.` });
      }
    }
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link Copied!", description: "Vehicle link copied to clipboard." });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-24 w-24"></div>
      </div>
    );
  }

  if (!vehicle) {
    return <div className="container mx-auto px-4 py-12 text-center text-destructive">Vehicle not found or is no longer available.</div>;
  }
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        <Card className="overflow-hidden shadow-2xl border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary to-accent p-6 text-primary-foreground">
            <div className="flex justify-between items-center">
              <CardTitle className="text-3xl md:text-4xl font-bold">{vehicle.name}</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" onClick={handleAddToWishlist} className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-white/20">
                  <Heart className="h-5 w-5" />
                </Button>
                 <Button variant="outline" size="icon" onClick={handleShare} className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-white/20">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <CardDescription className="text-lg text-primary-foreground/80">{vehicle.make} {vehicle.model}</CardDescription>
          </CardHeader>

          <CardContent className="p-0 md:p-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-0">
              <div className="md:col-span-2 p-4 md:p-6">
                <motion.div 
                  className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4 shadow-lg flex items-center justify-center"
                  key={selectedImageIndex} 
                  initial={{ opacity: 0.8, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {vehicle.galleryImages && vehicle.galleryImages.length > 0 ? (
                    <img    
                      className="w-full h-full object-cover" 
                      alt={vehicle.galleryImages[selectedImageIndex] || vehicle.name} src="https://images.unsplash.com/photo-1694216551331-4713d1286ab5" />
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground">
                      <ImageOff size={64} />
                      <p>No image available</p>
                    </div>
                  )}
                </motion.div>
                {vehicle.galleryImages && vehicle.galleryImages.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {vehicle.galleryImages.map((imgUrl, index) => (
                      <button 
                        key={index} 
                        onClick={() => setSelectedImageIndex(index)} 
                        className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${selectedImageIndex === index ? 'border-primary ring-2 ring-primary' : 'border-transparent hover:border-primary/50'}`}
                      >
                        <img   className="w-full h-full object-cover" alt={`Thumbnail ${index + 1}`}  src="https://images.unsplash.com/photo-1602676690655-11152bba0fdd" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:col-span-1 p-6 bg-muted/30 md:bg-muted/50">
                <div className="space-y-6">
                  <div>
                    <p className="text-4xl font-bold text-primary flex items-center"><DollarSign className="mr-2 h-8 w-8 opacity-70" />${vehicle.price?.toLocaleString()}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-foreground"><CalendarDays className="mr-2 h-5 w-5 text-primary/80" /><strong>Year:</strong>&nbsp;{vehicle.year}</div>
                    <div className="flex items-center text-foreground"><Zap className="mr-2 h-5 w-5 text-primary/80" /><strong>Mileage:</strong>&nbsp;{vehicle.mileage?.toLocaleString()} mi</div>
                    <div className="flex items-center text-foreground col-span-2"><MapPin className="mr-2 h-5 w-5 text-primary/80" /><strong>Location:</strong>&nbsp;{vehicle.zip_code || vehicle.location || 'N/A'}</div>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-xl font-semibold text-foreground mb-3">Description</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{vehicle.description || 'No description provided.'}</p>
                  </div>
                  
                  {vehicle.features && vehicle.features.length > 0 && (
                    <div className="pt-4 border-t">
                       <h3 className="text-xl font-semibold text-foreground mb-3">Features</h3>
                       <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                        {vehicle.features.map(feature => <li key={feature}>{feature}</li>)}
                       </ul>
                    </div>
                  )}

                  {sellerInfo && (
                    <div className="pt-4 border-t">
                      <h3 className="text-xl font-semibold text-foreground mb-3">Seller Information</h3>
                      <div className="flex items-center space-x-3 bg-background p-4 rounded-lg shadow">
                        <UserCircle className="h-10 w-10 text-primary" />
                        <div>
                          <p className="font-semibold text-foreground">{sellerInfo.name}</p>
                          <p className="text-xs text-muted-foreground">Member since {new Date(sellerInfo.memberSince).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-6 flex flex-col space-y-3">
                    <Button size="lg" className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground" asChild>
                       <Link to={`/chat/${vehicle.user_id}?listingId=${vehicle.id}`}> {/* Basic chat link structure */}
                         <MessageSquare className="mr-2 h-5 w-5" /> Contact Seller
                       </Link>
                    </Button>
                     <Button size="lg" variant="outline" className="w-full" onClick={handleAddToWishlist}>
                      <Heart className="mr-2 h-5 w-5" /> Add to Wishlist
                    </Button>
                  </div>
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