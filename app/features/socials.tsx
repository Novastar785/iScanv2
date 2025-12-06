import React from 'react';
import { useTranslation } from 'react-i18next'; // ✨
import GenericToolScreen from '../../components/GenericToolScreen';
import { useRemoteConfig } from '../../hooks/useRemoteConfig';

export default function StylistScreen() {
  const { t } = useTranslation(); // ✨
  const { getCost } = useRemoteConfig(); // <--- Usar Hook
  return (
    <GenericToolScreen 
      title={t('tools.socials.title')} // ✨
      subtitle={t('feature_descriptions.socials')} // ✨
      price={getCost('socials', 2)} // <--- USAR ID DE LA DB
      backgroundImage="https://rizzflows.com/img_aura/Image_fx(10).png"
      apiMode="socials"
    />
  );
}