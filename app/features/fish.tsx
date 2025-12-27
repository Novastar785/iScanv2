import React from 'react';
import { useTranslation } from 'react-i18next';
import IdentifierToolScreen from '../../components/IdentifierToolScreen';

export default function FishScreen() {
    const { t } = useTranslation();

    return (
        <IdentifierToolScreen
            featureId="fish"
            title={t('tools.fish.title')}
            subtitle={t('tools.fish.subtitle')}
            backgroundImage={require('../../assets/images/index/fish.png')}
        />
    );
}
