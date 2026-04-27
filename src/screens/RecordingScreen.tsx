import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../components/Typography';
import { Button } from '../components/Button';
import { useTheme } from '../context/ThemeContext';
import { Mic, Square, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import {
  useAudioRecorder,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import Constants from 'expo-constants';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Recording'>;

export const RecordingScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [seconds, setSeconds] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Track whether we already stopped so the cleanup doesn't double-stop
  const stoppedRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // expo-audio hook — manages the recorder's lifecycle automatically
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  // Animation values for waveform
  const pulse1 = useSharedValue(1);
  const pulse2 = useSharedValue(1);
  const pulse3 = useSharedValue(1);

  // Start pulsing animations
  useEffect(() => {
    const config = { duration: 500, easing: Easing.inOut(Easing.ease) };
    pulse1.value = withRepeat(withSequence(withTiming(1.5, config), withTiming(1, config)), -1, true);

    const t2 = setTimeout(() => {
      pulse2.value = withRepeat(withSequence(withTiming(1.8, config), withTiming(0.8, config)), -1, true);
    }, 200);

    const t3 = setTimeout(() => {
      pulse3.value = withRepeat(withSequence(withTiming(1.4, config), withTiming(1.1, config)), -1, true);
    }, 400);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Start recording on mount
  useEffect(() => {
    const startRecording = async () => {
      try {
        const { granted } = await requestRecordingPermissionsAsync();
        if (!granted) {
          Alert.alert('Permission needed', 'Microphone permission is required to record audio.');
          return;
        }

        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        });

        await recorder.prepareToRecordAsync();
        recorder.record();
        setIsRecording(true);

        intervalRef.current = setInterval(() => {
          setSeconds(s => s + 1);
        }, 1000);
      } catch (err) {
        console.error('Failed to start recording:', err);
        Alert.alert('Error', 'Failed to start recording. Please try again.');
      }
    };

    startRecording();

    // Cleanup: stop recording if user navigates away without pressing stop
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (!stoppedRef.current) {
        recorder.stop().catch(() => {});
      }
    };
  }, []);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStop = useCallback(async () => {
    if (!isRecording || isProcessing || stoppedRef.current) return;

    // Mark stopped immediately so cleanup doesn't interfere
    stoppedRef.current = true;
    setIsProcessing(true);
    setIsRecording(false);

    // Stop the timer immediately
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    try {
      // Stop the recording — this is immediate
      await recorder.stop();

      const uri = recorder.uri;
      if (!uri) throw new Error('No recording URI found after stopping');

      // Dynamically resolve backend IP from Expo's host
      const hostUri = Constants.expoConfig?.hostUri;
      const ip = hostUri ? hostUri.split(':')[0] : 'localhost';
      const API_URL = `http://${ip}:3000/api/transcribe-audio`;

      console.log('[RecordingScreen] Sending audio to:', API_URL);

      const formData = new FormData();
      formData.append('audio', {
        uri,
        name: 'recording.m4a',
        type: 'audio/m4a',
      } as any);

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // Try to extract a human-readable error from backend
        let errMsg = `Request failed (${response.status})`;
        try {
          const errData = await response.json();
          errMsg = errData.error || errMsg;
        } catch {
          // ignore parse errors
        }
        throw new Error(errMsg);
      }

      const data = await response.json();
      const transcript: string = data.transcript ?? '';

      if (!transcript.trim()) {
        // Empty transcript — Deepgram heard nothing meaningful
        Alert.alert(
          "Nothing Heard",
          "We couldn't pick up any speech. Please speak clearly and try again, or type your message instead.",
          [
            {
              text: "Try Again",
              onPress: () => navigation.replace('Recording'),
            },
            {
              text: "Type Instead",
              onPress: () => navigation.replace('Transcription', { initialTranscript: '' }),
            },
          ]
        );
        setIsProcessing(false);
        return;
      }

      navigation.replace('Transcription', { initialTranscript: transcript });

    } catch (error: any) {
      console.error('[RecordingScreen] Transcription error:', error);
      Alert.alert(
        'Connection Error',
        error.message || 'Failed to reach the server. Make sure your backend is running and you are on the same network.',
        [{ text: 'OK' }]
      );
      setIsProcessing(false);
      // Don't reset stoppedRef — recording is done, just failed to transcribe
    }
  }, [isRecording, isProcessing, recorder, navigation]);

  const handleCancel = useCallback(async () => {
    stoppedRef.current = true;
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (isRecording) {
      await recorder.stop().catch(console.error);
    }
    navigation.goBack();
  }, [isRecording, recorder, navigation]);

  const animatedStyle1 = useAnimatedStyle(() => ({ transform: [{ scaleY: pulse1.value }] }));
  const animatedStyle2 = useAnimatedStyle(() => ({ transform: [{ scaleY: pulse2.value }] }));
  const animatedStyle3 = useAnimatedStyle(() => ({ transform: [{ scaleY: pulse3.value }] }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
          <X color={colors.text} size={28} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Typography variant="h2" style={styles.statusText}>
          {isProcessing ? 'Processing...' : 'Recording...'}
        </Typography>

        <Typography variant="h1" style={[styles.timer, { color: colors.primaryAction }]}>
          {formatTime(seconds)}
        </Typography>

        {/* Mock Waveform */}
        <View style={styles.waveformContainer}>
          {[1, 2, 3, 2, 1, 3, 1].map((p, i) => {
            const style = p === 1 ? animatedStyle1 : p === 2 ? animatedStyle2 : animatedStyle3;
            return (
              <Animated.View
                key={i}
                style={[styles.waveBar, { backgroundColor: colors.primaryAction }, style]}
              />
            );
          })}
        </View>

        {/* Pulsing Mic Avatar */}
        <View style={[styles.micAvatarContainer, { borderColor: colors.primaryAction + '40' }]}>
          <View style={[styles.micAvatar, { backgroundColor: colors.primaryAction }]}>
            <Mic color={colors.white} size={48} />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={isProcessing ? 'Processing...' : 'Stop Recording'}
          icon={!isProcessing ? <Square color={colors.danger} size={20} fill={colors.danger} /> : undefined}
          onPress={handleStop}
          variant="secondary"
          size="large"
          containerStyle={styles.stopButton}
          disabled={isProcessing || !isRecording}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: 'flex-end',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    marginBottom: 16,
  },
  timer: {
    fontSize: 64,
    fontWeight: '300',
    marginBottom: 64,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    gap: 8,
    marginBottom: 64,
  },
  waveBar: {
    width: 8,
    height: 40,
    borderRadius: 4,
  },
  micAvatarContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  footer: {
    padding: 32,
  },
  stopButton: {
    borderRadius: 32,
  },
});
