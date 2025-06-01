
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { UserPlus, Car } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match!",
        description: "Please ensure your passwords are the same.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: name,
            role: 'user', // Default role
          }
        }
      });

      if (error) {
        throw error;
      }
      
      // Supabase signUp automatically signs in the user if email confirmation is not required.
      // If email confirmation is required, data.user will be null initially until confirmed.
      if (data.user) {
        toast({ title: "Account Created! 🎉", description: "Welcome to Your2ndRide! You are now logged in." });
        navigate('/');
      } else if (data.session === null && !data.user) {
         toast({ title: "Confirmation Email Sent!", description: "Please check your email to confirm your account." });
         navigate('/login'); // Redirect to login, user can login after confirmation
      } else {
        // Fallback for unexpected response
        toast({ title: "Signup Successful", description: "Please check your email for a confirmation link if required, then log in." });
        navigate('/login');
      }

    } catch (error) {
      toast({
        title: "Signup Failed",
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <motion.div variants={cardVariants} initial="hidden" animate="visible">
        <Card className="w-full max-w-md shadow-2xl border-primary/20">
          <CardHeader className="text-center">
             <Link to="/" className="inline-block mb-4">
              <Car className="h-12 w-12 mx-auto text-primary" />
            </Link>
            <CardTitle className="text-3xl font-bold text-primary">Create Your Account</CardTitle>
            <CardDescription className="text-muted-foreground">Join Your2ndRide today and find your perfect vehicle!</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="text-base py-3"
                />
              </div>
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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="•••••••• (min. 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="text-base py-3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="text-base py-3"
                />
              </div>
              <Button type="submit" className="w-full text-lg py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : (<><UserPlus className="mr-2 h-5 w-5" /> Sign Up</>)}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Log in here
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
