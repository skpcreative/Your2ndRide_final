import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Search, TrendingUp, CheckCircle, MessageSquare, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { supabase } from '@/lib/supabaseClient';

const HomePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { siteSettings, isLoading } = useSiteSettings();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchParams, setSearchParams] = useState({
    keywords: '',
    make: '',
    model: ''
  });
  const [featuredListings, setFeaturedListings] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  
  useEffect(() => {
    // Check if user is authenticated
    const userToken = localStorage.getItem('userToken');
    setIsAuthenticated(!!userToken);
    
    // Listen for storage changes (login/logout)
    const handleStorageChange = () => {
      const token = localStorage.getItem('userToken');
      setIsAuthenticated(!!token);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  useEffect(() => {
    // Fetch featured listings from Supabase
    const fetchFeatured = async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('featured', true)
        .or('status.eq.approved,status.eq.active')
        .order('created_at', { ascending: false })
        .limit(10);
      if (!error && data) {
        setFeaturedListings(data.map(listing => ({
          id: listing.id,
          name: `${listing.make || ''} ${listing.model || ''} ${listing.year || ''}`.trim() || 'Unnamed Vehicle',
          price: listing.price ? `$${listing.price.toLocaleString()}` : 'Contact for price',
          image: (listing.photo_urls && listing.photo_urls.length > 0 && typeof listing.photo_urls[0] === 'string') ? (listing.photo_urls[0].startsWith('http') ? listing.photo_urls[0] : supabase.storage.from('vehicle-assets').getPublicUrl(listing.photo_urls[0].replace(/^\//, '')).data.publicUrl) : 'https://images.unsplash.com/photo-1595872018818-97555653a011',
          make: listing.make || '',
        })));
      }
    };
    fetchFeatured();
  }, []);
  
  useEffect(() => {
    // Fetch recent listings
    const fetchRecent = async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .or('status.eq.approved,status.eq.active')
        .order('created_at', { ascending: false })
        .limit(4);
      if (!error && data) {
        setRecentListings(data.map(listing => ({
          id: listing.id,
          name: `${listing.make || ''} ${listing.model || ''} ${listing.year || ''}`.trim() || 'Unnamed Vehicle',
          price: listing.price ? `$${listing.price.toLocaleString()}` : 'Contact for price',
          image: (listing.photo_urls && listing.photo_urls.length > 0 && typeof listing.photo_urls[0] === 'string') ? (listing.photo_urls[0].startsWith('http') ? listing.photo_urls[0] : supabase.storage.from('vehicle-assets').getPublicUrl(listing.photo_urls[0].replace(/^\//, '')).data.publicUrl) : 'https://images.unsplash.com/photo-1595872018818-97555653a011',
          date: listing.created_at ? new Date(listing.created_at).toLocaleString() : 'Just now',
        })));
      }
    };
    fetchRecent();
    // Realtime subscription
    const channel = supabase
      .channel('recent-listings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, (payload) => {
        fetchRecent();
      })
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, []);
  
  const handleSellClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      toast({ 
        title: "Authentication Required", 
        description: "Please log in to sell your vehicle.", 
        variant: "destructive" 
      });
      navigate('/login', { state: { from: '/sell' } });
    }
    // If authenticated, the Link will work normally
  };

  const handleSearch = () => {
    // Implement search functionality
    console.log('Searching with params:', searchParams);
    // You would typically make an API call here with the search parameters
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const popularBrands = ['Alpha Motors', 'Beta Autos', 'Gamma Cars', 'Delta Drives', 'Epsilon EV'];
  const categories = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Hatchback', 'EV'];

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  return (
    <div className="space-y-16 md:space-y-24 pb-16">
      <motion.section 
        className="relative py-20 md:py-32 bg-gradient-brand text-primary-foreground overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            {siteSettings.hero_text_headline || 'Find Your Next Ride, Effortlessly.'}
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl mb-10 max-w-2xl mx-auto"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            style={{ transitionDelay: '0.2s' }}
          >
            {siteSettings.hero_text_subheadline || 'Your2ndRide connects buyers and sellers of quality pre-owned vehicles.'}
            {!siteSettings.hero_text_subheadline && ' Discover great deals or list your car today!'}
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            style={{ transitionDelay: '0.4s' }}
          >
            <Button size="lg" asChild className="bg-white text-primary hover:bg-gray-100 shadow-lg transform hover:scale-105 transition-transform duration-300">
              <Link to="/buy">
                Browse Vehicles <Search className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="border-white bg-white/20 text-white hover:bg-white/30 shadow-lg transform hover:scale-105 transition-transform duration-300 font-bold">
              <Link to="/sell" onClick={handleSellClick} style={{color: 'white', fontWeight: 'bold', textShadow: '0 0 3px rgba(0,0,0,0.5)'}}>
                Sell Your Car <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent"></div>
      </motion.section>

      <motion.section className="container mx-auto px-4 sm:px-6 lg:px-8" variants={fadeIn} initial="hidden" animate="visible">
        <Card className="shadow-xl border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-primary">Quick Search</CardTitle>
            <CardDescription>Find your perfect vehicle with our easy filters.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                type="text"
                name="keywords"
                value={searchParams.keywords}
                onChange={handleInputChange}
                placeholder="Keywords (e.g., Honda Civic, Red)"
                className="p-3 border rounded-md focus:ring-primary focus:border-primary"
              />
              <input
                type="text"
                name="make"
                value={searchParams.make}
                onChange={handleInputChange}
                placeholder="Make"
                className="p-3 border rounded-md focus:ring-primary focus:border-primary"
              />
              <input
                type="text"
                name="model"
                value={searchParams.model}
                onChange={handleInputChange}
                placeholder="Model"
                className="p-3 border rounded-md focus:ring-primary focus:border-primary"
              />
              <Button
                size="lg"
                onClick={handleSearch}
                className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Search Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      <motion.section className="container mx-auto px-4 sm:px-6 lg:px-8" variants={staggerContainer} initial="hidden" animate="visible">
        <h2 className="text-3xl font-bold mb-8 text-center text-primary">Featured Listings</h2>
        <div className="relative overflow-hidden">
          <div className="flex space-x-4 sm:space-x-6 overflow-x-auto no-scrollbar snap-x snap-mandatory py-4 px-1 -mx-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {featuredListings.length === 0 ? (
              <div className="text-muted-foreground text-center w-full py-8">No featured vehicles at the moment.</div>
            ) : (
              featuredListings.map((listing) => (
                <motion.div key={listing.id} variants={fadeIn} className="snap-start flex-shrink-0">
                  <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 group w-64 sm:w-72 md:w-80">
                    <div className="relative h-40 sm:h-48 md:h-56 bg-gray-200">
                      <img className="max-h-full max-w-full object-contain rounded-lg bg-white" alt={listing.name} src={listing.image} style={{ width: '100%', height: '100%' }} />
                      <div className="absolute top-2 left-2 bg-accent text-accent-foreground px-2 py-1 text-xs font-semibold rounded">{listing.make}</div>
                    </div>
                    <CardContent className="p-4 sm:p-6">
                      <CardTitle className="text-lg sm:text-xl font-semibold mb-1 group-hover:text-primary transition-colors">{listing.name}</CardTitle>
                      <p className="text-xl sm:text-2xl font-bold text-primary mb-3">{listing.price}</p>
                      <Button asChild className="w-full mt-2">
                        <Link to={`/vehicle/${listing.id}`}>View Details</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild>
            <Link to="/buy">
              View All Listings <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </motion.section>
      
      <motion.section className="container mx-auto px-4 sm:px-6 lg:px-8 bg-accent/5 py-12 rounded-lg" variants={fadeIn} initial="hidden" animate="visible">
        <h2 className="text-3xl font-bold mb-8 text-center text-primary">Recently Added</h2>
        <div className="relative overflow-hidden">
          <div className="flex space-x-4 sm:space-x-6 overflow-x-auto no-scrollbar snap-x snap-mandatory py-4 px-1 -mx-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {recentListings.length === 0 ? (
              <div className="text-muted-foreground text-center w-full py-8">No recent vehicles yet.</div>
            ) : (
              recentListings.map((listing) => (
                <motion.div key={listing.id} variants={fadeIn} className="snap-start flex-shrink-0">
                  <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 group w-64 sm:w-72 md:w-80">
                    <div className="relative h-40 sm:h-48 md:h-56 bg-gray-200 flex items-center justify-center">
                      <img 
                        className="max-h-full max-w-full object-contain rounded-lg bg-white"
                        alt={listing.name} 
                        src={listing.image} 
                        style={{ width: '100%', height: '100%' }}
                      />
                      <div className="absolute top-2 left-2 bg-accent text-accent-foreground px-2 py-1 text-xs font-semibold rounded">{listing.name.split(' ')[0]}</div>
                    </div>
                    <CardContent className="p-4 sm:p-6">
                      <CardTitle className="text-lg sm:text-xl font-semibold mb-1 group-hover:text-primary transition-colors">{listing.name}</CardTitle>
                      <p className="text-xl sm:text-2xl font-bold text-primary mb-3">{listing.price}</p>
                      <p className="text-xs text-muted-foreground mb-2">Listed: {listing.date}</p>
                      <Button asChild className="w-full mt-2">
                        <Link to={`/vehicle/${listing.id}`}>View Details</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.section>
      
      <motion.section className="bg-gradient-to-tr from-purple-600 via-pink-500 to-red-500 py-16 text-primary-foreground" variants={fadeIn} initial="hidden" animate="visible">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1,2,3].map(i => (
              <motion.div key={i} variants={fadeIn} className="glassmorphic p-6 rounded-xl shadow-2xl">
                <p className="italic mb-4">"This is a placeholder review. Realtime reviews coming soon! Your2ndRide is amazing and I found my dream car."</p>
                <p className="font-semibold">- Happy Customer {i}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16" variants={fadeIn} initial="hidden" animate="visible">
        <div className="bg-primary text-primary-foreground p-8 md:p-12 rounded-xl shadow-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Join Your2ndRide?</h2>
          <p className="text-lg mb-8 max-w-xl mx-auto">
            Whether you're looking for your next vehicle or want to sell your current one, 
            we make the process simple, secure, and enjoyable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-white text-primary hover:bg-gray-100 shadow-lg transform hover:scale-105 transition-transform duration-300">
              <Link to="/signup">
                Create Account <TrendingUp className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;

/* Add this to your global CSS (e.g., index.css or tailwind.css) if not present:
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
*/