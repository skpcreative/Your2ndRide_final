import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, ListChecks, FileWarning, DollarSign, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboardPage = () => {
  const stats = [
    { title: "Total Users", value: "1,234", icon: <Users className="h-6 w-6 text-blue-500" />, trend: "+5% this month" },
    { title: "Active Listings", value: "567", icon: <ListChecks className="h-6 w-6 text-green-500" />, trend: "+12 listings today" },
    { title: "Pending Verifications", value: "23", icon: <FileWarning className="h-6 w-6 text-yellow-500" />, trend: "3 new" },
    { title: "Total Sales (Month)", value: "$125,670", icon: <DollarSign className="h-6 w-6 text-purple-500" />, trend: "+8.2%" },
  ];

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <div className="space-y-8">
      <motion.h1 
        className="text-3xl md:text-4xl font-bold text-primary"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        Admin Dashboard
      </motion.h1>

      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {stats.map((stat, index) => (
          <motion.div key={index} variants={fadeIn}>
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground pt-1">{stat.trend}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.5 }}>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Activity className="mr-2 h-5 w-5 text-primary" /> Recent Activity
              </CardTitle>
              <CardDescription>Overview of recent platform activities.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Placeholder for recent activity feed */}
              <ul className="space-y-3 text-sm">
                <li className="flex items-center"><span className="bg-green-500 w-2 h-2 rounded-full mr-2"></span> New user 'JohnB' registered.</li>
                <li className="flex items-center"><span className="bg-blue-500 w-2 h-2 rounded-full mr-2"></span> Listing 'Honda Civic 2019' approved.</li>
                <li className="flex items-center"><span className="bg-yellow-500 w-2 h-2 rounded-full mr-2"></span> Report received for listing 'Old Truck'.</li>
                <li className="flex items-center"><span className="bg-purple-500 w-2 h-2 rounded-full mr-2"></span> User 'SellerPro' updated their profile.</li>
              </ul>
              <p className="mt-4 text-center text-muted-foreground italic">(Real-time activity feed coming soon)</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.6 }}>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Placeholder for quick actions - use Button component */}
              <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md transition-colors">View Pending Listings</button>
              <button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 px-4 py-2 rounded-md transition-colors">Manage User Reports</button>
              <button className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-md transition-colors">Broadcast Notification</button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;