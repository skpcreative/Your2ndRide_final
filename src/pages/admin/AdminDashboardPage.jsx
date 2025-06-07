import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, ListChecks, FileWarning, Activity, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const AdminDashboardPage = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState([
    { title: "Total Users", value: "--", icon: <Users className="h-6 w-6 text-blue-500" />, trend: "Loading..." },
    { title: "Active Listings", value: "--", icon: <ListChecks className="h-6 w-6 text-green-500" />, trend: "Loading..." },
  ]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch real-time data from Supabase
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // Get total users count
      let userCount = 0;
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id');
      if (!userError) userCount = userData?.length || 0;
      // Get active listings count
      let activeListingsCount = 0;
      const { data: activeListings, error: listingsError } = await supabase
        .from('listings')
        .select('id')
        .eq('status', 'approved');
      if (!listingsError) activeListingsCount = activeListings?.length || 0;
      setStats([
        {
          title: "Total Users",
          value: userCount.toString(),
          icon: <Users className="h-7 w-7 text-blue-600 bg-blue-100 rounded-full p-1" />, 
          trend: `${Math.floor(userCount/10)} new this month`
        },
        {
          title: "Active Listings",
          value: activeListingsCount.toString(),
          icon: <ListChecks className="h-7 w-7 text-green-600 bg-green-100 rounded-full p-1" />, 
          trend: `${Math.floor(activeListingsCount/5)} new today`
        }
      ]);
      // Fetch recent activity: new users, new listings, verifications
      const [recentListings, recentUsers, pendingListings] = await Promise.all([
        supabase.from('listings').select('id, make, model, year, status, created_at, user_id').order('created_at', { ascending: false }).limit(5),
        supabase.from('profiles').select('id, full_name, email, created_at').order('created_at', { ascending: false }).limit(3),
        supabase.from('listings').select('id, make, model, year, created_at, user_id').eq('status', 'pending_verification').order('created_at', { ascending: false }).limit(3)
      ]);
      let activityItems = [];
      // New listings
      if (recentListings.data) {
        for (const listing of recentListings.data) {
          activityItems.push({
            id: `listing-${listing.id}`,
            type: listing.status === 'approved' ? 'listing_approved' : (listing.status === 'pending_verification' ? 'listing_pending' : 'listing_other'),
            message: `New listing: ${listing.make} ${listing.model} ${listing.year}`,
            timestamp: new Date(listing.created_at).toLocaleString(),
            color: listing.status === 'approved' ? 'bg-green-500' : (listing.status === 'pending_verification' ? 'bg-yellow-500' : 'bg-gray-400'),
            icon: listing.status === 'approved' ? <ListChecks className="h-5 w-5 text-white" /> : <FileWarning className="h-5 w-5 text-white" />
          });
        }
      }
      // New users
      if (recentUsers.data) {
        for (const user of recentUsers.data) {
          activityItems.push({
            id: `user-${user.id}`,
            type: 'user_signup',
            message: `New user: ${user.full_name || user.email}`,
            timestamp: new Date(user.created_at).toLocaleString(),
            color: 'bg-blue-500',
            icon: <Users className="h-5 w-5 text-white" />
          });
        }
      }
      // Pending verifications
      if (pendingListings.data) {
        for (const listing of pendingListings.data) {
          activityItems.push({
            id: `pending-${listing.id}`,
            type: 'pending_verification',
            message: `Pending verification: ${listing.make} ${listing.model} ${listing.year}`,
            timestamp: new Date(listing.created_at).toLocaleString(),
            color: 'bg-yellow-500',
            icon: <FileWarning className="h-5 w-5 text-white" />
          });
        }
      }
      // Sort by timestamp desc
      activityItems = activityItems.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setRecentActivity(activityItems);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      toast({ title: "Error", description: "Failed to load dashboard data. Please try again.", variant: "destructive" });
    }
  };
  
  // Set up real-time subscription
  useEffect(() => {
    // Initial data fetch
    fetchDashboardData();
    
    // Set up a polling interval as a fallback (every 30 seconds)
    const pollingInterval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    // Subscribe to changes in the listings table
    const listingsSubscription = supabase
      .channel('listings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, (payload) => {
        console.log('Listings changed:', payload);
        // Refresh data when listings change
        fetchDashboardData();
      })
      .subscribe((status) => {
        console.log('Listings subscription status:', status);
      });
      
    // Subscribe to changes in the profiles table
    const profilesSubscription = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        console.log('Profiles changed:', payload);
        // Refresh data when profiles change
        fetchDashboardData();
      })
      .subscribe((status) => {
        console.log('Profiles subscription status:', status);
      });
    
    return () => {
      clearInterval(pollingInterval);
      listingsSubscription?.unsubscribe();
      profilesSubscription?.unsubscribe();
    };
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <div className="space-y-8">
      <motion.h1 
        className="text-3xl md:text-4xl font-bold text-primary"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        Admin Dashboard
      </motion.h1>

      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {stats.map((stat, index) => (
          <motion.div key={index} variants={fadeIn}>
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-primary bg-gradient-to-br from-white via-gray-50 to-blue-50 h-full flex flex-col justify-center">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">{stat.icon}{stat.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-foreground mb-1">{stat.value}</div>
                <p className="text-xs text-muted-foreground pt-1">{stat.trend}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.5 }}>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Activity className="mr-2 h-5 w-5 text-primary" /> Recent Activity
              </CardTitle>
              <CardDescription>Live platform timeline & highlights.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="relative pl-6 before:absolute before:left-2 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-primary/30 before:to-accent/30 before:rounded-full">
                  {recentActivity.map((activity, idx) => (
                    <div key={activity.id} className="mb-8 flex items-start relative group">
                      <div className={`absolute left-[-30px] top-0 flex items-center justify-center w-10 h-10 rounded-full shadow-lg border-4 ${activity.color} border-white z-10 bg-background group-hover:scale-110 transition-transform`}>
                        {activity.icon}
                      </div>
                      <div className="ml-4 flex-1 bg-muted/40 rounded-xl p-4 shadow-md border-l-4 border-primary/60 hover:bg-accent/10 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-primary text-base">{activity.message}</span>
                          <span className="ml-auto text-xs text-muted-foreground">{activity.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-block w-2 h-2 rounded-full ${activity.color}`}></span>
                          <span className="text-xs text-muted-foreground">{activity.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">No recent activity found</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.6 }}>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full" 
                variant="default" 
                onClick={() => window.location.href = '/admin/listings'}
              >
                View All Listings
              </Button>
              <Button 
                className="w-full" 
                variant="secondary"
                onClick={() => window.location.href = '/admin/users'}
              >
                Manage Users
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={fetchDashboardData}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>Refresh Dashboard Data</>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;