
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search, Filter, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const BuyPage = () => {
  const [allListings, setAllListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 100000]); // Increased max price
  const [selectedMakes, setSelectedMakes] = useState([]);
  const [availableMakes, setAvailableMakes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('listings')
        .select(`
          id,
          make,
          model,
          year,
          price,
          mileage,
          photo_urls,
          location,
          status
        `)
        .eq('status', 'active'); // Only show active listings

      if (error) {
        console.error('Error fetching listings:', error);
        setAllListings([]);
      } else {
        const formattedListings = data.map(item => ({
          ...item,
          name: `${item.make} ${item.model} ${item.year}`, // Construct name
          image: item.photo_urls && item.photo_urls.length > 0 ? item.photo_urls[0] : 'Placeholder vehicle image' // Use first photo as main image
        }));
        setAllListings(formattedListings);
        
        // Populate available makes from fetched listings
        const makes = [...new Set(formattedListings.map(listing => listing.make))].filter(Boolean);
        setAvailableMakes(makes);
      }
      setLoading(false);
    };
    fetchListings();
  }, []);

  useEffect(() => {
    let result = allListings;

    if (searchTerm) {
      result = result.filter(listing =>
        listing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (listing.make && listing.make.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (listing.model && listing.model.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    result = result.filter(listing => listing.price >= priceRange[0] && listing.price <= priceRange[1]);

    if (selectedMakes.length > 0) {
      result = result.filter(listing => selectedMakes.includes(listing.make));
    }
    
    setFilteredListings(result);
  }, [searchTerm, priceRange, selectedMakes, allListings]);

  const handleMakeChange = (make) => {
    setSelectedMakes(prev =>
      prev.includes(make) ? prev.filter(m => m !== make) : [...prev, make]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 100000]);
    setSelectedMakes([]);
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
        <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="w-full md:w-auto">
          <Filter className="mr-2 h-4 w-4" /> {showFilters ? 'Hide' : 'Show'} Filters
        </Button>
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
          {filteredListings.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            >
              {filteredListings.map((listing) => (
                <motion.div key={listing.id} variants={cardVariants}>
                  <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 group flex flex-col h-full">
                    <div className="relative h-56 bg-gray-200">
                      <img    
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        alt={listing.name || 'Vehicle image'} src="https://images.unsplash.com/photo-1595872018818-97555653a011" />
                      <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-full shadow-md">{listing.make}</div>
                    </div>
                    <CardContent className="p-6 flex flex-col flex-grow">
                      <CardTitle className="text-xl font-semibold mb-1 group-hover:text-primary transition-colors">{listing.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mb-1">{listing.year} &bull; {listing.mileage?.toLocaleString()} miles</p>
                      <p className="text-2xl font-bold text-primary mb-3">${listing.price?.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground mb-4">{listing.location || 'N/A'}</p>
                      <Button asChild className="w-full mt-auto">
                        <Link to={`/vehicle/${listing.id}`}>
                          View Details <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <img  className="mx-auto h-40 w-40 text-muted-foreground mb-6" alt="No results found icon" src="https://images.unsplash.com/photo-1682624400764-d2c9eaeae972" />
              <h3 className="text-2xl font-semibold mb-2">No Vehicles Found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters, or check back later for new listings!</p>
              <Button onClick={clearFilters} className="mt-6">Clear Filters and Search</Button>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BuyPage;
