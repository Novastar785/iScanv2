import React from 'react';
import { useTranslation } from 'react-i18next'; // ✨
import GenericToolScreen, { ToolOption } from '../../components/GenericToolScreen';
import { useRemoteConfig } from '../../hooks/useRemoteConfig';

export default function StylistScreen() {
  const { t } = useTranslation(); // ✨
  const { getCost } = useRemoteConfig(); // <--- Usar Hook
  
  // Aquí definimos las tarjetas visuales
  // El 'id' debe coincidir con lo que pusimos en gemini.ts después del guion bajo (stylist_ROCK)
  const options: ToolOption[] = [
    { 
      id: 'urban', 
      label: t('options.urban'), // ✨
      image: 'https://rizzflows.com/img_aura/Image_fx(4).png' // Chico con hoodie en la calle
    },
    { 
      id: 'rock', 
      label: t('options.rock'), // ✨
      image: 'https://rizzflows.com/img_aura/rockera.jpeg' // Ambiente concierto/guitarra
    },
    { 
      id: 'cyberpunk', 
      label: t('options.cyberpunk'), // ✨
      image: 'https://rizzflows.com/img_aura/Image_fx(5).png' // Luces neón y lluvia
    },
    { 
      id: 'viking', 
      label: t('options.viking'), // ✨
      image: 'https://rizzflows.com/img_aura/Image_fx(6).png' // Bosque oscuro y misterioso
    },
    { 
      id: 'retro', 
      label: t('options.retro'), // ✨
      image: 'https://rizzflows.com/img_aura/Image_fx(11).png' // Bosque oscuro y misterioso
    },
  ];

  return (
    <GenericToolScreen 
      title={t('tools.stylist.title')} // ✨
      subtitle={t('feature_descriptions.stylist')} // ✨
      price={getCost('stylist', 2)} // <--- USAR ID DE LA DB
      // Imagen de fondo general de la pantalla
      backgroundImage="https://rizzflows.com/img_aura/Image_fx(3).png"
      apiMode="stylist"
      options={options}
    />
  );
}