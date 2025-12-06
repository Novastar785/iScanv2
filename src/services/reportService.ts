// src/services/reportService.ts
import { Alert } from 'react-native';
import Purchases from 'react-native-purchases';
import { supabase } from '../config/supabase';
import i18n from '../i18n';

export const reportContent = async (
  featureId: string, 
  reason: string,
  imageBase64: string | null
) => {
  try {
    const appUserID = await Purchases.getAppUserID();

    // Insertamos el reporte en Supabase
    const { error } = await supabase
      .from('content_reports')
      .insert({
        reporter_id: appUserID,
        feature_id: featureId,
        reason: reason,
        // Opcional: Guardar solo una muestra para no llenar la BD, o subir a Storage si prefieres.
        // Aquí guardamos un marcador indicando que se reportó una imagen generada.
        image_data: imageBase64 ? 'BASE64_IMAGE_REPORTED' : 'NO_DATA' 
      });

    if (error) throw error;

    Alert.alert(
      i18n.t('report.success_title'),
      i18n.t('report.success_msg')
    );

  } catch (error) {
    console.error("Error reporting content:", error);
    Alert.alert(i18n.t('common.error'), i18n.t('common.error_technical'));
  }
};