import { createClient } from '@supabase/supabase-js'

// Replace these with your real values from Supabase → Project Settings → API
const SUPABASE_URL = "https://nmhyokohnmunfwyxekoj.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5taHlva29obm11bmZ3eXhla29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NDkzODYsImV4cCI6MjA5MTQyNTM4Nn0.MpwqRhDpevldYRMB7yE6Gs8njSQDPcxmGMmSE98EHUk"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
