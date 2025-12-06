import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';
import { CustomerInfo, PurchasesStoreTransaction } from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';

export default function StoreScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const isFocused = useIsFocused(); // Detectamos si la pantalla es visible

  // Callback de compra exitosa
  const handlePurchaseCompleted = ({ customerInfo }: { customerInfo: CustomerInfo, storeTransaction: PurchasesStoreTransaction }) => {
    console.log("Compra exitosa:", customerInfo);
    
    // Alerta con redirección al presionar OK
    Alert.alert(
      t('store.success_title'), 
      t('store.success_msg'),
      [
        { 
          text: "OK", 
          onPress: () => {
            // "Sacamos" al usuario redirigiéndolo al index de las tabs
            router.replace('/(tabs)'); 
          }
        }
      ]
    );
  };

  // Callback de restauración exitosa
  const handleRestoreCompleted = ({ customerInfo }: { customerInfo: CustomerInfo }) => {
    console.log("Restauración:", customerInfo);
    Alert.alert(t('store.restore_title'), t('store.restore_msg'));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0f0f0f', paddingBottom: 120 }}>
      {/* Renderizado Condicional: Solo mostramos el Paywall si la pantalla tiene el foco */}
      {isFocused && (
        <RevenueCatUI.Paywall 
          onPurchaseCompleted={handlePurchaseCompleted}
          onRestoreCompleted={handleRestoreCompleted}
          options={{
            displayCloseButton: false // Opcional: Ocultamos el botón de cerrar nativo ya que usamos tabs
          }}
        />
      )}
    </View>
  );
}