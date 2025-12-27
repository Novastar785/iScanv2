import React from 'react';
import { useTranslation } from 'react-i18next';
import IdentifierToolScreen from '../../components/IdentifierToolScreen';

export default function DogScreen() {
    const { t } = useTranslation();

    return (
        <IdentifierToolScreen
            featureId="dog"
            title={t('tools.dog.title')}
            subtitle={t('tools.dog.subtitle')}
            backgroundImage={require('../../assets/images/index/dog.png')}
        />
    );
}
