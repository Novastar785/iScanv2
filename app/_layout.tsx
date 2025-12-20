import { DefaultTheme, Theme, ThemeProvider } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import LottieView from 'lottie-react-native';
import { initializeUser } from '../src/services/user';
import { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, View, StatusBar } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Purchases from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { REVENUECAT_API_KEY } from '../src/config/secrets';
import "../src/i18n/index";
import "./global.css";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});
SplashScreen.preventAutoHideAsync();

const GlassyTheme: Theme = {
  ...DefaultTheme, 
  colors: {
    ...DefaultTheme.colors,
    background: '#F5F3FF',
    card: '#ffffff',       
    text: '#111827',       
    border: '#E5E7EB',     
    primary: '#4F46E5',    
  },
};

export default function Layout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [splashAnimationFinished, setSplashAnimationFinished] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean>(false);
  const animationRef = useRef<LottieView>(null);
  const router = useRouter();

  useEffect(() => {
    async function prepare() {
      try {
        if (Platform.OS === 'android') {
          await SystemUI.setBackgroundColorAsync("#F5F3FF");
          await NavigationBar.setVisibilityAsync("hidden");
          StatusBar.setHidden(true);
          await NavigationBar.setBehaviorAsync("overlay-swipe");
          await NavigationBar.setBackgroundColorAsync("transparent");
          await NavigationBar.setButtonStyleAsync("dark"); 
          StatusBar.setBarStyle("dark-content");
        }

        // 2. Verificar si el usuario ya vio el Onboarding
        // COMENTA ESTAS LÍNEAS:
        // const hasSeenOnboarding = await AsyncStorage.getItem('HAS_SEEN_ONBOARDING');
        // setIsFirstLaunch(hasSeenOnboarding !== 'true');
        
        // AGREGA ESTA LÍNEA PARA PRUEBAS:
        setIsFirstLaunch(true);
        
        // Configurar RevenueCat
        if (REVENUECAT_API_KEY) {
          await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
        }

        await initializeUser(); 

      } catch (e) {
        console.warn("Error en la preparación:", e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
      // Iniciar animación Lottie
      if (Platform.OS === 'android') {
        setTimeout(() => animationRef.current?.play(), 50);
      } else {
        animationRef.current?.play();
      }
    }
  }, [appIsReady]);

  // Lógica de Redirección: Se ejecuta MIENTRAS el splash sigue visible encima
  useEffect(() => {
    if (appIsReady && isFirstLaunch) {
        // Si es primera vez, redirigimos ANTES de quitar el splash
        router.replace('/onboarding');
    }
  }, [appIsReady, isFirstLaunch]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={GlassyTheme}>
        {/* --- CORRECCIÓN 2: Renderizamos AMBOS (Stack y Splash) --- */}
        <View style={{ flex: 1 }}>
            {/* La App siempre está montada al fondo para que el router funcione */}
            <Stack 
              screenOptions={{ 
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' }, 
                animation: 'fade', 
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen 
                name="paywall" 
                options={{ 
                  headerShown: false, 
                  presentation: 'modal', 
                  animation: 'slide_from_bottom'
                }} 
              />
            </Stack>

            {/* El Splash se queda encima (Absolute) hasta que termina la animación */}
            {(!appIsReady || !splashAnimationFinished) && (
              <View style={[styles.splashContainer, { backgroundColor: '#ffffff' }]}>
                <LottieView
                  ref={animationRef}
                  source={require('../assets/animations/splash-animation.json')}
                  autoPlay={false} 
                  loop={false}
                  resizeMode="cover"
                  // Cuando termina la animación, quitamos esta vista (el usuario ya estará en onboarding)
                  onAnimationFinish={() => setSplashAnimationFinished(true)}
                  style={styles.lottie}
                />
              </View>
            )}
        </View>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    ...StyleSheet.absoluteFillObject, // Cubre toda la pantalla
    zIndex: 9999, // Asegura que esté siempre encima
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottie: {
    width: 250, 
    height: 250,
  },
});