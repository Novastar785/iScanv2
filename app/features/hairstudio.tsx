import React from 'react';
import { useTranslation } from 'react-i18next'; // ✨
import GenericToolScreen, { ToolOption } from '../../components/GenericToolScreen';
import { useRemoteConfig } from '../../hooks/useRemoteConfig';

export default function HairStudioScreen() {
  const { t } = useTranslation(); // ✨
  const { getCost } = useRemoteConfig(); // <--- Usar Hook

  const options: ToolOption[] = [
    { 
      id: 'butterfly', 
      label: t('options.butterfly'), // ✨
      image: 'https://rizzflows.com/img_aura/hairstudio/butterflycut.png' 
    },
    { 
      id: 'layer', 
      label: t('options.layer'), // ✨
      image: 'https://rizzflows.com/img_aura/hairstudio/layered.png' 
    },
    { 
      id: 'bob', 
      label: t('options.bob'), // ✨
      image: 'https://rizzflows.com/img_aura/hairstudio/bobcut.png' 
    }, 
    { 
      id: 'mullet', 
      label: t('options.mullet'), // ✨
      image: 'https://rizzflows.com/img_aura/hairstudio/modermmullet.png' 
    },
    { 
      id: 'fade', 
      label: t('options.fade'), // ✨
      image: 'https://rizzflows.com/img_aura/hairstudio/taperfade.png' 
    },
    { 
      id: 'buzzcut', 
      label: t('options.buzzcut'), // ✨
      image: 'https://rizzflows.com/img_aura/hairstudio/buzzcut.png' 
    },
    { 
      id: 'blonde', 
      label: t('options.blonde'), // ✨
      image: 'https://rizzflows.com/img_aura/hairstudio/blonde.png' 
    },
    { 
      id: 'red', 
      label: t('options.red'), // ✨
      image: 'https://rizzflows.com/img_aura/hairstudio/red.png' 
    },
    { 
      id: 'dark', 
      label: t('options.dark'), // ✨
      image: 'https://rizzflows.com/img_aura/hairstudio/dark.png' 
    },
    { 
      id: 'balayage', 
      label: t('options.balayage'), // ✨
      image: 'https://rizzflows.com/img_aura/hairstudio/balayage.png' 
    }, 
   
  ];

  return (
    <GenericToolScreen 
      title={t('tools.hairstudio.title')} // ✨
      subtitle={t('feature_descriptions.hairstudio')} // ✨
      price={getCost('hairstudio', 2)} // <--- USAR ID DE LA DB
      backgroundImage="https://rizzflows.com/img_aura/Image_fx(13).png"
      apiMode="hairstudio"
      options={options}
    />
  );
}