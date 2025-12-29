import React from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Platform } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';
import { CustomerInfo } from 'react-native-purchases';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

// 1. IMPORTANTE: Importamos la función de sincronización
import { initializeUser } from '../src/services/user';

export default function PaywallScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem('HAS_SEEN_ONBOARDING', 'true');
      router.replace('/(tabs)');
    } catch (e) {
      console.error("Error guardando onboarding status:", e);
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      <RevenueCatUI.Paywall
        // 2. Convertimos a async para esperar la sincronización
        onPurchaseCompleted={async ({ customerInfo }: { customerInfo: CustomerInfo }) => {
          console.log("Compra completada:", customerInfo);

          // 3. Sincronizamos por si RevenueCat cambió el ID (CRÍTICO)
          await initializeUser();

          handleFinish();
        }}
        // 4. Lo mismo para la restauración
        onRestoreCompleted={async ({ customerInfo }: { customerInfo: CustomerInfo }) => {
          console.log("Restauración completada:", customerInfo);

          // 5. Sincronizamos ID recuperado
          await initializeUser();

          Alert.alert(t('store.restore_title'), t('store.restore_msg'));
          handleFinish();
        }}
        // onDismiss removed as there is no close button
        options={{
          displayCloseButton: false, // User cannot close this paywall
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },
  // Removed closeButton and shadow styles as they are no longer needed
});