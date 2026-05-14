import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Initialize Supabase client with credentials
const supabaseURL = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Validate that required environment variables are set
if (!supabaseURL || !supabaseAnonKey) {
    throw new Error(
        "Missing required environment variables: SUPABASE_URL and/or SUPABASE_ANON_KEY"
    );
}

// Create the client (singleton - created once, used everywhere)
export const supabase = createClient(supabaseURL, supabaseAnonKey);