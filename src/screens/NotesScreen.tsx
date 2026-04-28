import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { getApiUrl } from '../config/api';

export const NotesScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/notes`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (e) {
      console.error('Failed to fetch notes:', e);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <Card style={styles.noteCard} elevated>
      <Typography variant="bodySmall" color={colors.textSecondary} style={styles.date}>
        {new Date(item.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </Typography>
      <Typography variant="body">{item.content}</Typography>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Typography variant="h2">Notes</Typography>
      </View>
      {loading ? (
        <ActivityIndicator color={colors.primaryAction} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item, index) => item.note_id || index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Typography variant="body" color={colors.textSecondary} style={{ textAlign: 'center', marginTop: 40 }}>
              No notes found. Create a session to add notes.
            </Typography>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  backButton: { marginRight: 16 },
  listContent: { paddingHorizontal: 24, paddingBottom: 40 },
  noteCard: { padding: 16, marginBottom: 16, borderRadius: 12 },
  date: { marginBottom: 8 },
});
