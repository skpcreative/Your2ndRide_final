import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Search, TrendingUp, CheckCircle, MessageSquare, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const featuredListings = [
    { id: 1, name: 'Sedan X', price: '$15,000', image: 'Modern blue sedan', make: 'Alpha Motors' },
    { id: 2, name: 'SUV Max', price: '$25,000', image: 'Spacious family SUV in silver', make: 'Beta Autos' },
    { id: 3, name: 'Sport Coupe', price: '$30,000', image: 'Red sports coupe with black wheels', make: 'Gamma Cars' },
  ];

  const recentListings = [
    { id: 4, name: 'Eco Hatch', price: '$12,000', image: 'Compact green hatchback', date: '2 hours ago' },
    { id: 5, name: 'Pickup Pro', price: '$28,000', image: 'Heavy-duty pickup truck, black', date: '5 hours ago' },
  ];

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
            Find Your Next Ride, Effortlessly.
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl mb-10 max-w-2xl mx-auto"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            style={{ transitionDelay: '0.2s' }}
          >
            Your2ndRide connects buyers and sellers of quality pre-owned vehicles.
            Discover great deals or list your car today!
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
            <Button variant="outline" size="lg" asChild className="border-white text-white hover:bg-white/10 shadow-lg transform hover:scale-105 transition-transform duration-300">
              <Link to="/sell">
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
              <input type="text" placeholder="Keywords (e.g., Honda Civic, Red)" className="p-3 border rounded-md focus:ring-primary focus:border-primary" />
              <input type="text" placeholder="Make" className="p-3 border rounded-md focus:ring-primary focus:border-primary" />
              <input type="text" placeholder="Model" className="p-3 border rounded-md focus:ring-primary focus:border-primary" />
              <Button size="lg" className="w-full bg-gradient-brand text-primary-foreground">Search Now</Button>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      <motion.section className="container mx-auto px-4 sm:px-6 lg:px-8" variants={staggerContainer} initial="hidden" animate="visible">
        <h2 className="text-3xl font-bold mb-8 text-center text-primary">Featured Listings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredListings.map((listing) => (
            <motion.div key={listing.id} variants={fadeIn}>
              <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 group">
                <div className="relative h-56 bg-gray-200">
                  <img  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={listing.image} src="https://images.unsplash.com/photo-1595872018818-97555653a011" />
                  <div className="absolute top-2 left-2 bg-accent text-accent-foreground px-2 py-1 text-xs font-semibold rounded">{listing.make}</div>
                </div>
                <CardContent className="p-6">
                  <CardTitle className="text-xl font-semibold mb-1 group-hover:text-primary transition-colors">{listing.name}</CardTitle>
                  <p className="text-2xl font-bold text-primary mb-3">{listing.price}</p>
                  <Button asChild className="w-full mt-2">
                    <Link to={`/vehicle/${listing.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild>
            <Link to="/buy">
              View All Listings <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </motion.section>
      
      <motion.section className="bg-muted py-16" variants={fadeIn} initial="hidden" animate="visible">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center text-primary">How Your2ndRide Works</h2>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {[
              { icon: <Search size={48} className="mx-auto mb-4 text-accent" />, title: 'Find Your Ride', description: 'Browse thousands of listings with powerful filters.' },
              { icon: <MessageSquare size={48} className="mx-auto mb-4 text-accent" />, title: 'Connect Securely', description: 'Chat with sellers directly and safely through our platform.' },
              { icon: <ShieldCheck size={48} className="mx-auto mb-4 text-accent" />, title: 'Transact with Confidence', description: 'Verified sellers and transparent processes for peace of mind.' },
            ].map((step, index) => (
              <motion.div key={index} variants={fadeIn} className="p-6 bg-background rounded-lg shadow-lg">
                {step.icon}
                <h3 className="text-xl font-semibold mb-2 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section className="container mx-auto px-4 sm:px-6 lg:px-8" variants={fadeIn} initial="hidden" animate="visible">
        <h2 className="text-3xl font-bold mb-8 text-center text-primary">Recently Added</h2>
        <div className="space-y-6">
          {recentListings.map((listing) => (
            <motion.div key={listing.id} variants={fadeIn}>
              <Card className="flex flex-col md:flex-row items-center shadow-md hover:shadow-xl transition-shadow duration-300">
                <div className="md:w-1/3 h-48 md:h-auto bg-gray-200 rounded-t-lg md:rounded-l-lg md:rounded-tr-none overflow-hidden">
                  <img  className="w-full h-full object-cover" alt={listing.image} src="https://images.unsplash.com/photo-1595872018818-97555653a011" />
                </div>
                <CardContent className="p-6 md:w-2/3">
                  <CardTitle className="text-xl font-semibold mb-1 hover:text-primary transition-colors">{listing.name}</CardTitle>
                  <p className="text-lg font-bold text-primary mb-2">{listing.price}</p>
                  <p className="text-sm text-muted-foreground mb-3">Listed: {listing.date}</p>
                  <Button asChild>
                    <Link to={`/vehicle/${listing.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section className="container mx-auto px-4 sm:px-6 lg:px-8" variants={fadeIn} initial="hidden" animate="visible">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-semibold mb-6 text-center md:text-left text-primary">Popular Brands</h3>
            <motion.div className="flex flex-wrap gap-3 justify-center md:justify-start" variants={staggerContainer}>
              {popularBrands.map(brand => (
                <motion.div key={brand} variants={fadeIn}>
                  <Button variant="outline" className="bg-background hover:bg-accent/10 hover:border-accent transition-all duration-300">{brand}</Button>
                </motion.div>
              ))}
            </motion.div>
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-6 text-center md:text-left text-primary">Vehicle Categories</h3>
            <motion.div className="flex flex-wrap gap-3 justify-center md:justify-start" variants={staggerContainer}>
              {categories.map(category => (
                <motion.div key={category} variants={fadeIn}>
                  <Button variant="secondary" className="hover:bg-secondary/80 transition-all duration-300">{category}</Button>
                </motion.div>
              ))}
            </motion.div>
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
            <Button variant="outline" size="lg" asChild className="border-white text-white hover:bg-white/10 shadow-lg transform hover:scale-105 transition-transform duration-300">
              <Link to="/contact">
                Learn More <CheckCircle className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;