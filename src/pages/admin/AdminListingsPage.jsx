import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Search, Eye, CheckCircle, XCircle, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const AdminListingsPage = () => {
  const { toast } = useToast();
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching listings...');
      
      // First, get all listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (listingsError) {
        console.error('Error fetching listings:', listingsError);
        toast({
          title: "Error",
          description: `Failed to load listings: ${listingsError.message}`,
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      console.log('Listings fetched successfully:', listingsData?.length || 0, 'listings found');
      
      // If no listings, return empty array
      if (!listingsData || listingsData.length === 0) {
        setListings([]);
        setIsLoading(false);
        return;
      }
      
      // Transform data to match our UI needs - using contact_name directly from listings
      const formattedListings = listingsData.map(listing => {
        // Use contact_name from the listing if available, otherwise fallback to user ID or Unknown
        let sellerName = 'Unknown Seller';
        
        if (listing.contact_name && listing.contact_name.trim() !== '') {
          sellerName = listing.contact_name;
        } else if (listing.user_id) {
          sellerName = `User ${listing.user_id.substring(0, 6)}`;
        }
        
        return {
          id: listing.id,
          vehicleName: `${listing.make || ''} ${listing.model || ''} ${listing.year || ''}`.trim() || 'Unnamed Vehicle',
          sellerName: sellerName,
          price: listing.price || 0,
          status: listing.status || 'pending_verification',
          listedDate: listing.created_at ? new Date(listing.created_at).toLocaleDateString() : 'Unknown',
          views: listing.views || 0,
          userId: listing.user_id,
          originalData: listing
        };
      });
      
      // Set listings with seller information
      setListings(formattedListings);
    } catch (error) {
      console.error('Error in fetchListings:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading listings.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchListings();
    
    const subscription = supabase
      .channel('listings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, (payload) => {
        console.log('Listings changed:', payload);
        fetchListings();
      })
      .subscribe();
    
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const filteredListings = listings.filter(listing =>
    (listing.vehicleName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (listing.sellerName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleApproveListing = async (listingId) => {
    try {
      const listingToUpdate = listings.find(l => l.id === listingId);
      if (!listingToUpdate) return;
      
      const { error } = await supabase
        .from('listings')
        .update({ status: 'approved' })
        .eq('id', listingId);
      
      if (error) {
        console.error('Error approving listing:', error);
        toast({
          title: "Error",
          description: `Failed to approve listing: ${error.message}`,
          variant: "destructive"
        });
        return;
      }
      
      toast({ 
        title: "Listing Approved", 
        description: "The vehicle listing is now active." 
      });
    } catch (error) {
      console.error('Error in handleApproveListing:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };

  const handleRejectListing = async (listingId) => {
    try {
      const listingToUpdate = listings.find(l => l.id === listingId);
      if (!listingToUpdate) return;
      
      const { error } = await supabase
        .from('listings')
        .update({ status: 'rejected' })
        .eq('id', listingId);
      
      if (error) {
        console.error('Error rejecting listing:', error);
        toast({
          title: "Error",
          description: `Failed to reject listing: ${error.message}`,
          variant: "destructive"
        });
        return;
      }
      
      toast({ 
        title: "Listing Rejected", 
        description: "The vehicle listing has been rejected." 
      });
    } catch (error) {
      console.error('Error in handleRejectListing:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteListing = async (listingId) => {
    try {
      const listingToDelete = listings.find(l => l.id === listingId);
      if (!listingToDelete) return;
      
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId);
      
      if (error) {
        console.error('Error deleting listing:', error);
        toast({
          title: "Error",
          description: `Failed to delete listing: ${error.message}`,
          variant: "destructive"
        });
        return;
      }
      
      toast({ 
        title: "Listing Deleted", 
        description: "The vehicle listing has been removed.", 
        variant: "destructive" 
      });
    } catch (error) {
      console.error('Error in handleDeleteListing:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    }
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
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={fetchListings} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
            <Link to="/admin/add-listing" className="no-underline">
              <Button className="bg-primary hover:bg-primary/90">
                Add Listing
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Vehicle Listings</CardTitle>
          <CardDescription>Overview of all vehicle listings on the platform.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <RefreshCw className="h-12 w-12 animate-spin text-primary" />
              <span className="ml-2 text-lg">Loading listings...</span>
            </div>
          ) : filteredListings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Listed Date</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredListings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell className="font-medium">{listing.vehicleName}</TableCell>
                    <TableCell>{listing.sellerName}</TableCell>
                    <TableCell>${listing.price?.toLocaleString() || 'N/A'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        listing.status === 'approved' || listing.status === 'active' ? 'bg-green-100 text-green-800' : 
                        listing.status === 'pending_verification' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {listing.status === 'approved' || listing.status === 'active' ? 'Active' : 
                         listing.status === 'pending_verification' ? 'Pending' : 
                         'Rejected'}
                      </span>
                    </TableCell>
                    <TableCell>{listing.listedDate}</TableCell>
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
                          <DropdownMenuItem>
                            <Link to={`/vehicle/${listing.id}`} className="flex items-center w-full">
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </Link>
                          </DropdownMenuItem>
                          {listing.status !== 'approved' && listing.status !== 'active' && (
                            <DropdownMenuItem onClick={() => handleApproveListing(listing.id)}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Approve Listing
                            </DropdownMenuItem>
                          )}
                          {listing.status !== 'rejected' && (
                            <DropdownMenuItem onClick={() => handleRejectListing(listing.id)}>
                              <XCircle className="mr-2 h-4 w-4 text-yellow-600" /> Reject Listing
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteListing(listing.id)} className="text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Listing
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p>No listings found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminListingsPage;