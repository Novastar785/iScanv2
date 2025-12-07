import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// ⚠️ VE A TU DASHBOARD DE SUPABASE -> SETTINGS -> API
// Y COPIA TUS DATOS AQUÍ:
const supabaseUrl = 'https://nnoofrjtujkemrjnlios.supabase.co'; // Tu Project URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ub29mcmp0dWprZW1yam5saW9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNTIzODgsImV4cCI6MjA4MDYyODM4OH0.vtlUcTzxzFxpL-5aGMlkoVR0a7Ld9Kq1CfRx-_6mt5U'; // Tu Anon / Public Key

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});