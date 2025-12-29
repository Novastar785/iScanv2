import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  ChevronRight,
  CreditCard,
  FileText,
  HelpCircle,
  Infinity as InfinityIcon,
  Lock,
  RefreshCcw,
  Rocket,
  Trash2,
  User
} from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Linking, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import Purchases from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../src/config/supabase';
import { restorePurchases } from '../../src/services/revenueCat';
import { deleteAccount } from '../../src/services/user';
import BlobBackground from '../../components/BlobBackground';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [userId, setUserId] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Load RevenueCat Data
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const appUserID = await Purchases.getAppUserID();
      setUserId(appUserID);
      setIsSubscribed(!!customerInfo.entitlements.active['pro']);
    } catch (e) { console.log(e); }
  };

  const handleDeleteAccount = () => {
    Alert.alert(t('profile.delete_account'), t('profile.delete_confirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: async () => { await deleteAccount(); loadData(); } }
    ]
    );
  };

  const handleRestore = async () => {
    try { await restorePurchases(); await loadData(); Alert.alert(t('store.restore_title'), t('store.restore_msg')); } catch (e) { }
  };

  const openCustomerCenter = async () => {
    try { await RevenueCatUI.presentCustomerCenter(); await loadData(); } catch (e) { Alert.alert(t('common.info'), t('profile.manage_sub_desc')); }
  };

  const openUpgradePaywall = async () => {
    try { await RevenueCatUI.presentPaywall({ displayCloseButton: true }); await loadData(); } catch (e) { }
  };

  const handleSupport = async () => {
    const email = 'info@rizzflows.com';
    const url = `mailto:${email}?subject=${t('profile.subject')}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) await Linking.openURL(url);
    else Alert.alert(t('common.error'), t('profile.error_mail'));
  };

  const subscriptionItems = [
    { icon: CreditCard, label: t('profile.manage_sub'), action: openCustomerCenter, subtitle: t('profile.manage_sub_desc'), color: '#fb923c' }, // Orange for billing
    { icon: Rocket, label: t('profile.upgrade'), action: openUpgradePaywall, subtitle: t('profile.upgrade_desc'), color: '#c084fc' }, // Purple for upgrade
    { icon: RefreshCcw, label: t('store.restore_title'), action: handleRestore, subtitle: t('profile.restore_desc'), color: '#60a5fa' }, // Blue for restore
  ];

  const legalItems = [
    { icon: Lock, label: t('profile.privacy'), action: () => router.push('/privacy' as any), color: '#9ca3af' },
    { icon: FileText, label: t('profile.terms'), action: () => router.push('/terms' as any), color: '#9ca3af' },
    { icon: HelpCircle, label: t('profile.support'), action: handleSupport, color: '#9ca3af' },
    { icon: Trash2, label: t('profile.delete_account'), action: handleDeleteAccount, color: '#ef4444' }, // Red for delete
  ];

  return (
    <View className="flex-1 bg-background-dark">
      <BlobBackground />
      <StatusBar barStyle="light-content" />

      {/* Header / Title */}
      <View style={{ paddingTop: insets.top }} className="px-6 pb-4 z-10 w-full relative">
        <View className="flex-row items-center justify-between mb-2 mt-2">
          <Text className="text-white text-3xl font-bold tracking-tight">{t('home.nav_profile') || "Profile"}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

        {/* User Card */}
        <View className="items-center mt-4 mb-8 px-6">
          <View className="relative mb-4">
            <View className="w-28 h-28 rounded-full border-4 border-white/10 bg-surface-glass backdrop-blur-md items-center justify-center">
              <User size={56} color="rgba(255,255,255,0.7)" />
            </View>

            <View className={`absolute -bottom-3 self-center px-4 py-1.5 rounded-full border border-white/20 flex-row items-center shadow-md backdrop-blur-md ${isSubscribed ? 'bg-primary/90' : 'bg-stone-800/90'}`}>
              {isSubscribed && <InfinityIcon size={12} color="white" strokeWidth={3} className="mr-1" />}
              <Text className="text-white text-[10px] font-bold uppercase tracking-widest">
                {isSubscribed ? t('profile.status_premium') : t('profile.status_free')}
              </Text>
            </View>
          </View>

          <Text className="text-white text-xl font-bold mt-2 font-mono tracking-tight">
            {userId ? `${t('profile.user_id')}: ${userId.substring(0, 8)}...` : "..."}
          </Text>

          <Text className="text-white/50 text-sm mt-1 font-medium tracking-widest uppercase">
            {isSubscribed ? t('profile.member_pro') : t('profile.member_free')}
          </Text>
        </View>

        {/* Menu Sections */}
        <MenuSection title={t('profile.manage_sub')} items={subscriptionItems} />
        <MenuSection title={t('profile.legal_help')} items={legalItems} />

        {/* Version Info */}
        <View className="px-6 pb-10">
          <Text className="text-white/20 text-[10px] text-center mt-6 uppercase tracking-widest">
            {t('profile.app_version')}
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

// Helper with Glassmorphism
function MenuSection({ title, items }: { title: string, items: any[] }) {
  return (
    <View className="px-6 mb-6">
      <Text className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3 ml-2">{title}</Text>
      <View className="bg-surface-glass rounded-3xl overflow-hidden border border-white/10">
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={item.action}
            className={`flex-row items-center justify-between p-4 active:bg-white/5 ${index !== items.length - 1 ? 'border-b border-white/5' : ''}`}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityHint={item.subtitle || "Tap"}
          >
            <View className="flex-row items-center gap-4 flex-1">
              <View className="w-10 h-10 rounded-full items-center justify-center bg-white/5 border border-white/5">
                <item.icon size={20} color={item.color} />
              </View>
              <View>
                <Text className="font-semibold text-base text-white/90">{item.label}</Text>
                {item.subtitle && <Text className="text-white/40 text-xs mt-0.5">{item.subtitle}</Text>}
              </View>
            </View>
            <ChevronRight size={18} color="rgba(255,255,255,0.3)" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}