import { Platform } from 'react-native';

// AQUÍ GUARDAMOS LOS SECRETOS DE FORMA CENTRALIZADA

// 1. TUS CLAVES REALES DE REVENUECAT (Copiadas de tu mensaje anterior)
const ANDROID_KEY = "goog_XZDPQgjeJCvuWYrTMZVWvIlOQXD";
const IOS_KEY = "appl_vggLKPoNFinuyxlalBpfDGTUyAV";

// 2. Exportamos la clave correcta automáticamente según la plataforma
// La app detectará si es iOS o Android y usará la clave correspondiente.
export const REVENUECAT_API_KEY = Platform.select({
  ios: IOS_KEY,
  android: ANDROID_KEY,
  default: ANDROID_KEY, // Fallback por seguridad
});

// Otras configuraciones (Mantenemos tus otros valores)
export const SUPABASE_URL = "https://nnoofrjtujkemrjnlios.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ub29mcmp0dWprZW1yam5saW9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNTIzODgsImV4cCI6MjA4MDYyODM4OH0.vtlUcTzxzFxpL-5aGMlkoVR0a7Ld9Kq1CfRx-_6mt5U"; // Tu clave anónima pública
export const APP_NAME = "iScan AI";