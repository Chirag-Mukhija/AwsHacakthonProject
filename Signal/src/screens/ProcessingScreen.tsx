import React, { useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { ScreenContainer } from '../components/ScreenContainer';
import { ThemedText } from '../components/ThemedText';
import { useTheme } from '../theme/ThemeContext';
import { Spacing } from '../theme/typography';

// Replace with your machine's IP if testing on device, or 10.0.2.2 for Android Emulator
const BACKEND_URL = 'http://localhost:3000/process-audio';

export default function ProcessingScreen({ navigation, route }: any) {
    const { colors } = useTheme();
    const { audioUri } = route.params || {};

    useEffect(() => {
        if (audioUri) {
            processAudio(audioUri);
        } else {
            // Fallback for testing/demo without recording
            const timer = setTimeout(() => {
                navigation.replace('Confirmation');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [audioUri]);

    const processAudio = async (uri: string) => {
        try {
            const formData = new FormData();
            const fileType = uri.split('.').pop();
            const mimeType = fileType === 'm4a' ? 'audio/m4a' : 'audio/mp4';

            formData.append('audio', {
                uri,
                name: `recording.${fileType}`,
                type: mimeType,
            } as any);

            console.log('Sending to backend:', BACKEND_URL);
            const response = await axios.post(BACKEND_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Received response:', response.data);
            navigation.replace('Confirmation', { data: response.data });

        } catch (error: any) {
            console.error('Processing error:', error);
            Alert.alert(
                'Processing Failed',
                error.message || 'Could not process audio. Please try again.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        }
    };

    return (
        <ScreenContainer style={styles.container}>
            <ActivityIndicator size="large" color={colors.primary} />
            <ThemedText variant="headingMedium" style={styles.text}>
                Processing decision...
            </ThemedText>
            <ThemedText variant="body" color={colors.textSecondary} style={styles.subtext}>
                Extracting tasks and events...
            </ThemedText>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        marginTop: Spacing.l,
        textAlign: 'center',
    },
    subtext: {
        marginTop: Spacing.s,
        textAlign: 'center',
    },
});
