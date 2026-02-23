import { useEffect, useRef } from "react";
import { Animated, Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";

const features = [
    {
        icon: "⚡",
        label: "Real-time Detection",
        desc: "Live emotion analysis via camera feed",
    },
    {
        icon: "📸",
        label: "Photo Analysis",
        desc: "Capture & analyze facial expressions",
    },
    {
        icon: "🧠",
        label: "AI Powered",
        desc: "Deep learning emotion classification",
    },
];

export default function WelcomeScreen() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;
    const cardAnims = useRef(
        features.map(() => new Animated.Value(0))
    ).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 700,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 700,
                useNativeDriver: true,
            }),
        ]).start();

        cardAnims.forEach((anim, i) => {
            Animated.timing(anim, {
                toValue: 1,
                duration: 500,
                delay: 300 + i * 120,
                useNativeDriver: true,
            }).start();
        });
    }, []);

    return (
        <View className="flex-1 bg-[#080c10]">
            {/* Background grid */}
            <View className="absolute inset-0">
                {Array.from({ length: 20 }).map((_, i) => (
                    <View
                        key={`h-${i}`}
                        className="absolute left-0 right-0"
                        style={{
                            top: i * 40,
                            height: 1,
                            backgroundColor: "rgba(0,255,180,0.03)",
                        }}
                    />
                ))}
            </View>

            {/* Top glow */}
            <View
                className="absolute -top-24 -right-24 w-80 h-80 rounded-full"
                style={{ backgroundColor: "rgba(0,255,180,0.05)" }}
            />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <Animated.View
                    className="flex-1 px-7 mt-32 justify-center items-center"
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    }}
                >
                    <Text
                        className="text-xs tracking-[5px] mb-3"
                        style={{ color: "rgba(0,255,180,0.5)" }}
                    >
                        v1.0 · EMOTION AI
                    </Text>

                    <Text className="text-white text-5xl font-extrabold tracking-tight leading-tight text-center">
                        FACIAL{" "}
                        <Text style={{ color: "rgba(0,255,180,0.9)" }}>
                            EMOTION
                        </Text>
                        {"\n"}RECOGNITION
                    </Text>

                    <Text
                        className="mt-4 text-base leading-relaxed text-gray-500 text-center"
                        style={{ maxWidth: 260 }}
                    >
                        Advanced real-time facial expression analysis powered by deep
                        learning.
                    </Text>
                </Animated.View>

                {/* Face scan graphic */}
                <Animated.View
                    className="items-center my-7"
                    style={{ opacity: fadeAnim }}
                >
                    <View
                        className="w-28 h-28 rounded-full items-center justify-center"
                        style={{
                            borderWidth: 1,
                            borderColor: "rgba(0,255,180,0.2)",
                        }}
                    >
                        <View
                            className="w-24 h-24 rounded-full items-center justify-center"
                            style={{
                                borderWidth: 1,
                                borderColor: "rgba(0,255,180,0.4)",
                                backgroundColor: "rgba(0,255,180,0.03)",
                            }}
                        >
                            <Text className="text-4xl">🙂</Text>
                        </View>
                    </View>

                    {/* Emotion badge */}
                    <View
                        className="mt-2 px-3 py-1 rounded-md flex-row items-center gap-1"
                        style={{
                            backgroundColor: "rgba(0,255,180,0.08)",
                            borderWidth: 1,
                            borderColor: "rgba(0,255,180,0.25)",
                        }}
                    >
                        <View className="w-1.5 h-1.5 rounded-full bg-[#00ffb4]" />
                        <Text
                            className="text-[9px] tracking-widest"
                            style={{ color: "rgba(0,255,180,0.9)" }}
                        >
                            HAPPY 94%
                        </Text>
                    </View>
                </Animated.View>

                {/* Feature cards */}
                <View className="px-5 gap-3">
                    {features.map((f, i) => (
                        <Animated.View
                            key={f.label}
                            style={{
                                opacity: cardAnims[i],
                                transform: [
                                    {
                                        translateX: cardAnims[i].interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [-20, 0],
                                        }),
                                    },
                                ],
                            }}
                        >
                            <View
                                className="flex-row items-center gap-3 rounded-xl p-3"
                                style={{
                                    backgroundColor: "rgba(255,255,255,0.03)",
                                    borderWidth: 1,
                                    borderColor: "rgba(255,255,255,0.07)",
                                }}
                            >
                                <View
                                    className="w-10 h-10 rounded-lg items-center justify-center"
                                    style={{
                                        backgroundColor: "rgba(0,255,180,0.08)",
                                        borderWidth: 1,
                                        borderColor: "rgba(0,255,180,0.2)",
                                    }}
                                >
                                    <Text className="text-lg">{f.icon}</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white text-xs font-semibold tracking-wider">
                                        {f.label}
                                    </Text>
                                    <Text
                                        className="text-[10px] mt-0.5"
                                        style={{ color: "rgba(255,255,255,0.35)" }}
                                    >
                                        {f.desc}
                                    </Text>
                                </View>
                                <Text style={{ color: "rgba(0,255,180,0.4)", fontSize: 16 }}>
                                    ›
                                </Text>
                            </View>
                        </Animated.View>
                    ))}
                </View>

                {/* CTA */}
                <View className="px-5 mt-6">
                    <Pressable
                        onPress={() => router.push("/camera")}
                        className="w-full py-4 rounded-xl items-center"
                        style={{
                            backgroundColor: "rgba(0,255,180,0.9)",
                            shadowColor: "#00ffb4",
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.35,
                            shadowRadius: 20,
                        }}
                    >
                        <Text className="text-[#080c10] text-xs font-extrabold tracking-[3px]">
                            LAUNCH SCANNER →
                        </Text>
                    </Pressable>
                    <Text
                        className="text-center mt-3 text-[9px] tracking-widest"
                        style={{ color: "rgba(255,255,255,0.2)" }}
                    >
                        POWERED BY DEEP LEARNING
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}