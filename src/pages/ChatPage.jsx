import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '../components/ui/use-toast';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { 
  Send, 
  ArrowLeft, 
  UserCircle,
  Car,
  Clock
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const ChatPage = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const listingId = queryParams.get('listingId');
  
  const [currentUser, setCurrentUser] = useState(null);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [listingInfo, setListingInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);

  // Check if the user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({ 
            title: "Login Required", 
            description: "Please sign in to chat with sellers.", 
            variant: "destructive" 
          });
          navigate('/login', { state: { from: location.pathname + location.search } });
          return;
        }
        
        // Get user profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching profile:', profileError);
        }
        
        setCurrentUser({
          ...user,
          profile: profileData || {}
        });
        
        // Continue with loading other data
        fetchSellerInfo();
        if (listingId) {
          fetchListingInfo();
        }
        loadMessages();
      } catch (error) {
        console.error('Auth check error:', error);
        toast({ 
          title: "Error", 
          description: "Authentication error. Please try again.", 
          variant: "destructive" 
        });
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate, toast, location, sellerId, listingId]);

  // Fetch seller information
  const fetchSellerInfo = async () => {
    if (!sellerId) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sellerId)
        .single();
        
      if (error) {
        console.error('Error fetching seller info:', error);
        toast({ 
          title: "Error", 
          description: "Could not load seller information.", 
          variant: "destructive" 
        });
        return;
      }
      
      setSellerInfo(data);
    } catch (error) {
      console.error('Unexpected error fetching seller:', error);
    }
  };

  // Fetch listing information if a listing ID is provided
  const fetchListingInfo = async () => {
    if (!listingId) return;
    
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .single();
        
      if (error) {
        console.error('Error fetching listing info:', error);
        return;
      }
      
      setListingInfo({
        ...data,
        name: `${data.make || ''} ${data.model || ''} ${data.year || ''}`.trim() || 'Unnamed Vehicle',
        formattedPrice: data.price ? `$${data.price.toLocaleString()}` : 'Contact for price'
      });
    } catch (error) {
      console.error('Unexpected error fetching listing:', error);
    }
  };

  // Load messages from Supabase
  const loadMessages = async () => {
    if (!sellerId) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Get messages between current user and seller
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .or(`sender_id.eq.${sellerId},receiver_id.eq.${sellerId}`)
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error('Error loading messages:', error);
        toast({ 
          title: "Error", 
          description: "Could not load messages.", 
          variant: "destructive" 
        });
        return;
      }
      
      // Check for messages in local storage
      const localMessages = loadLocalMessages(sellerId);
      
      // Combine Supabase messages with local messages
      const allMessages = [...data, ...localMessages];
      
      // Sort by created_at
      allMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      
      setMessages(allMessages);
      
      // Mark messages as read if they are from the seller
      markMessagesAsRead(data, user.id, sellerId);
    } catch (error) {
      console.error('Unexpected error loading messages:', error);
    }
  };

  // Load messages from local storage
  const loadLocalMessages = (chatPartnerId) => {
    try {
      const localMessagesString = localStorage.getItem(`chat_messages_${chatPartnerId}`);
      if (localMessagesString) {
        return JSON.parse(localMessagesString);
      }
    } catch (error) {
      console.error('Error loading local messages:', error);
    }
    return [];
  };

  // Save a message to local storage
  const saveMessageToLocalStorage = (message) => {
    try {
      // Get existing messages for this chat
      const existingMessages = loadLocalMessages(message.receiver_id === currentUser.id ? message.sender_id : message.receiver_id);
      
      // Add the new message
      const updatedMessages = [...existingMessages, message];
      
      // Save back to local storage
      localStorage.setItem(
        `chat_messages_${message.receiver_id === currentUser.id ? message.sender_id : message.receiver_id}`, 
        JSON.stringify(updatedMessages)
      );
    } catch (error) {
      console.error('Error saving message to local storage:', error);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (messagesData, currentUserId, sellerId) => {
    try {
      // Find messages sent to the current user that are unread
      const unreadMessages = messagesData.filter(
        msg => msg.receiver_id === currentUserId && 
              msg.sender_id === sellerId && 
              !msg.is_read
      );
      
      if (unreadMessages.length === 0) return;
      
      // Mark messages as read in Supabase
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', unreadMessages.map(msg => msg.id));
        
      if (error) {
        console.error('Error marking messages as read:', error);
        return;
      }
      
      // Save read messages to local storage
      unreadMessages.forEach(msg => {
        const updatedMsg = { ...msg, is_read: true };
        saveMessageToLocalStorage(updatedMsg);
      });
      
      // Delete read messages from Supabase after saving locally
      deleteMessagesFromSupabase(unreadMessages);
      
      // Update messages state
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          unreadMessages.some(unread => unread.id === msg.id) 
            ? { ...msg, is_read: true } 
            : msg
        )
      );
    } catch (error) {
      console.error('Error in markMessagesAsRead:', error);
    }
  };

  // Delete messages from Supabase after they've been read and saved locally
  const deleteMessagesFromSupabase = async (messagesToDelete) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .in('id', messagesToDelete.map(msg => msg.id));
        
      if (error) {
        console.error('Error deleting messages from Supabase:', error);
      }
    } catch (error) {
      console.error('Unexpected error in deleteMessagesFromSupabase:', error);
    }
  };

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !sellerId) return;
    
    setSendingMessage(true);
    
    try {
      // Create the message object
      const messageData = {
        sender_id: currentUser.id,
        receiver_id: sellerId,
        message: newMessage.trim(),
        created_at: new Date().toISOString(),
        is_read: false,
        listing_id: listingId || null
      };
      
      // Save to Supabase
      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();
        
      if (error) {
        console.error('Error sending message:', error);
        toast({ 
          title: "Error", 
          description: "Could not send message. Please try again.", 
          variant: "destructive" 
        });
        return;
      }
      
      // Add the message to the local state
      setMessages(prevMessages => [...prevMessages, data]);
      
      // Save a copy to local storage
      saveMessageToLocalStorage(data);
      
      // Clear the input
      setNewMessage('');
      
      // Scroll to bottom
      scrollToBottom();
      
      toast({ 
        title: "Message Sent", 
        description: "Your message has been sent to the seller." 
      });
    } catch (error) {
      console.error('Unexpected error sending message:', error);
      toast({ 
        title: "Error", 
        description: "An unexpected error occurred.", 
        variant: "destructive" 
      });
    } finally {
      setSendingMessage(false);
    }
  };

  // Scroll to the bottom of the messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Effect to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Format the date for display
  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${date.toLocaleDateString([], { weekday: 'short' })}, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="mb-4 group"
      >
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chat section - Takes up 2/3 on desktop */}
        <div className="md:col-span-2">
          <Card className="shadow-lg border-primary/10">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-center">
                {sellerInfo?.avatar_url ? (
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={sellerInfo.avatar_url} alt={sellerInfo?.full_name || 'Seller'} />
                    <AvatarFallback>{sellerInfo?.full_name?.charAt(0) || 'S'}</AvatarFallback>
                  </Avatar>
                ) : (
                  <UserCircle className="h-10 w-10 text-muted-foreground mr-3" />
                )}
                <div>
                  <CardTitle className="text-lg">{sellerInfo?.full_name || 'Seller'}</CardTitle>
                  {sellerInfo?.created_at && (
                    <p className="text-xs text-muted-foreground">
                      Member since {new Date(sellerInfo.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {/* Messages container */}
              <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No messages yet. Send a message to start the conversation.</p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div 
                      key={msg.id || `local-${index}`} 
                      className={`flex ${msg.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.sender_id === currentUser?.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <div className={`flex items-center justify-end mt-1 text-xs ${
                          msg.sender_id === currentUser?.id 
                            ? 'text-primary-foreground/70' 
                            : 'text-muted-foreground'
                        }`}>
                          <span>{formatMessageDate(msg.created_at)}</span>
                          {msg.sender_id === currentUser?.id && (
                            <span className="ml-1">
                              {msg.is_read ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message input */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="resize-none"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={!newMessage.trim() || sendingMessage}
                    className="self-end"
                  >
                    {sendingMessage ? (
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar - Takes up 1/3 on desktop */}
        <div className="space-y-4">
          {/* Listing info card */}
          {listingInfo && (
            <Card className="shadow-md border-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Vehicle Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Car className="h-5 w-5 text-primary mr-2" />
                    <h3 className="font-medium">{listingInfo.name}</h3>
                  </div>
                  <p className="text-xl font-bold text-primary">{listingInfo.formattedPrice}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Listed on {new Date(listingInfo.created_at).toLocaleDateString()}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-2" 
                    onClick={() => navigate(`/vehicle/${listingInfo.id}`)}
                  >
                    View Listing
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Chat tips */}
          <Card className="shadow-md border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Chat Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <Badge className="mr-2 mt-0.5">1</Badge>
                  <span>Ask about the vehicle's history and maintenance records</span>
                </li>
                <li className="flex items-start">
                  <Badge className="mr-2 mt-0.5">2</Badge>
                  <span>Inquire about test drive availability</span>
                </li>
                <li className="flex items-start">
                  <Badge className="mr-2 mt-0.5">3</Badge>
                  <span>Discuss payment methods and potential negotiations</span>
                </li>
                <li className="flex items-start">
                  <Badge className="mr-2 mt-0.5">4</Badge>
                  <span>Arrange a safe meeting location for viewing the vehicle</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Message icon component
const MessageIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export default ChatPage;
