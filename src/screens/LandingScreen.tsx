import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../components/Typography';
import { Button } from '../components/Button';
import { useTheme } from '../context/ThemeContext';
import { Mic, ListChecks, Calendar } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Landing'>;

export const LandingScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const handleContinue = () => {
    navigation.replace('MainApp');
  };

  const features = [
    { icon: <Mic color={colors.primaryAction} size={24} />, text: 'Voice to Tasks' },
    { icon: <ListChecks color={colors.primaryAction} size={24} />, text: 'Smart Segregation' },
    { icon: <Calendar color={colors.primaryAction} size={24} />, text: 'Calendar Sync' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Placeholder Logo */}
        <View style={[styles.logoPlaceholder, { backgroundColor: colors.cardElevated }]}>
          <Mic color={colors.primaryAction} size={48} />
        </View>

        <Typography variant="h1" style={styles.title}>Signal</Typography>
        <Typography variant="bodyLarge" color={colors.textSecondary} align="center" style={styles.description}>
          Your AI-powered productivity assistant. Converting voice decisions into tasks, reminders, and calendar events.
        </Typography>

        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={[styles.featureRow, { backgroundColor: colors.card }]}>
              {feature.icon}
              <Typography variant="body" style={styles.featureText}>{feature.text}</Typography>
            </View>
          ))}
        </View>

      </View>
      <View style={styles.footer}>
        <Button title="Continue" onPress={handleContinue} size="large" />
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
    paddingHorizontal: 24,
  },
  logoPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    marginBottom: 16,
  },
  description: {
    marginBottom: 48,
    lineHeight: 24,
  },
  featuresContainer: {
    width: '100%',
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  featureText: {
    marginLeft: 16,
    fontWeight: '500',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
});
