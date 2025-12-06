import { LinearGradient } from 'expo-linear-gradient';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { Sparkles, User, Wallet } from 'lucide-react-native';
import { cssInterop } from "nativewind";
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Habilitamos Tailwind para el gradiente
cssInterop(LinearGradient, {
  className: "style",
});

function CustomTabBar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation(); // <--- Hook agregado

  // Lógica de estado activo
  const isHome = pathname === '/' || pathname === '/index' || pathname === '/(tabs)';
  const isStore = pathname.includes('store');
  const isProfile = pathname.includes('profile');

  return (
    <>
      {/* BARRA INFERIOR (Fondo y Botones Laterales) */}
      <View
        className="absolute bottom-0 w-full bg-[#0f0f0f]/95 border-t border-white/5 flex-row justify-between px-10 pt-4 z-10"
        style={{ paddingBottom: Math.max(insets.bottom, 20) }}
      >
        {/* Botón Tienda */}
        <TouchableOpacity
          className="items-center p-2"
          onPress={() => router.push('/(tabs)/store')}
          style={{ opacity: isStore ? 1 : 0.6 }}
        >
          <Wallet size={24} color={isStore ? '#818cf8' : 'white'} />
          <Text className={`text-[10px] mt-1 font-medium ${isStore ? 'text-indigo-400' : 'text-white'}`}>
            {t('home.nav_shop')} {/* <--- Texto traducido */}
          </Text>
        </TouchableOpacity>

        {/* Espacio vacío para el botón central */}
        <View className="w-20" />

        {/* Botón Perfil */}
        <TouchableOpacity
          className="items-center p-2"
          onPress={() => router.push('/(tabs)/profile')}
          style={{ opacity: isProfile ? 1 : 0.6 }}
        >
          <User size={24} color={isProfile ? '#818cf8' : 'white'} />
          <Text className={`text-[10px] mt-1 font-medium ${isProfile ? 'text-indigo-400' : 'text-white'}`}>
            {t('home.nav_profile')} {/* <--- Texto traducido */}
          </Text>
        </TouchableOpacity>
      </View>

      {/* BOTÓN CENTRAL FLOTANTE (Home) */}
      <View
        className="absolute left-0 right-0 items-center justify-center z-50 pointer-events-box-none"
        style={{ bottom: insets.bottom + 30 }}
      >
        {/* Efecto de brillo/sombra detrás del botón */}
        <View className="absolute w-20 h-20 bg-indigo-500/40 rounded-full blur-2xl" />
        
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push('/(tabs)')}
          className="rounded-full items-center justify-center shadow-2xl shadow-indigo-500/50"
          style={{ width: 72, height: 72, elevation: 10 }}
        >
          <LinearGradient
            colors={['#e0e7ff', '#818cf8']}
            className="w-full h-full rounded-full items-center justify-center border-4 border-white/10"
          >
            <Sparkles size={32} color="#312e81" fill="#312e81" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={() => <CustomTabBar />}
      screenOptions={{
        headerShown: false,
        // Color de fondo base para evitar parpadeos blancos
        sceneStyle: { backgroundColor: '#0f0f0f' } 
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="store" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}