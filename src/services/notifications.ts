import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { EkadasiDay } from '../data/ekadasi';
import { todayKey } from '../utils/date';

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
const WINDOW_DAYS = 7; // how many days ahead to pre-schedule dailies
const EKADASI_COUNT = 6; // how many upcoming Ekadasis to keep scheduled

async function ensurePermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.status === 'granted';
}

/** Cancels only the scheduled notifications whose identifier has this prefix. */
async function cancelByPrefix(prefix: string): Promise<void> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter((n) => (n.identifier ?? '').startsWith(prefix))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

async function ensureChannel(id: string, name: string): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(id, {
      name,
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
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
  await ensureChannel('reminders', 'Daily reminder');
  // Cancel only our daily reminders — leave Ekadasi (and any other) intact.
  await cancelByPrefix('daily-');

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
    if (when.getTime() <= now.getTime()) continue;

    await Notifications.scheduleNotificationAsync({
      identifier: `daily-${i}`,
      content: {
        title: 'Bhakti Tracker',
        body: "A gentle reminder to log today's sadhana.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: when,
        channelId: 'reminders',
      },
    });
  }
}

/**
 * Schedules two reminders for each of the next {@link EKADASI_COUNT} Ekadasis:
 * one the evening before (fasting prep) and one the morning of. Dates come from
 * the app's Ekadasi calendar, which the maintainer must keep verified.
 */
export async function syncEkadasiReminders(dates: EkadasiDay[]): Promise<void> {
  if (!(await ensurePermission())) return;
  await ensureChannel('ekadasi', 'Ekadasi reminders');
  await cancelByPrefix('ekadasi-');

  const now = new Date();
  const today = todayKey();
  const upcoming = [...dates]
    .filter((e) => e.date >= today)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(0, EKADASI_COUNT);

  for (const e of upcoming) {
    const [y, m, d] = e.date.split('-').map(Number);

    // Evening before — fasting prep (5:00 PM the previous day).
    const eve = new Date(y, m - 1, d - 1, 17, 0, 0, 0);
    if (eve.getTime() > now.getTime()) {
      await Notifications.scheduleNotificationAsync({
        identifier: `ekadasi-${e.date}-pre`,
        content: {
          title: 'Ekadasi tomorrow',
          body: `${e.name} is tomorrow. A good time to prepare for the fast.`,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: eve,
          channelId: 'ekadasi',
        },
      });
    }

    // Morning of (6:30 AM).
    const morn = new Date(y, m - 1, d, 6, 30, 0, 0);
    if (morn.getTime() > now.getTime()) {
      await Notifications.scheduleNotificationAsync({
        identifier: `ekadasi-${e.date}-day`,
        content: {
          title: 'Today is Ekadasi',
          body: `${e.name}. Haribol! Observe the fast and extra remembrance today.`,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: morn,
          channelId: 'ekadasi',
        },
      });
    }
  }
}

export async function cancelReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
