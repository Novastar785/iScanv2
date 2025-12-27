import { LinearGradient } from 'expo-linear-gradient';
import { X, Share2, Save, ShoppingCart, DollarSign, Star, ExternalLink, Image as ImageIcon, ChevronUp, Bug, Dna, Calendar, Network, Info, ShieldCheck, AlertTriangle, Droplets, Sun, Sprout, Layers, HeartPulse, CheckCircle2, Diamond, Hammer, FlaskConical, Gavel, Waves, Utensils, Ruler, Globe, Smile, Dumbbell, Weight, PawPrint, Landmark, Coins } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View, StyleSheet, Dimensions, Image, Linking, Share, Alert, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as MediaLibrary from 'expo-media-library';
import { useTranslation } from 'react-i18next';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
    withDecay,
    cancelAnimation,
    useDerivedValue
} from 'react-native-reanimated';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ShoppingLink {
    source: string;
    url: string;
}

interface ResultSection {
    title: string;
    content: string;
}

export interface InfoCardData {
    label: string;
    value: string;
    icon: string;
    color: string;
    featured?: boolean;
}

export interface HealthAssessment {
    is_healthy: boolean;
    diagnosis: string;
    recommendations?: string;
}

export interface ResultData {
    title: string;
    description: string;
    key_details?: InfoCardData[];
    health_assessment?: HealthAssessment;
    sections?: ResultSection[];
    isProduct?: boolean;
    average_price?: string;
    rating?: number;
    shopping_links?: ShoppingLink[];
    web_images?: { thumbnail_url: string; search_url: string }[];
}

interface ResultModalProps {
    visible: boolean;
    onClose: () => void;
    result: ResultData | null;
    imageUri: string | null;
}

// --- SELF-FILTERING IMAGE CARD ---
// Hides itself if the image fails to load (404/Forbidden)
const VisualMatchCard = ({ item, onPress }: { item: { thumbnail_url: string; search_url: string }, onPress: (url: string) => void }) => {
    const [hasError, setHasError] = useState(false);

    if (hasError) return null;

    return (
        <TouchableOpacity
            onPress={() => onPress(item.search_url)}
            style={{
                width: 120, height: 120, borderRadius: 16, overflow: 'hidden',
                backgroundColor: '#f3f4f6', marginRight: 12, position: 'relative',
                borderWidth: 1, borderColor: '#e5e7eb'
            }}
        >
            <Image
                source={{ uri: item.thumbnail_url }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
                onError={() => setHasError(true)}
            />
            <View style={{ position: 'absolute', bottom: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.6)', padding: 4, borderRadius: 10 }}>
                <ExternalLink size={10} color="white" />
            </View>
        </TouchableOpacity>
    );
};

// Helper to render dynamic icons
const renderIcon = (name: string, color: string) => {
    switch (name) {
        // INSECTS
        case 'bug': return <Bug size={20} color={color} opacity={0.6} />;
        case 'dna': return <Dna size={20} color={color} opacity={0.6} />;
        case 'calendar': return <Calendar size={20} color={color} opacity={0.6} />;
        case 'network': return <Network size={20} color={color} opacity={0.6} />;

        // PLANTS
        case 'shield-check': return <ShieldCheck size={20} color={color} opacity={0.6} />;
        case 'alert': return <AlertTriangle size={20} color={color} opacity={0.6} />;
        case 'droplet': return <Droplets size={20} color={color} opacity={0.6} />;
        case 'sun': return <Sun size={20} color={color} opacity={0.6} />;
        case 'leaf': return <Sprout size={20} color={color} opacity={0.6} />;
        case 'soil': return <Layers size={20} color={color} opacity={0.6} />;

        // ROCKS
        case 'diamond': return <Diamond size={20} color={color} opacity={0.6} />;
        case 'hammer': return <Hammer size={20} color={color} opacity={0.6} />;
        case 'flask': return <FlaskConical size={20} color={color} opacity={0.6} />;

        // FISH
        case 'scale': return <Gavel size={20} color={color} opacity={0.6} />;
        case 'waves': return <Waves size={20} color={color} opacity={0.6} />;
        case 'utensils': return <Utensils size={20} color={color} opacity={0.6} />;
        case 'ruler': return <Ruler size={20} color={color} opacity={0.6} />;

        // ANIMALS (CAT/DOG)
        case 'globe': return <Globe size={20} color={color} opacity={0.6} />;
        case 'smile': return <Smile size={20} color={color} opacity={0.6} />;
        case 'dumbbell': return <Dumbbell size={20} color={color} opacity={0.6} />;
        case 'weight': return <Weight size={20} color={color} opacity={0.6} />;
        case 'paw': return <PawPrint size={20} color={color} opacity={0.6} />;

        // COINS
        case 'landmark': return <Landmark size={20} color={color} opacity={0.6} />;
        case 'coins': return <Coins size={20} color={color} opacity={0.6} />;

        default: return <Info size={20} color={color} opacity={0.6} />;
    }
};

export default function ResultModal({ visible, onClose, result, imageUri }: ResultModalProps) {
    const insets = useSafeAreaInsets();
    const [isSaving, setIsSaving] = useState(false);

    // Bounds for Top Position (Y offset)
    const Y_MIN = SCREEN_HEIGHT * 0.1; // Max Height
    const Y_MAX = SCREEN_HEIGHT * 0.85; // Min Height
    const Y_INITIAL = SCREEN_HEIGHT * 0.5;

    const translateY = useSharedValue(SCREEN_HEIGHT);
    const context = useSharedValue({ y: 0 });
    const isInteracting = useSharedValue(false);

    const isExpanded = useDerivedValue(() => {
        return translateY.value < SCREEN_HEIGHT * 0.4;
    });

    useEffect(() => {
        if (visible) {
            translateY.value = withSpring(Y_INITIAL, { damping: 15, stiffness: 100 });
        } else {
            translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
        }
    }, [visible]);

    const handleCloseButton = () => {
        'worklet';
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 200 }, (finished) => {
            if (finished) {
                runOnJS(onClose)();
            }
        });
    };

    const gesture = Gesture.Pan()
        .onStart(() => {
            cancelAnimation(translateY);
            context.value = { y: translateY.value };
            isInteracting.value = true;
        })
        .onUpdate((event) => {
            let newY = event.translationY + context.value.y;
            if (newY < Y_MIN) newY = Y_MIN;
            if (newY > Y_MAX) newY = Y_MAX;
            translateY.value = newY;
        })
        .onEnd((event) => {
            isInteracting.value = false;
            translateY.value = withDecay({
                velocity: event.velocityY,
                clamp: [Y_MIN, Y_MAX],
                deceleration: 0.998
            });
        });

    const animatedStyle = useAnimatedStyle(() => {
        return { transform: [{ translateY: translateY.value }] };
    });

    const hintStyle = useAnimatedStyle(() => {
        return {
            opacity: withTiming(isExpanded.value ? 0 : 1, { duration: 200 }),
            height: isExpanded.value ? 0 : 'auto',
            overflow: 'hidden'
        };
    });

    const handleLinkPress = async (url: string) => {
        try { await Linking.openURL(url); } catch (e) { console.error("Failed to open link:", e); }
    };

    const handleShare = async () => {
        if (!result) return;
        try {
            const message = `${result.title}\n\n${result.description}\n\nScanned with iScan AI`;
            await Share.share({ message, title: result.title });
        } catch (error) { console.log("Error sharing:", error); }
    };

    const handleSave = async () => {
        if (!imageUri) return;
        setIsSaving(true);
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission needed", "Please allow access to save photos.");
                return;
            }
            const asset = await MediaLibrary.createAssetAsync(imageUri);
            const album = await MediaLibrary.getAlbumAsync('iScan AI');
            if (album) {
                await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
            } else {
                await MediaLibrary.createAlbumAsync('iScan AI', asset, false);
            }
            Alert.alert("Saved!", "Image saved to your gallery.");
        } catch (error) {
            Alert.alert("Error", "Could not save image.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!visible || !result) return null;

    return (
        <Modal
            visible={visible}
            transparent={false}
            animationType="fade"
            onRequestClose={() => runOnJS(handleCloseButton)()}
            statusBarTranslucent
        >
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={styles.container}>
                    <StatusBar barStyle="light-content" />

                    {/* BACKGROUND */}
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                    ) : (
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#111' }]} />
                    )}

                    <LinearGradient
                        colors={['rgba(0,0,0,0.6)', 'transparent']}
                        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120 }}
                    />

                    {/* CLOSE BUTTON */}
                    <View style={[styles.headerActions, { top: insets.top + 10 }]}>
                        <TouchableOpacity onPress={() => runOnJS(handleCloseButton)()} style={styles.circleButton}>
                            <X color="white" size={24} />
                        </TouchableOpacity>
                    </View>

                    {/* BOTTOM SHEET */}
                    <Animated.View style={[styles.sheetContainer, animatedStyle]}>

                        {/* HEADER - DRAGGABLE */}
                        <GestureDetector gesture={gesture}>
                            <View style={styles.sheetHeader} collapsable={false}>
                                <View style={styles.dragHandle} />
                                <Animated.View style={[styles.swipeHintContainer, hintStyle]}>
                                    <Text style={styles.swipeHintText}>Swipe to adjust view</Text>
                                    <ChevronUp size={16} color="#9ca3af" />
                                </Animated.View>
                                <View style={styles.titleRow}>
                                    <Text style={styles.titleText} numberOfLines={2}>{result.title}</Text>
                                </View>
                            </View>
                        </GestureDetector>

                        {/* CONTENT - SCROLLABLE */}
                        <ScrollView
                            style={styles.scrollView}
                            bounces={false}
                            contentContainerStyle={[
                                styles.scrollContent,
                                { paddingBottom: SCREEN_HEIGHT * 0.85 }
                            ]}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* --- 1. INFO CARDS GRID --- */}
                            {result.key_details && result.key_details.length > 0 && (
                                <View style={styles.cardsGrid}>
                                    {result.key_details.map((card, index) => (
                                        <View
                                            key={index}
                                            style={[
                                                styles.infoCard,
                                                { backgroundColor: card.color },
                                                card.featured ? { width: '100%' } : {} // Expanded width for featured cards
                                            ]}
                                        >
                                            <View style={styles.cardHeader}>
                                                <Text style={[styles.cardLabel, { color: '#000', opacity: 0.5 }]}>{card.label}</Text>
                                                {renderIcon(card.icon, '#000')}
                                            </View>
                                            <Text style={styles.cardValue} numberOfLines={2} adjustsFontSizeToFit={true}>{card.value}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* --- 2. HEALTH ASSESSMENT (NEW) --- */}
                            {result.health_assessment && (
                                <View style={styles.healthContainer}>
                                    <View style={[
                                        styles.healthHeader,
                                        { backgroundColor: result.health_assessment.is_healthy ? '#f0fdf4' : '#fef2f2' }
                                    ]}>
                                        {result.health_assessment.is_healthy ? (
                                            <CheckCircle2 color="#16a34a" size={24} />
                                        ) : (
                                            <HeartPulse color="#dc2626" size={24} />
                                        )}
                                        <Text style={[
                                            styles.healthTitle,
                                            { color: result.health_assessment.is_healthy ? '#16a34a' : '#dc2626' }
                                        ]}>
                                            {result.health_assessment.is_healthy ? 'Healthy Plant' : 'Health Issues Detected'}
                                        </Text>
                                    </View>

                                    <View style={styles.healthContent}>
                                        <Text style={styles.healthDiagnosisHeader}>Diagnosis</Text>
                                        <Text style={styles.descriptionText}>{result.health_assessment.diagnosis}</Text>

                                        {result.health_assessment.recommendations && (
                                            <>
                                                <Text style={styles.healthDiagnosisHeader}>Recommendations</Text>
                                                <Text style={styles.descriptionText}>{result.health_assessment.recommendations}</Text>
                                            </>
                                        )}
                                    </View>
                                </View>
                            )}

                            {/* --- 3. BADGES (For products) --- */}
                            {result.isProduct && (
                                <View style={styles.badgesRow}>
                                    {result.average_price && (
                                        <View style={[styles.badge, styles.badgeGreen]}>
                                            <View style={styles.badgeIconBg}><DollarSign size={14} color="#15803d" /></View>
                                            <View><Text style={styles.badgeLabelGreen}>Average Price</Text><Text style={styles.badgeValue}>{result.average_price}</Text></View>
                                        </View>
                                    )}
                                    {result.rating && (
                                        <View style={[styles.badge, styles.badgeYellow]}>
                                            <View style={styles.badgeIconBg}><Star size={14} color="#ca8a04" fill="#ca8a04" /></View>
                                            <View><Text style={styles.badgeLabelYellow}>Rating</Text><Text style={styles.badgeValue}>{result.rating}/5.0</Text></View>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* --- 4. VISUAL MATCHES (Auto-Filter Broken Images) --- */}
                            {result.web_images && result.web_images.length > 0 && (
                                <View style={styles.sectionContainer}>
                                    <Text style={styles.sectionTitle}>Visual Matches</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                                        {result.web_images.map((link, index) => (
                                            <VisualMatchCard key={index} item={link} onPress={handleLinkPress} />
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                            {/* --- 5. DESCRIPTION --- */}
                            <Text style={styles.descriptionText}>{result.description}</Text>

                            {result.isProduct && result.shopping_links && result.shopping_links.length > 0 && (
                                <View style={styles.sectionContainer}>
                                    <Text style={styles.sectionTitle}>Where to Buy</Text>
                                    <View style={{ gap: 12 }}>
                                        {result.shopping_links.map((link, index) => (
                                            <TouchableOpacity key={index} onPress={() => handleLinkPress(link.url)} style={styles.shoppingLinkCard}>
                                                <View style={{ flex: 1 }}><Text style={styles.shoppingSource}>{link.source}</Text><Text style={styles.visitStoreText}>Visit Store</Text></View>
                                                <ExternalLink size={18} color="#9ca3af" />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {result.sections && result.sections.map((section, index) => (
                                <View key={index} style={styles.extraSectionCard}>
                                    <Text style={styles.extraSectionTitle}>{section.title}</Text>
                                    <Text style={styles.descriptionText}>{section.content}</Text>
                                </View>
                            ))}

                            <View style={styles.bottomActions}>
                                <TouchableOpacity onPress={handleSave} disabled={isSaving} style={styles.saveButton}>
                                    {isSaving ? <ActivityIndicator color="white" /> : <Save size={20} color="white" />}
                                    <Text style={styles.saveButtonText}>Save Scan</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
                                    <Share2 size={24} color="#374151" />
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </Animated.View>
                </View>
            </GestureHandlerRootView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    headerActions: { position: 'absolute', left: 20, zIndex: 10 },
    circleButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
    sheetContainer: {
        position: 'absolute', left: 0, right: 0, top: 0, height: SCREEN_HEIGHT,
        backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32,
        shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 20, overflow: 'hidden',
    },
    sheetHeader: { backgroundColor: 'white', paddingTop: 12, paddingBottom: 4, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', zIndex: 20 },
    dragHandle: { width: 40, height: 5, backgroundColor: '#e5e7eb', borderRadius: 10, marginBottom: 8 },
    swipeHintContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
    swipeHintText: { color: '#9ca3af', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    titleRow: { width: '100%', paddingHorizontal: 24, paddingBottom: 12, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    titleText: { fontSize: 28, fontWeight: '900', color: '#111827', lineHeight: 32, flex: 1 },
    scrollView: { flex: 1, backgroundColor: 'white' },
    scrollContent: { paddingHorizontal: 24, paddingTop: 16 },

    // INFO CARDS
    cardsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    infoCard: {
        width: '48%',
        borderRadius: 20,
        padding: 16,
        minHeight: 110,
        justifyContent: 'space-between',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    cardLabel: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    cardValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1f2937',
    },

    // HEALTH SECTION
    healthContainer: {
        marginBottom: 28,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    healthHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 16,
    },
    healthTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    healthContent: {
        padding: 20,
        backgroundColor: '#fff',
    },
    healthDiagnosisHeader: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    descriptionText: { fontSize: 16, lineHeight: 28, color: '#4b5563', marginBottom: 24, fontWeight: '500' },
    badgesRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    badge: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 1, gap: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    badgeGreen: { backgroundColor: '#f0fdf4', borderColor: '#dcfce7' },
    badgeYellow: { backgroundColor: '#fefce8', borderColor: '#fef9c3' },
    badgeIconBg: { backgroundColor: 'white', padding: 6, borderRadius: 20 },
    badgeLabelGreen: { fontSize: 10, color: '#15803d', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 },
    badgeLabelYellow: { fontSize: 10, color: '#a16207', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 },
    badgeValue: { fontSize: 18, fontWeight: '900', color: '#111827' },
    sectionContainer: { marginBottom: 28 },
    sectionTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 12 },
    horizontalScroll: { marginHorizontal: -24, paddingHorizontal: 24 },
    webImageCard: { width: 120, height: 120, borderRadius: 16, overflow: 'hidden', backgroundColor: '#f3f4f6', marginRight: 12, position: 'relative', borderWidth: 1, borderColor: '#e5e7eb' },
    externalLinkBadge: { position: 'absolute', bottom: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.6)', padding: 4, borderRadius: 10 },
    shoppingLinkCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    shoppingSource: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 2 },
    visitStoreText: { fontSize: 12, color: '#4f46e5', fontWeight: '700' },
    extraSectionCard: { backgroundColor: '#f9fafb', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 16 },
    extraSectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
    bottomActions: { flexDirection: 'row', gap: 16, marginTop: 8 },
    saveButton: { flex: 1, backgroundColor: '#4f46e5', borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8, shadowColor: "#4f46e5", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    shareButton: { width: 56, backgroundColor: '#f3f4f6', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
});
