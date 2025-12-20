import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Dimensions, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { ArrowRight, Check, Sparkles, Wand2, Home } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Datos de las diapositivas
const SLIDES = [
  {
    id: '1',
    title: 'Transforma tu Espacio',
    description: 'Toma una foto y deja que la IA rediseñe tu habitación en segundos.',
    icon: Wand2,
    color: '#4F46E5', // Indigo
    // Aquí podrías poner una imagen de fondo real de "Antes/Después"
  },
  {
    id: '2',
    title: 'Elige tu Estilo',
    description: 'Desde Minimalista hasta Industrial. Tenemos docenas de estilos para ti.',
    icon: Home,
    color: '#7C3AED', // Violet
  },
  {
    id: '3',
    title: 'Tu Regalo de Bienvenida',
    description: 'Empieza hoy con 3 CRÉDITOS GRATIS para diseñar tus primeras habitaciones.',
    icon: Sparkles,
    color: '#DB2777', // Pink
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      await finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
    // NO guardamos 'HAS_SEEN_ONBOARDING' todavía. 
    // Lo guardamos cuando salgan del Paywall, para asegurar que lo vean al menos una vez.
    
    // Navegamos al Paywall
    router.push('/paywall');
  };

  const Slide = ({ item }: { item: typeof SLIDES[0] }) => {
    const Icon = item.icon;
    return (
      <View style={{ width, height }} className="items-center justify-center p-6 pb-32">
        {/* Círculo decorativo de fondo */}
        <View 
          className="absolute rounded-full opacity-20"
          style={{ 
            backgroundColor: item.color, 
            width: width * 1.2, 
            height: width * 1.2, 
            top: -width * 0.4 
          }} 
        />
        
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <View className="bg-white/80 p-8 rounded-3xl shadow-xl items-center mb-8 border border-white/40">
            <Icon size={80} color={item.color} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()} className="items-center">
          <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
            {item.title}
          </Text>
          <Text className="text-lg text-gray-500 text-center px-4 leading-relaxed">
            {item.description}
          </Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-violet-50">
      <StatusBar style="dark" />
      
      {/* Carrusel de Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={({ item }) => <Slide item={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        keyExtractor={(item) => item.id}
      />

      {/* Footer Fijo: Indicadores y Botón */}
      <SafeAreaView className="absolute bottom-0 w-full px-6 py-4">
        {/* Indicadores (Puntos) */}
        <View className="flex-row justify-center mb-8 space-x-2">
          {SLIDES.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === index ? 'w-8 bg-indigo-600' : 'w-2 bg-indigo-200'
              }`}
            />
          ))}
        </View>

        {/* Botón de Acción */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          className="bg-indigo-600 py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-indigo-200"
        >
          <Text className="text-white font-bold text-lg mr-2">
            {currentIndex === SLIDES.length - 1 ? 'Empezar a Diseñar' : 'Siguiente'}
          </Text>
          {currentIndex === SLIDES.length - 1 ? (
             <Sparkles size={20} color="white" />
          ) : (
             <ArrowRight size={20} color="white" />
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}