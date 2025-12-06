import { Alert } from 'react-native';
import Purchases from 'react-native-purchases';
import { supabase } from '../config/supabase';
import i18n from '../i18n';

// NOTA: La inicialización de RevenueCat (Purchases.configure) ya se hace en app/_layout.tsx
// Aquí solo ponemos funciones auxiliares para créditos y restauración.

// Función para obtener créditos de Supabase
export const getUserCredits = async () => {
  try {
    // CORRECCIÓN: Usamos el método específico para obtener el ID
    const appUserID = await Purchases.getAppUserID();
    
    // Consulta directa a la tabla user_credits
    const { data, error } = await supabase
      .from('user_credits')
      .select('subscription_credits, pack_credits')
      .eq('user_id', appUserID)
      .single();

    if (error) {
      // Si no hay fila, asumimos que es un usuario nuevo o sin créditos registrados
      return { sub: 0, pack: 0, total: 0 };
    }

    return {
      sub: data.subscription_credits || 0,
      pack: data.pack_credits || 0,
      total: (data.subscription_credits || 0) + (data.pack_credits || 0)
    };
  } catch (e) {
    console.error("Error fetching credits:", e);
    return { sub: 0, pack: 0, total: 0 };
  }
};

// Función para restaurar compras
export const restorePurchases = async () => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    // Al restaurar, RevenueCat puede actualizar el appUserID en el dispositivo si detecta un usuario previo.
    // La próxima vez que llamemos a getUserCredits, usará el ID correcto recuperado.
    return customerInfo;
  } catch (e) {
    console.error("Error restaurando compras:", e);
    Alert.alert(
      i18n.t('common.error'), 
      i18n.t('store.restore_error')
    );
    throw e;
  }
};