import React from 'react';
import { useTranslation } from 'react-i18next'; // ✨
import GenericToolScreen, { ToolOption } from '../../components/GenericToolScreen';
import { useRemoteConfig } from '../../hooks/useRemoteConfig';

export default function GlobetrotterScreen() {
  const { t } = useTranslation(); // ✨
  const { getCost } = useRemoteConfig(); // <--- Usar Hook

  const options: ToolOption[] = [
    { 
      id: 'santorini', 
      label: t('options.santorini'), // ✨
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=300&q=80' 
    },
    { 
      id: 'paris', 
      label: t('options.paris'), // ✨
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=300&q=80' 
    },
    { 
      id: 'nyc', 
      label: t('options.nyc'), // ✨
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=300&q=80' 
    },
  ];

  return (
    <GenericToolScreen 
      title={t('tools.globetrotter.title')} // ✨
      subtitle={t('feature_descriptions.globetrotter')} // ✨
      price={getCost('globetrotter', 2)} // <--- USAR ID DE LA DB
      backgroundImage="https://rizzflows.com/img_aura/Image_fx(12).png"
      apiMode="globetrotter"
      options={options}
    />
  );
}