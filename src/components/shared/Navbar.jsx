import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Car, Menu, X, LogOut, UserCircle, Heart, ShoppingCart, User, Settings, Shield, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { siteSettings } = useSiteSettings();
  
  // Auth state management
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check authentication status and admin role from profiles table
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('userToken');
      const userData = localStorage.getItem('userData');
      
      setIsAuthenticated(!!token);
      
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          
          // Check admin status from profiles table in Supabase
          if (parsedUser?.id) {
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', parsedUser.id)
              .single();
            
            if (error) {
              console.error('Error fetching user profile:', error);
            } else if (profileData) {
              // Set admin status based on role in profiles table
              setIsAdmin(profileData.role === 'admin');
            }
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          setUser(null);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    };
    
    // Initial check
    checkAuth();
    
    // Setup event listener for storage changes
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        toast({ title: "Error", description: "Failed to sign out. Please try again.", variant: "destructive" });
        return;
      }
      
      // Clear local storage
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      
      // Update state
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      
      // Show success message
      toast({ title: "Success", description: "Logged out successfully!" });
      
      // Force a complete page reload and redirect to home
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      toast({ title: "Error", description: "An unexpected error occurred during logout.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/buy', label: 'Buy' },
    { href: '/sell', label: 'Sell' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
  ];

  const mobileMenuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  return (
    <nav className="bg-background/80 backdrop-blur-md shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
            {siteSettings.logo_url ? (
              <img src={siteSettings.logo_url} alt="Your2ndRide Logo" className="h-10 w-auto" />
            ) : (
              <>
                <Car className="h-8 w-8" />
                <span className="text-2xl font-bold">Your<span className="text-accent">2nd</span>Ride</span>
              </>
            )}
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" className="text-foreground hover:text-primary transition-colors font-medium">
                Admin
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="icon" onClick={() => navigate('/wishlist')} aria-label="Wishlist">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => navigate('/cart')} aria-label="Cart">
                  <ShoppingCart className="h-5 w-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <UserCircle className="h-6 w-6" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/wishlist')}>
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Wishlist</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/chat')}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>Messages</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
                <Button onClick={() => navigate('/signup')} className="bg-gradient-to-r from-primary to-accent text-primary-foreground">Sign Up</Button>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle mobile menu">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="md:hidden absolute top-20 left-0 right-0 bg-background/95 backdrop-blur-sm shadow-lg pb-4 z-40"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="px-5 pt-2 pb-3 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link 
                  to="/admin" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Admin Dashboard
                </Link>
              )}
            </div>
            <div className="pt-4 pb-3 border-t border-border px-5 space-y-3">
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/profile'); setIsMobileMenuOpen(false); }}>
                    <User className="mr-2 h-5 w-5" /> My Profile
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/wishlist'); setIsMobileMenuOpen(false); }}>
                    <Heart className="mr-2 h-5 w-5" /> Wishlist
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/chat'); setIsMobileMenuOpen(false); }}>
                    <MessageSquare className="mr-2 h-5 w-5" /> Messages
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/cart'); setIsMobileMenuOpen(false); }}>
                    <ShoppingCart className="mr-2 h-5 w-5" /> Cart
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/settings'); setIsMobileMenuOpen(false); }}>
                    <Settings className="mr-2 h-5 w-5" /> Settings
                  </Button>
                  {isAdmin && (
                    <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/admin'); setIsMobileMenuOpen(false); }}>
                      <Shield className="mr-2 h-5 w-5" /> Admin Dashboard
                    </Button>
                  )}
                  <Button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    <LogOut className="mr-2 h-5 w-5" /> Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full" onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}>Login</Button>
                  <Button className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground" onClick={() => { navigate('/signup'); setIsMobileMenuOpen(false); }}>Sign Up</Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;