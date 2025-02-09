import { createClient } from "@supabase/supabase-js";


export const supabaseUrl = 'https://ofttyugvvpyshwlxxsmc.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mdHR5dWd2dnB5c2h3bHh4c21jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTA0NjU0MiwiZXhwIjoyMDU0NjIyNTQyfQ.uX4hsL7cgfthvI6fKgRNnTbDnD0dAbxV3I3pauMFPmA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);