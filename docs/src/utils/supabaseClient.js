// supabaseClient.js
// Replace the placeholders below with your actual Supabase URL and anon key.

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://nmhyokohnmunfwyxekoj.supabase.co"; // <-- replace
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5taHlva29obm11bmZ3eXhla29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NDkzODYsImV4cCI6MjA5MTQyNTM4Nn0.MpwqRhDpevldYRMB7yE6Gs8njSQDPcxmGMmSE98EHUk"; // <-- replace

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
