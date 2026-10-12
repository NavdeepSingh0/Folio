import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import { storage } from '../cache';

const STUDY_REMINDER_PREFIX = 'study-reminder-';
const LAST_SCHEDULED_KEY = 'notifications.lastScheduled';

// Configure how notifications behave when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Rotating messages to keep reminders fresh and engaging
const STUDY_MESSAGES_12PM = [
  "Lunch break? Perfect time to review some notes! 🥪",
  "Halfway through the day! Keep the momentum going. 🚀",
  "Just 10 minutes of review can boost your retention! 🧠",
  "Ready for a quick study session? Let's go! 📚"
];

const STUDY_MESSAGES_7PM = [
  "Evening review time! Let's lock in today's knowledge. 🌙",
  "Wind down with a quick look at your flashcards. 📖",
  "One last study session before you call it a day? 🎯",
  "Consistency is key! Great time to review your folders. 🗝️"
];

export async function setupLocalNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
  }

  // Top up at most once per day
  const today = new Date().toDateString();
  if (storage.getString(LAST_SCHEDULED_KEY) === today) return;

  // Cancel only our study reminders so exam reminders survive
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter(n => n.identifier.startsWith(STUDY_REMINDER_PREFIX))
      .map(n => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );

  // TEST NOTIFICATION: Fire 5 seconds from now so the user can see it!
  //await Notifications.scheduleNotificationAsync({
  // content: { 
  //title: "Test Notification 🎉", 
  // body: "Notifications are working perfectly on your device!",
  // sound: true 
  //},
  // @ts-ignore - Expo types for timeInterval trigger
  //trigger: { seconds: 5, type: 'timeInterval' },
  //});

  const now = new Date();

  // Schedule rotating reminders for the next 7 days
  // We re-run this logic on app launch, so it continually "tops up" the next 7 days.
  for (let i = 0; i < 7; i++) {
    const d12 = new Date();
    d12.setDate(now.getDate() + i);
    d12.setHours(12, 0, 0, 0);

    const d19 = new Date();
    d19.setDate(now.getDate() + i);
    d19.setHours(19, 0, 0, 0);

    const msg12 = STUDY_MESSAGES_12PM[i % STUDY_MESSAGES_12PM.length];
    const msg19 = STUDY_MESSAGES_7PM[i % STUDY_MESSAGES_7PM.length];

    if (d12 > now) {
      await Notifications.scheduleNotificationAsync({
        identifier: `${STUDY_REMINDER_PREFIX}${i}-12`,
        content: { title: "Folio 📚", body: msg12, sound: true },
        trigger: { date: d12, type: Notifications.SchedulableTriggerInputTypes.DATE },
      });
    }

    if (d19 > now) {
      await Notifications.scheduleNotificationAsync({
        identifier: `${STUDY_REMINDER_PREFIX}${i}-19`,
        content: { title: "Folio 🌙", body: msg19, sound: true },
        trigger: { date: d19, type: Notifications.SchedulableTriggerInputTypes.DATE },
      });
    }
  }

  storage.set(LAST_SCHEDULED_KEY, today);
}

// Function to schedule a custom exam reminder
export async function scheduleExamReminder(examDate: Date, subjectName: string) {
  const reminderDate = new Date(examDate);
  // Remind 3 days before at 10 AM
  reminderDate.setDate(reminderDate.getDate() - 3);
  reminderDate.setHours(10, 0, 0, 0);

  if (reminderDate > new Date()) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Exam Coming Up! 🚨",
        body: `Your ${subjectName} exam is in 3 days! Time to hit the books hard.`,
        sound: true,
      },
      trigger: { date: reminderDate, type: Notifications.SchedulableTriggerInputTypes.DATE },
    });
  }
}
