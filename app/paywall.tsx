import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui'; // Importación corregida
import { CustomerInfo } from 'react-native-purchases'; // Tipos necesarios
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PaywallScreen() {
  const router = useRouter();

  // Función para guardar que ya terminó el onboarding y salir
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
      {/* Usamos RevenueCatUI.Paywall igual que en tu store.tsx */}
      <RevenueCatUI.Paywall
        onPurchaseCompleted={({ customerInfo }: { customerInfo: CustomerInfo }) => {
          console.log("Compra completada:", customerInfo);
          handleFinish();
        }}
        onRestoreCompleted={({ customerInfo }: { customerInfo: CustomerInfo }) => {
          console.log("Restauración completada:", customerInfo);
          Alert.alert("Restaurado", "Tus compras se han restaurado correctamente.");
          handleFinish();
        }}
        onDismiss={() => {
          // Se ejecuta al tocar la "X" de cerrar
          console.log("Paywall cerrado por el usuario");
          handleFinish();
        }}
        options={{
          // Asegúrate de que esto sea true para que tengan opción de salir
          // (Si tu estrategia es "Hard Paywall", ponlo en false)
          displayCloseButton: true, 
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Fondo blanco para evitar parpadeos
    backgroundColor: '#fff', 
  },
});