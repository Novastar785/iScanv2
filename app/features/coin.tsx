import React from 'react';
import { useTranslation } from 'react-i18next';
import IdentifierToolScreen from '../../components/IdentifierToolScreen';

export default function CoinScreen() {
    const { t } = useTranslation();

    return (
        <IdentifierToolScreen
            featureId="coin"
            title={t('tools.coin.title', 'Coin Identifier')}
            subtitle={t('tools.coin.subtitle', 'Value & History')}
            backgroundImage={require('../../assets/images/index/coin.png')}
        />
    );
}
