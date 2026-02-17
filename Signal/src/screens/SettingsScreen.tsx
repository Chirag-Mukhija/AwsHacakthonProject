import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { ThemedText } from '../components/ThemedText';
import { ToggleItem } from '../components/ToggleItem';
import { SectionHeader } from '../components/SectionHeader';
import { useTheme } from '../theme/ThemeContext';
import { Spacing } from '../theme/typography';

export default function SettingsScreen() {
    const { theme, toggleTheme } = useTheme();

    return (
        <ScreenContainer>
            <ThemedText variant="headingMedium" style={styles.header}>
                Settings
            </ThemedText>

            <SectionHeader title="Appearance" />
            <View style={styles.section}>
                <ToggleItem
                    label="Dark Mode"
                    value={theme === 'dark'}
                    onValueChange={toggleTheme}
                />
            </View>

            <SectionHeader title="Privacy" />
            <View style={styles.section}>
                <ToggleItem
                    label="Local Processing Only"
                    value={true}
                    onValueChange={() => { }}
                />
                <ThemedText variant="caption" color="#6B6B6B" style={styles.caption}>
                    Your voice data never leaves your device without permission.
                </ThemedText>
            </View>

            <View style={styles.footer}>
                <ThemedText variant="caption" style={styles.version}>
                    Signal v1.0.0 (MVP)
                </ThemedText>
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        marginBottom: Spacing.l,
    },
    section: {
        marginBottom: Spacing.l,
    },
    caption: {
        marginTop: Spacing.s,
    },
    footer: {
        marginTop: 'auto',
        alignItems: 'center',
        paddingBottom: Spacing.l,
    },
    version: {
        opacity: 0.5,
    },
});
