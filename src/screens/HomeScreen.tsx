import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { useTheme } from '../context/ThemeContext';
import { Keyboard, CheckCircle2, Circle, Mic, GripVertical } from 'lucide-react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainApp'>;

export const HomeScreen = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const isFocused = useIsFocused();

  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    if (isFocused) {
      fetchTasks();
    }
  }, [isFocused]);

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://192.168.1.4:3000/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (e) {
      console.error('Failed to fetch tasks:', e);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleRecordPress = () => {
    navigation.navigate('Recording');
  };

  const handleTypePress = () => {
    navigation.navigate('Transcription', { initialTranscript: '' });
  };

  const toggleTaskCompletion = async (sessionId: string, taskIndex: number, currentStatus: boolean) => {
    // Optimistic update
    setTasks(prev => prev.map(t => 
      (t.session_id === sessionId && t.task_index === taskIndex) ? { ...t, completed: !currentStatus } : t
    ));

    try {
      const response = await fetch(`http://192.168.1.4:3000/api/session/${sessionId}/task`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_index: taskIndex, completed: !currentStatus })
      });
      if (!response.ok) {
        throw new Error('Failed to update backend');
      }
    } catch (error) {
      console.error('Failed to toggle task:', error);
      fetchTasks(); // Revert on error
    }
  };

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <Typography variant="h2">Good Morning</Typography>
        <Typography variant="body" color={colors.textSecondary}>Ready to capture some thoughts?</Typography>
      </View>

      {/* Top Half - Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.recordButton, { backgroundColor: colors.primaryAction }]}
          onPress={handleRecordPress}
          activeOpacity={0.8}
        >
          <Mic color={colors.white} size={32} style={styles.recordIcon} />
          <Typography variant="h3" color={colors.white} style={{ fontWeight: '700' }}>Record</Typography>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleTypePress}
          activeOpacity={0.8}
        >
          <Keyboard color={colors.primaryAction} size={24} style={styles.typeIcon} />
          <Typography variant="bodyLarge" style={{ fontWeight: '600' }}>Type</Typography>
        </TouchableOpacity>
      </View>

      {/* Bottom Half - Upcoming Tasks */}
      <View style={styles.tasksHeader}>
        <Typography variant="h3">Upcoming Tasks</Typography>
        <TouchableOpacity>
          <Typography variant="bodySmall" color={colors.primaryAction}>View all</Typography>
        </TouchableOpacity>
      </View>

      {loadingTasks && <ActivityIndicator color={colors.primaryAction} style={{ margin: 20 }} />}
      {!loadingTasks && tasks.length === 0 && (
        <Typography variant="body" color={colors.textSecondary} style={{ textAlign: 'center', marginVertical: 20 }}>
          No active tasks.
        </Typography>
      )}
    </View>
  );

  const renderItem = ({ item, drag, isActive }: RenderItemParams<any>) => (
    <ScaleDecorator>
      <Card
        style={[
          styles.taskCard,
          isActive && { elevation: 5, shadowOpacity: 0.1, borderColor: colors.primaryAction, borderWidth: 1 }
        ]}
        elevated={!isActive}
      >
        <TouchableOpacity
          style={styles.taskRow}
          onLongPress={drag}
          onPress={() => toggleTaskCompletion(item.session_id, item.task_index, item.completed)}
          activeOpacity={1}
          disabled={isActive}
        >
          {item.completed ? (
            <CheckCircle2 color={colors.success} size={24} />
          ) : (
            <Circle color={colors.textSecondary} size={24} />
          )}
          <Typography
            variant="body"
            style={[
              styles.taskText,
              item.completed && { textDecorationLine: 'line-through', color: colors.textSecondary }
            ]}
          >
            {item.title}
          </Typography>
          <TouchableOpacity onPressIn={drag} style={styles.dragHandle}>
            <GripVertical color={colors.textSecondary} size={20} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Card>
    </ScaleDecorator>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.tasksSection}>
        <DraggableFlatList
          data={tasks}
          onDragEnd={({ data }) => setTasks(data)}
          keyExtractor={(item) => `${item.session_id}-${item.task_index}`}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.scrollContent}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
    marginTop: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 48,
  },
  recordButton: {
    flex: 2,
    height: 140,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  recordIcon: {
    marginBottom: 12,
  },
  typeButton: {
    flex: 1,
    height: 140,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  typeIcon: {
    marginBottom: 12,
  },
  tasksSection: {
    flex: 1,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tasksList: {
    gap: 12,
  },
  taskCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12, // Required since DraggableFlatList doesn't inherently support gap on older React Native wrappers
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskText: {
    marginLeft: 12,
    flex: 1,
  },
  dragHandle: {
    paddingLeft: 12,
    paddingVertical: 4,
  },
});
