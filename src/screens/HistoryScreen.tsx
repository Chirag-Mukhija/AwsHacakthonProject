import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { useTheme } from '../context/ThemeContext';
import { Clock, ChevronDown, ChevronUp, FileText, CheckCircle2, Trash2, Bell } from 'lucide-react-native';
import { useIsFocused } from '@react-navigation/native';
import { API_URL } from '../config/api';

export const HistoryScreen = () => {
  const { colors } = useTheme();
  const isFocused = useIsFocused();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (isFocused) {
      fetchHistory();
    }
  }, [isFocused]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/api/sessions`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (e) {
      console.error('Failed to fetch sessions:', e);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ', ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const deleteSession = async (id: string) => {
    // Optimistic removal
    setSessions(prev => prev.filter(s => s.id !== id));
    if (expandedId === id) setExpandedId(null);
    
    try {
      const res = await fetch(`${API_URL}/api/session/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete history');
    } catch (e) {
      console.error('Failed to delete session:', e);
      fetchHistory(); // Revert
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Typography variant="h2">History</Typography>
          <Typography variant="body" color={colors.textSecondary}>
            Your past interactions and extracted tasks.
          </Typography>
        </View>

        <View style={styles.list}>
          {loading ? (
            <ActivityIndicator color={colors.primaryAction} style={{ margin: 20 }} />
          ) : sessions.length === 0 ? (
            <Typography variant="body" color={colors.textSecondary} style={{ textAlign: 'center', marginVertical: 20 }}>
              No history found. Try creating a new session.
            </Typography>
          ) : sessions.map(session => {
            const isExpanded = expandedId === session.id;
            
            return (
              <Card key={session.id} elevated style={styles.card}>
                <TouchableOpacity onPress={() => toggleExpand(session.id)} activeOpacity={0.7}>
                  <View style={styles.cardHeader}>
                    <View style={styles.timestampRow}>
                      <Clock color={colors.textSecondary} size={16} />
                      <Typography variant="bodySmall" color={colors.textSecondary} style={{ marginLeft: 8 }}>
                        {formatDate(session.created_at)}
                      </Typography>
                    </View>
                    {isExpanded ? (
                      <ChevronUp color={colors.textSecondary} size={20} />
                    ) : (
                      <ChevronDown color={colors.textSecondary} size={20} />
                    )}
                  </View>

                  <Typography variant="body" numberOfLines={isExpanded ? undefined : 2} style={styles.transcriptPreview}>
                    "{session.transcript}"
                  </Typography>

                  {!isExpanded && (
                    <View style={styles.statsRow}>
                      <Typography variant="caption" style={[styles.statValue, { backgroundColor: colors.background }]}>
                        {session.task_count} Tasks
                      </Typography>
                      <Typography variant="caption" style={[styles.statValue, { backgroundColor: colors.background }]}>
                        {session.reminder_count} Reminders
                      </Typography>
                      <Typography variant="caption" style={[styles.statValue, { backgroundColor: colors.background }]}>
                        {session.event_count} Events
                      </Typography>
                    </View>
                  )}
                </TouchableOpacity>

                {isExpanded && (
                  <View style={[styles.expandedContent, { borderTopColor: colors.border }]}>
                    {/* Extracted Tasks */}
                    {session.ai_output?.tasks?.length > 0 && (
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                          <CheckCircle2 color={colors.success} size={16} />
                          <Typography variant="bodySmall" color={colors.textSecondary} style={styles.sectionTitle}>
                            Tasks
                          </Typography>
                        </View>
                        {session.ai_output.tasks.map((task: any, i: number) => (
                          <View key={i} style={styles.listItem}>
                            <View style={[styles.bullet, { backgroundColor: colors.textSecondary }]} />
                            <Typography variant="body" style={task.completed ? { textDecorationLine: 'line-through', opacity: 0.5 } : {}}>{task.title}</Typography>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Extracted Reminders */}
                    {session.ai_output?.reminders?.length > 0 && (
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                          <Bell color={'#F59E0B'} size={16} />
                          <Typography variant="bodySmall" color={colors.textSecondary} style={styles.sectionTitle}>
                            Reminders
                          </Typography>
                        </View>
                        {session.ai_output.reminders.map((rem: any, i: number) => (
                          <View key={i} style={styles.listItem}>
                            <View style={[styles.bullet, { backgroundColor: colors.textSecondary }]} />
                            <Typography variant="body">{rem.title}</Typography>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Extracted Events */}
                    {session.ai_output?.calendar_events?.length > 0 && (
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                          <Clock color={colors.danger} size={16} />
                          <Typography variant="bodySmall" color={colors.textSecondary} style={styles.sectionTitle}>
                            Events
                          </Typography>
                        </View>
                        {session.ai_output.calendar_events.map((evt: any, i: number) => (
                          <View key={i} style={styles.listItem}>
                            <View style={[styles.bullet, { backgroundColor: colors.textSecondary }]} />
                            <Typography variant="body">{evt.title}</Typography>
                          </View>
                        ))}
                      </View>
                    )}

                    <TouchableOpacity onPress={() => deleteSession(session.id)} style={styles.deleteButton}>
                      <Trash2 color={colors.danger} size={16} />
                      <Typography variant="body" color={colors.danger} style={{ marginLeft: 8, fontWeight: '600' }}>
                        Delete History
                      </Typography>
                    </TouchableOpacity>
                  </View>
                )}
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  list: {
    gap: 16,
  },
  card: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transcriptPreview: {
    fontStyle: 'italic',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statValue: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  expandedContent: {
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 1,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    marginLeft: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
    marginLeft: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#333',
  },
});
