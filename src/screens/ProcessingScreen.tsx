import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../components/Typography';
import { useTheme } from '../context/ThemeContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { Alert } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { API_URL } from '../config/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Processing'>;
type ProcessingRouteProp = RouteProp<RootStackParamList, 'Processing'>;

export const ProcessingScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ProcessingRouteProp>();

  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const processTranscript = async () => {
      try {
        const textToProcess = route.params?.textToProcess || '';
        
        // If there's no text, skip API and show empty mock immediately
        if (!textToProcess) {
          setTimeout(() => navigation.replace('Segregation', { extractedData: null }), 1500);
          return;
        }

        // Make API request (replace IP with localhost if on iOS Simulator)
        const response = await fetch(`${API_URL}/api/extract`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textToProcess }),
        });

        if (!response.ok) {
          throw new Error('Backend responded with an error');
        }

        const data = await response.json();
        
        setTimeout(() => {
          navigation.replace('Segregation', { extractedData: { ...data, transcript: textToProcess } });
        }, 1000); // give some buffer for animation
        
      } catch (error) {
        console.error('Processing connection error:', error);
        Alert.alert(
          'API Error', 
          `Failed to extract data. Ensure the Node backend is running exactly at ${API_URL}.`, 
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    };

    processTranscript();

    const config = { duration: 400, easing: Easing.inOut(Easing.ease) };
    
    dot1.value = withRepeat(withSequence(withTiming(-10, config), withTiming(0, config)), -1, true);
    
    setTimeout(() => {
      dot2.value = withRepeat(withSequence(withTiming(-10, config), withTiming(0, config)), -1, true);
    }, 150);

    setTimeout(() => {
      dot3.value = withRepeat(withSequence(withTiming(-10, config), withTiming(0, config)), -1, true);
    }, 300);

    return () => {}; // we don't clear the timeout easily here, but it's safe for this implementation
  }, [navigation, route.params?.textToProcess]);

  const style1 = useAnimatedStyle(() => ({ transform: [{ translateY: dot1.value }] }));
  const style2 = useAnimatedStyle(() => ({ transform: [{ translateY: dot2.value }] }));
  const style3 = useAnimatedStyle(() => ({ transform: [{ translateY: dot3.value }] }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primaryAction} style={styles.spinner} />
        </View>

        <Typography variant="h2" style={styles.title}>Processing</Typography>
        
        <View style={styles.messageRow}>
          <Typography variant="bodyLarge" color={colors.textSecondary} align="center">
            Hang tight, we're extracting tasks and reminders
          </Typography>
          <View style={styles.dots}>
            <Animated.View style={[styles.dot, { backgroundColor: colors.textSecondary }, style1]} />
            <Animated.View style={[styles.dot, { backgroundColor: colors.textSecondary }, style2]} />
            <Animated.View style={[styles.dot, { backgroundColor: colors.textSecondary }, style3]} />
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loaderContainer: {
    marginBottom: 40,
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  spinner: {
    transform: [{ scale: 1.2 }],
  },
  title: {
    marginBottom: 16,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 24,
    marginLeft: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 2,
    marginBottom: 4,
  },
});
