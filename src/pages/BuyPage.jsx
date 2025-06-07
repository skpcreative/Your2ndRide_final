import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search, Filter, X, ArrowRight, ArrowUpDown, SortAsc, ChevronDown, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

// Reliable fallback images for different vehicle types
const fallbackImages = {
  default: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1470",
  sedan: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1528",
  suv: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=1471",
  truck: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=1469",
  luxury: "https://images.unsplash.com/photo-1549399542-7e8f2e928464?q=80&w=1469",
  sports: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1470",
  convertible: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1470",
  hatchback: "https://images.unsplash.com/photo-1471444928139-48c5bf5173f8?q=80&w=1632",
  van: "https://images.unsplash.com/photo-1600772337092-a55138d83a7a?q=80&w=1374"
};

// Custom dropdown component for sorting
const SortDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const options = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name-az', label: 'Name: A to Z' },
    { value: 'name-za', label: 'Name: Z to A' },
  ];
  
  const currentOption = options.find(option => option.value === value) || options[0];
  
  return (
    <div className="relative">
      <Button 
        variant="outline" 
        className="w-full md:w-[180px] flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <SortAsc className="mr-2 h-4 w-4" />
          <span>{currentOption.label}</span>
        </div>
        <ChevronDown className="h-4 w-4 ml-2" />
      </Button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-background rounded-md shadow-lg border border-border">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-muted ${option.value === value ? 'bg-muted' : ''}`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get a fallback image based on vehicle make or type
const getFallbackImage = (make, model) => {
  if (!make) return fallbackImages.default;
  
  make = make.toLowerCase();
  const modelLower = model ? model.toLowerCase() : '';
  
  // Check for luxury brands
  if (['mercedes', 'bmw', 'audi', 'lexus', 'porsche', 'jaguar', 'tesla'].some(brand => make.includes(brand))) {
    return fallbackImages.luxury;
  }
  
  // Check for sports cars
  if (['corvette', 'mustang', 'camaro', 'ferrari', 'lamborghini', 'porsche'].some(brand => make.includes(brand) || modelLower.includes(brand))) {
    return fallbackImages.sports;
  }
  
  // Check for trucks
  if (['f-150', 'silverado', 'ram', 'sierra', 'tacoma', 'tundra', 'ranger'].some(brand => make.includes(brand) || modelLower.includes(brand))) {
    return fallbackImages.truck;
  }
  
  // Check for SUVs
  if (['suv', 'explorer', 'tahoe', 'suburban', 'highlander', 'cr-v', 'rav4'].some(brand => make.includes(brand) || modelLower.includes(brand))) {
    return fallbackImages.suv;
  }
  
  // Default to sedan for most other cars
  return fallbackImages.sedan;
};

const BuyPage = () => {
  const [allListings, setAllListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 100000]); // Increased max price
  const [selectedMakes, setSelectedMakes] = useState([]);
  const [availableMakes, setAvailableMakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState('newest'); // Default sort by newest
  const [currentPage, setCurrentPage] = useState(1);
  const CARDS_PER_PAGE = 10;

  // Calculate paginated listings
  const totalPages = Math.ceil(filteredListings.length / CARDS_PER_PAGE);
  const paginatedListings = filteredListings.slice(
    (currentPage - 1) * CARDS_PER_PAGE,
    currentPage * CARDS_PER_PAGE
  );

  // Reset to page 1 when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, priceRange, selectedMakes, sortOption, allListings]);

  // Function to fetch listings
  const fetchListings = async () => {
    try {
      setLoading(true);
      console.log('Fetching listings from Supabase...');
      
      // Fetch all listings - we'll filter on the client side
      const { data, error, status, statusText } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Supabase response:', { status, statusText, dataCount: data?.length, error });

      if (error) {
        console.error('Error fetching listings:', error);
        setAllListings([]);
        return;
      }

      console.log(`Found ${data?.length || 0} listings:`, data);
      
      // Filter for active or approved listings
      const activeListings = data?.filter(item => {
        const isActive = item.status === 'approved' || item.status === 'active' || !item.status;
        console.log(`Listing ${item.id} (${item.make} ${item.model}): status=${item.status}, isActive=${isActive}`);
        return isActive;
      }) || [];
      
      console.log(`Active/Approved listings: ${activeListings.length} of ${data?.length || 0}`);
      
      // Process and validate each listing
      const formattedListings = activeListings.map(item => {
          // Check if photo_urls is valid and contains actual URLs
          let imageUrl = getFallbackImage(item.make || '', item.model || ''); // Use our smart fallback system
        
          // Validate photo_urls
          if (item.photo_urls && Array.isArray(item.photo_urls) && item.photo_urls.length > 0) {
            // Make sure the URL is a string and not null/undefined
            const firstPhoto = item.photo_urls[0];
            if (typeof firstPhoto === 'string' && firstPhoto.trim() !== '') {
              // Check if it's a valid URL or a Supabase storage path
              if (firstPhoto.startsWith('http')) {
                imageUrl = firstPhoto;
              } else if (firstPhoto.includes('vehicle-assets')) {
                // Try to construct a proper Supabase URL
                try {
                  const publicUrl = supabase.storage.from('vehicle-assets').getPublicUrl(firstPhoto).data.publicUrl;
                  if (publicUrl) imageUrl = publicUrl;
                } catch (err) {
                  console.log('Error getting public URL for', firstPhoto, err);
                }
              }
            }
          }
          
          const listingData = {
            ...item,
            name: `${item.make || ''} ${item.model || ''} ${item.year || ''}`.trim() || 'Unnamed Vehicle',
            image: imageUrl,
            createdAt: new Date(item.created_at || item.listed_at || Date.now())
          };
          
          console.log('Processed listing:', listingData);
          return listingData;
        });
        
        console.log('Formatted listings:', formattedListings);
        setAllListings(formattedListings);
        
        // Populate available makes from fetched listings
        const makes = [...new Set(formattedListings.map(listing => listing.make).filter(Boolean))];
        console.log('Available makes:', makes);
      setAvailableMakes(makes.sort()); // Sort makes alphabetically
      
      setLoading(false);
    } catch (error) {
      console.error('Unexpected error in fetchListings:', error);
      setAllListings([]);
      setLoading(false);
    }
  };
  
  // Call fetchListings when component mounts
  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    let result = [...allListings]; // Create a copy to avoid mutating the original

    // Apply filters
    if (searchTerm) {
      result = result.filter(listing =>
        (listing.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (listing.make?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (listing.model?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }

    // Price range filter
    result = result.filter(listing => {
      const price = Number(listing.price) || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Make filter
    if (selectedMakes.length > 0) {
      result = result.filter(listing => listing.make && selectedMakes.includes(listing.make));
    }
    
    // Apply sorting
    result = sortListings(result, sortOption);
    
    setFilteredListings(result);
    setCurrentPage(1); // Reset to first page when filters/search change
  }, [searchTerm, priceRange, selectedMakes, allListings, sortOption]);
  
  // Function to sort listings based on selected option
  const sortListings = (listings, option) => {
    switch(option) {
      case 'price-low':
        return [...listings].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
      case 'price-high':
        return [...listings].sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
      case 'newest':
        return [...listings].sort((a, b) => b.createdAt - a.createdAt);
      case 'oldest':
        return [...listings].sort((a, b) => a.createdAt - b.createdAt);
      case 'name-az':
        return [...listings].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      case 'name-za':
        return [...listings].sort((a, b) => (b.name || '').localeCompare(a.name || ''));
      default:
        return listings;
    }
  };

  const handleMakeChange = (make) => {
    setSelectedMakes(prev =>
      prev.includes(make) ? prev.filter(m => m !== make) : [...prev, make]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 100000]);
    setSelectedMakes([]);
    setSortOption('newest'); // Reset sorting to default
    // setShowFilters(false); // Keep filters open or close based on preference
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };
  
  const filterPanelVariants = {
    hidden: { opacity: 0, x: "-100%" },
    visible: { opacity: 1, x: "0%", transition: { type: "spring", stiffness: 120, damping: 20 } },
    exit: { opacity: 0, x: "-100%", transition: { duration: 0.3 } }
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
        <h1 className="text-4xl font-bold text-primary mb-2">Find Your Perfect Vehicle</h1>
        <p className="text-lg text-muted-foreground">Browse our extensive collection of quality pre-owned cars.</p>
      </motion.div>

      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full md:w-auto">
          <Input
            type="text"
            placeholder="Search by name, make, model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-lg py-3"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <SortDropdown value={sortOption} onChange={setSortOption} />
          <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="w-full md:w-auto">
            <Filter className="mr-2 h-4 w-4" /> {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
          <Button 
            onClick={fetchListings} 
            variant="outline" 
            className="w-full md:w-auto" 
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <AnimatePresence>
        {showFilters && (
          <motion.aside 
            key="filter-panel"
            className="lg:w-1/4 p-6 bg-card rounded-xl shadow-lg border sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto" 
            variants={filterPanelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-primary">Filters</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)} className="lg:hidden">
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label className="text-lg font-medium">Price Range</Label>
                <Slider
                  min={0}
                  max={100000}
                  step={1000}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="mt-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>${priceRange[0].toLocaleString()}</span>
                  <span>${priceRange[1].toLocaleString()}</span>
                </div>
              </div>

              {availableMakes.length > 0 && (
                <div>
                  <Label className="text-lg font-medium">Make</Label>
                  <div className="space-y-2 mt-2 max-h-60 overflow-y-auto pr-2">
                    {availableMakes.map(make => (
                      <div key={make} className="flex items-center space-x-2">
                        <Checkbox
                          id={`make-${make}`}
                          checked={selectedMakes.includes(make)}
                          onCheckedChange={() => handleMakeChange(make)}
                        />
                        <Label htmlFor={`make-${make}`} className="font-normal">{make}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Button onClick={clearFilters} variant="destructive" className="w-full mt-4">
                <X className="mr-2 h-4 w-4" /> Clear All Filters
              </Button>
            </div>
          </motion.aside>
        )}
        </AnimatePresence>

        <main className={`flex-grow ${showFilters ? 'lg:w-3/4' : 'w-full'}`}>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading vehicles...</p>
            </div>
          ) : filteredListings.length > 0 ? (
            <>
              <motion.div 
                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
              >
                {paginatedListings.map((listing) => (
                  <motion.div key={listing.id} variants={cardVariants}>
                    <Card className="rounded-xl shadow-md border border-primary/10 bg-white/95 hover:shadow-xl transition-all duration-200 flex flex-col h-full overflow-hidden group min-h-[280px] max-w-full">
                      <div className="relative h-36 sm:h-40 md:h-48 overflow-hidden bg-white flex items-center justify-center">
                        <img
                          src={listing.image}
                          alt={listing.name || 'Vehicle image'}
                          className="max-h-full max-w-full object-contain p-2"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getFallbackImage(listing.make, listing.model);
                          }}
                        />
                      </div>
                      <CardContent className="p-3 flex flex-col flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base font-bold text-primary truncate flex-1">{listing.name}</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent text-accent-foreground border border-primary/20">{listing.year}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-1">
                          {listing.fuel_type && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-semibold">{listing.fuel_type}</span>}
                          {listing.transmission && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-semibold">{listing.transmission}</span>}
                          {listing.body_type && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-pink-100 text-pink-800 font-semibold">{listing.body_type}</span>}
                        </div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-base font-bold text-primary">{listing.price ? `$${Number(listing.price).toLocaleString()}` : 'Contact'}</span>
                          {listing.location && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                              {listing.location}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <span>{listing.mileage ? `${listing.mileage.toLocaleString()} mi` : '—'}</span>
                          <span>•</span>
                          <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                        </div>
                        <Button asChild className="w-full mt-auto text-xs font-semibold shadow bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary transition-colors rounded-full py-2 h-8">
                          <Link to={`/vehicle/${listing.id}`}>
                            View Details <ArrowRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-muted-foreground/20 rounded-lg p-8">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No Vehicles Found</h3>
              <p className="text-muted-foreground mb-6">We couldn't find any vehicles matching your criteria.</p>
              <div className="flex flex-col gap-4 max-w-md mx-auto">
                <div className="text-left">
                  <h4 className="font-medium mb-2">Possible reasons:</h4>
                  <ul className="list-disc pl-5 text-muted-foreground">
                    <li>There are no approved or active listings in the database</li>
                    <li>Your filters are too restrictive</li>
                    <li>The database connection might have issues</li>
                  </ul>
                </div>
                <Button onClick={() => {
                  clearFilters();
                  fetchListings();
                }}>
                  Reset Filters & Refresh
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BuyPage;
