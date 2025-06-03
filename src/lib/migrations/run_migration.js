import { supabase } from '../supabaseClient';
import fs from 'fs';
import path from 'path';

/**
 * Run the SQL migration to create the messages table
 * This script should be executed from the command line with Node.js
 */
async function runMigration() {
  try {
    console.log('Reading SQL migration file...');
    const sqlFile = path.resolve(__dirname, 'create_messages_table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('Executing SQL migration...');
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Error executing migration:', error);
      process.exit(1);
    }
    
    console.log('Migration completed successfully!');
    console.log('The messages table has been created with the following schema:');
    console.log('- id: UUID (primary key)');
    console.log('- sender_id: UUID (references auth.users)');
    console.log('- receiver_id: UUID (references auth.users)');
    console.log('- message: TEXT');
    console.log('- listing_id: UUID (references listings)');
    console.log('- is_read: BOOLEAN');
    console.log('- created_at: TIMESTAMP WITH TIME ZONE');
    console.log('- updated_at: TIMESTAMP WITH TIME ZONE');
    console.log('\nRow Level Security policies have been applied to ensure:');
    console.log('- Users can only see messages they\'ve sent or received');
    console.log('- Users can only insert messages they\'re sending');
    console.log('- Users can only update messages they\'ve received');
    console.log('- Users can only delete messages they\'ve sent or received');
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

runMigration();
