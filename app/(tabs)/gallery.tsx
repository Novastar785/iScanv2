import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import { useFocusEffect, useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Image, Modal, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BlobBackground from '../../components/BlobBackground';

const { width } = Dimensions.get('window');

// Fallback images (same as index.tsx to keep consistency if needed)
const placeholderImage = require('../../assets/images/galaria1.jpg');

export default function GalleryScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // const [hasPermission, setHasPermission] = useState(false);
    // const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    // Mock Data from the design
    const MOCK_GALLERY = [
        { id: '1', uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGsYToxfHnHYyY6Qpj6Lvkz3rizfXTE15NJFgtpCM5CJB_2Cp4obmxl3FByFtBHKvNqAnldD-RHRWX-Fwj4APxHIpkVrv_l9S-IC2XKLrrTXX39jBE8S4iL8UZVUHa55pu4krkfbDnrqb0pIPYrtuOgLUFqwT3gkdrcpGyw_MJwt-bXYqbQnH1wiTussgliGve-lUplz4cOdLFo7QXIYFb5WcQtqOP8fE1FXFolMC9x_dal7r7sZfY4wXZOv_8CNrvZdHJgB-dZG0" }, // Cat
        { id: '2', uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuA3S8P_jmi3JkStHGgawT4vv2fpUclAVeSuAtqU24w8mlbBnPfM_0-SRP1FCzinZSlfX7ripsvX_LQJ58JCFr63B49DcLrQIHsNTH8-6KD0oBBHV9885HOZq_hNWdb7M8AeTVCstcaJMrpOiFkbr7hyvfXRBrKdR4j-ik1wy511W_VGu0yhYt67RLcINWY39jJAgG84t035j48AhiOmZu2IixQE6KnMcFSemerbOPDRWqOy25g8kM_3l_zLJPr1B33QDsMzG1sPXGc" }, // Dog
        { id: '3', uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDcuvyxTL9M0d0_8wTt9X8V2FRC3dlfg33wbGo7zD80G8sZXKqRRFtrnSVRjtGE_wSdW1MoxIimYwnO1j-LLZrTh31UEYXX5TozMtkCtWy9volwE2aeskui37yUeAlbjxnpMn9XIVkStVSvPI2LanK1WTh--vn4yF7uXsDZFBOvaRF67e-EswVGJ6xci9jwYCuhEVc1aPEC3KE82JF1ghQfrXIPn9H-k5-1kjFRzkXzHcN4qFQ_Kj2EZWcvO4thb9gLYssp4MeT6Fw" }, // Plant
        { id: '4', uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuB4oq4xrnz3EPYxQWTKHQ4zyOmYdivYo6uHXeWhoUFCEPdyypRbT3bD02zfmN2l-_iP2fH4GLwKHv22pmbjO2T6HV_4uaIj70lqXCQNxw4Qpp3qVes2hERl5hdgGLTWyT2cBlNyWllOczZEFpvD1jhijcDHRxS46fpmt3ZZWjq2JsImQec6M83hIZ5CdwDaaV1_x9BFIKDU3UzDK19OumT5i7CTE8r5pIEdeO7qCj4zz40ZXpdlL8k4Qj9E4HKuiNMqklSKeE9PGLY" }, // Fish
        { id: '5', uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCFfmvx6q3es0_3rUcaxlA3cQKQHl1xH7L2xPAyj44W52pNTU2yrpGhGW5Pii1TN7AHVT-j4kF9kU_Kak4tMQaeacbfxYBm4X97n8AZ3cSf-0l9-ftE7VRk7_1Pc8UGNchOKKZToUg7X_N7GK2AIAbvu_tI-Gr6bv_sBZZFUUAXcmqz4GwcE3hmdRjqBImoWSGlw7CieYgkn_1W2SdSAm1D5DXUkEweeST7m4P1XIekk-_pFO4z7cKd4pHesAbE0VY7D33V-X7_bN8" }, // Beetle
        { id: '6', uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGsYToxfHnHYyY6Qpj6Lvkz3rizfXTE15NJFgtpCM5CJB_2Cp4obmxl3FByFtBHKvNqAnldD-RHRWX-Fwj4APxHIpkVrv_l9S-IC2XKLrrTXX39jBE8S4iL8UZVUHa55pu4krkfbDnrqb0pIPYrtuOgLUFqwT3gkdrcpGyw_MJwt-bXYqbQnH1wiTussgliGve-lUplz4cOdLFo7QXIYFb5WcQtqOP8fE1FXFolMC9x_dal7r7sZfY4wXZOv_8CNrvZdHJgB-dZG0" }, // Coins (dup for now)
    ];

    // Placeholder data
    const PLACEHOLDER_GALLERY: any[] = Array(6).fill(0).map((_, i) => ({
        id: `placeholder-${i}`,
        uri: placeholderImage
    }));

    /* 
    useFocusEffect(
        useCallback(() => {
            (async () => {
                try {
                const { status } = await MediaLibrary.requestPermissionsAsync();
                if (status === 'granted') {
                    setHasPermission(true);
                    loadAuraAlbum();
                }
                } catch (e) { console.log("Error permisos o Expo Go"); }
            })();
        }, [])
    );

    const loadAuraAlbum = async () => {
        try {
            const album = await MediaLibrary.getAlbumAsync('iScan AI');
            if (album) {
                const assets = await MediaLibrary.getAssetsAsync({ album, first: 50, mediaType: 'photo', sortBy: ['creationTime'] });
                setGalleryPhotos(assets.assets);
            } else { setGalleryPhotos([]); }
        } catch (e) { setGalleryPhotos([]); }
    };
    */

    const displayPhotos = MOCK_GALLERY;
    const isShowingPlaceholders = true; // Always true for mock mode, or logic to show "Example" badge

    return (
        <View className="flex-1 bg-background-dark">
            <BlobBackground />
            <StatusBar barStyle="light-content" />

            {/* Header / Title */}
            <View style={{ paddingTop: insets.top }} className="px-6 pb-4 z-10 w-full relative">
                {/* Glass Blur behind Header */}
                <View className="absolute inset-x-0 top-0 h-32 bg-background-dark/30 z-0" style={{ backdropFilter: 'blur(20px)' }} />

                <View className="flex-row items-center justify-between mb-2 mt-2">
                    <Text className="text-white text-3xl font-bold tracking-tight">{t('home.gallery_header') || "Gallery"}</Text>
                    {!isShowingPlaceholders && (
                        <View className="bg-white/10 px-3 py-1 rounded-full border border-white/10">
                            <Text className="text-primary-light text-xs font-bold">{displayPhotos.length} {t('photos') || "Scans"}</Text>
                        </View>
                    )}
                </View>
                <Text className="text-stone-300 text-sm">{t('gallery.subtitle') || "Your saved scans and discoveries"}</Text>
            </View>

            {/* Content */}
            <ScrollView
                className="flex-1 px-4"
                contentContainerStyle={{ paddingBottom: 120, paddingTop: 10 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="flex-row flex-wrap justify-between">
                    {displayPhotos.map((photo, index) => (
                        <TouchableOpacity
                            key={photo.id}
                            activeOpacity={0.8}
                            onPress={() => setSelectedPhoto(photo.uri)}
                            className="bg-surface-glass rounded-2xl mb-4 overflow-hidden border border-white/20 relative"
                            style={{ width: '48%', aspectRatio: 0.8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 }}
                        >
                            <Image
                                source={typeof photo.uri === 'string' ? { uri: photo.uri } : photo.uri}
                                className="w-full h-full"
                                resizeMode="cover"
                            />

                            {/* Overlay Gradient */}
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.6)']}
                                className="absolute bottom-0 w-full h-1/3"
                            />

                            {isShowingPlaceholders && (
                                <View className="absolute top-2 right-2 bg-black/40 px-2 py-1 rounded-md backdrop-blur-md">
                                    <Text className="text-white/80 text-[8px] font-bold tracking-wide">EXAMPLE</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {isShowingPlaceholders && (
                    <View className="mt-8 px-8 py-6 rounded-2xl bg-surface-glass border border-white/10 items-center">
                        <Text className="text-stone-300 text-center leading-relaxed">
                            {t('home.empty_gallery') || "Scan objects to establish your collection. Your photos will appear here automatically."}
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Modal */}
            <Modal
                visible={!!selectedPhoto}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSelectedPhoto(null)}
            >
                <View className="flex-1 bg-black/95 justify-center items-center relative">
                    <Image
                        source={{ uri: selectedPhoto || "" }}
                        style={{ width: width, height: '80%', borderRadius: 0 }}
                        resizeMode="contain"
                    />
                    <TouchableOpacity
                        onPress={() => setSelectedPhoto(null)}
                        className="absolute top-12 right-6 w-12 h-12 bg-white/10 rounded-full items-center justify-center border border-white/20"
                    >
                        <X color="#fff" size={24} />
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
}
