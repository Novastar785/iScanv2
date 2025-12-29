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


// Custom "Cut Glass" Shadow Style for cards
const cutGlassStyle = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.5,
  shadowRadius: 20,
  elevation: 10,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.2)',
  backgroundColor: 'rgba(255,255,255,0.1)', // Dark theme glass
};

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Config or placeholders
  const getCost = (feature: string, defaultPrice: number) => defaultPrice;

  // Categories data
  const CATEGORIES = [
    {
      id: 'plant',
      route: '/features/plant',
      title: t('tools.plant.title') || "Plants",
      icon: Sparkles,
      image: require('../../assets/images/index/plant.png'),
      iconName: 'psychiatry'
    },
    {
      id: 'coin',
      route: '/features/coin',
      title: t('tools.coin.title') || "Coins",
      icon: Coins,
      image: require('../../assets/images/index/coin.png'),
      iconName: 'monetization_on'
    },
    {
      id: 'fish',
      route: '/features/fish',
      title: t('tools.fish.title') || "Fish",
      icon: Fish,
      image: require('../../assets/images/index/fish.png'),
      iconName: 'set_meal'
    },
    {
      id: 'cat',
      route: '/features/cat',
      title: t('tools.cat.title') || "Cat",
      icon: PawPrint,
      image: require('../../assets/images/index/cat.png'),
      iconName: 'pets'
    },
    {
      id: 'dog',
      route: '/features/dog',
      title: t('tools.dog.title') || "Dog",
      icon: PawPrint,
      image: require('../../assets/images/index/dog.png'),
      iconName: 'pets'
    },
    {
      id: 'rock',
      route: '/features/rock',
      title: t('tools.rock.title') || "Rocks",
      icon: Gem,
      image: require('../../assets/images/index/rock.png'),
      iconName: 'landscape'
    },
    {
      id: 'insect',
      route: '/features/insect',
      title: t('tools.insect.title') || "Insects",
      icon: Bug,
      image: require('../../assets/images/index/insect.png'),
      iconName: 'bug_report'
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
        {/* Header Text - Dark Theme */}
        <View className="px-6 mb-8 mt-4 items-center relative z-20">
          <Text className="text-white text-3xl font-bold leading-tight mb-3 text-center drop-shadow-md">
            {t('home.title_question') || "¿Qué quieres descubrir hoy?"}
          </Text>
          <Text className="text-stone-300 text-sm font-medium leading-relaxed max-w-[280px] text-center">
            {t('home.subtitle_instruction') || "Selecciona una categoría para ayudar a nuestra IA a darte un resultado preciso"}
          </Text>
        </View>

        {/* Auto-Detect Button - Glass Style */}
        <View className="px-4 mb-8">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/features/custom')}
            className="w-full relative group overflow-hidden"
            style={{
              height: 80,
              borderRadius: 20,
              ...cutGlassStyle,
              backgroundColor: 'rgba(255,255,255,0.15)', // Lighter glass for button
              borderColor: 'rgba(255,255,255,0.3)',
              shadowColor: '#f59e0b', // Amber glow
              shadowOpacity: 0.3,
              elevation: 0, // Remove native shadow artifact on Android
            }}
          >

            {/* Shimmer Effect */}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.3 }}
            />

            {/* Content */}
            <View className="flex-row items-center justify-between h-full px-6">
              <View className="flex-row items-center gap-4 z-10">
                {/* Icon Container - Amber Gradient */}
                <View className="w-12 h-12 rounded-xl items-center justify-center border border-white/20" style={{ overflow: 'hidden' }}>
                  <LinearGradient
                    colors={['#f59e0b', '#d97706']} // Amber 500 -> 600
                    style={{ position: 'absolute', width: '100%', height: '100%' }}
                  />
                  <Sparkles color="white" size={24} />
                </View>
                <View>
                  <Text className="text-white font-bold text-lg tracking-wide" style={{ textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>{t('home.auto_detect') || "Auto-detectar"}</Text>
                  <Text className="text-stone-300 text-xs">{t('home.smart_scan') || "Escaneo inteligente IA"}</Text>
                </View>
              </View>
              <Scan color="#f59e0b" size={28} className="z-10 animate-pulse" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Grid of Categories */}
        <View className="flex-row flex-wrap px-2">
          {CATEGORIES.map((item, index) => {
            const isWide = item.id === 'insect';
            return (
              <View key={item.id} className={`p-2 ${isWide ? 'w-full' : 'w-1/2'}`}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => router.push(item.route as any)}
                  style={{
                    aspectRatio: isWide ? 2.2 : 1,
                    borderRadius: 20,
                    overflow: 'hidden',
                    ...cutGlassStyle,
                    // Slightly adjust shadow for cards vs primary button
                    shadowOpacity: 0.1,
                  }}
                >
                  {/* Background Image - Full Vibrancy */}
                  <Animated.Image
                    source={item.image}
                    className="absolute inset-0 w-full h-full"
                    resizeMode="cover"
                    // @ts-ignore
                    sharedTransitionTag={`feature-image-${item.id}`}
                  />

                  {/* White Gradient Fade from Bottom - Pushed down for more vibrancy */}
                  <LinearGradient
                    colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.7)', '#ffffff']}
                    locations={[0.65, 0.85, 1]}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                  />

                  {/* Top Shine/Reflection - REMOVED for clarity */}

                  {/* Content */}
                  <View className="absolute bottom-0 left-0 w-full p-5 flex-col justify-end z-10 w-full">
                    {/* Icon Box */}
                    <View className="w-10 h-10 rounded-xl bg-surface-glass border border-white/20 items-center justify-center mb-1 shadow-sm">
                      <item.icon color="#f59e0b" size={24} />
                    </View>

                    <View className="flex-row justify-between items-end w-full">
                      {/* Text - Darker and sharper without shadow */}
                      <Text className="text-slate-900 text-xl font-extrabold leading-tight">
                        {item.title}
                      </Text>

                      {/* Arrow for Wide Card */}
                      {isWide && (
                        <View className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center backdrop-blur-md border border-white/40 mb-1">
                          <Scan color="#334155" size={20} style={{ transform: [{ rotate: '-90deg' }] }} />
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

      </ScrollView>
    </View>
  );
}
