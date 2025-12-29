import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { Home, ShoppingBag, User, Image } from 'lucide-react-native';
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
      <View className={`p-2 rounded-xl transition-all ${isActive ? 'bg-[#f59e0b]/10' : 'bg-transparent'}`}>
        <Icon
          size={24}
          color={isActive ? '#f59e0b' : '#9CA3AF'} // Orange when active
          strokeWidth={isActive ? 2.5 : 2}
        />
      </View>
      <Text className={`text-[10px] mt-1 font-medium ${isActive ? 'text-[#f59e0b]' : 'text-gray-400'}`}>
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
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 10,
          backgroundColor: 'transparent',
          borderRadius: 9999,
        }}
      >
        <View className="rounded-full overflow-hidden border border-white/10">
          <BlurView
            intensity={60} // Slightly more opaque
            tint="dark"
            className="flex-row items-center justify-around h-20 bg-black/75" // Less translucent
          >
            <TabItem
              icon={ShoppingBag}
              label={t('home.nav_shop')}
              isActive={isStore}
              onPress={() => router.push('/(tabs)/store')}
              accessibilityLabel={t('a11y.tab_store')}
            />
            <TabItem
              icon={Home}
              label="Home"
              isActive={isHome}
              onPress={() => router.push('/(tabs)')}
              accessibilityLabel={t('a11y.tab_home')}
            />
            <TabItem
              icon={Image}
              label={t('home.nav_gallery') || "Gallery"}
              isActive={pathname.includes('gallery')}
              onPress={() => router.push('/(tabs)/gallery')}
              accessibilityLabel={t('a11y.tab_gallery') || "Gallery Tab"}
            />
            <TabItem
              icon={User}
              label={t('home.nav_profile')}
              isActive={isProfile}
              onPress={() => router.push('/(tabs)/profile')}
              accessibilityLabel={t('a11y.tab_profile')}
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
      <Tabs.Screen name="gallery" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}