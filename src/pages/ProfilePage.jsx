import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/auth/AuthGuard';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Loader2, User, Car, MessageSquare, Heart, Edit, Save, X } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    location: ''
  });
  const [userListings, setUserListings] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, listingId: null });
  
  // Fetch user profile data
  useEffect(() => {
    let listingsSubscription = null;
    let wishlistSubscription = null;
    
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch profile data from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError);
          toast({
            title: 'Error',
            description: 'Failed to load profile data',
            variant: 'destructive'
          });
        }
        
        // Set profile data
        const profile = profileData || { id: user.id };
        setUserProfile(profile);
        
        // Initialize form data
        setFormData({
          full_name: profile.full_name || user.name || '',
          phone_number: profile.phone_number || '',
          location: profile.location || ''
        });
        
        // Initial fetch for listings
        const { data: listingsData, error: listingsError } = await supabase
          .from('listings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (listingsError) {
          console.error('Error fetching listings:', listingsError);
        } else {
          // Process images for each listing
          const processedListings = (listingsData || []).map(listing => {
            let image = '/placeholder-car.jpg';
            if (listing.photo_urls && Array.isArray(listing.photo_urls) && listing.photo_urls.length > 0) {
              const firstPhoto = listing.photo_urls[0];
              if (typeof firstPhoto === 'string' && firstPhoto.trim() !== '') {
                if (firstPhoto.startsWith('http')) {
                  image = firstPhoto;
                } else {
                  try {
                    const cleanPath = firstPhoto.startsWith('/') ? firstPhoto.substring(1) : firstPhoto;
                    image = supabase.storage.from('vehicle-assets').getPublicUrl(cleanPath).data.publicUrl || image;
                  } catch (err) {
                    // fallback remains
                  }
                }
              }
            }
            return {
              ...listing,
              image,
              name: `${listing.make || ''} ${listing.model || ''} ${listing.year || ''}`.trim() || listing.name || 'Unnamed Vehicle',
            };
          });
          setUserListings(processedListings);
        }
        
        // Initial fetch for wishlist
        const { data: wishlistData, error: wishlistError } = await supabase
          .from('wishlists') // Using correct table name 'wishlists' instead of 'wishlist'
          .select(`
            id,
            listing_id,
            listings:listing_id (id, name, price, main_image, created_at, status)
          `)
          .eq('user_id', user.id);
          
        if (wishlistError) {
          console.error('Error fetching wishlist:', wishlistError);
        } else {
          setWishlistItems(wishlistData?.map(item => item.listings).filter(Boolean) || []);
        }
        
        // Set up real-time subscription for listings
        listingsSubscription = supabase
          .channel('listings-changes')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'listings',
            filter: `user_id=eq.${user.id}`
          }, async () => {
            // Refetch listings when changes occur
            const { data, error } = await supabase
              .from('listings')
              .select('id, name, price, main_image, created_at, status')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false });
              
            if (!error) {
              setUserListings(data || []);
            }
          })
          .subscribe();
        
        // Set up real-time subscription for wishlist
        wishlistSubscription = supabase
          .channel('wishlist-changes')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'wishlists', // Using correct table name 'wishlists'
            filter: `user_id=eq.${user.id}`
          }, async () => {
            // Refetch wishlist when changes occur
            const { data, error } = await supabase
              .from('wishlists') // Using correct table name 'wishlists'
              .select(`
                id,
                listing_id,
                listings:listing_id (id, name, price, main_image, created_at, status)
              `)
              .eq('user_id', user.id);
              
            if (!error) {
              setWishlistItems(data?.map(item => item.listings).filter(Boolean) || []);
            }
          })
          .subscribe();
        
      } catch (error) {
        console.error('Error in data fetching:', error);
        toast({
          title: 'Error',
          description: 'Something went wrong while loading your profile',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
    
    // Cleanup subscriptions when component unmounts
    return () => {
      if (listingsSubscription) {
        supabase.removeChannel(listingsSubscription);
      }
      if (wishlistSubscription) {
        supabase.removeChannel(wishlistSubscription);
      }
    };
  }, [user, toast]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      let error;
      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            phone_number: formData.phone_number,
            location: formData.location,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
          
        error = updateError;
      } else {
        // Insert new profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: formData.full_name,
            phone_number: formData.phone_number,
            location: formData.location,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        error = insertError;
      }
      
      if (error) {
        throw error;
      }
      
      // Update user metadata
      await supabase.auth.updateUser({
        data: { full_name: formData.full_name, phone_number: formData.phone_number }
      });
      
      // Update local state to reflect changes
      setUserProfile({
        ...userProfile,
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        location: formData.location,
        updated_at: new Date().toISOString()
      });
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated',
        variant: 'success'
      });
      
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Cancel edit mode
  const handleCancelEdit = () => {
    // Reset form data to original values
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || user?.name || '',
        phone_number: userProfile.phone_number || '',
        location: userProfile.location || ''
      });
    }
    setEditMode(false);
  };
  
  if (loading && !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }
  
  return (
    <div className="container py-8 max-w-6xl">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Profile Card */}
            <Card className="md:col-span-1">
              <CardHeader>
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={userProfile?.avatar_url} alt={formData.full_name} />
                    <AvatarFallback className="text-2xl">
                      {formData.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-center">{formData.full_name || user?.email?.split('@')[0]}</CardTitle>
                  <CardDescription className="text-center">{user?.email}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {userProfile?.location && (
                    <div className="flex items-center text-sm">
                      <span className="font-semibold mr-2">Location:</span>
                      <span>{userProfile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <span className="font-semibold mr-2">Member since:</span>
                    <span>{new Date(userProfile?.created_at || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-semibold mr-2">Listings:</span>
                    <span>{userListings.length}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {!editMode ? (
                  <Button 
                    className="w-full" 
                    variant="outline" 
                    onClick={() => setEditMode(true)}
                  >
                    <Edit className="mr-2 h-4 w-4" /> Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2 w-full">
                    <Button 
                      className="flex-1" 
                      variant="outline" 
                      onClick={handleCancelEdit}
                    >
                      <X className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                    <Button 
                      className="flex-1" 
                      onClick={handleSaveProfile}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
            
            {/* Profile Details */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  {editMode 
                    ? 'Edit your profile information below' 
                    : 'Your personal information and preferences'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    {editMode ? (
                      <Input
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                      />
                    ) : (
                      <div className="p-2 border rounded-md bg-muted/50">
                        {formData.full_name || 'Not provided'}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    {editMode ? (
                      <Input
                        id="phone_number"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        placeholder="Your phone number"
                      />
                    ) : (
                      <div className="p-2 border rounded-md bg-muted/50">
                        {formData.phone_number || 'Not provided'}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    {editMode ? (
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="Your location (city, state)"
                      />
                    ) : (
                      <div className="p-2 border rounded-md bg-muted/50">
                        {formData.location || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Listings Tab */}
        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>My Listings</span>
                <Button onClick={() => navigate('/sell')}>
                  Create New Listing
                </Button>
              </CardTitle>
              <CardDescription>
                Manage your vehicle listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userListings.length === 0 ? (
                <div className="text-center py-12">
                  <Car className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No listings yet</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't created any vehicle listings yet.
                  </p>
                  <Button onClick={() => navigate('/sell')}>
                    Create Your First Listing
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {userListings.map(listing => (
                    <Card key={listing.id} className="overflow-hidden">
                      <div className="aspect-video relative">
                        <img 
                          src={listing.image || '/placeholder-car.jpg'} 
                          alt={listing.name}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-car.jpg';
                          }}
                        />
                        {listing.status === 'sold' && (
                          <div className="absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded bg-gray-700 text-white">
                            Sold
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium truncate">{listing.name}</h3>
                        <p className="text-primary font-bold">
                          ${listing.price?.toLocaleString() || 'Price not set'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Listed on {new Date(listing.created_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => navigate(`/vehicle/${listing.id}`)}
                        >
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => navigate(`/edit-listing/${listing.id}`)}
                        >
                          Edit
                        </Button>
                        {listing.status !== 'sold' && (
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="flex-1"
                            onClick={async () => {
                              const { error } = await supabase
                                .from('listings')
                                .update({ status: 'sold' })
                                .eq('id', listing.id);
                              if (!error) {
                                setUserListings(prev => prev.map(l => l.id === listing.id ? { ...l, status: 'sold' } : l));
                                toast({ title: 'Marked as Sold', description: 'This listing is now marked as sold and will not be shown to buyers.' });
                              } else {
                                toast({ title: 'Error', description: 'Failed to mark as sold.', variant: 'destructive' });
                              }
                            }}
                          >
                            Mark as Sold
                          </Button>
                        )}
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setDeleteDialog({ open: true, listingId: listing.id })}
                        >
                          Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Wishlist Tab */}
        <TabsContent value="wishlist">
          <Card>
            <CardHeader>
              <CardTitle>My Wishlist</CardTitle>
              <CardDescription>
                Vehicles you've saved to your wishlist
              </CardDescription>
            </CardHeader>
            <CardContent>
              {wishlistItems.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Your wishlist is empty</h3>
                  <p className="text-muted-foreground mb-4">
                    Save vehicles you're interested in to your wishlist.
                  </p>
                  <Button onClick={() => navigate('/buy')}>
                    Browse Vehicles
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {wishlistItems.filter(Boolean).map(item => (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="aspect-video relative">
                        <img 
                          src={item.main_image || '/placeholder-car.jpg'} 
                          alt={item.name}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-car.jpg';
                          }}
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium truncate">{item.name}</h3>
                        <p className="text-primary font-bold">
                          ${item.price?.toLocaleString() || 'Price not set'}
                        </p>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button 
                          className="w-full"
                          onClick={() => navigate(`/vehicle/${item.id}`)}
                        >
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Delete Confirmation Dialog */}
      {deleteDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold mb-2 text-destructive">Delete Listing?</h2>
            <p className="mb-4 text-muted-foreground">Are you sure you want to delete this listing? This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteDialog({ open: false, listingId: null })}>Cancel</Button>
              <Button 
                variant="destructive" 
                onClick={async () => {
                  const { error } = await supabase
                    .from('listings')
                    .delete()
                    .eq('id', deleteDialog.listingId);
                  if (!error) {
                    setUserListings(prev => prev.filter(l => l.id !== deleteDialog.listingId));
                    toast({ title: 'Listing Deleted', description: 'This listing has been deleted.' });
                  } else {
                    toast({ title: 'Error', description: 'Failed to delete listing.', variant: 'destructive' });
                  }
                  setDeleteDialog({ open: false, listingId: null });
                }}
              >
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
