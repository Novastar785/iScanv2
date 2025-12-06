import React from 'react';
import { useTranslation } from 'react-i18next'; // ✨
import TryOnToolScreen from '../../components/TryOnToolScreen';
import { useRemoteConfig } from '../../hooks/useRemoteConfig';

export default function TryOnScreen() {
  const { t } = useTranslation(); // ✨
  const { getCost } = useRemoteConfig(); // <--- Usar Hook
  return (
    <TryOnToolScreen 
      title={t('tools.styletransfer.title')} // ✨
      subtitle={t('feature_descriptions.styletransfer')} // ✨
      price={getCost('styletransfer', 3)} // <--- USAR ID DE LA DB
      // Imagen de fondo (Probador/Tienda de ropa)
      backgroundImage="https://rizzflows.com/img_aura/Vtryon.png"
    />
  );
}