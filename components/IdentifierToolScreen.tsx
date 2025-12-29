import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert, SafeAreaView, StyleSheet, ImageSourcePropType } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, ScanLine, Camera, ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { getUserStatus } from '../src/services/revenueCat';
import Purchases from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';
import { identifyImage } from '../src/services/identificationService';
import ResultModal from './ResultModal';
import { useTranslation } from 'react-i18next';
import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

interface IdentifierToolScreenProps {
    featureId: string;
    title: string;
    subtitle: string;
    backgroundImage: ImageSourcePropType;
}

import Animated from 'react-native-reanimated';

export default function IdentifierToolScreen({ featureId, title, subtitle, backgroundImage }: IdentifierToolScreenProps) {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState<any>(null);

    const pickImage = async (useCamera: boolean) => {
        try { // trigger small impact
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            let result;
            if (useCamera) {
                const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
                if (permissionResult.granted === false) {
                    Alert.alert(t('common.permissions_missing'), t('common.permissions_access'));
                    return;
                }
                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: false,
                    quality: 0.8,
                });
            } else {
                const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (permissionResult.granted === false) {
                    Alert.alert(t('common.permissions_missing'), t('common.permissions_access'));
                    return;
                }
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: false,
                    quality: 0.8,
                });
            }

            if (!result.canceled) {
                setSelectedImage(result.assets[0].uri);
            }
        } catch (error) {
            console.log("Error picking image: ", error);
        }
    };

    const handleIdentify = async () => {
        if (!selectedImage) return;

        // Vibrate to indicate start
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        setIsAnalyzing(true);
        try {
            const { isPro } = await getUserStatus();

            if (!isPro) {
                setIsAnalyzing(false);
                try {
                    await RevenueCatUI.presentPaywall({ displayCloseButton: true });
                } catch (e) { console.log("Paywall closed or error"); }
                return;
            }

            const data = await identifyImage(featureId, selectedImage, i18n.language);
            setResult(data);
            setShowResult(true);

            // --- APP REVIEW LOGIC ---
            // Request review only on the FIRST successful scan to avoid spamming.
            const hasReviewed = await AsyncStorage.getItem('HAS_REQUESTED_REVIEW');
            if (!hasReviewed && await StoreReview.hasAction()) {
                setTimeout(async () => {
                    await StoreReview.requestReview();
                    await AsyncStorage.setItem('HAS_REQUESTED_REVIEW', 'true');
                }, 1000); // Small delay to let the modal open first
            }
        } catch (e: any) {
            // Display specific error from AI (e.g. "Not a plant") or fallback to generic
            Alert.alert(t('common.error'), e.message || t('common.error_generation'));
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <View className="flex-1 bg-background-dark relative">
            {/* FULL SCREEN BLURRED BACKGROUND */}
            {/* FULL SCREEN BLURRED BACKGROUND */}
            <Animated.Image
                source={backgroundImage}
                className="absolute w-full h-full opacity-80" // Increased opacity
                blurRadius={5} // Very subtle blur
                resizeMode="cover"
                // @ts-ignore
                sharedTransitionTag={`feature-image-${featureId}`}
            />
            {/* Gradient Overlay to ensure text readability - Lightened */}
            <View className="absolute inset-0 bg-black/30" />

            <SafeAreaView className="flex-1 px-6">
                <Stack.Screen options={{ headerShown: false }} />

                {/* HEADER */}
                <View className="flex-row items-center justify-between mb-8 pt-8">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-black/20 backdrop-blur-md border border-white/20 rounded-full items-center justify-center">
                        <ArrowLeft size={20} color="white" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="font-bold text-white/90 text-lg uppercase tracking-wider shadow-sm">iScan AI</Text>
                    </View>
                    <View className="w-10" />
                </View>

                {/* MAIN CONTENT */}
                <View className="flex-1 justify-center pb-20">
                    <Text className="text-4xl font-black text-white text-center mb-2 drop-shadow-lg shadow-black">{title}</Text>
                    <Text className="text-stone-200 text-center text-lg mb-10 font-medium drop-shadow-md">{subtitle}</Text>

                    {/* IMAGE PICKER AREA - Removed shadow-2xl and surface-glass to fix artifact, used manual transparent style */}
                    <View
                        className="w-full aspect-[4/3] rounded-[32px] overflow-hidden border border-white/30 mb-8 relative group"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    >
                        {selectedImage ? (
                            <Image source={{ uri: selectedImage }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                            <View className="w-full h-full items-center justify-center border-2 border-dashed border-white/30 rounded-[28px]">
                                <ScanLine size={48} color="rgba(255,255,255,0.6)" />
                                <Text className="text-stone-300 font-medium mt-4">{t('generic_tool.photo_selected') || "Select Photo"}</Text>
                            </View>
                        )}

                        {/* OVERLAY ACTIONS FOR PICKING */}
                        {!isAnalyzing && (
                            <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-4">
                                <TouchableOpacity onPress={() => pickImage(true)} className="bg-white/10 border border-white/20 p-4 rounded-full shadow-lg backdrop-blur-md">
                                    <Camera color="white" size={24} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => pickImage(false)} className="bg-white/10 border border-white/20 p-4 rounded-full shadow-lg backdrop-blur-md">
                                    <ImageIcon color="white" size={24} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* PROCESS BUTTON */}
                    <TouchableOpacity
                        onPress={handleIdentify}
                        disabled={!selectedImage || isAnalyzing}
                        className={`w-full h-16 rounded-2xl flex-row items-center justify-center gap-3 shadow-lg transition-all ${!selectedImage ? 'bg-white/10 border border-white/10' : 'bg-primary border border-orange-400/50'}`}
                    >
                        {isAnalyzing ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <ScanLine color={!selectedImage ? "rgba(255,255,255,0.4)" : "white"} size={22} />
                                <Text className={`font-bold text-xl ${!selectedImage ? 'text-white/40' : 'text-white'}`}>
                                    {t('tools.start_btn')}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                </View>
            </SafeAreaView>

            <ResultModal
                visible={showResult}
                onClose={() => setShowResult(false)}
                result={result}
                imageUri={selectedImage}
                featureImage={backgroundImage}
            />
        </View>
    );
}
