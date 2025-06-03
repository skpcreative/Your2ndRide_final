/**
 * Utility functions for managing chat messages in local storage
 * This helps implement the strategy of moving messages from Supabase to local storage
 * after they've been read by the seller to optimize storage costs
 */

/**
 * Save messages to local storage for a specific conversation
 * @param {string} partnerId - The ID of the conversation partner
 * @param {Array} messages - Array of message objects to save
 */
export const saveMessagesToLocalStorage = (partnerId, messages) => {
  try {
    const storageKey = `chat_messages_${partnerId}`;
    const existingMessagesJSON = localStorage.getItem(storageKey);
    let existingMessages = [];
    
    if (existingMessagesJSON) {
      existingMessages = JSON.parse(existingMessagesJSON);
    }
    
    // Merge messages, avoiding duplicates based on message ID
    const messageIds = new Set(existingMessages.map(msg => msg.id));
    const newMessages = messages.filter(msg => !messageIds.has(msg.id));
    const updatedMessages = [...existingMessages, ...newMessages];
    
    // Sort by created_at
    updatedMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    
    localStorage.setItem(storageKey, JSON.stringify(updatedMessages));
    return updatedMessages;
  } catch (error) {
    console.error('Error saving messages to local storage:', error);
    return [];
  }
};

/**
 * Get messages from local storage for a specific conversation
 * @param {string} partnerId - The ID of the conversation partner
 * @returns {Array} Array of message objects
 */
export const getMessagesFromLocalStorage = (partnerId) => {
  try {
    const storageKey = `chat_messages_${partnerId}`;
    const messagesJSON = localStorage.getItem(storageKey);
    
    if (messagesJSON) {
      return JSON.parse(messagesJSON);
    }
    
    return [];
  } catch (error) {
    console.error('Error getting messages from local storage:', error);
    return [];
  }
};

/**
 * Get all conversations from local storage
 * @returns {Object} Object with partner IDs as keys and arrays of message objects as values
 */
export const getAllConversationsFromLocalStorage = () => {
  try {
    const conversations = {};
    
    // Find all keys that match the pattern chat_messages_*
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('chat_messages_')) {
        const partnerId = key.replace('chat_messages_', '');
        const messagesJSON = localStorage.getItem(key);
        
        if (messagesJSON) {
          conversations[partnerId] = JSON.parse(messagesJSON);
        }
      }
    }
    
    return conversations;
  } catch (error) {
    console.error('Error getting all conversations from local storage:', error);
    return {};
  }
};

/**
 * Add a single message to local storage
 * @param {string} partnerId - The ID of the conversation partner
 * @param {Object} message - The message object to add
 */
export const addMessageToLocalStorage = (partnerId, message) => {
  try {
    const messages = getMessagesFromLocalStorage(partnerId);
    
    // Check if message already exists
    const messageExists = messages.some(msg => msg.id === message.id);
    
    if (!messageExists) {
      messages.push(message);
      messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      
      const storageKey = `chat_messages_${partnerId}`;
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
    
    return messages;
  } catch (error) {
    console.error('Error adding message to local storage:', error);
    return [];
  }
};

/**
 * Delete a conversation from local storage
 * @param {string} partnerId - The ID of the conversation partner
 */
export const deleteConversationFromLocalStorage = (partnerId) => {
  try {
    const storageKey = `chat_messages_${partnerId}`;
    localStorage.removeItem(storageKey);
    return true;
  } catch (error) {
    console.error('Error deleting conversation from local storage:', error);
    return false;
  }
};
