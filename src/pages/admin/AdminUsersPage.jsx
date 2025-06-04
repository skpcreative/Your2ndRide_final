import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, UserPlus, Search, Edit3, Trash2, ShieldAlert, ShieldCheck, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

const AdminUsersPage = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Function to fetch users from Supabase
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Get the current user's email to demonstrate we can access it
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      console.log('Current user:', currentUser);
      
      // Create a map with just the current user's email
      // In a real app with proper admin permissions, you could get all users
      const emailMap = {};
      if (currentUser) {
        emailMap[currentUser.id] = currentUser.email;
      }
      
      // Get all users from profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        toast({
          title: "Error",
          description: "Failed to load user profiles. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      // Transform data to match our UI needs
      const formattedUsers = profiles.map(profile => {
        // Get email from our map or use a placeholder
        const email = emailMap[profile.id] || `user-${profile.id.substring(0, 6)}@example.com`;
        
        return {
          id: profile.id,
          name: profile.full_name || profile.username || email.split('@')[0],
          email: email, // Real email from auth or placeholder
          role: profile.role || 'user',
          status: profile.banned ? 'banned' : 'active',
          joinedDate: new Date(profile.created_at || Date.now()).toLocaleDateString(),
        };
      });
      
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading users.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Set up real-time subscription
  useEffect(() => {
    fetchUsers();
    
    // Subscribe to changes in the profiles table
    const subscription = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        console.log('Profiles changed:', payload);
        fetchUsers();
      })
      .subscribe();
    
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const filteredUsers = users.filter(user =>
    (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleToggleUserStatus = async (userId) => {
    try {
      const userToUpdate = users.find(u => u.id === userId);
      if (!userToUpdate) return;
      
      const newStatus = userToUpdate.status === 'active' ? 'banned' : 'active';
      
      // Update in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ banned: newStatus === 'banned' })
        .eq('id', userId);
      
      if (error) {
        console.error('Error updating user status:', error);
        toast({
          title: "Error",
          description: `Failed to update user status: ${error.message}`,
          variant: "destructive"
        });
        return;
      }
      
      // Local state update will happen via the subscription
      toast({ 
        title: `User ${newStatus === 'active' ? 'Unbanned' : 'Banned'}`, 
        description: `${userToUpdate.name || userToUpdate.email} has been ${newStatus === 'active' ? 'unbanned' : 'banned'}.` 
      });
    } catch (error) {
      console.error('Error in handleToggleUserStatus:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const userToUpdate = users.find(u => u.id === userId);
      if (!userToUpdate) return;
      
      // Update in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) {
        console.error('Error updating user role:', error);
        toast({
          title: "Error",
          description: `Failed to update user role: ${error.message}`,
          variant: "destructive"
        });
        return;
      }
      
      // Local state update will happen via the subscription
      toast({ 
        title: "Role Updated", 
        description: `${userToUpdate.name || userToUpdate.email} is now a ${newRole}.` 
      });
    } catch (error) {
      console.error('Error in handleUpdateUserRole:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Manage Users</h1>
        <div className="flex gap-3">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={fetchUsers} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>A list of all registered users in the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <RefreshCw className="h-12 w-12 animate-spin text-primary" />
              <span className="ml-2 text-lg">Loading users...</span>
            </div>
          ) : filteredUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell>{user.joinedDate}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => toast({ title: "Edit User", description: "Edit user functionality coming soon." })}>Edit User <Edit3 className="ml-2 h-4 w-4" /></DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleUserStatus(user.id)}>
                            {user.status === 'active' ? 'Ban User' : 'Unban User'} 
                            {user.status === 'active' ? <ShieldAlert className="ml-2 h-4 w-4 text-destructive" /> : <ShieldCheck className="ml-2 h-4 w-4 text-green-500" />}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleUpdateUserRole(user.id, user.role === 'admin' ? 'user' : 'admin')}
                            className={user.role === 'admin' ? 'text-amber-500' : 'text-blue-500'}
                          >
                            {user.role === 'admin' ? 'Remove Admin Role' : 'Make Admin'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p>No users found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminUsersPage;