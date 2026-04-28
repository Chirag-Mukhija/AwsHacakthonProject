import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { useTheme } from '../context/ThemeContext';
import { Keyboard, CheckCircle2, Circle, Mic, GripVertical, Trash2, Bell, StickyNote, Calendar as CalendarIcon } from 'lucide-react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { getApiUrl } from '../config/api';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as Notifications from 'expo-notifications';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainApp'>;

export const HomeScreen = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();

  const [tasks, setTasks] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [viewAll, setViewAll] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'reminders'>('active');
  const [recentlyToggled, setRecentlyToggled] = useState<Set<string>>(new Set());

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [editingReminder, setEditingReminder] = useState<any>(null);

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
      fetchReminders();
    }
  }, [isFocused]);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/tasks`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (e) {
      console.error('[HomeScreen] Failed to fetch tasks:', e);
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchReminders = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/reminders`);
      if (res.ok) {
        const data = await res.json();
        setReminders(data);
      }
    } catch (e) {
      console.error('[HomeScreen] Failed to fetch reminders:', e);
    }
  };

  const showDatePicker = (reminder: any) => {
    setEditingReminder(reminder);
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
    setEditingReminder(null);
  };

  const handleConfirmDate = async (date: Date) => {
    if (editingReminder) {
      const { session_id, reminder_id, notificationId } = editingReminder;
      const scheduledTime = date.toISOString();

      // Cancel old notification
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId).catch(console.error);
      }

      // Schedule new notification
      let newNotificationId;
      try {
        newNotificationId = await Notifications.scheduleNotificationAsync({
          content: { title: editingReminder.title, body: 'Reminder from app' },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
        });
      } catch (err) {
        console.error(err);
      }

      // Optimistic update
      setReminders(prev => prev.map(r => r.reminder_id === reminder_id ? { ...r, scheduledTime, notificationId: newNotificationId } : r));
      
      fetch(`${getApiUrl()}/api/session/${session_id}/reminder/${reminder_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledTime, notificationId: newNotificationId })
      }).catch(console.error);
    }
    hideDatePicker();
  };

  const handleRecordPress = () => {
    navigation.navigate('Recording');
  };

  const handleTypePress = () => {
    navigation.navigate('Transcription', { initialTranscript: '' });
  };

  const handleNotesPress = () => {
    (navigation as any).navigate('Notes');
  };

  const toggleTaskCompletion = async (sessionId: string, taskIndex: number, currentStatus: boolean) => {
    const taskId = `${sessionId}-${taskIndex}`;
    
    setRecentlyToggled(prev => {
      const newSet = new Set(prev);
      newSet.add(taskId);
      return newSet;
    });

    setTasks(prev => prev.map(t => 
      (t.session_id === sessionId && t.task_index === taskIndex) ? { ...t, completed: !currentStatus } : t
    ));

    setTimeout(() => {
      setRecentlyToggled(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }, 3500); 

    try {
      const response = await fetch(`${getApiUrl()}/api/session/${sessionId}/task`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_index: taskIndex, completed: !currentStatus })
      });
      if (!response.ok) throw new Error('Failed to update backend');
    } catch (error) {
      console.error('Failed to toggle task:', error);
      fetchTasks();
    }
  };

  const deleteTask = async (sessionId: string, taskIndex: number) => {
    setTasks(prev => prev.filter(t => !(t.session_id === sessionId && t.task_index === taskIndex)));
    try {
      const response = await fetch(`${getApiUrl()}/api/session/${sessionId}/task/${taskIndex}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete backend');
    } catch (error) {
      console.error('Failed to delete task:', error);
      fetchTasks();
    }
  };

  const activeTasksList = tasks.filter(t => !t.completed || recentlyToggled.has(`${t.session_id}-${t.task_index}`));
  const completedTasksList = tasks.filter(t => t.completed && !recentlyToggled.has(`${t.session_id}-${t.task_index}`));
  
  const currentListContext = activeTab === 'active' ? activeTasksList : (activeTab === 'completed' ? completedTasksList : reminders);
  const displayItems = viewAll ? currentListContext : currentListContext.slice(0, 4);

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <Typography variant="h2">{getGreeting()}</Typography>
        <Typography variant="body" color={colors.textSecondary}>Ready to capture some thoughts?</Typography>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={[styles.recordButton, { backgroundColor: colors.primaryAction }]} onPress={handleRecordPress} activeOpacity={0.8}>
          <Mic color={colors.white} size={32} style={styles.recordIcon} />
          <Typography variant="h3" color={colors.white} style={{ fontWeight: '700' }}>Record</Typography>
        </TouchableOpacity>

        <View style={{ flex: 1, gap: 16 }}>
          <TouchableOpacity style={[styles.smallActionButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={handleTypePress} activeOpacity={0.8}>
            <Keyboard color={colors.primaryAction} size={20} style={styles.actionIcon} />
            <Typography variant="body" style={{ fontWeight: '600' }}>Type</Typography>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.smallActionButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={handleNotesPress} activeOpacity={0.8}>
            <StickyNote color={colors.primaryAction} size={20} style={styles.actionIcon} />
            <Typography variant="body" style={{ fontWeight: '600' }}>Notes</Typography>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <View style={styles.tasksHeader}>
          <TouchableOpacity onPress={() => setActiveTab('active')} style={[styles.filterTab, activeTab === 'active' && { borderBottomColor: colors.primaryAction, borderBottomWidth: 2 }]}>
            <Typography variant="bodyLarge" style={{ fontWeight: activeTab === 'active' ? '700' : '500' }} color={activeTab === 'active' ? colors.text : colors.textSecondary}>Tasks</Typography>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('completed')} style={[styles.filterTab, activeTab === 'completed' && { borderBottomColor: colors.primaryAction, borderBottomWidth: 2 }]}>
            <Typography variant="bodyLarge" style={{ fontWeight: activeTab === 'completed' ? '700' : '500' }} color={activeTab === 'completed' ? colors.text : colors.textSecondary}>Completed</Typography>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('reminders')} style={[styles.filterTab, activeTab === 'reminders' && { borderBottomColor: colors.primaryAction, borderBottomWidth: 2 }]}>
            <Typography variant="bodyLarge" style={{ fontWeight: activeTab === 'reminders' ? '700' : '500' }} color={activeTab === 'reminders' ? colors.text : colors.textSecondary}>Reminders</Typography>
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
      {!loadingTasks && displayItems.length === 0 && (
        <Typography variant="body" color={colors.textSecondary} style={{ textAlign: 'center', marginVertical: 20 }}>
          {activeTab === 'reminders' ? 'No upcoming reminders.' : (activeTab === 'completed' ? 'No completed tasks.' : 'No active tasks.')}
        </Typography>
      )}
    </View>
  );

  const renderRightActions = (sessionId: string, taskIndex: number) => (
    <View style={[styles.deleteSwipeAction, { backgroundColor: colors.danger || '#EF4444' }]}>
      <TouchableOpacity style={styles.deleteButtonContainer} onPress={() => deleteTask(sessionId, taskIndex)}>
        <Trash2 color={colors.white} size={24} />
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item, drag, isActive }: RenderItemParams<any>) => {
    if (activeTab === 'reminders') {
      return (
        <ScaleDecorator>
          <Card style={[styles.taskCard, isActive && { elevation: 5, shadowOpacity: 0.1, borderColor: colors.primaryAction, borderWidth: 1 }]} elevated={!isActive}>
            <TouchableOpacity style={styles.taskRow} onLongPress={drag} disabled={isActive}>
              <Bell color={colors.textSecondary} size={24} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Typography variant="body">{item.title}</Typography>
                {item.scheduledTime && (
                  <TouchableOpacity style={styles.datePickerButton} onPress={() => showDatePicker(item)}>
                    <CalendarIcon size={12} color={colors.primaryAction} />
                    <Typography variant="caption" color={colors.primaryAction} style={{ marginLeft: 6, fontWeight: '600' }}>
                      {new Date(item.scheduledTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity onPressIn={drag} style={styles.dragHandle}>
                <GripVertical color={colors.textSecondary} size={20} />
              </TouchableOpacity>
            </TouchableOpacity>
          </Card>
        </ScaleDecorator>
      );
    }

    // Task item
    return (
      <ScaleDecorator>
        <Swipeable renderRightActions={() => renderRightActions(item.session_id, item.task_index)} containerStyle={styles.swipeableContainer} friction={2} rightThreshold={40}>
          <Card style={[styles.taskCard, isActive && { elevation: 5, shadowOpacity: 0.1, borderColor: colors.primaryAction, borderWidth: 1 }]} elevated={!isActive}>
            <TouchableOpacity style={styles.taskRow} onLongPress={drag} onPress={() => toggleTaskCompletion(item.session_id, item.task_index, item.completed)} activeOpacity={1} disabled={isActive}>
              {item.completed ? <CheckCircle2 color={colors.success} size={24} /> : <Circle color={colors.textSecondary} size={24} />}
              <Typography variant="body" style={[styles.taskText, item.completed && { textDecorationLine: 'line-through', color: colors.textSecondary }]}>
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
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.tasksSection}>
        <DraggableFlatList
          data={displayItems}
          onDragEnd={({ data }) => {
            if (activeTab === 'reminders') {
              const newOrderIds = data.map(d => d.reminder_id);
              setReminders(prev => {
                const other = prev.filter(r => !newOrderIds.includes(r.reminder_id));
                return [...data, ...other];
              });
            } else {
              const newOrderIds = data.map(d => `${d.session_id}-${d.task_index}`);
              setTasks(prev => {
                const other = prev.filter(t => !newOrderIds.includes(`${t.session_id}-${t.task_index}`));
                return [...data, ...other];
              });
            }
          }}
          keyExtractor={(item) => activeTab === 'reminders' ? item.reminder_id : `${item.session_id}-${item.task_index}`}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.scrollContent}
        />
      </View>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        themeVariant={isDark ? "dark" : "light"}
        isDarkModeEnabled={isDark}
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
        date={editingReminder && editingReminder.scheduledTime ? new Date(editingReminder.scheduledTime) : new Date()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24 },
  header: { marginBottom: 32, marginTop: 16 },
  actionsContainer: { flexDirection: 'row', gap: 16, marginBottom: 48 },
  recordButton: { flex: 1, height: 140, borderRadius: 24, justifyContent: 'center', alignItems: 'center', shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8 },
  recordIcon: { marginBottom: 12 },
  smallActionButton: { flex: 1, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  actionIcon: { marginBottom: 8 },
  tasksSection: { flex: 1 },
  tasksHeader: { flexDirection: 'row', justifyContent: 'flex-start', gap: 24, alignItems: 'center', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  filterTab: { paddingVertical: 12, marginBottom: -1, paddingHorizontal: 4 },
  taskCard: { padding: 16, borderRadius: 16 },
  taskRow: { flexDirection: 'row', alignItems: 'center' },
  taskText: { marginLeft: 12, flex: 1 },
  dragHandle: { paddingLeft: 4, paddingVertical: 4 },
  swipeableContainer: { marginBottom: 12, borderRadius: 16, overflow: 'hidden' },
  deleteSwipeAction: { justifyContent: 'center', alignItems: 'flex-end', width: 80, height: '100%' },
  deleteButtonContainer: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  datePickerButton: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: 'rgba(59, 130, 246, 0.1)', alignSelf: 'flex-start', borderRadius: 8 },
});
