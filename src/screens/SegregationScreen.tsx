import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { Typography } from '../components/Typography';
import { Button } from '../components/Button';
import { useTheme } from '../context/ThemeContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { CheckCircle2, Circle, GripVertical } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Segregation'>;
type SegregationRouteProp = RouteProp<RootStackParamList, 'Segregation'>;

type ItemType = 'tasks' | 'reminders' | 'events' | 'notes';

type ListItem = 
  | { type: 'header'; id: string; title: string; category: ItemType }
  | { type: 'item'; id: string; category: ItemType; text: string; completed: boolean };

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
        calendar_events.forEach((text: string) => {
          formattedData.push({ type: 'item', id: `evt-${idCounter++}`, category: 'events', text, completed: true });
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

  const handleConfirm = () => {
    // Navigate to History to show the results
    navigation.replace('MainApp');
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
          
          <TextInput
            style={[
              styles.input, 
              { color: colors.text, textDecorationLine: !item.completed ? 'line-through' : 'none', opacity: !item.completed ? 0.5 : 1 }
            ]}
            value={item.text}
            onChangeText={(text) => updateText(item.id, text)}
            multiline
          />

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
        <Button title="Confirm and Add" onPress={handleConfirm} size="large" />
      </View>
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
  dragHandle: {
    paddingLeft: 12,
    paddingVertical: 8,
  },
  footer: {
    padding: 24,
  },
});
