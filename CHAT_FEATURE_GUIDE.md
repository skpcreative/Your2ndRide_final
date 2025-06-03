# Your2ndRide Chat Feature Guide

## Overview

The chat feature allows buyers and sellers to communicate directly within the Your2ndRide platform. It's designed with a storage optimization strategy:

1. Buyer messages are initially stored in Supabase
2. When the seller reads the messages, they're saved locally on the seller's device
3. After local saving, messages are deleted from Supabase to minimize storage costs

## Setup Instructions

### 1. Database Setup

Run the SQL migration to create the required `messages` table in Supabase:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `src/lib/migrations/create_messages_table.sql`
4. Execute the SQL to create the table and set up Row Level Security policies

Alternatively, if you have access to the Supabase CLI and proper credentials, you can run:

```bash
node src/lib/migrations/run_migration.js
```

### 2. Testing the Chat Feature

To fully test the chat feature, you'll need to:

1. **Create two test accounts** (a buyer and a seller)
2. **Have a vehicle listing** created by the seller account
3. **Test the buyer flow**:
   - Log in as the buyer
   - Navigate to a vehicle listing
   - Click "Contact Seller" or "Contact via Chat"
   - Send a message to the seller
4. **Test the seller flow**:
   - Log in as the seller
   - Navigate to the Messages section from the profile dropdown
   - View the unread message from the buyer
   - Observe that after reading, the message is saved locally and removed from Supabase

## Feature Components

### Chat List Page (`/chat`)

- Displays all conversations for the current user
- Shows unread message count
- Combines messages from Supabase and local storage
- Displays conversation previews with:
  - Last message
  - Timestamp
  - Related vehicle information

### Individual Chat Page (`/chat/:sellerId?listingId=:listingId`)

- Displays the conversation between buyer and seller
- Shows vehicle information related to the conversation
- Allows sending and receiving messages
- Implements the storage optimization strategy
- Provides message timestamps and read status

## Technical Implementation

### Storage Strategy

- **New messages** are stored in Supabase
- **Read messages** are:
  1. Saved to local storage on the seller's device
  2. Marked as read in Supabase
  3. Deleted from Supabase to save storage costs

### Local Storage Structure

Messages are stored in local storage with keys following the pattern:
```
chat_messages_{partnerId}
```

Each value is a JSON array of message objects containing:
- Message ID
- Sender ID
- Receiver ID
- Message content
- Timestamp
- Read status
- Related listing ID

### Security Considerations

- Row Level Security ensures users can only access messages they've sent or received
- Local storage is browser-specific and cleared when browser data is cleared
- Consider implementing message encryption for sensitive information

## Limitations

- Local storage has size limits (typically 5-10MB per domain)
- Messages saved locally are only available on that specific device/browser
- If a user clears their browser data, locally stored messages will be lost
- No offline support for sending new messages (requires Supabase connection)

## Future Enhancements to Consider

- Real-time message notifications using Supabase subscriptions
- Message attachments for sharing images or documents
- Message encryption for enhanced privacy
- Offline support with message queuing
- Push notifications for mobile devices
