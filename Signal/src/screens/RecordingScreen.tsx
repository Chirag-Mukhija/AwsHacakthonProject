
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { ScreenContainer } from '../components/ScreenContainer';
import { ThemedText } from '../components/ThemedText';
import { useTheme } from '../theme/ThemeContext';
import { Spacing, Radius } from '../theme/typography';
import { X } from 'lucide-react-native';

// Backend URL - Replace with your valid IP if testing on physical device
// For Android Emulator use 10.0.2.2, for iOS Simulator use localhost
const BACKEND_URL = 'http://localhost:3000/process-audio';

const WaveformLine = ({ delay }: { delay: number }) => {
    const height = useSharedValue(20);
    const { colors } = useTheme();

    useEffect(() => {
        height.value = withRepeat(
            withTiming(Math.random() * 80 + 20, {
                duration: 500,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        height: height.value,
        backgroundColor: colors.primary,
    }));

    return <Animated.View style={[styles.waveLine, animatedStyle]} />;
};

export default function RecordingScreen({ navigation }: any) {
    const { colors } = useTheme();
    const [seconds, setSeconds] = useState(0);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [permissionResponse, requestPermission] = Audio.usePermissions();

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (recording) {
            interval = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [recording]);

    useEffect(() => {
        startRecording();
        return () => {
            if (recording) {
                stopRecording();
            }
        };
    }, []);

    async function startRecording() {
        try {
            if (permissionResponse?.status !== 'granted') {
                console.log('Requesting permission..');
                await requestPermission();
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            console.log('Starting recording..');
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
            console.log('Recording started');
        } catch (err) {
            console.error('Failed to start recording', err);
            Alert.alert('Error', 'Failed to start recording');
        }
    }

    async function stopRecording() {
        console.log('Stopping recording..');
        if (!recording) return;

        setRecording(null);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        console.log('Recording stopped and stored at', uri);

        if (uri) {
            uploadAudio(uri);
        }
    }

    async function uploadAudio(uri: string) {
        navigation.replace('Processing');

        try {
            const formData = new FormData();

            // We need to infer the file type from the extension
            const fileType = uri.split('.').pop();
            const mimeType = fileType === 'm4a' ? 'audio/m4a' : 'audio/mp4';

            formData.append('audio', {
                uri,
                name: `recording.${fileType} `,
                type: mimeType,
            } as any);

            console.log('Uploading to backend...');
            // Pass the formData to the Processing Screen via navigation params
            // Or perform the upload here and pass the result? 
            // Better UX to show processing screen immediately and let it handle the upload/waiting.
            // But for MVP simplicity, let's keep logic here or pass the promise?

            // Actually, standard pattern: 
            // User taps stop -> Navigate to Processing -> Processing initiates the API call.
            // However, we need the file URI.

            navigation.replace('Processing', { audioUri: uri });

        } catch (error) {
            console.error('Error preparing upload:', error);
            Alert.alert('Error', 'Failed to prepare upload');
            navigation.goBack();
        }
    }

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs} `;
    };

    return (
        <ScreenContainer style={styles.container}>
            <View style={styles.header}>
                <ThemedText variant="headingMedium">Recording</ThemedText>
            </View>

            <View style={styles.waveformContainer}>
                {[...Array(5)].map((_, i) => (
                    <WaveformLine key={i} delay={i * 100} />
                ))}
            </View>

            <ThemedText variant="headingLarge" style={styles.timer}>
                {formatTime(seconds)}
            </ThemedText>

            <View style={styles.controls}>
                <TouchableOpacity
                    style={[styles.controlButton, { backgroundColor: colors.card }]}
                    onPress={() => {
                        // Cancel functionality
                        if (recording) {
                            recording.stopAndUnloadAsync();
                        }
                        navigation.goBack();
                    }}
                >
                    <X size={24} color={colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.stopButton, { backgroundColor: colors.error }]}
                    onPress={stopRecording}
                >
                    <View style={styles.stopIcon} />
                </TouchableOpacity>

                <View style={{ width: 56 }} />
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'space-between',
        paddingBottom: Spacing.xl,
    },
    header: {
        alignItems: 'center',
        paddingVertical: Spacing.l,
    },
    waveformContainer: {
        height: 150,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    waveLine: {
        width: 8,
        borderRadius: 4,
    },
    timer: {
        textAlign: 'center',
        fontVariant: ['tabular-nums'],
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.xl,
    },
    controlButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stopButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#FF3B30",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    stopIcon: {
        width: 24,
        height: 24,
        borderRadius: 4,
        backgroundColor: 'white',
    },
});

