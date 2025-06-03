import { supabase } from '../supabaseClient';
import fs from 'fs';
import path from 'path';

/**
 * Run the SQL migration to create the wishlists table
 * This script should be executed from the command line with Node.js
 */
async function runWishlistsMigration() {
  try {
    console.log('Reading SQL migration file...');
    const sqlFile = path.resolve(__dirname, 'create_wishlists_table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('Executing SQL migration...');
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Error executing migration:', error);
      process.exit(1);
    }
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

runWishlistsMigration();
