import { Alert } from 'react-native';
import Purchases from 'react-native-purchases';
import { supabase } from '../config/supabase';
import i18n from '../i18n';

// NOTA: La inicialización de RevenueCat (Purchases.configure) ya se hace en app/_layout.tsx
// Aquí solo ponemos funciones auxiliares para créditos y restauración.

// MODO DEBUG: Activado para pruebas sin build nativo
const DEBUG_MODE = true;

// Función para comprobar estado de suscripción
export const getUserStatus = async () => {
  if (DEBUG_MODE) {
    console.log("DEBUG MODE: Returning active subscription");
    return { isPro: true };
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const isPro = typeof customerInfo.entitlements.active['pro'] !== "undefined";
    return { isPro };
  } catch (e) {
    console.error("Error fetching user status:", e);
    return { isPro: false };
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