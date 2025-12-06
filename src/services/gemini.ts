import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator'; // <--- NUEVA IMPORTACIÓN
import Purchases from 'react-native-purchases';
import { supabase } from '../config/supabase';
import i18n from '../i18n';

// --- NUEVA FUNCIÓN DE COMPRESIÓN ---
const compressImage = async (uri: string): Promise<string> => {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }], // Redimensionar a un ancho seguro (1024px es ideal para Gemini)
      { 
        compress: 0.7, // Calidad 70% (reduce drásticamente el peso sin perder calidad visible para IA)
        format: ImageManipulator.SaveFormat.JPEG 
      }
    );
    return result.uri;
  } catch (error) {
    console.error("Error comprimiendo imagen:", error);
    return uri; // Si falla, devolvemos la original como fallback
  }
};

export const generateAIImage = async (
  imageUri: string, 
  featureKey: string, 
  variant: string | null = null,
  garmentUri: string | null = null
): Promise<string> => {

  // --- ⚡ MODO DEBUG: ACTIVA ESTO PARA PROBAR SIN CRÉDITOS ---
  const DEBUG_MODE = false; // <--- Asegúrate de que esto esté en false para producción

  if (DEBUG_MODE) {
    console.log("🛠️ MODO DEBUG: Simulando generación de IA...");
    await new Promise(resolve => setTimeout(resolve, 3000));
    return "https://rizzflows.com/img_aura/Image_fx(3).png";
  }
  // ------------------------------------------------------------
  
  try {
    const appUserID = await Purchases.getAppUserID();
    if (!appUserID) throw new Error(i18n.t('errors.user_id_missing'));

    // --- CAMBIO: OPTIMIZACIÓN DE IMÁGENES ANTES DE LEER ---
    
    // 1. Optimizar y leer imagen principal
    console.log("🔄 Optimizando imagen principal...");
    const optimizedImageUri = await compressImage(imageUri);
    const base64 = await FileSystem.readAsStringAsync(optimizedImageUri, { encoding: 'base64' });
    
    // 2. Optimizar y leer prenda (si existe)
    let garmentBase64 = null;
    if (garmentUri) {
        console.log("👗 Optimizando imagen de prenda...");
        const optimizedGarmentUri = await compressImage(garmentUri);
        garmentBase64 = await FileSystem.readAsStringAsync(optimizedGarmentUri, { encoding: 'base64' });
    }
    
    console.log(`☁️ Solicitando generación para Feature: ${featureKey}, Variante: ${variant || 'base'}`);

    // Llamamos a la Edge Function
    const { data, error } = await supabase.functions.invoke('generate-ai-image', {
        body: { 
            feature_id: featureKey,
            variant: variant,
            imageBase64: base64,
            garmentBase64: garmentBase64,
            user_id: appUserID,
        }
    });

    if (error) {
        if (error instanceof Error && error.message.includes("402")) throw new Error("INSUFFICIENT_CREDITS");
        throw error;
    }

    if (data && data.error) {
        if (data.code === 'INSUFFICIENT_CREDITS' || data.error.includes("Saldo insuficiente")) {
            throw new Error("INSUFFICIENT_CREDITS");
        }
        throw new Error(data.error);
    }

    if (!data || !data.image) {
        throw new Error(i18n.t('errors.no_image_returned'));
    }

    return data.image;

  } catch (error: any) {
    console.error("❌ Error AI SERVICE:", error);
    throw error;
  }
};