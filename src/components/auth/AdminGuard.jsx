import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

/**
 * AdminGuard component to protect routes that require admin privileges
 * Redirects to home if user is not authenticated or not an admin
 */
const AdminGuard = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setIsLoading(true);
        
        // First check if we have a valid session
        const { data } = await supabase.auth.getSession();
        const session = data?.session;
        
        if (!session) {
          setIsAdmin(false);
          setIsLoading(false);
          toast({ 
            title: "Access Denied", 
            description: "You must be logged in to access the admin area.", 
            variant: "destructive" 
          });
          return;
        }
        
        // Check if user has admin role in profiles table
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user profile:', error);
          setIsAdmin(false);
          toast({ 
            title: "Error", 
            description: "Failed to verify admin privileges.", 
            variant: "destructive" 
          });
        } else if (profileData && profileData.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          toast({ 
            title: "Access Denied", 
            description: "You don't have permission to access the admin area.", 
            variant: "destructive" 
          });
        }
      } catch (error) {
        console.error('Admin check error:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [toast]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If admin, render the children
  if (isAdmin) {
    return children;
  }

  // If not admin, redirect to home
  return <Navigate to="/" replace />;
};

export default AdminGuard;
