import React, { useRef, useState, useEffect } from 'react';
import { View, Text, FlatList, Dimensions, Image, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cssInterop } from 'nativewind';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  Easing,
  FadeInDown,
  withDelay
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';



// 2. CONFIGURAMOS LinearGradient PARA QUE ACEPTE CLASES DE TAILWIND
cssInterop(LinearGradient, {
  className: "style",
});

const { width } = Dimensions.get('window');



// --- COMPONENTE: Tarjeta de Estilo ---
const ShimmerCard = ({ image, title, delay }: { image: any, title: string, delay: number }) => {
  const translateX = useSharedValue(-200);

  useEffect(() => {
    translateX.value = withDelay(delay, withRepeat(
      withTiming(400, { duration: 1500, easing: Easing.linear }),
      -1,
      false
    ));
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View className="w-full h-40 mb-5 rounded-2xl overflow-hidden relative shadow-sm elevation-2 bg-white">
      <Image source={image} className="w-full h-full object-cover opacity-90" />

      <LinearGradient
        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
        className="absolute inset-0 justify-end pb-4 pl-5"
      >
        <Text className="text-white text-2xl font-bold tracking-wider uppercase shadow-md">{title}</Text>
      </LinearGradient>

      <Animated.View style={[styles.shimmer, shimmerStyle]}>
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
};

// --- COMPONENTE: Welcome Slide (Pantalla 1) ---
const WelcomeSlide = () => {
  const { t } = useTranslation();
  const scale = useSharedValue(0);

  useEffect(() => {
    // Animación de rebote inicial
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 100
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View className="flex-1 items-center justify-center bg-white">
      {/* Círculo de fondo sutil */}
      {/* Círculo de fondo eliminado por causar glitch visual */}

      <Animated.View style={[animatedStyle, { zIndex: 10 }]}>
        <Image
          source={require('../assets/images/icon.png')}
          style={{ width: 180, height: 180, borderRadius: 40 }}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.Text
        entering={FadeInDown.delay(300).springify()}
        className="text-stone-900 text-4xl font-black mt-8 tracking-tight text-center"
      >
        {t('onboarding.welcome_title')}
      </Animated.Text>
    </View>
  );
};

// --- COMPONENTE: Scanner Animation (Componente Visual) ---
const ScannerAnimation = () => {
  const scanLineY = useSharedValue(0);

  useEffect(() => {
    scanLineY.value = withRepeat(
      withSequence(
        withTiming(280, { duration: 1500, easing: Easing.linear }),
        withTiming(0, { duration: 1500, easing: Easing.linear })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
  }));

  return (
    <View className="relative w-full h-[350px] rounded-3xl overflow-hidden bg-gray-100 shadow-sm border border-gray-200 mt-6">
      <Image
        source={require('../assets/images/index/cat.png')}
        className="w-full h-full object-cover"
      />

      {/* Overlay oscuro sutil */}
      <View className="absolute inset-0 bg-black/10" />

      {/* Marco de Escaneo */}
      <View className="absolute inset-0 border-2 border-white/50 rounded-3xl m-4" />

      {/* Esquinas del Marco (Simuladas) */}
      <View className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-yellow-500 rounded-tl-xl" />
      <View className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-yellow-500 rounded-tr-xl" />
      <View className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-yellow-500 rounded-bl-xl" />
      <View className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-yellow-500 rounded-br-xl" />

      {/* Linea de Escaneo Animada */}
      <Animated.View style={[{ position: 'absolute', top: 20, left: 20, right: 20, height: 2 }, animatedStyle]}>
        <LinearGradient
          colors={['rgba(234, 179, 8, 0)', 'rgba(234, 179, 8, 1)', 'rgba(234, 179, 8, 0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1, borderRadius: 1 }}
        />
        {/* Brillo/Resplandor debajo de la linea */}
        <LinearGradient
          colors={['rgba(234, 179, 8, 0)', 'rgba(234, 179, 8, 0.3)', 'rgba(234, 179, 8, 0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: '100%', height: 40 }}
        />
      </Animated.View>
    </View>
  );
};

// --- PANTALLA PRINCIPAL ---
export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Auto-advance logic for the first screen
  useEffect(() => {
    if (currentIndex === 0) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: 1, animated: true });
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex < 3) { // 0, 1, 2 -> Next. 3 -> Paywall. (Total 4 screens)
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/paywall');
    }
  };

  const screens = [
    // 1. WELCOME
    {
      id: '1',
      content: <WelcomeSlide />,
    },
    // 2. SCANNER (Uses old Slide 1 text + New Animation)
    {
      id: '2',
      content: (
        <View className="flex-1 px-6 pt-6 bg-white">
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text className="text-stone-900 text-4xl font-black mb-3 leading-tight">
              {t('onboarding.slide1_title')}{'\n'}
              <Text className="text-yellow-600">{t('onboarding.slide1_title_accent')}</Text>
            </Text>
            <Text className="text-gray-500 text-lg leading-6">
              {t('onboarding.slide1_text')}
            </Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(300).duration(800)}>
            <ScannerAnimation />
          </Animated.View>
        </View>
      ),
    },
    // 3. STYLES (Uses old Slide 2 text + Cards)
    {
      id: '3',
      content: (
        <View className="flex-1 px-6 pt-6 bg-white">
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text className="text-stone-900 text-4xl font-black mb-3">
              {t('onboarding.slide2_title')} <Text className="text-yellow-600">{t('onboarding.slide2_title_accent')}</Text>
            </Text>
            <Text className="text-gray-500 text-lg mb-6 leading-6">
              {t('onboarding.slide2_text')}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <ShimmerCard
              image={require('../assets/images/index/plant.png')}
              title={t('onboarding.style_nordic')}
              delay={0}
            />
            <ShimmerCard
              image={require('../assets/images/index/rock.png')}
              title={t('onboarding.style_modern')}
              delay={500}
            />
            <ShimmerCard
              image={require('../assets/images/index/insect.png')}
              title={t('onboarding.style_minimalist')}
              delay={1000}
            />
          </Animated.View>
        </View>
      ),
    },
    // 4. GALLERY (New "Save Favorites" Screen)
    {
      id: '4',
      content: (
        <View className="flex-1 px-6 pt-6 bg-white">
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text className="text-stone-900 text-4xl font-black mb-3">
              {t('onboarding.slide3_title')}
              <Text className="text-yellow-600"> {t('onboarding.slide3_title_accent')}</Text>
            </Text>
            <Text className="text-gray-500 text-lg mb-8 px-0">
              {t('onboarding.slide3_text')}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).springify()} className="items-center justify-center flex-1 pb-20">
            <Image
              source={require('../assets/images/galaria1.jpg')}
              style={{ width: width - 48, height: 400, borderRadius: 24 }}
              resizeMode="cover"
            />
          </Animated.View>
        </View>
      ),
    },
  ];

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <FlatList
          ref={flatListRef}
          data={screens}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ width, height: '100%' }}>
              {item.content}
            </View>
          )}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentIndex(index);
          }}
        />

        <View className="px-6 pb-6 pt-2 bg-white">
          <View className="flex-row justify-center space-x-2 mb-6">
            {screens.map((_, index) => {
              const isActive = currentIndex === index;
              return (
                <Animated.View
                  key={index}
                  style={{
                    width: isActive ? 32 : 8,
                    height: 8,
                    backgroundColor: isActive ? '#1c1917' : '#e5e7eb',
                    borderRadius: 4
                  }}
                />
              );
            })}
          </View>

          {/* Ocultar botón en la pantalla de Welcome (índice 0) */}
          {currentIndex > 0 && (
            <TouchableOpacity
              onPress={handleNext}
              activeOpacity={0.9}
              accessibilityRole="button"
              accessibilityLabel={currentIndex === 3 ? t('a11y.onboarding_claim') : t('a11y.onboarding_next')}
              className="w-full rounded-2xl shadow-xl shadow-stone-200"
            >
              <LinearGradient
                colors={['#1c1917', '#292524']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-5 items-center justify-center rounded-2xl"
              >
                <Text className="text-white font-bold text-lg tracking-widest uppercase">
                  {currentIndex === 3 ? t('onboarding.btn_claim') : t('onboarding.btn_next')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 150,
    transform: [{ skewX: '-25deg' }]
  }
});