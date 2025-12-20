import { BlurView } from 'expo-blur';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { Home, ShoppingBag, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function CustomTabBar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();

  const isHome = pathname === '/' || pathname === '/index' || (pathname.includes('(tabs)') && !pathname.includes('store') && !pathname.includes('profile'));
  const isStore = pathname.includes('store');
  const isProfile = pathname.includes('profile');

  // --- CAMBIO: Props de Accesibilidad agregadas ---
  const TabItem = ({ icon: Icon, label, isActive, onPress, accessibilityLabel }: { icon: any, label: string, isActive: boolean, onPress: () => void, accessibilityLabel: string }) => (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={onPress} 
      className="flex-1 items-center justify-center h-full"
      // ACCESIBILIDAD
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={accessibilityLabel}
    >
      <Icon 
        size={24} 
        color={isActive ? '#111827' : '#9CA3AF'} 
        strokeWidth={isActive ? 2.5 : 2} 
        fill={isActive ? '#111827' : 'transparent'} 
      />
      <Text className={`text-[10px] mt-1 font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View 
      className="absolute bottom-0 left-0 right-0 items-center z-50 pointer-events-box-none"
      style={{ paddingBottom: Math.max(insets.bottom, 20) }}
    >
      <View 
        className="w-[90%] max-w-[400px]"
        style={{ 
            shadowColor: "#4f46e5", 
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 10,
            backgroundColor: 'transparent', 
            borderRadius: 9999,
        }}
      >
        <View className="rounded-full overflow-hidden border border-white/60">
            <BlurView 
              intensity={95}
              tint="light" 
              className="flex-row items-center justify-around h-20 bg-white/70"
            >
              <TabItem 
                icon={ShoppingBag} 
                label={t('home.nav_shop')} 
                isActive={isStore} 
                onPress={() => router.push('/(tabs)/store')} 
                accessibilityLabel={t('a11y.tab_store')} // Nueva clave
              />
              <TabItem 
                icon={Home} 
                label="Home" 
                isActive={isHome} 
                onPress={() => router.push('/(tabs)')} 
                accessibilityLabel={t('a11y.tab_home')} // Nueva clave
              />
              <TabItem 
                icon={User} 
                label={t('home.nav_profile')} 
                isActive={isProfile} 
                onPress={() => router.push('/(tabs)/profile')} 
                accessibilityLabel={t('a11y.tab_profile')} // Nueva clave
              />
            </BlurView>
        </View>
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={() => <CustomTabBar />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: 'transparent' }
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="store" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}