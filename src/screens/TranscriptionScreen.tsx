import React, { useState } from 'react';
import { View, StyleSheet, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useTheme } from '../context/ThemeContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { ChevronLeft } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Transcription'>;
type TranscriptionRouteProp = RouteProp<RootStackParamList, 'Transcription'>;

export const TranscriptionScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TranscriptionRouteProp>();
  
  const defaultMock = "Hey Signal, send a proposal to the client tomorrow and remind me to call Rahul regarding the project update. Also, I have a presentation review later today.";
  const initialTranscript = route.params?.initialTranscript !== undefined ? route.params.initialTranscript : defaultMock;
  const [transcript, setTranscript] = useState(initialTranscript);

  const handleConfirm = () => {
    navigation.replace('Processing', { textToProcess: transcript });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            
            <View style={styles.header}>
              <Button 
                icon={<ChevronLeft color={colors.text} size={24} />} 
                variant="ghost" 
                onPress={handleBack} 
                containerStyle={styles.backButton}
              />
              <Typography variant="h3">Review Transcript</Typography>
              <View style={styles.headerRight} />
            </View>

            <View style={styles.content}>
              <Typography variant="body" color={colors.textSecondary} style={styles.instruction}>
                Edit any mistakes before we extract your tasks and events.
              </Typography>

              <Card elevated style={styles.transcriptCard}>
                <TextInput
                  style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
                  multiline
                  value={transcript}
                  onChangeText={setTranscript}
                  placeholder="Start typing..."
                  placeholderTextColor={colors.textSecondary}
                  textAlignVertical="top"
                />
              </Card>
            </View>

            <View style={styles.footer}>
              <Button 
                title="Confirm & Extract" 
                onPress={handleConfirm} 
                size="large" 
              />
            </View>

          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 48,
  },
  headerRight: {
    width: 48,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  instruction: {
    marginBottom: 24,
  },
  transcriptCard: {
    flex: 1,
    padding: 0,
    overflow: 'hidden',
  },
  textInput: {
    flex: 1,
    padding: 16,
    fontSize: 18,
    lineHeight: 28,
  },
  footer: {
    padding: 24,
  },
});
