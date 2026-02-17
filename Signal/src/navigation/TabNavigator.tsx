import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeStackNavigator from './HomeStackNavigator';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { TabParamList } from './types';
import { useTheme } from '../theme/ThemeContext';
import { Monitor, FileClock, Settings } from 'lucide-react-native';

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
    const { colors } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.card,
                    borderTopColor: colors.border,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
            }}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeStackNavigator}
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => <Monitor color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="History"
                component={HistoryScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <FileClock color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
                }}
            />
        </Tab.Navigator>
    );
}
