-- Create wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- Enable RLS
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own wishlist items
CREATE POLICY wishlists_select_policy ON wishlists 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can add items to their own wishlist
CREATE POLICY wishlists_insert_policy ON wishlists 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can delete items from their own wishlist
CREATE POLICY wishlists_delete_policy ON wishlists 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS wishlists_user_id_idx ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS wishlists_listing_id_idx ON wishlists(listing_id);
