import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://itqsafmuakxgarcvvlrq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0cXNhZm11YWt4Z2FyY3Z2bHJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NDg1MTYsImV4cCI6MjA4MDUyNDUxNn0.CjEORNaTpn5dJHiQoA0LeH4DCOjNWxKCUvU_1E6xQNw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
