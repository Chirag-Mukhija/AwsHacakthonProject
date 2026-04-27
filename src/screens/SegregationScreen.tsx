import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../components/Typography';
import { Button } from '../components/Button';
import { useTheme } from '../context/ThemeContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { CheckCircle2, Circle, GripVertical, Calendar as CalendarIcon } from 'lucide-react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { API_URL, getApiUrl } from '../config/api';
import { createCalendarEvents } from '../utils/calendarUtils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Segregation'>;
type SegregationRouteProp = RouteProp<RootStackParamList, 'Segregation'>;

type ItemType = 'tasks' | 'reminders' | 'events' | 'notes';

type ListItem = 
  | { type: 'header'; id: string; title: string; category: ItemType }
  | { type: 'item'; id: string; category: ItemType; text: string; completed: boolean; start_iso?: string; end_iso?: string; };

const initialData: ListItem[] = [
  { type: 'header', id: 'h-tasks', title: 'Tasks', category: 'tasks' },
  { type: 'item', id: '1', category: 'tasks', text: 'Send proposal to client', completed: true },
  { type: 'item', id: '2', category: 'tasks', text: 'Review presentation', completed: true },
  
  { type: 'header', id: 'h-reminders', title: 'Reminders', category: 'reminders' },
  { type: 'item', id: '3', category: 'reminders', text: 'Call Rahul regarding update', completed: true },
  
  { type: 'header', id: 'h-events', title: 'Calendar Events', category: 'events' },
  { type: 'item', id: '4', category: 'events', text: 'Team Sync at 4 PM', completed: true },
];

export const SegregationScreen = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SegregationRouteProp>();
  const [data, setData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);

  const showDatePicker = (id: string) => {
    setActiveEventId(id);
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
    setActiveEventId(null);
  };

  const handleConfirmDate = (date: Date) => {
    if (activeEventId) {
      setData(prev => prev.map(item => {
        if (item.type === 'item' && item.id === activeEventId) {
          const start_iso = date.toISOString();
          const end_iso = new Date(date.getTime() + 60 * 60 * 1000).toISOString();
          return { ...item, start_iso, end_iso };
        }
        return item;
      }));
    }
    hideDatePicker();
  };

  const formatDisplayDate = (isoString?: string) => {
    if (!isoString) return 'No time set';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString('en-US', { 
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  useEffect(() => {
    if (route.params?.extractedData) {
      const { tasks = [], reminders = [], calendar_events = [], notes = [] } = route.params.extractedData;
      
      const formattedData: ListItem[] = [];
      let idCounter = 0;
      
      if (tasks.length > 0) {
        formattedData.push({ type: 'header', id: 'h-tasks', title: 'Tasks', category: 'tasks' });
        tasks.forEach((text: string) => {
          formattedData.push({ type: 'item', id: `task-${idCounter++}`, category: 'tasks', text, completed: true });
        });
      }
      
      if (reminders.length > 0) {
        formattedData.push({ type: 'header', id: 'h-reminders', title: 'Reminders', category: 'reminders' });
        reminders.forEach((text: string) => {
          formattedData.push({ type: 'item', id: `rem-${idCounter++}`, category: 'reminders', text, completed: true });
        });
      }

      if (calendar_events.length > 0) {
        formattedData.push({ type: 'header', id: 'h-events', title: 'Calendar Events', category: 'events' });
        calendar_events.forEach((event: any) => {
          // Fallback if event is a string from old mock data, otherwise use the object
          const title = typeof event === 'string' ? event : (event.title || 'Event');
          formattedData.push({ 
            type: 'item', 
            id: `evt-${idCounter++}`, 
            category: 'events', 
            text: title, 
            completed: true,
            start_iso: typeof event === 'object' ? event.start_iso : undefined,
            end_iso: typeof event === 'object' ? event.end_iso : undefined
          });
        });
      }

      if (notes.length > 0) {
        formattedData.push({ type: 'header', id: 'h-notes', title: 'Notes', category: 'notes' });
        notes.forEach((text: string) => {
          formattedData.push({ type: 'item', id: `note-${idCounter++}`, category: 'notes', text, completed: true });
        });
      }
      
      if (formattedData.length > 0) {
        setData(formattedData);
      } else {
        // If everything is completely empty, maybe just show a note
        setData([{ type: 'header', id: 'h-notes', title: 'Notes', category: 'notes' }, { type: 'item', id: 'note-0', category: 'notes', text: route.params.extractedData.transcript || 'No data generated', completed: true }]);
      }
    }
  }, [route.params?.extractedData]);

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      const finalTasks: any[] = [];
      const finalReminders: any[] = [];
      const finalEvents: any[] = [];
      const finalNotes: any[] = [];

      data.forEach(item => {
        if (item.type === 'item' && item.completed && item.text.trim()) {
           if (item.category === 'tasks') {
             finalTasks.push({ title: item.text.trim(), completed: false });
           } else if (item.category === 'reminders') {
             finalReminders.push({ title: item.text.trim() });
           } else if (item.category === 'events') {
             finalEvents.push({ 
               title: item.text.trim(),
               start_iso: item.start_iso,
               end_iso: item.end_iso
             });
           } else if (item.category === 'notes') {
             finalNotes.push(item.text.trim());
           }
        }
      });

      const payload = {
        transcript: route.params?.extractedData?.transcript || 'Manual entry',
        source_type: 'text',
        ai_output: {
          tasks: finalTasks,
          reminders: finalReminders,
          calendar_events: finalEvents,
          notes: finalNotes
        }
      };

      const response = await fetch(`${getApiUrl()}/api/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to save session');

      if (finalEvents.length > 0) {
        createCalendarEvents(finalEvents).catch(err => {
          console.error('Calendar integration failed non-fatally:', err);
        });
      }

      navigation.replace('MainApp');
    } catch (error) {
       console.error('Failed to save session:', error);
       Alert.alert('Error', 'Could not sync session to the cloud. Try again.');
    } finally {
       setIsSaving(false);
    }
  };

  const toggleComplete = (id: string) => {
    setData(prev => prev.map(item => 
      item.type === 'item' && item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const updateText = (id: string, newText: string) => {
    setData(prev => prev.map(item => 
      item.type === 'item' && item.id === id ? { ...item, text: newText } : item
    ));
  };

  const onDragEnd = ({ data: newData }: { data: ListItem[] }) => {
    // After reordering, update the category of items based on the headers above them
    let currentCategory: ItemType = 'tasks';
    const updatedData = newData.map(item => {
      if (item.type === 'header') {
        currentCategory = item.category;
        return item;
      } else {
        return { ...item, category: currentCategory };
      }
    });
    setData(updatedData);
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<ListItem>) => {
    if (item.type === 'header') {
      return (
        <View style={[styles.headerContainer, { backgroundColor: colors.background }]}>
          <Typography variant="h3" color={colors.textSecondary}>{item.title}</Typography>
        </View>
      );
    }

    return (
      <ScaleDecorator>
        <TouchableOpacity
          activeOpacity={1}
          onLongPress={drag}
          disabled={isActive}
          style={[
            styles.itemContainer,
            { 
              backgroundColor: isActive ? colors.cardElevated : colors.card,
              borderColor: isActive ? colors.primaryAction : colors.border,
              borderWidth: isActive ? 1 : 0,
              elevation: isActive ? 5 : 0,
              shadowColor: '#000',
              shadowOpacity: isActive ? 0.1 : 0,
              shadowRadius: 10,
            }
          ]}
        >
          <TouchableOpacity onPress={() => toggleComplete(item.id)} style={styles.checkbox}>
            {item.completed ? (
              <CheckCircle2 color={colors.success} size={24} />
            ) : (
              <Circle color={colors.textSecondary} size={24} />
            )}
          </TouchableOpacity>
          
          <View style={{ flex: 1 }}>
            <TextInput
              style={[
                styles.input, 
                { color: colors.text, textDecorationLine: !item.completed ? 'line-through' : 'none', opacity: !item.completed ? 0.5 : 1 }
              ]}
              value={item.text}
              onChangeText={(text) => updateText(item.id, text)}
              multiline
            />
            {item.category === 'events' && (
              <TouchableOpacity 
                style={styles.datePickerButton} 
                onPress={() => showDatePicker(item.id)}
              >
                <CalendarIcon size={14} color={colors.primaryAction} />
                <Typography variant="bodySmall" color={colors.primaryAction} style={{ marginLeft: 6, fontWeight: '600' }}>
                  {formatDisplayDate(item.start_iso)}
                </Typography>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity onPressIn={drag} style={styles.dragHandle}>
            <GripVertical color={colors.textSecondary} size={24} />
          </TouchableOpacity>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Typography variant="h2">Segregation</Typography>
        <Typography variant="body" color={colors.textSecondary}>
          Review and organize your extracted items.
        </Typography>
      </View>

      <View style={styles.listContainer}>
        <DraggableFlatList
          data={data}
          onDragEnd={onDragEnd}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      </View>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border, borderTopWidth: 1 }]}>
        {isSaving ? (
          <ActivityIndicator color={colors.primaryAction} style={{ padding: 14 }} />
        ) : (
          <Button title="Confirm and Add" onPress={handleConfirm} size="large" />
        )}
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
        date={
          activeEventId 
            ? (() => {
                const item = data.find(i => i.type === 'item' && i.id === activeEventId) as any;
                return item?.start_iso ? new Date(item.start_iso) : new Date();
              })()
            : new Date()
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    paddingVertical: 16,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  checkbox: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    padding: 0,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)', // Subtle primary blue background
    alignSelf: 'flex-start',
    borderRadius: 8,
  },
  dragHandle: {
    paddingLeft: 12,
    paddingVertical: 8,
  },
  footer: {
    padding: 24,
  },
});
