import React from 'react';
import { useTranslation } from 'react-i18next';
import SingleStepDesignScreen, { DesignOption } from '../../components/SingleStepDesignScreen';
import { useRemoteConfig } from '../../hooks/useRemoteConfig';

export default function GardenDesignScreen() {
  const { t } = useTranslation();
  const { getCost } = useRemoteConfig();

  // Opciones de Estilo para el Jardín
  const gardenStyles: DesignOption[] = [
    { 
      id: 'garden_zen', 
      label: t('styles.zen'), 
      image: 'https://rizzflows.com/img_lyh/garden/zen.jpg' 
    },
    { 
      id: 'garden_tropical', 
      label: t('styles.tropical'), 
      image: 'https://rizzflows.com/img_lyh/garden/tropical.jpg' 
    },
    { 
      id: 'garden_modern', 
      label: t('styles.modern'), 
      image: 'https://rizzflows.com/img_lyh/garden/moderm.jpg' 
    },
    { 
      id: 'garden_english', 
      label: t('styles.english'), 
      image: 'https://rizzflows.com/img_lyh/garden/english.jpg' 
    },
    { 
      id: 'garden_mediterranean', 
      label: t('styles.mediterranean'), 
      image: 'https://rizzflows.com/img_lyh/garden/mediterranean.jpg' 
    },
  ];

  return (
    <SingleStepDesignScreen
      featureId="gardendesign"
      title={t('tools.gardendesign.title')}
      subtitle={t('tools.gardendesign.subtitle')}
      price={getCost('gardendesign', 3)}
      // Esta es la misma imagen que usas en el Home para la tarjeta de Garden Design
      backgroundImage="https://rizzflows.com/img_lyh/jardin.png"
      options={gardenStyles}
      selectionTitle={t('wizard.step_style_title')}
    />
  );
}