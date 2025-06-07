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
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+91 ');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePhone = (phone) => /^\+?\d{10,15}$/.test(phone.replace(/\s/g, ''));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Name required", description: "Please enter your full name.", variant: "destructive" });
      return;
    }
    if (!validateEmail(email)) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match!",
        description: "Please ensure your passwords are the same.",
        variant: "destructive",
      });
      return;
    }
    if (!validatePhone(phoneNumber)) {
      toast({ title: "Invalid Phone Number", description: "Please enter a valid phone number (10-15 digits, with or without +).", variant: "destructive" });
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
            phone_number: phoneNumber,
            role: 'user',
          }
        }
      });

      if (error) {
        throw error;
      }
      
      if (data.user && data.session) {
        localStorage.setItem('userToken', data.session.access_token);
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: data.user.email,
          full_name: name,
          phone_number: phoneNumber,
          role: 'user',
        });
        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: name || email.split('@')[0],
          phone_number: phoneNumber,
          role: data.user.user_metadata?.role || 'user',
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        window.dispatchEvent(new Event('storage'));
        toast({ title: "Account Created! 🎉", description: "Welcome to Your2ndRide! You are now logged in." });
        navigate('/');
      } else if (data.session === null && !data.user) {
         toast({ title: "Confirmation Email Sent!", description: "Please check your email to confirm your account." });
         navigate('/login');
      } else {
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
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4 py-24">
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
                  className="text-base py-3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="e.g. +91 1234567890"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
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
    <Footer />
    </>
  );
};

export default SignUpPage;
