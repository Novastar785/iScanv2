import React, { useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    withDelay
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import Svg, { Defs, RadialGradient, Stop, Circle, Rect } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Helper component for a single gradient blob
const GradientBlob = ({ color, id }: { color: string, id: string }) => (
    <Svg height="100%" width="100%" viewBox="0 0 100 100">
        <Defs>
            <RadialGradient
                id={`grad-${id}`}
                cx="50%"
                cy="50%"
                rx="50%"
                ry="50%"
                fx="50%"
                fy="50%"
                gradientUnits="userSpaceOnUse"
            >
                <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
                <Stop offset="50%" stopColor={color} stopOpacity="0.4" />
                <Stop offset="100%" stopColor={color} stopOpacity="0" />
            </RadialGradient>
        </Defs>
        <Circle cx="50" cy="50" r="50" fill={`url(#grad-${id})`} />
    </Svg>
);

export default function BlobBackground() {
    const scale1 = useSharedValue(1);
    const translate1X = useSharedValue(0);
    const translate1Y = useSharedValue(0);

    const scale2 = useSharedValue(1);
    const translate2X = useSharedValue(0);
    const translate2Y = useSharedValue(0);

    const opacity3 = useSharedValue(0.6);

    useEffect(() => {
        // Blob 1 Animation
        scale1.value = withRepeat(
            withTiming(1.2, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
        translate1X.value = withRepeat(
            withTiming(30, { duration: 7000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
        translate1Y.value = withRepeat(
            withTiming(-30, { duration: 9000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );

        // Blob 2 Animation (Delayed and reversed)
        scale2.value = withDelay(1000, withRepeat(
            withTiming(0.9, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        ));
        translate2X.value = withDelay(500, withRepeat(
            withTiming(-30, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        ));
        translate2Y.value = withRepeat(
            withTiming(30, { duration: 10000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );

        // Blob 3 Pulse
        opacity3.value = withRepeat(
            withTiming(0.3, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const animatedStyle1 = useAnimatedStyle(() => ({
        transform: [
            { scale: scale1.value },
            { translateX: translate1X.value },
            { translateY: translate1Y.value },
        ],
    }));

    const animatedStyle2 = useAnimatedStyle(() => ({
        transform: [
            { scale: scale2.value },
            { translateX: translate2X.value },
            { translateY: translate2Y.value },
        ],
    }));

    const animatedStyle3 = useAnimatedStyle(() => ({
        opacity: opacity3.value,
    }));

    return (
        <View className="absolute inset-0 bg-background-dark overflow-hidden pointer-events-none">
            {/* Blob 1: Top Left */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        top: -width * 0.2,
                        left: -width * 0.2,
                        width: width,
                        height: width,
                        // borderRadius: width / 2, // No longer needed for shape, but keeps container clean
                    },
                    animatedStyle1
                ]}
            >
                <GradientBlob color="#d97706" id="1" />
            </Animated.View>

            {/* Blob 2: Bottom Right */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        bottom: -width * 0.1,
                        right: -width * 0.1,
                        width: width * 0.9,
                        height: width * 0.9,
                    },
                    animatedStyle2
                ]}
            >
                <GradientBlob color="#5d4037" id="2" />
            </Animated.View>

            {/* Blob 3: Center */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        top: '30%',
                        left: '30%',
                        width: width * 0.6,
                        height: width * 0.6,
                    },
                    animatedStyle3
                ]}
            >
                <GradientBlob color="#f59e0b" id="3" />
            </Animated.View>

            {/* Glass/Blur overlay to diffuse everything even further */}
            <BlurView intensity={30} tint="dark" className="absolute inset-0" style={{ opacity: 1 }} />

            {/* Caustics/Noise overlay simulation */}
            <View className="absolute inset-0 bg-black/10" />
        </View>
    );
}
