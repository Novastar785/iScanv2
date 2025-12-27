import React from 'react';
import { useTranslation } from 'react-i18next';
import IdentifierToolScreen from '../../components/IdentifierToolScreen';

export default function InsectScreen() {
    const { t } = useTranslation();

    return (
        <IdentifierToolScreen
            featureId="insect"
            title={t('tools.insect.title')}
            subtitle={t('tools.insect.subtitle')}
            backgroundImage={require('../../assets/images/index/insect.png')}
        />
    );
}
