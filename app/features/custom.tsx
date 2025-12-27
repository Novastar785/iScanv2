import React from 'react';
import { useTranslation } from 'react-i18next';
import IdentifierToolScreen from '../../components/IdentifierToolScreen';

export default function CustomScreen() {
    const { t } = useTranslation();

    return (
        <IdentifierToolScreen
            featureId="custom"
            title={t('tools.custom.title')}
            subtitle={t('tools.custom.subtitle')}
            backgroundImage={require('../../assets/images/index/plant.png')}
        />
    );
}
