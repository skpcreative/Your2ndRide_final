import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { LogIn, Car } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    if (!password || password.length < 6) {
      toast({ title: "Invalid Password", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Store user token and data in localStorage
        localStorage.setItem('userToken', data.session.access_token);
        
        // Create a user data object with necessary information
        const userData = {
          id: data.user.id,
          email: data.user.email,
          role: data.user.user_metadata?.role || 'user',
          name: data.user.user_metadata?.full_name || email.split('@')[0],
        };
        
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Dispatch storage event to notify other components
        window.dispatchEvent(new Event('storage'));
        
        toast({
          title: "Login Successful",
          description: "Welcome back to Your2ndRide!",
        });
        
        // Redirect to the page the user was trying to access, or home if none
        navigate(from);
      } else {
         toast({
          title: "Login Failed",
          description: "No user data received. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.error_description || error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4 py-24">
      <motion.div variants={cardVariants} initial="hidden" animate="visible">
        <Card className="w-full max-w-md shadow-2xl border-primary/20">
          <CardHeader className="text-center">
            <Link to="/" className="inline-block mb-4">
              <Car className="h-12 w-12 mx-auto text-primary" />
            </Link>
            <CardTitle className="text-3xl font-bold text-primary">Welcome Back!</CardTitle>
            <CardDescription className="text-muted-foreground">Log in to Your2ndRide to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-base py-3"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" 
                        className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="text-base py-3"
                />
              </div>
              <Button type="submit" className="w-full text-lg py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground" disabled={isLoading}>
                {isLoading ? 'Logging in...' : (<><LogIn className="mr-2 h-5 w-5" /> Log In</>)}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-primary hover:underline">
                Sign up here
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
    <Footer />
    </>
  );
};

export default LoginPage;
