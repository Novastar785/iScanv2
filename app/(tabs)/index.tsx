import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Sparkles, Scan, PawPrint, Coins, Fish, Bug, Globe, Gem } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Image, ScrollView, StatusBar, Text, TouchableOpacity, View, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BlobBackground from '../../components/BlobBackground';
import { useRemoteConfig } from '../../hooks/useRemoteConfig';

// Make sure icons can take classes if needed (though we use color props mostly)
cssInterop(Sparkles, { className: "style" });

const { width } = Dimensions.get('window');

import { BlurView } from 'expo-blur';
import { t } from 'i18next';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Config or placeholders
  const getCost = (feature: string, defaultPrice: number) => defaultPrice;

  // Categories data matching the new design
  const CATEGORIES = [
    {
      id: 'plant',
      route: '/features/plant',
      title: t('tools.plant.title') || "Plants",
      icon: Sparkles, // Placeholder icon
      iconName: 'psychiatry', // Material symbol equivalent
      image: require('../../assets/images/index/plant.png')
    },
    {
      id: 'coin',
      route: '/features/coin',
      title: 'Coins',
      icon: Coins,
      iconName: 'monetization_on',
      image: require('../../assets/images/index/coin.png')
    },
    {
      id: 'fish',
      route: '/features/fish',
      title: t('tools.fish.title') || "Fish",
      icon: Fish,
      iconName: 'set_meal',
      image: require('../../assets/images/index/fish.png')
    },
    {
      id: 'cat',
      route: '/features/cat',
      title: t('tools.cat.title') || "Cat",
      icon: PawPrint,
      iconName: 'pets',
      image: require('../../assets/images/index/cat.png')
    },
    {
      id: 'dog',
      route: '/features/dog',
      title: t('tools.dog.title') || "Dog",
      icon: PawPrint,
      iconName: 'pets',
      image: require('../../assets/images/index/dog.png')
    },
    {
      id: 'rock',
      route: '/features/rock',
      title: t('tools.rock.title') || "Rocks",
      icon: Gem,
      iconName: 'landscape',
      image: require('../../assets/images/index/rock.png')
    },
    {
      id: 'insect',
      route: '/features/insect',
      title: t('tools.insect.title') || "Insects",
      icon: Bug,
      iconName: 'bug_report',
      image: require('../../assets/images/index/insect.png')
    },
  ];

  return (
    <View className="flex-1 bg-background-dark">
      <BlobBackground />
      <StatusBar barStyle="light-content" />

      {/* Main Scroll Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: insets.top + 20 }}
      >
        {/* Header Text */}
        <View className="px-6 mb-8 mt-4">
          <Text className="text-white text-3xl font-bold leading-tight mb-2 drop-shadow-md">
            {t('home.title_question') || "¿Qué quieres descubrir hoy?"}
          </Text>
          <Text className="text-stone-300 text-sm font-medium leading-relaxed max-w-[280px]">
            {t('home.subtitle_instruction') || "Selecciona una categoría para ayudar a nuestra IA a darte un resultado preciso"}
          </Text>
        </View>

        {/* Auto-Detect Button */}
        {/* Auto-Detect Button */}
        <View className="px-4 mb-6">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/features/custom')}
            className="w-full relative"
            style={{
              height: 80,
              borderRadius: 24, // Explicit border radius (rounded-3xl)
              overflow: 'hidden', // Enforce clipping
              shadowColor: '#d97706',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 15,
              elevation: 8,
              backgroundColor: 'rgba(60, 40, 30, 0.8)' // Fallback background
            }}
          >
            {/* Unified Background Layer */}
            <BlurView intensity={40} tint="dark" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />

            <LinearGradient
              colors={['rgba(80, 50, 40, 0.6)', 'rgba(60, 40, 30, 0.8)']}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />

            {/* Shimmer Effect */}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />

            {/* Border Overlay - Dedicated View for reliable border rendering */}
            <View
              className="absolute inset-0 border border-white/20 rounded-[24px]"
              pointerEvents="none"
            />

            {/* Content */}
            <View className="flex-row items-center justify-between h-full px-6">
              <View className="flex-row items-center gap-4">
                {/* Icon Container - Using consistent rounded style */}
                <View className="w-12 h-12 rounded-xl bg-primary items-center justify-center border border-white/20 shadow-lg">
                  <Sparkles color="white" size={24} />
                </View>
                <View>
                  <Text className="text-white font-bold text-lg tracking-wide">{t('home.auto_detect') || "Auto-detectar"}</Text>
                  <Text className="text-stone-300 text-xs">{t('home.smart_scan') || "Escaneo inteligente IA"}</Text>
                </View>
              </View>
              <Scan color="#f59e0b" size={28} className="opacity-80" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Grid of Categories */}
        <View className="flex-row flex-wrap px-2">
          {CATEGORIES.map((item, index) => {
            const isWide = item.id === 'insect'; // Example logic for span-2
            return (
              <View key={item.id} className={`p-2 ${isWide ? 'w-full' : 'w-1/2'}`}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => router.push(item.route as any)}
                  style={{
                    aspectRatio: isWide ? 2.2 : 1,
                    shadowColor: '#d97706',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.5,
                    shadowRadius: 12,
                    elevation: 10,
                  }}
                >
                  {/* RIM LIGHTING / SPECULAR HIGHLIGHT WRAPPER */}
                  <LinearGradient
                    colors={['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ borderRadius: 20, padding: 1.5, flex: 1 }} // padding creates the border width
                  >
                    <View className="flex-1 rounded-[19px] overflow-hidden bg-surface-dark relative">
                      {/* Background Image - Full Vibrancy */}
                      <Animated.Image
                        source={item.image}
                        className="absolute inset-0 w-full h-full"
                        resizeMode="cover"
                        // @ts-ignore
                        sharedTransitionTag={`feature-image-${item.id}`}
                      />
                      {/* Subtle Gradient Overlay - Bottom only for text readability */}
                      <LinearGradient
                        colors={['transparent', 'transparent', 'rgba(0,0,0,0.8)']}
                        locations={[0, 0.5, 1]}
                        className="absolute inset-0"
                      />

                      {/* Content */}
                      <View className="absolute bottom-0 left-0 w-full p-4 flex-col justify-end h-full">
                        <View className="w-10 h-10 rounded-xl bg-surface-dark/50 backdrop-blur-md border border-white/20 items-center justify-center mb-2 shadow-lg">
                          <item.icon color="#f59e0b" size={20} />
                        </View>
                        <Text className="text-white text-lg font-bold leading-tight drop-shadow-md">
                          {item.title}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

      </ScrollView>
    </View>
  );
}