import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { ThemedText } from '../components/ThemedText';
import { PrimaryButton } from '../components/PrimaryButton';
import { Spacing } from '../theme/typography';
import { useTheme } from '../theme/ThemeContext';
// import { NativeStackScreenProps } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../navigation/types';

export default function OnboardingScreen({ navigation }: any) {
    const { colors } = useTheme();

    return (
        <ScreenContainer style={styles.container}>
            <View style={styles.content}>
                <View style={[styles.placeholder, { backgroundColor: colors.card }]} />
                <ThemedText variant="headingLarge" style={styles.title}>
                    Turn decisions into action
                </ThemedText>
                <View style={styles.bullets}>
                    <ThemedText variant="body" style={styles.bullet}>
                        • Capture voice notes instantly
                    </ThemedText>
                    <ThemedText variant="body" style={styles.bullet}>
                        • Convert to structured tasks
                    </ThemedText>
                    <ThemedText variant="body" style={styles.bullet}>
                        • Execute with clarity
                    </ThemedText>
                </View>
            </View>
            <View style={styles.footer}>
                <PrimaryButton
                    label="Continue"
                    onPress={() => navigation.replace('Main')}
                />
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: Spacing.xl,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: Spacing.xl,
    },
    title: {
        textAlign: 'center',
        marginBottom: Spacing.l,
    },
    bullets: {
        gap: Spacing.m,
    },
    bullet: {
        textAlign: 'center',
    },
    footer: {
        paddingTop: Spacing.l,
    },
});
