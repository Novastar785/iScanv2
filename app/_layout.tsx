import { DarkTheme, Theme, ThemeProvider } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import LottieView from 'lottie-react-native';
import { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Purchases from 'react-native-purchases';

// Importaciones locales
import { REVENUECAT_API_KEY } from '../src/config/secrets';
import "../src/i18n/index";
import "./global.css";

// Mantiene el splash nativo visible hasta que le digamos lo contrario
SplashScreen.preventAutoHideAsync();

// 2. Definimos el tema "Aura"
const AuraTheme: Theme = {
  ...DarkTheme, 
  colors: {
    ...DarkTheme.colors,
    background: '#0f0f0f', 
    card: '#0f0f0f',       
    text: '#ffffff',
    border: '#27272a',     
  },
};

export default function Layout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    async function prepare() {
      try {
        // Configuración visual solo para Android (NavBar transparente)
        if (Platform.OS === 'android') {
          await SystemUI.setBackgroundColorAsync("#0f0f0f");
          await NavigationBar.setVisibilityAsync("hidden");
          await NavigationBar.setBehaviorAsync("overlay-swipe");
          await NavigationBar.setBackgroundColorAsync("transparent");
        }

        const initRevenueCat = async () => {
          try {
            // CORRECCIÓN IMPORTANTE:
            // Ya no usamos "if (Platform.OS === 'android')" aquí.
            // Como secrets.ts ya nos da la key correcta (sea ios o android),
            // ejecutamos esto para AMBAS plataformas.
            if (REVENUECAT_API_KEY) {
                await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
                console.log("RevenueCat configurado correctamente");
            } else {
                console.warn("No se encontró API Key de RevenueCat");
            }
          } catch (e) {
            console.error("Error inicializando RevenueCat", e);
          }
        };

        await initRevenueCat();
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Ocultar splash nativo y reproducir Lottie cuando la app esté lista
  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
      
      if (Platform.OS === 'android') {
        setTimeout(() => {
          animationRef.current?.play();
        }, 50);
      } else {
        animationRef.current?.play();
      }
    }
  }, [appIsReady]);

  if (!appIsReady || !animationFinished) {
    return (
      <View style={[styles.container, { backgroundColor: '#000000' }]}>
        <LottieView
          ref={animationRef}
          source={require('../assets/animations/splash-animation.json')}
          autoPlay={false} 
          loop={false}
          resizeMode="cover"
          onAnimationFinish={() => setAnimationFinished(true)}
          style={styles.lottie}
        />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={AuraTheme}>
        <Stack 
          screenOptions={{ 
            headerShown: false,
            contentStyle: { backgroundColor: '#0f0f0f' },
            animation: 'fade', 
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottie: {
    width: 250, 
    height: 250,
  },
});