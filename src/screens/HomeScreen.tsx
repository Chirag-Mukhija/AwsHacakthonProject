import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { useTheme } from '../context/ThemeContext';
import { Keyboard, CheckCircle2, Circle, Mic, GripVertical, Trash2 } from 'lucide-react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { API_URL, getApiUrl } from '../config/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainApp'>;

export const HomeScreen = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const isFocused = useIsFocused();

  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [viewAll, setViewAll] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [recentlyToggled, setRecentlyToggled] = useState<Set<string>>(new Set());

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  useEffect(() => {
    if (isFocused) {
      fetchTasks();
    }
  }, [isFocused]);

  const fetchTasks = async () => {
    try {
      const url = `${getApiUrl()}/api/tasks`;
      console.log('[HomeScreen] Fetching tasks from:', url);
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        console.log('[HomeScreen] Fetched', data.length, 'tasks');
        setTasks(data);
      } else {
        console.warn('[HomeScreen] Tasks fetch returned status:', res.status);
      }
    } catch (e) {
      console.error('[HomeScreen] Failed to fetch tasks:', e);
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
    const taskId = `${sessionId}-${taskIndex}`;
    
    // Add to recently toggled so it delays moving sections
    setRecentlyToggled(prev => {
      const newSet = new Set(prev);
      newSet.add(taskId);
      return newSet;
    });

    // Optimistic update
    setTasks(prev => prev.map(t => 
      (t.session_id === sessionId && t.task_index === taskIndex) ? { ...t, completed: !currentStatus } : t
    ));

    setTimeout(() => {
      setRecentlyToggled(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }, 3500); // Wait 3.5 seconds before it disappears from the current list

    try {
      const response = await fetch(`${getApiUrl()}/api/session/${sessionId}/task`, {
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

  const deleteTask = async (sessionId: string, taskIndex: number) => {
    // Optimistic remove
    setTasks(prev => prev.filter(t => !(t.session_id === sessionId && t.task_index === taskIndex)));
    
    try {
      const response = await fetch(`${getApiUrl()}/api/session/${sessionId}/task/${taskIndex}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete backend');
    } catch (error) {
      console.error('Failed to delete task:', error);
      fetchTasks();
    }
  };

  const activeTasksList = tasks.filter(t => !t.completed || recentlyToggled.has(`${t.session_id}-${t.task_index}`));
  const completedTasksList = tasks.filter(t => t.completed && !recentlyToggled.has(`${t.session_id}-${t.task_index}`));
  
  const currentListContext = showCompleted ? completedTasksList : activeTasksList;
  const displayTasks = viewAll ? currentListContext : currentListContext.slice(0, 4);

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <Typography variant="h2">{getGreeting()}</Typography>
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
      <View style={{ marginBottom: 24 }}>
        <View style={styles.tasksHeader}>
          <TouchableOpacity 
            onPress={() => setShowCompleted(false)}
            style={[styles.filterTab, !showCompleted && { borderBottomColor: colors.primaryAction, borderBottomWidth: 2 }]}
          >
            <Typography variant="bodyLarge" style={{ fontWeight: !showCompleted ? '700' : '500' }} color={!showCompleted ? colors.text : colors.textSecondary}>Upcoming Tasks</Typography>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setShowCompleted(true)}
            style={[styles.filterTab, showCompleted && { borderBottomColor: colors.primaryAction, borderBottomWidth: 2 }]}
          >
            <Typography variant="bodyLarge" style={{ fontWeight: showCompleted ? '700' : '500' }} color={showCompleted ? colors.text : colors.textSecondary}>Completed</Typography>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 }}>
          {currentListContext.length > 4 && (
            <TouchableOpacity onPress={() => setViewAll(!viewAll)}>
              <Typography variant="bodySmall" color={colors.primaryAction}>{viewAll ? 'View less' : 'View all'}</Typography>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loadingTasks && <ActivityIndicator color={colors.primaryAction} style={{ margin: 20 }} />}
      {!loadingTasks && displayTasks.length === 0 && (
        <Typography variant="body" color={colors.textSecondary} style={{ textAlign: 'center', marginVertical: 20 }}>
          {showCompleted ? 'No completed tasks.' : 'No active tasks.'}
        </Typography>
      )}
    </View>
  );

  const renderRightActions = (sessionId: string, taskIndex: number) => {
    return (
      <View style={[styles.deleteSwipeAction, { backgroundColor: colors.danger || '#EF4444' }]}>
        <TouchableOpacity style={styles.deleteButtonContainer} onPress={() => deleteTask(sessionId, taskIndex)}>
          <Trash2 color={colors.white} size={24} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<any>) => (
    <ScaleDecorator>
      <Swipeable
        renderRightActions={() => renderRightActions(item.session_id, item.task_index)}
        containerStyle={styles.swipeableContainer}
        friction={2}
        rightThreshold={40}
      >
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
      </Swipeable>
    </ScaleDecorator>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.tasksSection}>
        <DraggableFlatList
          data={displayTasks}
          onDragEnd={({ data }) => {
            // Update local state without breaking partitioned subsets
            const newOrderIds = data.map(d => `${d.session_id}-${d.task_index}`);
            setTasks(prev => {
              const otherTasks = prev.filter(t => !newOrderIds.includes(`${t.session_id}-${t.task_index}`));
              return [...data, ...otherTasks];
            });
          }}
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
    justifyContent: 'flex-start',
    gap: 24,
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTab: {
    paddingVertical: 12,
    marginBottom: -1, // overlap the border
    paddingHorizontal: 4,
  },
  tasksList: {
    gap: 12,
  },
  taskCard: {
    padding: 16,
    borderRadius: 16,
    // marginBottom removed, now handled by swipeableContainer
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
    paddingLeft: 4,
    paddingVertical: 4,
  },
  swipeableContainer: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  deleteSwipeAction: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: 80,
    height: '100%',
  },
  deleteButtonContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
