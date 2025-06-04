import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Car, LayoutDashboard, Users, ListChecks, FileWarning, Settings, LogOut, Menu, X, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: ListChecks, label: 'Listings', path: '/admin/listings' },
    { icon: FileWarning, label: 'Reports', path: '/admin/reports' },
    { icon: Settings, label: 'Site Settings', path: '/admin/settings' },
  ];
  
  const sidebarVariants = {
    open: { width: "280px", transition: { type: "spring", stiffness: 100, damping: 20 } },
    closed: { width: "80px", transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  const mobileSidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  const NavLinkContent = ({ item, isOpen }) => (
    <>
      <item.icon className={`h-6 w-6 ${isOpen ? 'mr-3' : 'mx-auto'}`} />
      <AnimatePresence>
        {isOpen && (
          <motion.span 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="truncate"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </>
  );

  const SidebarContent = ({ mobile = false }) => (
    <motion.div
      className={`${mobile ? 'fixed lg:hidden inset-y-0 left-0 z-50' : 'h-full'} flex flex-col justify-between bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 p-4 shadow-2xl`}
      variants={mobile ? mobileSidebarVariants : sidebarVariants}
      initial={mobile ? "closed" : (isSidebarOpen ? "open" : "closed")}
      animate={mobile ? (isSidebarOpen ? "open" : "closed") : (isSidebarOpen ? "open" : "closed")}
      key={mobile ? "mobile-sidebar" : "desktop-sidebar"}
      style={{ height: mobile ? '100vh' : '100%' }}
    >
      <div>
        <div className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'} mb-10 pt-3`}>
          {(isSidebarOpen || mobile) && (
            <Link to="/" className="flex items-center space-x-2 text-2xl font-bold">
              <Car className="h-8 w-8 text-accent" />
              <span>Your<span className="text-accent">2nd</span>Ride</span>
            </Link>
          )}
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hover:bg-slate-700 text-slate-300 hover:text-white">
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
        <nav className="space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              onClick={mobile ? () => setIsSidebarOpen(false) : undefined}
              className={`flex items-center py-3 px-4 rounded-lg transition-all duration-200 ease-in-out
                         hover:bg-accent hover:text-white group
                         ${window.location.pathname === item.path ? 'bg-accent text-white shadow-md' : 'text-slate-300 hover:bg-slate-700' }
                         ${!(isSidebarOpen || mobile) && 'justify-center'}`}
            >
              <NavLinkContent item={item} isOpen={isSidebarOpen || mobile} />
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto">
        <Link
          to="/"
          className={`flex items-center py-3 px-4 rounded-lg transition-colors duration-200 ease-in-out
                     text-slate-300 hover:bg-slate-700 hover:text-white group
                     ${!(isSidebarOpen || mobile) && 'justify-center'}`}
        >
          <Home className={`h-6 w-6 ${(isSidebarOpen || mobile) ? 'mr-3' : 'mx-auto'}`} />
          {(isSidebarOpen || mobile) && <motion.span initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>Back to Site</motion.span>}
        </Link>
        <Button onClick={handleLogout} variant="ghost" className={`w-full flex items-center py-3 px-4 mt-2 rounded-lg transition-colors duration-200 ease-in-out text-red-400 hover:bg-red-500 hover:text-white group ${!(isSidebarOpen || mobile) && 'justify-center'}`}>
          <LogOut className={`h-6 w-6 ${(isSidebarOpen || mobile) ? 'mr-3' : 'mx-auto'}`} />
          {(isSidebarOpen || mobile) && <motion.span initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>Logout</motion.span>}
        </Button>
      </div>
    </motion.div>
  );


  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Desktop Sidebar - Fixed width, no margin issues */}
      <div className="hidden lg:block w-auto">
        <SidebarContent />
      </div>
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)} 
          />
        )}
      </AnimatePresence>
      
      {/* Mobile Sidebar */}
      <SidebarContent mobile={true} />
      
      {/* Main Content - Takes remaining space with no margin */}
      <main className="flex-1 p-6 md:p-10 overflow-auto">
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden mb-4 hover:bg-slate-200">
          <Menu className="h-6 w-6" />
        </Button>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;