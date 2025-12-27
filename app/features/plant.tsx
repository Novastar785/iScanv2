import React from 'react';
import { useTranslation } from 'react-i18next';
import IdentifierToolScreen from '../../components/IdentifierToolScreen';

export default function PlantScreen() {
    const { t } = useTranslation();

    return (
        <IdentifierToolScreen
            featureId="plant"
            title={t('tools.plant.title')}
            subtitle={t('tools.plant.subtitle')}
            backgroundImage={require('../../assets/images/index/plant.png')}
        />
    );
}
