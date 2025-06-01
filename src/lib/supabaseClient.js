
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dphwqpwclfiqwogcuspw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwaHdxcHdjbGZpcXdvZ2N1c3B3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NjcwOTMsImV4cCI6MjA2NDM0MzA5M30.kkE3M4fF5iTW21oNEBGnPdE1Ao2rGHc-ABQYgRTmHpU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
