import React from 'react';
import { useTranslation } from 'react-i18next';
import IdentifierToolScreen from '../../components/IdentifierToolScreen';

export default function CatScreen() {
    const { t } = useTranslation();

    return (
        <IdentifierToolScreen
            featureId="cat"
            title={t('tools.cat.title')}
            subtitle={t('tools.cat.subtitle')}
            backgroundImage={require('../../assets/images/index/cat.png')}
        />
    );
}
