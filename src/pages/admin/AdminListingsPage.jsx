import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Search, Eye, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// Mock listings data
const initialListings = [
  { id: 'lst_001', vehicleName: 'Toyota Camry 2020', sellerName: 'John Doe', price: 18500, status: 'active', listedDate: '2023-05-01', views: 120 },
  { id: 'lst_002', vehicleName: 'Ford F-150 2019', sellerName: 'Jane Smith', price: 27000, status: 'pending_verification', listedDate: '2023-05-10', views: 35 },
  { id: 'lst_003', vehicleName: 'Honda Civic 2021', sellerName: 'Mike Brown', price: 21000, status: 'active', listedDate: '2023-04-20', views: 250 },
  { id: 'lst_004', vehicleName: 'BMW X5 2018', sellerName: 'Sarah Wilson', price: 32000, status: 'rejected', listedDate: '2023-05-05', views: 88 },
  { id: 'lst_005', vehicleName: 'Audi A4 2022', sellerName: 'Chris Green', price: 35000, status: 'active', listedDate: '2023-05-12', views: 50 },
];

const AdminListingsPage = () => {
  const { toast } = useToast();
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Load listings from localStorage or API
    const storedListings = JSON.parse(localStorage.getItem('vehicleListings')) || [];
    // Combine initial mock data with stored data, prioritizing stored if IDs match (simple merge)
    const combined = [...initialListings.filter(il => !storedListings.find(sl => sl.id === il.id)), ...storedListings.map(sl => ({
      ...sl, 
      vehicleName: `${sl.make} ${sl.model} ${sl.year}`, 
      sellerName: sl.name, // Assuming 'name' from sell form is seller name
      listedDate: new Date().toISOString().split('T')[0], // Placeholder
      views: Math.floor(Math.random() * 300) // Placeholder
    }))];
    setListings(combined);
  }, []);

  const filteredListings = listings.filter(listing =>
    listing.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.sellerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApproveListing = (listingId) => {
    setListings(listings.map(l => l.id === listingId ? { ...l, status: 'active' } : l));
    toast({ title: "Listing Approved", description: "The vehicle listing is now active." });
  };

  const handleRejectListing = (listingId) => {
    setListings(listings.map(l => l.id === listingId ? { ...l, status: 'rejected' } : l));
    toast({ title: "Listing Rejected", description: "The vehicle listing has been rejected.", variant: "destructive" });
  };
  
  const handleDeleteListing = (listingId) => {
    setListings(listings.filter(l => l.id !== listingId));
    // Also remove from localStorage if it exists there
    const localListings = JSON.parse(localStorage.getItem('vehicleListings') || '[]');
    localStorage.setItem('vehicleListings', JSON.stringify(localListings.filter(l => l.id !== listingId)));
    toast({ title: "Listing Deleted", description: "The vehicle listing has been permanently removed.", variant: "destructive" });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'pending_verification': return 'bg-yellow-100 text-yellow-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
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
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">Manage Listings</h1>
        <div className="relative w-full md:w-auto md:max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search listings..." 
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="shadow-xl border-primary/10">
        <CardHeader>
          <CardTitle>Vehicle Listings</CardTitle>
          <CardDescription>Overview of all vehicle listings on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle Name</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Listed Date</TableHead>
                <TableHead>Views</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredListings.length > 0 ? filteredListings.map((listing) => (
                <TableRow key={listing.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{listing.vehicleName}</TableCell>
                  <TableCell>{listing.sellerName}</TableCell>
                  <TableCell>${listing.price?.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(listing.status)}`}>
                      {listing.status.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(listing.listedDate).toLocaleDateString()}</TableCell>
                  <TableCell>{listing.views}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link to={`/vehicle/${listing.id}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="mr-2 h-4 w-4" /> View Listing
                          </Link>
                        </DropdownMenuItem>
                        {listing.status === 'pending_verification' && (
                          <>
                            <DropdownMenuItem onClick={() => handleApproveListing(listing.id)}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRejectListing(listing.id)}>
                              <XCircle className="mr-2 h-4 w-4 text-red-600" /> Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteListing(listing.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Listing
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                    No listings found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminListingsPage;