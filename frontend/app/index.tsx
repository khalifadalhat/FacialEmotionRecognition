import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Text, View } from "react-native";
import { router } from "expo-router";

export default function SplashScreen() {
  const [progress, setProgress] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Pulse ring
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Progress bar
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => router.replace("/welcome"), 400);
          return 100;
        }
        return p + 2;
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return (
    <View className="flex-1 bg-[#080c10] items-center justify-center">
      {/* Background grid */}
      <View className="absolute inset-0 opacity-30">
        {Array.from({ length: 20 }).map((_, i) => (
          <View
            key={`h-${i}`}
            className="absolute left-0 right-0 border-b border-[#00ffb4]"
            style={{ top: i * 40, opacity: 0.06 }}
          />
        ))}
        {Array.from({ length: 15 }).map((_, i) => (
          <View
            key={`v-${i}`}
            className="absolute top-0 bottom-0 border-r border-[#00ffb4]"
            style={{ left: i * 32, opacity: 0.06 }}
          />
        ))}
      </View>

      {/* Radial glow */}
      <View className="absolute w-96 h-96 rounded-full bg-[#00ffb4] opacity-5" />

      {/* Pulse rings */}
      <Animated.View
        className="absolute w-48 h-48 rounded-full border border-[#00ffb4]"
        style={{ transform: [{ scale: pulseAnim }], opacity: 0.2 }}
      />
      <Animated.View
        className="absolute w-64 h-64 rounded-full border border-[#00ffb4]"
        style={{ transform: [{ scale: pulseAnim }], opacity: 0.1 }}
      />
      <Animated.View
        className="absolute w-80 h-80 rounded-full border border-[#00ffb4]"
        style={{ transform: [{ scale: pulseAnim }], opacity: 0.06 }}
      />

      <Animated.View className="items-center" style={{ opacity: fadeAnim }}>
        {/* Face icon */}
        <View
          className="w-20 h-20 rounded-full border border-[#00ffb4] items-center justify-center mb-8"
          style={{
            borderColor: "rgba(0,255,180,0.6)",
            shadowColor: "#00ffb4",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
          }}
        >
          <Text className="text-3xl">🙂</Text>
        </View>

        {/* Title */}
        <Text
          className="text-[#00ffb4] text-xs tracking-[6px] mb-3"
          style={{ opacity: 0.5 }}
        >
          SYSTEM INITIALIZING
        </Text>
        <Text className="text-white text-xl font-bold tracking-widest">
          FACIAL EMOTION
        </Text>
        <Text
          className="text-xl font-bold tracking-widest"
          style={{ color: "rgba(0,255,180,0.9)" }}
        >
          RECOGNITION
        </Text>
      </Animated.View>

      {/* Progress bar */}
      <Animated.View
        className="absolute bottom-20 w-3/5"
        style={{ opacity: fadeAnim }}
      >
        <View className="flex-row justify-between mb-1">
          <Text className="text-[9px] tracking-[3px]" style={{ color: "rgba(0,255,180,0.4)" }}>
            LOADING
          </Text>
          <Text className="text-[9px]" style={{ color: "rgba(0,255,180,0.6)" }}>
            {progress}%
          </Text>
        </View>
        <View className="h-0.5 bg-white/10 rounded">
          <View
            className="h-full rounded"
            style={{
              width: `${progress}%`,
              backgroundColor: "#00ffb4",
              shadowColor: "#00ffb4",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 4,
            }}
          />
        </View>
      </Animated.View>

      {/* Corner brackets */}
      <View className="absolute top-3 left-3 w-5 h-5 border-t border-l border-[#00ffb4] opacity-40" />
      <View className="absolute top-3 right-3 w-5 h-5 border-t border-r border-[#00ffb4] opacity-40" />
      <View className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-[#00ffb4] opacity-40" />
      <View className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-[#00ffb4] opacity-40" />
    </View>
  );
}