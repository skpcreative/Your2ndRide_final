# Chat Feature Implementation

This document provides instructions for setting up and using the chat feature in Your2ndRide.

## Database Setup

1. Run the SQL migration script `create_messages_table.sql` in your Supabase project to create the necessary table and security policies.

```bash
# You can execute this through the Supabase SQL Editor or CLI
```

## Chat Feature Overview

The chat system is designed to optimize Supabase storage costs by:

1. Initially storing buyer messages in Supabase
2. When the seller reads the messages, they are saved to the seller's local storage
3. After saving locally, messages are deleted from Supabase to reduce storage costs

## Components

- **ChatListPage**: Shows all conversations, combining messages from Supabase and local storage
- **ChatPage**: Individual chat interface for communicating with a specific user about a vehicle
- **chatStorage.js**: Utility functions for managing chat messages in local storage

## Usage Flow

1. **Buyer sends a message**:
   - Message is stored in Supabase
   - Appears in seller's chat list with an unread indicator

2. **Seller reads the message**:
   - Message is marked as read
   - Message is saved to seller's local storage
   - Message is deleted from Supabase

3. **Ongoing conversation**:
   - New messages follow the same pattern
   - Local messages are loaded and displayed alongside Supabase messages

## Security Considerations

- Row Level Security (RLS) policies ensure users can only access messages they've sent or received
- Messages are encrypted in transit via HTTPS
- Consider implementing message content encryption if sensitive information is being shared

## Limitations

- Local storage has size limits (typically 5-10MB per domain)
- If a user clears their browser data, locally stored messages will be lost
- No offline support for sending new messages (requires Supabase connection)
