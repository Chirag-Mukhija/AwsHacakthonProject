import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LandingScreen } from '../screens/LandingScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { RecordingScreen } from '../screens/RecordingScreen';
import { TranscriptionScreen } from '../screens/TranscriptionScreen';
import { ProcessingScreen } from '../screens/ProcessingScreen';
import { SegregationScreen } from '../screens/SegregationScreen';
import { NotesScreen } from '../screens/NotesScreen';
import { useTheme } from '../context/ThemeContext';

export type RootStackParamList = {
  Landing: undefined;
  MainApp: undefined;
  Recording: undefined;
  Transcription: { initialTranscript?: string } | undefined;
  Processing: { textToProcess: string };
  Segregation: { extractedData?: any } | undefined;
  Notes: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { colors, isDark } = useTheme();

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        dark: isDark,
        colors: {
          ...DefaultTheme.colors,
          primary: colors.primaryAction,
          background: colors.background,
          card: colors.card,
          text: colors.text,
          border: colors.border,
          notification: colors.danger,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="MainApp" component={MainTabNavigator} />
        {/* Recording Flow */}
        <Stack.Screen name="Recording" component={RecordingScreen} options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="Transcription" component={TranscriptionScreen} />
        <Stack.Screen name="Processing" component={ProcessingScreen} />
        <Stack.Screen name="Segregation" component={SegregationScreen} />
        <Stack.Screen name="Notes" component={NotesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
