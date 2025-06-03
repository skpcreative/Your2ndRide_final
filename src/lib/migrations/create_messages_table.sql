-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES auth.users(id),
    receiver_id UUID NOT NULL REFERENCES auth.users(id),
    message TEXT NOT NULL,
    listing_id UUID REFERENCES listings(id),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_listing_id ON messages(listing_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy for selecting messages (users can only see messages they've sent or received)
CREATE POLICY messages_select_policy ON messages 
    FOR SELECT 
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Policy for inserting messages (users can only insert messages they're sending)
CREATE POLICY messages_insert_policy ON messages 
    FOR INSERT 
    WITH CHECK (auth.uid() = sender_id);

-- Policy for updating messages (users can only update messages they've received)
CREATE POLICY messages_update_policy ON messages 
    FOR UPDATE 
    USING (auth.uid() = receiver_id);

-- Policy for deleting messages (users can only delete messages they've sent or received)
CREATE POLICY messages_delete_policy ON messages 
    FOR DELETE 
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
