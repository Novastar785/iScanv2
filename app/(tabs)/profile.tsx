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

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [userId, setUserId] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

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
    { icon: CreditCard, label: t('profile.manage_sub'), action: openCustomerCenter, subtitle: t('profile.manage_sub_desc'), iconColor: '#AF9883', bgIcon: 'bg-[#F5F0EB]' },
    { icon: Rocket, label: t('profile.upgrade'), action: openUpgradePaywall, subtitle: t('profile.upgrade_desc'), iconColor: '#AF9883', bgIcon: 'bg-[#F5F0EB]' },
    { icon: RefreshCcw, label: t('store.restore_title'), action: handleRestore, subtitle: t('profile.restore_desc'), iconColor: '#A8A29E', bgIcon: 'bg-[#F5F5F4]' },
  ];

  const legalItems = [
    { icon: Lock, label: t('profile.privacy'), action: () => router.push('/privacy' as any), iconColor: '#A8A29E', bgIcon: 'bg-[#F5F5F4]' },
    { icon: FileText, label: t('profile.terms'), action: () => router.push('/terms' as any), iconColor: '#A8A29E', bgIcon: 'bg-[#F5F5F4]' },
    { icon: HelpCircle, label: t('profile.support'), action: handleSupport, iconColor: '#A8A29E', bgIcon: 'bg-[#F5F5F4]' },
    { icon: Trash2, label: t('profile.delete_account'), action: handleDeleteAccount, iconColor: '#EF4444', bgIcon: 'bg-red-50' },
  ];

  return (
    <View className="flex-1 bg-[#F5F5F4]">
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop' }}
        className="absolute top-0 left-0 right-0 h-[350px] opacity-90"
        resizeMode="cover"
      />

      <LinearGradient
        colors={['rgba(250, 250, 249, 0)', '#FAFAF9', '#F5F5F4']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="absolute inset-0"
      />
      <StatusBar barStyle="dark-content" />

      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

          <View className="items-center mt-10 mb-8 px-6">
            <View className="relative mb-4">
              <View className="w-28 h-28 rounded-full border-4 border-[#FFFBF7] bg-white shadow-xl items-center justify-center">
                <User size={56} color="#A8A29E" />
              </View>

              <View className={`absolute -bottom-3 self-center px-4 py-1.5 rounded-full border border-white flex-row items-center shadow-md ${isSubscribed ? 'bg-[#AF9883]' : 'bg-gray-800'}`}>
                {isSubscribed && <InfinityIcon size={12} color="white" strokeWidth={3} className="mr-1" />}
                <Text className="text-white text-[10px] font-bold uppercase tracking-widest">
                  {isSubscribed ? t('profile.status_premium') : t('profile.status_free')}
                </Text>
              </View>
            </View>

            <Text className="text-gray-900 text-xl font-bold mt-2 font-mono">
              {userId ? `ID: ${userId.substring(0, 8)}...` : "..."}
            </Text>

            <Text className="text-gray-500 text-sm mt-1 font-medium tracking-widest uppercase">
              {isSubscribed ? t('profile.member_pro') : t('profile.member_free')}
            </Text>
          </View>



          <MenuSection title={t('profile.manage_sub')} items={subscriptionItems} />
          <MenuSection title={t('profile.legal_help')} items={legalItems} />

          <View className="px-6 pb-10">
            <Text className="text-gray-400 text-[10px] text-center mt-6 uppercase tracking-widest">
              Love Your Home v1.0.0
            </Text>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// Función auxiliar mejorada con accesibilidad
function MenuSection({ title, items }: { title: string, items: any[] }) {
  return (
    <View className="px-6 mb-6">
      <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3 ml-2">{title}</Text>
      <View className="bg-[#FFFBF7] rounded-3xl overflow-hidden border border-[#F2EBE6] shadow-sm">
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={item.action}
            className={`flex-row items-center justify-between p-4 active:bg-[#F2EBE6] ${index !== items.length - 1 ? 'border-b border-gray-100/50' : ''}`}
            // ACCESIBILIDAD
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityHint={item.subtitle || "Toca para abrir"}
          >
            <View className="flex-row items-center gap-4 flex-1">
              <View className={`w-10 h-10 rounded-full items-center justify-center ${item.bgIcon}`}>
                <item.icon size={20} color={item.iconColor} />
              </View>
              <View>
                <Text className="font-semibold text-base text-gray-900">{item.label}</Text>
                {item.subtitle && <Text className="text-gray-500 text-xs mt-0.5">{item.subtitle}</Text>}
              </View>
            </View>
            <ChevronRight size={18} color="#A8A29E" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}