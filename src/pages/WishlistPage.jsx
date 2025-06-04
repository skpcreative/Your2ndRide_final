
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Eye, HeartCrack, ImageOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserAndWishlist = async () => {
      setLoading(true);
      try {
        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser) {
          console.log('Fetching wishlist for user:', currentUser.id);
          
          // Get wishlist items with joined vehicle data
          const { data, error } = await supabase
            .from('wishlist') // Using table name 'wishlist'
            .select(`
              id,
              listing_id,
              created_at,
              listings(*)  // Join with listings table
            `)
            .eq('user_id', currentUser.id);

          if (error) {
            console.error('Error fetching wishlist:', error);
            toast({ title: "Error", description: "Could not load wishlist items: " + error.message, variant: "destructive" });
          } else {
            console.log('Wishlist data:', data);
            
            // Format the data for display
            const formattedItems = data
              .filter(item => item.listings) // Ensure listing data exists
              .map(item => ({
                ...item.listings,
                wishlist_id: item.id, // Keep track of wishlist item ID for removal
                name: `${item.listings.make} ${item.listings.model} ${item.listings.year}`,
                image: item.listings.photo_urls && item.listings.photo_urls.length > 0 ? item.listings.photo_urls[0] : null
              }));
              
            console.log('Formatted wishlist items:', formattedItems);
            setWishlistItems(formattedItems);
          }
        }
      } catch (err) {
        console.error('Unexpected error fetching wishlist:', err);
        toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndWishlist();
    
    // Set up real-time subscription for wishlist changes
    const wishlistSubscription = supabase
      .channel('wishlist_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'wishlist' }, 
        (payload) => {
          console.log('Wishlist changed:', payload);
          // Refresh wishlist data when changes occur
          fetchUserAndWishlist();
        }
      )
      .subscribe();
      
    return () => {
      wishlistSubscription?.unsubscribe();
    };
  }, [toast]);

  const removeFromWishlist = async (wishlistEntryId, vehicleName) => {
    if (!user) return;
    
    console.log('Removing wishlist item:', wishlistEntryId);

    const { error } = await supabase
      .from('wishlist') // Using table name 'wishlist'
      .delete()
      .eq('id', wishlistEntryId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error removing from wishlist:', error);
      toast({ title: "Error", description: `Could not remove ${vehicleName} from wishlist: ${error.message}`, variant: "destructive" });
    } else {
      setWishlistItems(prevItems => prevItems.filter(item => item.wishlist_id !== wishlistEntryId));
      toast({
        title: "Removed from Wishlist",
        description: `${vehicleName} has been removed from your wishlist.`,
      });
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-24 w-24"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-primary mb-2">My Wishlist</h1>
        <p className="text-lg text-muted-foreground">Your saved vehicles. Keep track of your favorites!</p>
      </motion.div>

      {!user ? (
         <motion.div 
          className="text-center py-16"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <HeartCrack className="mx-auto h-24 w-24 text-muted-foreground/50 mb-6" />
          <h2 className="text-2xl font-semibold mb-3 text-foreground">Please Log In</h2>
          <p className="text-muted-foreground mb-6">Log in to view your wishlist.</p>
          <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
            <Link to="/login">Log In</Link>
          </Button>
        </motion.div>
      ) : wishlistItems.length === 0 ? (
        <motion.div 
          className="text-center py-16"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <HeartCrack className="mx-auto h-24 w-24 text-muted-foreground/50 mb-6" />
          <h2 className="text-2xl font-semibold mb-3 text-foreground">Your Wishlist is Empty</h2>
          <p className="text-muted-foreground mb-6">Looks like you haven't added any vehicles to your wishlist yet.</p>
          <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
            <Link to="/buy">Start Browsing Vehicles</Link>
          </Button>
        </motion.div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 }}}}
        >
          <AnimatePresence>
            {wishlistItems.map((item) => (
              <motion.div key={item.wishlist_id} variants={fadeIn} exit={fadeIn.exit} layout>
                <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 group flex flex-col h-full">
                  <div className="relative h-56 bg-gray-200 flex items-center justify-center">
                    {item.image ? (
                       <img    
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        alt={item.name} 
                        src={item.image} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/400x300?text=No+Image+Available';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-foreground/70">
                        <ImageOff size={48} className="mb-2"/>
                        <p className="text-sm">No image available</p>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-full shadow-md">{item.make}</div>
                  </div>
                  <CardContent className="p-6 flex flex-col flex-grow">
                    <CardTitle className="text-xl font-semibold mb-1 group-hover:text-primary transition-colors">{item.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mb-1">
                      {item.year} • {item.mileage?.toLocaleString() || 'N/A'} miles • {item.transmission || 'N/A'}
                    </p>
                    <p className="text-2xl font-bold text-primary mb-4">
                      ${typeof item.price === 'number' ? item.price.toLocaleString() : 'Price on request'}
                    </p>
                    
                    <div className="mt-auto space-y-2">
                      <Button asChild className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground">
                        <Link to={`/vehicle/${item.id}`}>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => removeFromWishlist(item.wishlist_id, item.name)}>
                        <Trash2 className="mr-2 h-4 w-4 text-destructive" /> Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default WishlistPage;