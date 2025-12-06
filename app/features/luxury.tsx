import React from 'react';
import { useTranslation } from 'react-i18next'; // ✨
import GenericToolScreen from '../../components/GenericToolScreen';
import { useRemoteConfig } from '../../hooks/useRemoteConfig';

export default function LuxuryScreen() {
  const { t } = useTranslation(); // ✨
  const { getCost } = useRemoteConfig(); // <--- Usar Hook
  return (
    <GenericToolScreen 
      title={t('tools.luxury.title')} // ✨
      subtitle={t('feature_descriptions.luxury')} // ✨
      price={getCost('luxury', 2)} // <--- USAR ID DE LA DB
      backgroundImage="https://rizzflows.com/img_aura/bmw%20rojo.jpg"
      apiMode="luxury"
    />
  );
}