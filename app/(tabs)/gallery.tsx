import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import { useFocusEffect, useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Image, Modal, ScrollView, StatusBar, Text, TouchableOpacity, View, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BlobBackground from '../../components/BlobBackground';

const { width } = Dimensions.get('window');

export default function GalleryScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [hasPermission, setHasPermission] = useState(false);
    const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [isShowingPlaceholders, setIsShowingPlaceholders] = useState(true);

    // Feature Images as Placeholders
    const PLACEHOLDER_GALLERY = [
        { id: 'p1', uri: require('../../assets/images/index/plant.png'), isPlaceholder: true },
        { id: 'p2', uri: require('../../assets/images/index/coin.png'), isPlaceholder: true },
        { id: 'p3', uri: require('../../assets/images/index/cat.png'), isPlaceholder: true },
        { id: 'p4', uri: require('../../assets/images/index/dog.png'), isPlaceholder: true },
        { id: 'p5', uri: require('../../assets/images/index/rock.png'), isPlaceholder: true },
        { id: 'p6', uri: require('../../assets/images/index/fish.png'), isPlaceholder: true },
        { id: 'p7', uri: require('../../assets/images/index/insect.png'), isPlaceholder: true },
    ];

    useFocusEffect(
        useCallback(() => {
            (async () => {
                try {
                    const { status } = await MediaLibrary.requestPermissionsAsync();
                    if (status === 'granted') {
                        setHasPermission(true);
                        loadAppAlbum();
                    } else {
                        // Permission denied: Show placeholders
                        setGalleryPhotos(PLACEHOLDER_GALLERY);
                        setIsShowingPlaceholders(true);
                    }
                } catch (e) {
                    console.log("Error checking permissions", e);
                    setGalleryPhotos(PLACEHOLDER_GALLERY);
                    setIsShowingPlaceholders(true);
                }
            })();
        }, [])
    );

    const loadAppAlbum = async () => {
        try {
            const albumName = 'iScan';
            const album = await MediaLibrary.getAlbumAsync(albumName);

            if (album) {
                const assets = await MediaLibrary.getAssetsAsync({
                    album,
                    first: 50,
                    mediaType: 'photo',
                    sortBy: ['creationTime']
                });

                if (assets.assets.length > 0) {
                    setGalleryPhotos(assets.assets);
                    setIsShowingPlaceholders(false);
                } else {
                    // Empty album: Show placeholders to avoid empty state
                    setGalleryPhotos(PLACEHOLDER_GALLERY);
                    setIsShowingPlaceholders(true);
                }
            } else {
                // Album doesn't exist yet: Show placeholders
                setGalleryPhotos(PLACEHOLDER_GALLERY);
                setIsShowingPlaceholders(true);
            }
        } catch (e) {
            console.log("Error loading album:", e);
            setGalleryPhotos(PLACEHOLDER_GALLERY);
            setIsShowingPlaceholders(true);
        }
    };

    return (
        <View className="flex-1 bg-background-dark">
            <BlobBackground />
            <StatusBar barStyle="light-content" />

            {/* Header / Title */}
            <View style={{ paddingTop: insets.top }} className="px-6 pb-4 z-10 w-full relative">
                {/* Removed the manual backdropFilter View to fix the glitch. 
                    The BlobBackground handles the ambient look. 
                    If a blur is strictly needed, we should use Expo BlurView, 
                    but for now, removing the artifact-causing view is safer. 
                 */}

                <View className="flex-row items-center justify-between mb-2 mt-2">
                    <Text className="text-white text-3xl font-bold tracking-tight">{t('home.gallery_header') || "Gallery"}</Text>
                    {/* Show count only if NOT showing placeholders */}
                    {!isShowingPlaceholders && galleryPhotos.length > 0 && (
                        <View className="bg-white/10 px-3 py-1 rounded-full border border-white/10">
                            <Text className="text-primary-light text-xs font-bold">{galleryPhotos.length} {t('home.photos') || "Scans"}</Text>
                        </View>
                    )}
                </View>
                <Text className="text-stone-300 text-sm">{t('home.gallery_subtitle') || "Your saved collection"}</Text>
            </View>

            {/* Content */}
            <ScrollView
                className="flex-1 px-4"
                contentContainerStyle={{ paddingBottom: 120, paddingTop: 10 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Gallery Grid */}
                <View className="flex-row flex-wrap justify-between">
                    {galleryPhotos.map((photo, index) => (
                        <TouchableOpacity
                            key={photo.id || index}
                            activeOpacity={0.8}
                            onPress={() => {
                                // Only allow opening real photos, not placeholders? 
                                // Or maybe allow viewing placeholders too. Let's allow viewing for now.
                                setSelectedPhoto(photo.uri);
                            }}
                            className="bg-surface-glass rounded-2xl mb-4 overflow-hidden border border-white/20 relative"
                            style={[
                                { width: '48%', aspectRatio: 0.8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 }
                            ]}
                        >
                            <Image
                                source={typeof photo.uri === 'string' ? { uri: photo.uri } : photo.uri}
                                className="w-full h-full"
                                resizeMode="cover"
                            />

                            {isShowingPlaceholders && (
                                <View className="absolute top-2 right-2 bg-black/40 px-2 py-1 rounded-md backdrop-blur-md">
                                    <Text className="text-white/80 text-[8px] font-bold tracking-wide">{t('gallery.example_badge')}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Empty State Message (Only if showing placeholders) */}
                {isShowingPlaceholders && (
                    <View className="mt-4 px-8 py-6 rounded-2xl bg-surface-glass border border-white/10 items-center">
                        <Text className="text-stone-300 text-center leading-relaxed">
                            {t('home.empty_gallery') || "Scan objects to build your collection. Your saved scans will appear here."}
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
                        source={typeof selectedPhoto === 'string' ? { uri: selectedPhoto } : selectedPhoto || {}}
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
