import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Recording'>;

export const RecordingScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [seconds, setSeconds] = useState(0);

  // Animation values for waveform mock
  const pulse1 = useSharedValue(1);
  const pulse2 = useSharedValue(1);
  const pulse3 = useSharedValue(1);

  useEffect(() => {
    // Timer
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    // Start pulsing animation
    const config = { duration: 500, easing: Easing.inOut(Easing.ease) };
    pulse1.value = withRepeat(withSequence(withTiming(1.5, config), withTiming(1, config)), -1, true);
    
    setTimeout(() => {
      pulse2.value = withRepeat(withSequence(withTiming(1.8, config), withTiming(0.8, config)), -1, true);
    }, 200);

    setTimeout(() => {
      pulse3.value = withRepeat(withSequence(withTiming(1.4, config), withTiming(1.1, config)), -1, true);
    }, 400);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStop = () => {
    navigation.replace('Transcription');
  };

  const handleCancel = () => {
    navigation.goBack();
  };

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
        <Typography variant="h2" style={styles.statusText}>Recording...</Typography>
        
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
          title="Stop Recording"
          icon={<Square color={colors.danger} size={20} fill={colors.danger} />}
          onPress={handleStop}
          variant="secondary"
          size="large"
          containerStyle={styles.stopButton}
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
