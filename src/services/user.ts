// src/services/user.ts
import { Alert } from 'react-native';
import Purchases from 'react-native-purchases';
import { supabase } from '../config/supabase';
import i18n from '../i18n';

export const deleteAccount = async () => {
  try {
    const appUserID = await Purchases.getAppUserID();
    
    // 1. Borrar datos en Supabase
    const { error } = await supabase.rpc('delete_user_account', {
      target_user_id: appUserID
    });

    if (error) throw error;

    // 2. Resetear RevenueCat (Crea un nuevo ID anónimo limpio)
    // Esto "desconecta" al dispositivo del historial de compras anterior
    if (!Purchases.isAnonymous) {
        await Purchases.logOut();
    } 
    // Si ya es anónimo, logOut no siempre es necesario, pero resetear ayuda:
    // await Purchases.reset(); // Depende de la versión del SDK, a veces logOut basta.

    Alert.alert(
      i18n.t('profile.account_deleted_title'), 
      i18n.t('profile.account_deleted_msg')
    );
    
    // Aquí podrías redirigir al Onboarding o recargar la app
    
  } catch (e: any) {
    console.error("Error deleting account:", e);
    Alert.alert(i18n.t('common.error'), i18n.t('profile.delete_error'));
  }
};