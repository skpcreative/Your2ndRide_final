import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { AlertTriangle, Home } from 'lucide-react';

const NotFoundPage = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: 0.2, type: "spring", stiffness: 120 } }
  };
  
  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center text-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <AlertTriangle className="h-24 w-24 md:h-32 md:w-32 text-destructive mx-auto mb-8 animate-pulse" />
      </motion.div>
      
      <motion.h1 
        className="text-5xl md:text-7xl font-extrabold text-primary mb-4"
        variants={itemVariants}
        style={{ transitionDelay: '0.3s' }}
      >
        404
      </motion.h1>
      
      <motion.p 
        className="text-xl md:text-2xl font-semibold text-foreground mb-3"
        variants={itemVariants}
        style={{ transitionDelay: '0.4s' }}
      >
        Oops! Page Not Found
      </motion.p>
      
      <motion.p 
        className="text-md md:text-lg text-muted-foreground max-w-md mx-auto mb-10"
        variants={itemVariants}
        style={{ transitionDelay: '0.5s' }}
      >
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </motion.p>
      
      <motion.div 
        variants={itemVariants}
        style={{ transitionDelay: '0.6s' }}
      >
        <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg transform hover:scale-105 transition-transform duration-300">
          <Link to="/">
            <Home className="mr-2 h-5 w-5" /> Go Back to Homepage
          </Link>
        </Button>
      </motion.div>
      <motion.div 
        className="mt-12"
        variants={itemVariants}
        style={{ transitionDelay: '0.7s' }}
      >
        <img  
          className="w-64 h-auto mx-auto opacity-80" 
          alt="Lost car in a desert illustration"
         src="https://images.unsplash.com/photo-1657725279580-ab9372166a45" />
      </motion.div>
    </motion.div>
  );
};

export default NotFoundPage;