import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Eye, ShieldCheck, HeartHandshake as Handshake } from 'lucide-react';

const AboutPage = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      }
    }
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
            About Your<span className="text-yellow-300">2nd</span>Ride
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl max-w-2xl mx-auto"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            style={{ transitionDelay: '0.2s' }}
          >
            Revolutionizing the way you buy and sell pre-owned vehicles. We're passionate about cars and even more passionate about connecting people.
          </motion.p>
        </div>
      </motion.section>

      {/* Our Story Section */}
      <motion.section 
        className="py-16 md:py-24"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeIn}>
              <img  
                className="rounded-xl shadow-2xl w-full h-auto object-cover aspect-video" 
                alt="Team working collaboratively in a modern office"
               src="https://images.unsplash.com/photo-1603201667141-5a2d4c673378" />
            </motion.div>
            <motion.div variants={fadeIn}>
              <h2 className="text-3xl font-bold text-primary mb-6">Our Story</h2>
              <p className="text-lg text-muted-foreground mb-4">
                Founded in <span className="text-accent font-semibold">2024</span>, Your2ndRide was born from a simple idea: to make the experience of buying and selling used cars more transparent, trustworthy, and enjoyable for everyone. We saw the frustrations people faced – opaque pricing, untrustworthy sellers, and complicated processes – and knew there had to be a better way.
              </p>
              <p className="text-lg text-muted-foreground">
                We're a team of car enthusiasts, tech innovators, and customer service fanatics dedicated to building a platform that puts you, the user, first.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Mission, Vision, Values Section */}
      <motion.section className="py-16 md:py-24 bg-muted/50" variants={staggerContainer} initial="hidden" animate="visible">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <motion.div variants={fadeIn} className="p-6 bg-card rounded-lg shadow-lg">
              <Target size={48} className="mx-auto mb-4 text-accent" />
              <h3 className="text-2xl font-semibold mb-2 text-foreground">Our Mission</h3>
              <p className="text-muted-foreground">To empower individuals with a seamless and secure platform for buying and selling pre-owned vehicles, fostering a community built on trust and transparency.</p>
            </motion.div>
            <motion.div variants={fadeIn} className="p-6 bg-card rounded-lg shadow-lg">
              <Eye size={48} className="mx-auto mb-4 text-accent" />
              <h3 className="text-2xl font-semibold mb-2 text-foreground">Our Vision</h3>
              <p className="text-muted-foreground">To be the most trusted and user-friendly online marketplace for pre-owned vehicles, recognized for innovation, integrity, and exceptional customer experiences.</p>
            </motion.div>
            <motion.div variants={fadeIn} className="p-6 bg-card rounded-lg shadow-lg">
              <Handshake size={48} className="mx-auto mb-4 text-accent" />
              <h3 className="text-2xl font-semibold mb-2 text-foreground">Our Values</h3>
              <ul className="text-muted-foreground list-none space-y-1">
                <li><ShieldCheck className="inline mr-2 h-4 w-4 text-green-500"/>Integrity & Trust</li>
                <li><Users className="inline mr-2 h-4 w-4 text-blue-500"/>Customer Centricity</li>
                <li>Innovation & Excellence</li>
                <li>Community & Collaboration</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Meet The Team Section - Placeholder */}
      <motion.section className="py-16 md:py-24" variants={fadeIn} initial="hidden" animate="visible">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary mb-12">Meet The (Awesome) Team</h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            (Team member profiles coming soon! We're busy making Your2ndRide amazing for you.)
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Placeholder Team Member Cards */}
            {[1, 2, 3, 4].map(i => (
              <motion.div key={i} variants={fadeIn} className="text-center">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-primary to-accent rounded-full mx-auto mb-4 shadow-lg flex items-center justify-center">
                   <Users size={48} className="text-primary-foreground opacity-70" />
                </div>
                <h4 className="text-xl font-semibold text-foreground">Team Member {i}</h4>
                <p className="text-sm text-accent">Role/Title</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section className="py-16 md:py-24 bg-gradient-brand text-primary-foreground" variants={fadeIn} initial="hidden" animate="visible">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Join the Your2ndRide Community!</h2>
          <p className="text-lg mb-8 max-w-xl mx-auto">
            Ready to experience a better way to buy or sell your next vehicle? Get started today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Button component should be imported if used */}
            {/* <Button size="lg" className="bg-white text-primary hover:bg-gray-100">Browse Vehicles</Button> */}
            {/* <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">Sell Your Car</Button> */}
            <a href="/buy" className="inline-block px-8 py-3 text-lg font-semibold rounded-md bg-white text-primary hover:bg-gray-100 transition-colors">Browse Vehicles</a>
            <a href="/sell" className="inline-block px-8 py-3 text-lg font-semibold rounded-md border-2 border-white text-white hover:bg-white/10 transition-colors">Sell Your Car</a>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default AboutPage;