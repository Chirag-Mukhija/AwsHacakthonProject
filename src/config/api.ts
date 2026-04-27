import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Returns the API base URL dynamically at call time.
 * Using a getter ensures Constants.expoConfig is always fully populated.
 */
export const getApiUrl = (): string => {
  if (__DEV__) {
    // For local development with Expo, dynamically construct the API URL
    // This allows testing on physical devices without hardcoding local IPs
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      // hostUri is usually something like '192.168.1.100:8081'
      const ip = hostUri.split(':')[0];
      return `http://${ip}:3000`;
    }

    // Fallback for Android emulator (which sees localhost as 10.0.2.2)
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000';
    }

    // Fallback for iOS simulator or local web
    return 'http://localhost:3000';
  }

  // Production URL
  return 'https://api.yourproductionurl.com';
};

// Keep a static export for backward compatibility, evaluated once at startup.
// Screens that need the freshest value should call getApiUrl() directly.
export const API_URL = getApiUrl();
