import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { createContext, useContext } from 'react';

// Create a context to share authentication state across components
export const AuthContext = createContext({
  isAuthenticated: null,
  user: null,
  checkAuth: async () => {}
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

/**
 * AuthGuard component to protect routes that require authentication
 * Redirects to login if user is not authenticated
 */
const AuthGuard = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default to true to prevent flashing
  const [user, setUser] = useState(null);
  const { toast } = useToast();
  const location = useLocation();

  const checkAuth = async () => {
    try {
      // Try to get the session from Supabase
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      
      // If we have a valid session
      if (session) {
        // Update localStorage with session data
        localStorage.setItem('userToken', session.access_token);
        
        const userData = {
          id: session.user.id,
          email: session.user.email,
          role: session.user.user_metadata?.role || 'user',
          name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
        };
        
        setUser(userData);
        localStorage.setItem('userData', JSON.stringify(userData));
        setIsAuthenticated(true);
        return true;
      }
      
      // Check localStorage as fallback
      const userToken = localStorage.getItem('userToken');
      const userDataStr = localStorage.getItem('userData');
      
      if (userToken && userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          setUser(userData);
          setIsAuthenticated(true);
          return true;
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
      
      // If we reach here, user is not authenticated
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  };
  
  useEffect(() => {
    // Check authentication status
    const initAuth = async () => {
      const isAuth = await checkAuth();
      
      // Only show toast if not authenticated and not on login page
      if (!isAuth && !location.pathname.includes('/login')) {
        toast({ 
          title: "Authentication Required", 
          description: "Please log in to access this page.", 
          variant: "destructive" 
        });
      }
    };
    
    initAuth();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_IN') {
        await checkAuth();
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        
        // Force reload the page on sign out
        window.location.href = '/';
      }
    });
    
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [toast, location.pathname]);

  // Provide auth context to children
  const contextValue = {
    isAuthenticated,
    user,
    checkAuth
  };

  // If authenticated, render the children
  if (isAuthenticated) {
    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
  }

  // If not authenticated, redirect to login with return URL
  return <Navigate to="/login" state={{ from: location.pathname }} replace />;
};

export default AuthGuard;
