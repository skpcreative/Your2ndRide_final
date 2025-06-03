import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '../components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { 
  MessageSquare, 
  UserCircle,
  Search,
  Inbox,
  Clock,
  Car
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const ChatListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({ 
            title: 'Login Required', 
            description: 'Please sign in to view your messages.', 
            variant: 'destructive' 
          });
          navigate('/login', { state: { from: '/chat' } });
          return;
        }
        
        setCurrentUser(user);
        fetchConversations(user.id);
      } catch (error) {
        console.error('Auth check error:', error);
        toast({ 
          title: 'Error', 
          description: 'Authentication error. Please try again.', 
          variant: 'destructive' 
        });
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const fetchConversations = async (userId) => {
    setLoading(true);
    try {
      // Get all messages where the user is either sender or receiver
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false });
        
      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        toast({ 
          title: 'Error', 
          description: 'Could not load your messages.', 
          variant: 'destructive' 
        });
        setLoading(false);
        return;
      }
      
      // Get messages from local storage
      const localConversations = getLocalConversations();
      
      // Combine Supabase and local conversations
      const allMessages = [...messagesData, ...localConversations];
      
      // Group messages by conversation partner
      const conversationsMap = new Map();
      
      for (const message of allMessages) {
        const partnerId = message.sender_id === userId ? message.receiver_id : message.sender_id;
        
        if (!conversationsMap.has(partnerId)) {
          conversationsMap.set(partnerId, {
            partnerId,
            messages: [],
            unreadCount: 0,
            lastMessage: null,
            listingId: null
          });
        }
        
        const conversation = conversationsMap.get(partnerId);
        conversation.messages.push(message);
        
        // Update unread count if message is to current user and unread
        if (message.receiver_id === userId && !message.is_read) {
          conversation.unreadCount++;
        }
        
        // Update last message if this is newer
        if (!conversation.lastMessage || new Date(message.created_at) > new Date(conversation.lastMessage.created_at)) {
          conversation.lastMessage = message;
          // Keep track of listing ID if available
          if (message.listing_id) {
            conversation.listingId = message.listing_id;
          }
        }
      }
      
      // Convert map to array and sort by last message date
      let conversationsArray = Array.from(conversationsMap.values());
      conversationsArray.sort((a, b) => 
        new Date(b.lastMessage?.created_at || 0) - new Date(a.lastMessage?.created_at || 0)
      );
      
      // Fetch user profiles for all conversation partners
      const partnerIds = conversationsArray.map(conv => conv.partnerId);
      
      if (partnerIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', partnerIds);
          
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        } else {
          // Add profile info to conversations
          conversationsArray = conversationsArray.map(conv => {
            const profile = profilesData.find(p => p.id === conv.partnerId);
            return {
              ...conv,
              partnerProfile: profile || null
            };
          });
        }
      }
      
      // Fetch listing info for conversations with listing_id
      const listingIds = conversationsArray
        .filter(conv => conv.listingId)
        .map(conv => conv.listingId)
        .filter((value, index, self) => self.indexOf(value) === index); // Unique listing IDs
      
      if (listingIds.length > 0) {
        const { data: listingsData, error: listingsError } = await supabase
          .from('listings')
          .select('id, make, model, year, price')
          .in('id', listingIds);
          
        if (listingsError) {
          console.error('Error fetching listings:', listingsError);
        } else {
          // Add listing info to conversations
          conversationsArray = conversationsArray.map(conv => {
            if (!conv.listingId) return conv;
            
            const listing = listingsData.find(l => l.id === conv.listingId);
            if (!listing) return conv;
            
            return {
              ...conv,
              listing: {
                ...listing,
                name: `${listing.make || ''} ${listing.model || ''} ${listing.year || ''}`.trim() || 'Unnamed Vehicle',
                formattedPrice: listing.price ? `$${listing.price.toLocaleString()}` : 'Contact for price'
              }
            };
          });
        }
      }
      
      setConversations(conversationsArray);
    } catch (error) {
      console.error('Unexpected error fetching conversations:', error);
      toast({ 
        title: 'Error', 
        description: 'An unexpected error occurred.', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Get conversations from local storage
  const getLocalConversations = () => {
    try {
      const allMessages = [];
      
      // Check all local storage keys for chat messages
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('chat_messages_')) {
          const messages = JSON.parse(localStorage.getItem(key));
          if (Array.isArray(messages)) {
            allMessages.push(...messages);
          }
        }
      }
      
      return allMessages;
    } catch (error) {
      console.error('Error getting local conversations:', error);
      return [];
    }
  };

  // Format the date for display
  const formatLastMessageDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Get the preview text of the last message
  const getMessagePreview = (message) => {
    if (!message) return '';
    
    // Truncate message if it's too long
    const maxLength = 60;
    if (message.length <= maxLength) return message;
    
    return message.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Messages</h1>
        </div>
        
        {conversations.length === 0 ? (
          <Card className="shadow-md border-primary/10 text-center py-12">
            <CardContent className="flex flex-col items-center">
              <Inbox className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Messages Yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You don't have any messages yet. Start a conversation by viewing a vehicle listing and contacting the seller.
              </p>
              <Button asChild>
                <Link to="/buy">Browse Vehicles</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <Card 
                key={conversation.partnerId} 
                className="shadow-sm hover:shadow-md transition-shadow border-primary/10 cursor-pointer"
                onClick={() => navigate(`/chat/${conversation.partnerId}${conversation.listingId ? `?listingId=${conversation.listingId}` : ''}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="relative">
                      {conversation.partnerProfile?.avatar_url ? (
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={conversation.partnerProfile.avatar_url} alt={conversation.partnerProfile?.full_name || 'User'} />
                          <AvatarFallback>{conversation.partnerProfile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <UserCircle className="h-12 w-12 text-muted-foreground" />
                      )}
                      
                      {conversation.unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs min-w-[1.25rem] h-5 flex items-center justify-center rounded-full">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold">
                          {conversation.partnerProfile?.full_name || 'Unknown User'}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {conversation.lastMessage ? formatLastMessageDate(conversation.lastMessage.created_at) : ''}
                        </span>
                      </div>
                      
                      <p className={`text-sm mt-1 ${conversation.unreadCount > 0 ? 'font-medium' : 'text-muted-foreground'}`}>
                        {conversation.lastMessage ? getMessagePreview(conversation.lastMessage.message) : ''}
                      </p>
                      
                      {conversation.listing && (
                        <div className="flex items-center mt-2 text-xs text-muted-foreground">
                          <Car className="h-3 w-3 mr-1" />
                          <span>{conversation.listing.name}</span>
                          <span className="mx-1">•</span>
                          <span className="font-medium text-primary">{conversation.listing.formattedPrice}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ChatListPage;