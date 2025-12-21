import React from 'react';
import { useTranslation } from 'react-i18next';
import WizardToolScreen, { WizardOption } from '../../components/WizardToolScreen';
import { useRemoteConfig } from '../../hooks/useRemoteConfig';

export default function ExteriorDesignScreen() {
  const { t } = useTranslation();
  const { getCost } = useRemoteConfig();

  // PASO 1: Tipo de Casa (Contexto Estructural)
  const houseTypes: WizardOption[] = [
    { 
      id: 'house_modern', 
      label: t('houses.modern_home'), 
      image: 'https://rizzflows.com/img_lyh/exterior/house.jpg' 
    },
    { 
      id: 'house_villa', 
      label: t('houses.villa'), 
      image: 'https://rizzflows.com/img_lyh/exterior/villa.jpg' 
    },
    { 
      id: 'house_cottage', 
      label: t('houses.cottage'), 
      image: 'https://rizzflows.com/img_lyh/exterior/cottage.jpg' 
    },
   
  ];

  // PASO 2: Estilo de Fachada (Visual)
  const exteriorStyles: WizardOption[] = [
    { 
      id: 'ext_modern', 
      label: t('styles.modern'), 
      image: 'https://rizzflows.com/img_lyh/exterior/styles/modern.jpg' 
    },
    { 
      id: 'ext_mediterranean', 
      label: t('styles.mediterranean'), 
      image: 'https://rizzflows.com/img_lyh/exterior/styles/mediterranean.jpg' 
    },
    { 
      id: 'ext_scandinavian', 
      label: t('styles.scandinavian'), 
      image: 'https://rizzflows.com/img_lyh/exterior/styles/scandinavian.jpg' 
    },
    { 
      id: 'ext_american', 
      label: t('styles.american'), 
      image: 'https://rizzflows.com/img_lyh/exterior/styles/american.jpg' 
    },
    { 
      id: 'ext_minimalist', 
      label: t('styles.minimalist'), 
      image: 'https://rizzflows.com/img_lyh/exterior/styles/minimalist.jpg' 
    },
  ];

  return (
    <WizardToolScreen
      featureId="exteriordesign" // ID base para la DB
      title={t('tools.exteriordesign.title')}
      subtitle={t('tools.exteriordesign.subtitle')}
      // Usa una imagen de fondo apropiada para exteriores
      backgroundImage="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80"
      
      step1Title={t('wizard.step_house_title')}
      step1Options={houseTypes}
      
      step2Title={t('wizard.step_facade_title')}
      step2Options={exteriorStyles}
    />
  );
}