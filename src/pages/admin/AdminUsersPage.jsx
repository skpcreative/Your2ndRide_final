import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, UserPlus, Search, Edit3, ShieldAlert, ShieldCheck, RefreshCw, User as UserIcon, Crown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const AdminUsersPage = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const PAGE_SIZE = 20;

  // Function to fetch users from Supabase
  const fetchUsers = async (pageNum = 1) => {
    try {
      setIsLoading(true);
      // Get total count
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      setTotalUsers(count || 0);
      // Fetch paginated users
      const from = (pageNum - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .range(from, to)
        .order('updated_at', { ascending: false });
      if (profilesError) {
        toast({
          title: 'Error',
          description: 'Failed to load user profiles. Please try again.',
          variant: 'destructive',
        });
        return;
      }
      // Transform data to match our UI needs
      const formattedUsers = profiles.map(profile => {
        const email = profile.email || `user-${profile.id.substring(0, 6)}@example.com`;
        return {
          id: profile.id,
          name: profile.full_name || profile.username || email.split('@')[0],
          email: email,
          role: profile.role || 'user',
          status: profile.banned ? 'banned' : 'active',
          joinedDate: new Date(profile.updated_at || Date.now()).toLocaleDateString(),
          avatar_url: profile.avatar_url || '',
        };
      });
      setUsers(formattedUsers);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while loading users.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchUsers(page);
    const subscription = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchUsers(page);
      })
      .subscribe();
    return () => {
      subscription?.unsubscribe();
    };
  }, [page]);

  const filteredUsers = users.filter(user =>
    (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleToggleUserStatus = async (userId) => {
    try {
      const userToUpdate = users.find(u => u.id === userId);
      if (!userToUpdate) return;
      const newStatus = userToUpdate.status === 'active' ? 'banned' : 'active';
      const { error } = await supabase
        .from('profiles')
        .update({ banned: newStatus === 'banned' })
        .eq('id', userId);
      if (error) {
        toast({
          title: 'Error',
          description: `Failed to update user status: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: `User ${newStatus === 'active' ? 'Unbanned' : 'Banned'}`,
        description: `${userToUpdate.name || userToUpdate.email} has been ${newStatus === 'active' ? 'unbanned' : 'banned'}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const userToUpdate = users.find(u => u.id === userId);
      if (!userToUpdate) return;
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      if (error) {
        toast({
          title: 'Error',
          description: `Failed to update user role: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: 'Role Updated',
        description: `${userToUpdate.name || userToUpdate.email} is now a ${newRole}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      className="space-y-8 px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">Manage Users</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
          <div className="flex flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={fetchUsers}
              disabled={isLoading}
              className="w-full sm:w-auto"
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
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>
      </div>
      <div className="w-full">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <RefreshCw className="h-12 w-12 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading users...</span>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="flex flex-col gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="rounded-lg shadow border flex flex-row items-center gap-4 p-4 bg-white hover:shadow-lg transition-all">
                <Avatar className="h-10 w-10">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="object-cover w-full h-full rounded-full" />
                  ) : (
                    <AvatarFallback className="bg-muted text-base">
                      {user.name?.[0]?.toUpperCase() || <UserIcon />}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base text-primary truncate">{user.name}</span>
                    {user.role === 'admin' && <Crown className="h-4 w-4 text-amber-500" title="Admin" />}
                  </div>
                  <span className="text-xs text-muted-foreground break-all">{user.email}</span>
                  <div className="flex gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>{user.role}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.status}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8 p-0 border border-muted hover:bg-accent">
                        <span className="sr-only">Open actions</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleToggleUserStatus(user.id)}>
                        {user.status === 'active' ? (
                          <><ShieldAlert className="mr-2 h-4 w-4 text-destructive" /> Ban User</>
                        ) : (
                          <><ShieldCheck className="mr-2 h-4 w-4 text-green-500" /> Unban User</>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleUpdateUserRole(user.id, user.role === 'admin' ? 'user' : 'admin')}
                        className={user.role === 'admin' ? 'text-amber-500' : 'text-blue-500'}
                      >
                        {user.role === 'admin' ? (
                          <><Crown className="mr-2 h-4 w-4 text-amber-500" /> Remove Admin</>
                        ) : (
                          <><Crown className="mr-2 h-4 w-4 text-blue-500" /> Make Admin</>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))}
            <div className="flex justify-between items-center mt-6">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {Math.ceil(totalUsers / PAGE_SIZE)}
              </span>
              <Button
                variant="outline"
                disabled={page * PAGE_SIZE >= totalUsers}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <p>No users found matching your search.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminUsersPage;