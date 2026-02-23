import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Easing,
    Pressable,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { analyzeFrame, resetEmotion } from "../store/slices/emotionSlice";
import { useAnalyzeFrameMutation } from "../store/services/emotionApi";

type Mode = "realtime" | "capture";

const EMOTION_COLORS: Record<string, string> = {
    HAPPY: "#00ffb4",
    NEUTRAL: "#7eb8ff",
    SURPRISED: "#ffb347",
    ANGRY: "#ff6b6b",
    FEAR: "#ff6b9d",
    DISGUST: "#b4a0ff",
    SAD: "#778ca3",
};

const getColor = (emotion: string | null) =>
    EMOTION_COLORS[(emotion ?? "").toUpperCase()] ?? "#00ffb4";

const VIEWFINDER_HEIGHT = 300;

export default function CameraScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [mode, setMode] = useState<Mode>("realtime");
    const [captured, setCaptured] = useState(false);

    const dispatch = useAppDispatch();
    const {
        dominant_emotion: realtimeEmotion,
        emotions: realtimeEmotions,
        loading: realtimeLoading,
        error: realtimeError,
    } = useAppSelector((s) => s.emotion);

    const [
        analyzeCapture,
        { data: captureData, isLoading: captureLoading, error: captureError, reset: resetCapture },
    ] = useAnalyzeFrameMutation();

    const dominant_emotion = mode === "realtime" ? realtimeEmotion : captureData?.dominant_emotion ?? null;
    const emotions = mode === "realtime" ? realtimeEmotions : captureData?.emotions ?? {};
    const isLoading = mode === "realtime" ? realtimeLoading : captureLoading;
    const error = mode === "realtime" ? realtimeError : captureError;
    const color = getColor(dominant_emotion);

    const cameraRef = useRef<CameraView>(null);
    const isAnalyzing = useRef(false);
    const scanAnim = useRef(new Animated.Value(0)).current;
    const flashAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (mode !== "realtime") return;

        const loop = Animated.loop(
            Animated.timing(scanAnim, {
                toValue: 1,
                duration: 5000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
        loop.start();

        const interval = setInterval(async () => {
            if (isAnalyzing.current || !cameraRef.current) return;
            try {
                isAnalyzing.current = true;
                const photo = await cameraRef.current.takePictureAsync({
                    base64: true,
                    quality: 0.3,
                    skipProcessing: true,
                });
                if (photo?.base64) {
                    await dispatch(analyzeFrame(photo.base64));
                }
            } catch { } finally {
                isAnalyzing.current = false;
            }
        }, 2500);

        return () => {
            loop.stop();
            clearInterval(interval);
            dispatch(resetEmotion());
        };
    }, [mode]);

    const handleCapture = async () => {
        if (!cameraRef.current) return;
        Animated.sequence([
            Animated.timing(flashAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
            Animated.timing(flashAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();

        try {
            const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.6, skipProcessing: true });
            if (photo?.base64) {
                await analyzeCapture({ image: photo.base64 }).unwrap();
                setCaptured(true);
            }
        } catch (e) { console.error(e); }
    };

    const switchMode = (m: Mode) => {
        setMode(m);
        setCaptured(false);
        resetCapture();
        dispatch(resetEmotion());
        scanAnim.setValue(0);
    };

    if (!permission) return <View className="flex-1 bg-[#080c10]" />;

    if (!permission.granted) {
        return (
            <SafeAreaView className="flex-1 bg-[#080c10] items-center justify-center px-8">
                <Text className="text-white text-lg font-extrabold tracking-[4px] mb-3 text-center">CAMERA ACCESS</Text>
                <Text className="text-white/40 text-xs text-center leading-5 mb-8">
                    Camera permission is required to detect facial emotions.
                </Text>
                <Pressable onPress={requestPermission} className="bg-[#00ffb4]/90 px-8 py-4 rounded-xl">
                    <Text className="text-[#080c10] text-[11px] font-extrabold tracking-[3px]">GRANT ACCESS</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#080c10]">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 pt-2 pb-3">
                <Pressable onPress={() => router.back()} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                    <Text className="text-white/60 text-[10px] tracking-[2px]">← BACK</Text>
                </Pressable>
                <Text className="text-white/30 text-[9px] tracking-[4px]">EMOTION SCANNER</Text>
                <View className="flex-row items-center gap-1.5">
                    {isLoading ? (
                        <ActivityIndicator size="small" color={color} />
                    ) : (
                        <View className="w-2 h-2 rounded-full" style={{ backgroundColor: color, shadowColor: color, elevation: 5 }} />
                    )}
                    <Text className="text-[9px] tracking-[2px]" style={{ color }}>
                        {mode === "realtime" ? (isLoading ? "SCANNING" : dominant_emotion?.toUpperCase() ?? "DETECTING") : (captured ? dominant_emotion?.toUpperCase() ?? "DONE" : "READY")}
                    </Text>
                </View>
            </View>

            {/* Mode Toggle */}
            <View className="flex-row mx-4 mb-3 gap-2">
                {(["realtime", "capture"] as Mode[]).map((m) => (
                    <Pressable
                        key={m}
                        onPress={() => switchMode(m)}
                        className={`flex-1 py-2 rounded-lg items-center border ${mode === m ? 'bg-[#00ffb4]/10 border-[#00ffb4]/40' : 'bg-white/5 border-white/10'}`}
                    >
                        <Text
                            className="text-[9px] font-bold tracking-[2px]"
                            style={{ color: mode === m ? "rgba(0,255,180,0.9)" : "rgba(255,255,255,0.3)" }}
                        >
                            {m === "realtime" ? "⚡ REAL-TIME" : "📸 CAPTURE"}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* Viewfinder */}
            <View
                className="mx-4 rounded-2xl overflow-hidden border"
                style={{
                    height: 300,
                    borderColor: `${color}44`,
                }}
            >
                <CameraView
                    ref={cameraRef}
                    style={{ flex: 1 }}
                    facing="front"
                    mode="picture"
                />

                {mode === "realtime" && (
                    <Animated.View
                        className="absolute left-4 right-4 h-[1px]"
                        style={{
                            backgroundColor: color,
                            shadowColor: color,
                            elevation: 8,
                            transform: [{ translateY: scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, VIEWFINDER_HEIGHT] }) }],
                        }}
                    />
                )}

                <Animated.View className="absolute inset-0 bg-white" style={{ opacity: flashAnim }} />

                {/* Corners */}
                <View className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2" style={{ borderColor: color }} />
                <View className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2" style={{ borderColor: color }} />
                <View className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2" style={{ borderColor: color }} />
                <View className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2" style={{ borderColor: color }} />

                {/* Badge */}
                <View className="absolute top-3 left-3 flex-row items-center gap-1.5 bg-black/50 border rounded-md px-2 py-1" style={{ borderColor: `${color}44` }}>
                    <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                    <Text className="text-[9px] tracking-[2px]" style={{ color }}>
                        {isLoading ? "ANALYZING..." : dominant_emotion ? `${dominant_emotion.toUpperCase()} ${Math.round(emotions[dominant_emotion] ?? 0)}%` : "DETECTING..."}
                    </Text>
                </View>
            </View>

            {/* Error Banner */}
            {error && (
                <View className="mx-4 mt-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30">
                    <Text className="text-red-400 text-[9px] tracking-[2px] text-center">⚠ API ERROR — CHECK YOUR SERVER URL</Text>
                </View>
            )}

            {/* Capture Action */}
            {mode === "capture" && (
                <View className="mx-4 mt-3">
                    {!captured ? (
                        <Pressable
                            onPress={handleCapture}
                            disabled={captureLoading}
                            className={`py-3.5 rounded-xl items-center ${captureLoading ? 'bg-[#00ffb4]/40' : 'bg-[#00ffb4]/90'}`}
                        >
                            {captureLoading ? <ActivityIndicator color="#080c10" /> : <Text className="text-[#080c10] text-[10px] font-extrabold tracking-[3px]">📸 CAPTURE & ANALYZE</Text>}
                        </Pressable>
                    ) : (
                        <Pressable onPress={() => { setCaptured(false); resetCapture(); }} className="py-3.5 rounded-xl items-center bg-white/5 border border-white/10">
                            <Text className="text-white/60 text-[10px] font-bold tracking-[3px]">↺ RETAKE</Text>
                        </Pressable>
                    )}
                </View>
            )}

            {/* Emotion Bars */}
            <View className="mx-4 mt-3 rounded-xl p-3 bg-white/5 border border-white/10">
                <Text className="text-white/30 text-[8px] tracking-[3px] mb-2">EMOTION ANALYSIS</Text>
                {Object.entries(emotions).length === 0 ? (
                    <Text className="text-white/20 text-[9px] tracking-[2px] text-center py-2">{isLoading ? "PROCESSING..." : "WAITING FOR DETECTION"}</Text>
                ) : (
                    <View className="gap-2">
                        {Object.entries(emotions).map(([label, val]) => {
                            const barColor = getColor(label);
                            const isActive = label.toUpperCase() === dominant_emotion?.toUpperCase();
                            return (
                                <View key={label} className="flex-row items-center gap-2">
                                    <Text className="text-white/40 text-[8px] tracking-[1px] w-16 uppercase">{label}</Text>
                                    <View className="flex-1 h-1 rounded-full bg-white/5">
                                        <View
                                            className="h-full rounded-full"
                                            style={{ width: `${val}%`, backgroundColor: isActive ? barColor : "rgba(255,255,255,0.1)" }}
                                        />
                                    </View>
                                    <Text className="text-[8px] w-7 text-right" style={{ color: isActive ? barColor : "rgba(255,255,255,0.2)" }}>{Math.round(val as number)}%</Text>
                                </View>
                            );
                        })}
                    </View>
                )}
            </View>

            {/* Footer */}
            <View className="flex-row justify-between px-5 mt-auto pb-4">
                <Text className="text-white/10 text-[7px] tracking-[2px]">{mode === "realtime" ? "INTERVAL: 1.5s" : "MODE: CAPTURE"}</Text>
                <Text className="text-white/10 text-[7px] tracking-[2px]">FER-NET v2</Text>
                <Text className="text-white/10 text-[7px] tracking-[2px]">QUALITY: {mode === "realtime" ? "0.3" : "0.6"}</Text>
            </View>
        </SafeAreaView>
    );
}