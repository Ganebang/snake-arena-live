import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://jqjwugwtrtlenqrnrnhe.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impxand1Z3d0cnRsZW5xcm5ybmhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MzcxNTUsImV4cCI6MjA4MjMxMzE1NX0.bCMkNJ_2dvOh51hdAT_nqlEopY6oCkHEScjf_xCbgeQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
