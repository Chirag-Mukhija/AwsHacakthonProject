import * as Calendar from 'expo-calendar';
import { Alert, Platform } from 'react-native';

export const createCalendarEvents = async (eventsArray: any[]) => {
  if (!eventsArray || eventsArray.length === 0) return;

  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Calendar permission is required to add events.');
      return;
    }

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    let selectedCalendar = calendars.find(
      (c) => c.allowsModifications && c.isPrimary
    );

    if (!selectedCalendar) {
      selectedCalendar = calendars.find((c) => c.allowsModifications);
    }

    if (!selectedCalendar) {
      console.warn('No calendar available that allows modifications');
      return;
    }

    for (const event of eventsArray) {
      try {
        const titleText = event.title || 'New Event';
        
        if (!event.start_iso) {
          console.warn('Invalid calendar event format: missing start_iso');
          continue;
        }

        const startDate = new Date(event.start_iso);
        if (isNaN(startDate.getTime())) {
          console.warn('Invalid calendar event format: start_iso is invalid date');
          continue;
        }

        let endDate = event.end_iso ? new Date(event.end_iso) : new Date(startDate.getTime() + 60 * 60 * 1000);
        if (isNaN(endDate.getTime())) {
          endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        }

        await Calendar.createEventAsync(selectedCalendar.id, {
          title: titleText,
          startDate,
          endDate,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || Calendar.getDefaultTimezone() || 'UTC',
          notes: event.notes || 'Created by Signal',
        });
        console.log(`Successfully created event: ${titleText}`);
      } catch (eventError) {
        console.error('Failed to create individual event:', eventError);
      }
    }
  } catch (error) {
    console.error('Failed to process calendar events:', error);
  }
};
