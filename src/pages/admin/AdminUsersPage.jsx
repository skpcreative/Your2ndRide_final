import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; // Assuming Table is created
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'; // Assuming DropdownMenu is created
import { MoreHorizontal, UserPlus, Search, Edit3, Trash2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

// Mock user data
const initialUsers = [
  { id: 'usr_1', name: 'Alice Wonderland', email: 'alice@example.com', role: 'user', status: 'active', joinedDate: '2023-01-15' },
  { id: 'usr_2', name: 'Bob The Builder', email: 'bob@example.com', role: 'user', status: 'active', joinedDate: '2023-02-20' },
  { id: 'usr_3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'admin', status: 'active', joinedDate: '2022-12-01' },
  { id: 'usr_4', name: 'Diana Prince', email: 'diana@example.com', role: 'user', status: 'banned', joinedDate: '2023-03-10' },
  { id: 'usr_5', name: 'Edward Scissorhands', email: 'edward@example.com', role: 'user', status: 'active', joinedDate: '2023-04-05' },
];

const AdminUsersPage = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  // Add state for modals: addUserModal, editUserModal, etc.

  useEffect(() => {
    // Load users from localStorage or API
    const storedUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const combinedUsers = [...initialUsers.filter(iu => !storedUsers.find(su => su.email === iu.email)), ...storedUsers.map(su => ({...su, id: su.email, status: 'active', joinedDate: new Date().toISOString().split('T')[0] }))]; // simple merge
    setUsers(combinedUsers);
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBanUser = (userId) => {
    setUsers(users.map(user => user.id === userId ? { ...user, status: user.status === 'active' ? 'banned' : 'active' } : user));
    const userToUpdate = users.find(u => u.id === userId);
    toast({ title: `User ${userToUpdate.status === 'active' ? 'Unbanned' : 'Banned'}`, description: `${userToUpdate.name} has been ${userToUpdate.status === 'active' ? 'unbanned' : 'banned'}.` });
  };

  const handleDeleteUser = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
    const deletedUser = users.find(u => u.id === userId);
    toast({ title: "User Deleted", description: `${deletedUser.name} has been removed.`, variant: "destructive" });
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
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">Manage Users</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search users..." 
              className="pl-10 w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
            <UserPlus className="mr-2 h-5 w-5" /> Add New User
          </Button>
        </div>
      </div>

      <Card className="shadow-xl border-primary/10">
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>A list of all registered users in the platform.</CardDescription>
        </CardHeader>
        <CardContent>
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
              {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell><span className={`px-2 py-1 text-xs rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{user.role}</span></TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(user.joinedDate).toLocaleDateString()}</TableCell>
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
                        <DropdownMenuItem>
                          <Edit3 className="mr-2 h-4 w-4" /> Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBanUser(user.id)}>
                          {user.status === 'active' ? <ShieldAlert className="mr-2 h-4 w-4 text-yellow-600" /> : <ShieldCheck className="mr-2 h-4 w-4 text-green-600" />}
                          {user.status === 'active' ? 'Ban User' : 'Unban User'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    No users found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Modals for Add/Edit User would go here */}
    </motion.div>
  );
};

export default AdminUsersPage;