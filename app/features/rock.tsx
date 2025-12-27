import React from 'react';
import { useTranslation } from 'react-i18next';
import IdentifierToolScreen from '../../components/IdentifierToolScreen';

export default function RockScreen() {
    const { t } = useTranslation();

    return (
        <IdentifierToolScreen
            featureId="rock"
            title={t('tools.rock.title')}
            subtitle={t('tools.rock.subtitle')}
            backgroundImage={require('../../assets/images/index/rock.png')}
        />
    );
}
