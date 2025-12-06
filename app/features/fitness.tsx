import React from 'react';
import { useTranslation } from 'react-i18next'; // ✨
import GenericToolScreen, { ToolOption } from '../../components/GenericToolScreen';
import { useRemoteConfig } from '../../hooks/useRemoteConfig';

export default function FitnessScreen() {
  const { t } = useTranslation(); // ✨
  const { getCost } = useRemoteConfig();
  const options: ToolOption[] = [
    { 
      id: 'shredded', 
      label: t('options.shredded'), // ✨
      image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=300&q=80' 
    },
    { 
      id: 'yoga', 
      label: t('options.yoga'), // ✨
      image: 'https://images.unsplash.com/photo-1599447421405-0e32096b3033?w=300&q=80' 
    },
  ];

  return (
    <GenericToolScreen 
      title={t('tools.fitness.title')} // ✨
      subtitle={t('feature_descriptions.fitness')} // ✨
      price={getCost('fitness', 3)} // <--- USAR ID DE LA DB
      backgroundImage="https://rizzflows.com/img_aura/Image_fx(14).png"
      apiMode="fitness"
      options={options}
    />
  );
}