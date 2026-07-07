import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const REMINDER_HOUR = 20; // 8:00 PM local time
const WINDOW_DAYS = 7; // how many days ahead to pre-schedule

async function ensurePermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.status === 'granted';
}

/**
 * Keeps the evening reminders in sync with the user's logging state.
 *
 * A repeating notification can't skip a single day, so instead we schedule one
 * reminder per day for the next {@link WINDOW_DAYS} days at {@link REMINDER_HOUR}.
 * Today's reminder is omitted when today's entry is already logged. Call this on
 * the Today screen load and right after saving so it always reflects reality.
 */
export async function syncDailyReminders(alreadyLoggedToday: boolean): Promise<void> {
  if (!(await ensurePermission())) return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Daily reminder',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();
  for (let i = 0; i < WINDOW_DAYS; i++) {
    // Skip today's reminder once today is already logged.
    if (i === 0 && alreadyLoggedToday) continue;

    const when = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + i,
      REMINDER_HOUR,
      0,
      0,
      0,
    );
    // Never schedule a time that has already passed.
    if (when.getTime() <= now.getTime()) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Bhakti Tracker',
        body: "A reminder to log today's chanting and reading.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: when,
        channelId: 'reminders',
      },
    });
  }
}

export async function cancelReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
