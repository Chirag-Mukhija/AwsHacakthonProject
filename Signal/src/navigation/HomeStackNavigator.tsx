import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import RecordingScreen from '../screens/RecordingScreen';
import ProcessingScreen from '../screens/ProcessingScreen';
import ConfirmationScreen from '../screens/ConfirmationScreen';
import { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Recording" component={RecordingScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="Processing" component={ProcessingScreen} options={{ animation: 'fade' }} />
            <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
        </Stack.Navigator>
    );
}
