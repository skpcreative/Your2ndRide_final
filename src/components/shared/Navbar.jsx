import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Car, Menu, X, LogOut, UserCircle, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  // Mock auth status - replace with actual context/state
  const isAuthenticated = !!localStorage.getItem('userToken');
  const user = JSON.parse(localStorage.getItem('userData'));
  const isAdmin = isAuthenticated && user?.role === 'admin';

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    // Potentially redirect or refresh state
    navigate('/'); 
    // You might want to use a toast notification here
    // toast({ title: "Logged out successfully!" });
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
            <Car className="h-8 w-8" />
            <span className="text-2xl font-bold">Your<span className="text-accent">2nd</span>Ride</span>
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
                  <UserCircle className="h-6 w-6" />
                </Button>
                <Button onClick={handleLogout} variant="outline">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
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
                  <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/wishlist'); setIsMobileMenuOpen(false); }}>
                    <UserCircle className="mr-2 h-5 w-5" /> My Profile / Wishlist
                  </Button>
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