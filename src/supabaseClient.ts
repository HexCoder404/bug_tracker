import { createClient } from "@supabase/supabase-js";

// Replace these with your actual Supabase project URL and anon key
const supabaseUrl = "https://vrjkybyrgwiotkecvrqs.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyamt5YnlyZ3dpb3RrZWN2cnFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTczNzYsImV4cCI6MjA4ODYzMzM3Nn0.11HhBxGlaVVSxJXsX4ZVNJWHuyTklDmVjjWBlSDi1GE";

export const supabase = createClient(supabaseUrl, supabaseKey);
