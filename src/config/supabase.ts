import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// ⚠️ VE A TU DASHBOARD DE SUPABASE -> SETTINGS -> API
// Y COPIA TUS DATOS AQUÍ:
const supabaseUrl = 'https://acrqlwtkhcvdnkmdeibi.supabase.co'; // Tu Project URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjcnFsd3RraGN2ZG5rbWRlaWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NTUzODAsImV4cCI6MjA3OTMzMTM4MH0.ZdJiwSjSvfcUG2Dqy_04Nf4pCVd1SqEgNWZWQsut_bc'; // Tu Anon / Public Key

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});