import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen from '../screens/OnboardingScreen';
import TabNavigator from './TabNavigator';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* For MVP, we'll start with Onboarding, then user can navigate to Main */}
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Main" component={TabNavigator} />
        </Stack.Navigator>
    );
}
