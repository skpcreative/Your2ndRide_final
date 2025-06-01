import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const ContactPage = () => {
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic (e.g., send to an API or email service)
    // For now, just show a toast notification and clear form (if needed)
    toast({
      title: "Message Sent! 🚀",
      description: "Thanks for reaching out! We'll get back to you as soon as possible.",
    });
    e.target.reset(); // Reset form fields
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };
  
  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.2 } }
  };

  // Placeholder contact details (can be made dynamic from admin settings later)
  const contactDetails = {
    email: "support@your2ndride.com",
    phone: "+1 (555) RIDE-NOW",
    address: "123 Auto Lane, Carville, CA 90210"
  };

  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <motion.section 
        className="py-20 md:py-32 bg-gradient-brand text-primary-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            Get In Touch
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl max-w-2xl mx-auto"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            style={{ transitionDelay: '0.2s' }}
          >
            We're here to help! Whether you have a question about a listing, need support, or just want to say hi, feel free to reach out.
          </motion.p>
        </div>
      </motion.section>

      {/* Contact Form and Info Section */}
      <motion.section 
        className="py-16 md:py-24"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Contact Form */}
            <motion.div variants={fadeIn} className="bg-card p-6 sm:p-8 rounded-xl shadow-2xl border">
              <h2 className="text-3xl font-bold text-primary mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-lg">Full Name</Label>
                  <Input type="text" id="name" name="name" required className="mt-1 text-base py-3" placeholder="John Doe"/>
                </div>
                <div>
                  <Label htmlFor="email" className="text-lg">Email Address</Label>
                  <Input type="email" id="email" name="email" required className="mt-1 text-base py-3" placeholder="you@example.com"/>
                </div>
                <div>
                  <Label htmlFor="subject" className="text-lg">Subject</Label>
                  <Input type="text" id="subject" name="subject" required className="mt-1 text-base py-3" placeholder="e.g., Question about listing #123"/>
                </div>
                <div>
                  <Label htmlFor="message" className="text-lg">Message</Label>
                  <Textarea id="message" name="message" rows={5} required className="mt-1 text-base" placeholder="Your message here..."/>
                </div>
                <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-lg py-3">
                  Send Message <Send className="ml-2 h-5 w-5"/>
                </Button>
              </form>
            </motion.div>

            {/* Contact Information */}
            <motion.div variants={fadeIn} className="space-y-8">
              <h2 className="text-3xl font-bold text-primary mb-6">Contact Information</h2>
              <p className="text-lg text-muted-foreground">
                You can also reach us through the following channels. We aim to respond to all inquiries within 24 business hours.
              </p>
              <div className="space-y-6">
                <motion.div variants={fadeIn} className="flex items-start space-x-4 p-4 bg-card rounded-lg shadow-md border hover:shadow-lg transition-shadow">
                  <Mail size={32} className="text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">Email Us</h3>
                    <a href={`mailto:${contactDetails.email}`} className="text-lg text-muted-foreground hover:text-primary transition-colors break-all">{contactDetails.email}</a>
                  </div>
                </motion.div>
                <motion.div variants={fadeIn} className="flex items-start space-x-4 p-4 bg-card rounded-lg shadow-md border hover:shadow-lg transition-shadow">
                  <Phone size={32} className="text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">Call Us</h3>
                    <a href={`tel:${contactDetails.phone.replace(/\s+/g, '')}`} className="text-lg text-muted-foreground hover:text-primary transition-colors">{contactDetails.phone}</a>
                    <p className="text-sm text-muted-foreground/80">(Mon-Fri, 9am - 5pm PST)</p>
                  </div>
                </motion.div>
                <motion.div variants={fadeIn} className="flex items-start space-x-4 p-4 bg-card rounded-lg shadow-md border hover:shadow-lg transition-shadow">
                  <MapPin size={32} className="text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">Visit Us (By Appointment)</h3>
                    <p className="text-lg text-muted-foreground">{contactDetails.address}</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* FAQ Link Section - Placeholder */}
      <motion.section className="py-16 md:py-24 bg-muted/50" variants={fadeIn} initial="hidden" animate="visible">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary mb-6">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Have a common question? Check out our FAQ page for quick answers.
          </p>
          {/* Button component should be imported if used */}
          {/* <Button size="lg" variant="outline" className="text-lg py-3">Visit FAQ Page</Button> */}
          <a href="/faq" className="inline-block px-8 py-3 text-lg font-semibold rounded-md border-2 border-primary text-primary hover:bg-primary/10 transition-colors">Visit FAQ Page</a>
        </div>
      </motion.section>
    </div>
  );
};

export default ContactPage;