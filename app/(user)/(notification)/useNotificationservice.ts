import { useState, useEffect, useContext } from "react";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "@/Ipconfig/ipconfig";
import { UserContext } from "@/context/UserContext";

type PrayerTime = {
  name: string;
  time: string;
  icon: string;
};

type TaskType = {
  _id: string;
  title: string;
  time: string;
  description?: string;
  date?: string;
  isRecurring?: boolean;
  duration?: number; // Duration in days
  createdAt?: string; // ISO timestamp
};

const prayerIcons = {
  Fajr: "🌅",
  Sunrise: "🌄",
  Dhuhr: "☀️",
  Asr: "🌤️",
  Maghrib: "🌅",
  Isha: "🌙",
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function useNotificationService(city: string, country: string) {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const { user } = useContext(UserContext);

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      setHasPermission(status === "granted");
    })();

    const receivedSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      }
    );

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;

        if (data?.type === "prayerTime" && data?.navigateTo) {
          navigation.navigate(data.navigateTo);
        }
        if (data?.type === "tasks" && data?.taskId) {
          navigation.navigate("(more)/Schedule");
        }
        if (data?.type === "storyTime") {
          navigation.navigate("(detailsscreens)/StoriesDetails");
        }
        if (data?.type === "events") {
          navigation.navigate("(detailsscreens)/EventsDetails");
        }
      });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, [navigation]);

  const requestPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const isGranted = status === "granted";
      setHasPermission(isGranted);
      return isGranted;
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      return false;
    }
  };

  const parsePrayerTime = (timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const now = new Date();
    const prayerDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
      0,
      0
    );
    if (prayerDate < now) {
      prayerDate.setDate(prayerDate.getDate() + 1);
    }
    return prayerDate;
  };

  const fetchAndSchedulePrayerTimes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://api.aladhan.com/v1/timingsByCity",
        {
          params: {
            city,
            country,
            method: 1,
            school: 1,
            adjustment: 0,
          },
        }
      );

      const timings = response.data.data.timings;
      const formattedTimes: PrayerTime[] = Object.keys(timings)
        .filter((key) => ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].includes(key))
        .map((key) => ({
          name: key,
          time: timings[key],
          icon: prayerIcons[key],
        }));

      await AsyncStorage.setItem("prayerTimes", JSON.stringify(formattedTimes));
      await AsyncStorage.setItem("prayerTimesLastFetched", new Date().toISOString());

      await cancelPrayerNotifications();
      for (const prayer of formattedTimes) {
        await schedulePrayerNotification(prayer);
      }

      return formattedTimes;
    } catch (error) {
      console.error("Error fetching prayer times:", error);
      try {
        const cachedTimesString = await AsyncStorage.getItem("prayerTimes");
        if (cachedTimesString) {
          const cachedTimes: PrayerTime[] = JSON.parse(cachedTimesString);
          await cancelPrayerNotifications();
          for (const prayer of cachedTimes) {
            await schedulePrayerNotification(prayer);
          }
          return cachedTimes;
        }
        throw new Error("No cached prayer times available");
      } catch (storageError) {
        console.error("Error retrieving cached prayer times:", storageError);
        throw storageError;
      }
    } finally {
      setLoading(false);
    }
  };

  const schedulePrayerNotification = async (prayer: PrayerTime) => {
    try {
      const triggerDate = parsePrayerTime(prayer.time);
      const notificationId = `prayer-${prayer.name}-${triggerDate.getDate()}`;
      await Notifications.scheduleNotificationAsync({
        identifier: notificationId,
        content: {
          title: `${prayer.icon} ${prayer.name} Prayer Time`,
          body: `It's time for ${prayer.name} prayer (${prayer.time}). Learn how to pray correctly.`,
          data: {
            type: "prayerTime",
            prayerName: prayer.name,
            navigateTo: "NamazScreen",
          },
        },
        trigger: triggerDate,
      });
      console.log(`Scheduled notification for ${prayer.name} at ${triggerDate.toLocaleString()} (ID: ${notificationId})`);
    } catch (error) {
      console.error(`Error scheduling notification for ${prayer.name}:`, error);
    }
  };

  const setupDailyPrayerTimeRefresh = async () => {
    try {
      const updatedTimes = await fetchAndSchedulePrayerTimes();
      console.log("Prayer times refreshed:", updatedTimes);
      return updatedTimes;
    } catch (error) {
      console.error("Error refreshing prayer times:", error);
      throw error;
    }
  };

  useEffect(() => {
    const checkAndRefreshPrayerTimes = async () => {
      const prayerEnabled = await AsyncStorage.getItem("notification_prayerTime");
      if (prayerEnabled === "true") {
        const lastRefresh = await AsyncStorage.getItem("prayer_times_last_refresh");
        const now = new Date();
        const lastRefreshDate = lastRefresh ? new Date(lastRefresh) : null;
        if (!lastRefreshDate || lastRefreshDate.getDate() !== now.getDate()) {
          try {
            await setupDailyPrayerTimeRefresh();
            await AsyncStorage.setItem("prayer_times_last_refresh", now.toISOString());
          } catch (error) {
            const cachedTimesString = await AsyncStorage.getItem("prayerTimes");
            if (cachedTimesString) {
              const cachedTimes: PrayerTime[] = JSON.parse(cachedTimesString);
              await cancelPrayerNotifications();
              for (const prayer of cachedTimes) {
                await schedulePrayerNotification(prayer);
              }
              console.log("Scheduled notifications using cached prayer times");
            }
          }
        } else {
          const cachedTimesString = await AsyncStorage.getItem("prayerTimes");
          if (cachedTimesString) {
            const cachedTimes: PrayerTime[] = JSON.parse(cachedTimesString);
            await cancelPrayerNotifications();
            for (const prayer of cachedTimes) {
              await schedulePrayerNotification(prayer);
            }
            console.log("Scheduled notifications using cached prayer times");
          }
        }
      }
    };
    checkAndRefreshPrayerTimes();
  }, []);

  const cancelPrayerNotifications = async () => {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const prayerNotifications = scheduledNotifications
      .filter((notification) => notification.content.data?.type === "prayerTime")
      .map((notification) => notification.identifier);

    for (const id of prayerNotifications) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
  };

  const cancelServiceNotifications = async (serviceType: string) => {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const serviceNotifications = scheduledNotifications
        .filter(
          (notification) =>
            notification.content.data &&
            typeof notification.content.data === "object" &&
            "type" in notification.content.data &&
            notification.content.data.type === serviceType
        )
        .map((notification) => notification.identifier);

      for (const id of serviceNotifications) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
      console.log(`Canceled ${serviceNotifications.length} notifications for ${serviceType}`);
      return serviceNotifications.length;
    } catch (error) {
      console.error(`Error canceling ${serviceType} notifications:`, error);
      throw error;
    }
  };

  const toggleNotificationService = async (serviceType: string, enabled: boolean) => {
    try {
      if (!hasPermission) {
        const granted = await requestPermissions();
        if (!granted) throw new Error("Notification permission not granted");
      }

      await cancelServiceNotifications(serviceType);

      if (enabled) {
        switch (serviceType) {
          case "prayerTime":
            if (!city || !country) throw new Error("City and country are required");
            await fetchAndSchedulePrayerTimes();
            await setupDailyPrayerTimeRefresh();
            await AsyncStorage.setItem("prayer_times_last_refresh", new Date().toISOString());
            break;
          case "tasks":
            if (!user?.user?._id) throw new Error("User is not authenticated");
            const userId = user.user._id;
            const userToken = await AsyncStorage.getItem("userToken");
            if (!userToken) throw new Error("User token not found");
            let tasks: TaskType[] = [];
            try {
              tasks = await fetchTasksFromDatabase(userToken, userId);
              await AsyncStorage.setItem("cachedTasks", JSON.stringify(tasks));
            } catch (error) {
              console.error("Failed to fetch tasks, using cached tasks:", error);
              const cachedTasksString = await AsyncStorage.getItem("cachedTasks");
              if (cachedTasksString) {
                tasks = JSON.parse(cachedTasksString);
              }
            }
            await setupTaskNotifications(tasks);
            break;
          case "storyTime":
            await setupStoryNotifications();
            break;
          case "events":
            await setupSpecialEventNotifications();
            break;
          default:
            throw new Error(`Unknown service type: ${serviceType}`);
        }
      }

      await AsyncStorage.setItem(`notification_${serviceType}`, String(enabled));
      console.log(`${serviceType} notifications ${enabled ? "enabled" : "disabled"}`);
    } catch (error) {
      console.error(`Error toggling ${serviceType} notification service:`, error);
      throw error;
    }
  };

  const fetchTasksFromDatabase = async (userToken: string, userId: string): Promise<TaskType[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/schedule/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      });
      console.log("Tasks fetched successfully", response.data);
      return response.data || [];
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  };

  const isTaskWithinDuration = (task: TaskType): boolean => {
    if (!task.createdAt || !task.duration) return true;
    const createdDate = new Date(task.createdAt);
    const now = new Date();
    const durationMs = task.duration * 24 * 60 * 60 * 1000;
    const endDate = new Date(createdDate.getTime() + durationMs);
    return now <= endDate;
  };

  const cancelTaskNotifications = async (taskId: string) => {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      let cancelCount = 0;
      for (const notification of scheduledNotifications) {
        if (
          notification.content.data?.type === "tasks" &&
          notification.content.data?.taskId === taskId
        ) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
          cancelCount++;
        }
      }
      console.log(`Canceled ${cancelCount} notifications for task ID: ${taskId}`);
    } catch (error) {
      console.error("Error canceling task notifications:", error);
      throw error;
    }
  };

  const setupNotificationForSingleTask = async (task: TaskType) => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== "granted") {
          console.error("Notification permissions denied by user");
          return;
        }
      }

      const tasksEnabled = await AsyncStorage.getItem("notification_tasks");
      if (tasksEnabled !== "true") {
        console.log("Task notifications are disabled. Skipping.");
        return;
      }

      const { time, title, _id, duration, createdAt } = task;
      if (!time || !title || !_id) {
        console.warn("Task missing required fields:", task);
        return;
      }

      if (!isTaskWithinDuration(task)) {
        console.log(`Task "${title}" duration has expired. Skipping notification.`);
        await cancelTaskNotifications(_id);
        return;
      }

      const [hours, minutes] = time.split(":").map(Number);
      if (isNaN(hours) || isNaN(minutes)) {
        console.warn(`Invalid time format for task "${title}": ${time}`);
        return;
      }

      await cancelTaskNotifications(_id);

      const triggerDate = new Date();
      triggerDate.setHours(hours, minutes, 0, 0);
      if (triggerDate < new Date()) {
        triggerDate.setDate(triggerDate.getDate() + 1);
      }

      const notificationId = `task-${_id}-${triggerDate.getTime()}`;
      if (duration && createdAt) {
        const createdDate = new Date(createdAt);
        const endDate = new Date(createdDate.getTime() + duration * 24 * 60 * 60 * 1000);
        const now = new Date();
        if (now <= endDate) {
          await Notifications.scheduleNotificationAsync({
            identifier: notificationId,
            content: {
              title: "Task Reminder",
              body: `Don't forget: ${title}`,
              data: { type: "tasks", taskId: _id },
            },
            trigger: {
              hour: hours,
              minute: minutes,
              repeats: true,
            },
          });
          console.log(`Scheduled notification (ID: ${notificationId}) for task "${title}" until ${endDate}`);
        }
      } else {
        await Notifications.scheduleNotificationAsync({
          identifier: notificationId,
          content: {
            title: "Task Reminder",
            body: `Don't forget: ${title}`,
            data: { type: "tasks", taskId: _id },
          },
          trigger: {
            hour: hours,
            minute: minutes,
            repeats: true,
          },
        });
        console.log(
          `Scheduled recurring notification (ID: ${notificationId}) for task "${title}" at ${hours}:${minutes} daily`
        );
      }

      if (triggerDate > new Date() && isTaskWithinDuration(task)) {
        const todayNotificationId = `task-${_id}-today-${triggerDate.getTime()}`;
        await Notifications.scheduleNotificationAsync({
          identifier: todayNotificationId,
          content: {
            title: "Task Reminder",
            body: `Don't forget: ${title}`,
            data: { type: "tasks", taskId: _id },
          },
          trigger: triggerDate,
        });
        console.log(
          `Scheduled today's notification (ID: ${todayNotificationId}) for task "${title}" at ${triggerDate.toLocaleString()}`
        );
      }
    } catch (error) {
      console.error("Error scheduling notification for task:", error);
      throw error;
    }
  };

  const setupTaskNotifications = async (tasks: TaskType[]) => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== "granted") {
          console.error("Notification permissions denied.");
          return;
        }
      }

      await cancelServiceNotifications("tasks");

      if (!tasks || tasks.length === 0) {
        console.log("No tasks to schedule notifications for");
        return;
      }

      let scheduledCount = 0;
      let skippedCount = 0;

      for (const task of tasks) {
        await setupNotificationForSingleTask(task);
        if (isTaskWithinDuration(task)) {
          scheduledCount++;
        } else {
          skippedCount++;
        }
      }

      console.log(
        `Task notifications setup complete: ${scheduledCount} scheduled, ${skippedCount} skipped`
      );
      await AsyncStorage.setItem(
        "tasks_notifications_last_setup",
        new Date().toISOString()
      );
    } catch (error) {
      console.error("Error scheduling task notifications:", error);
      throw error;
    }
  };

  const handleNewOrUpdatedTask = async (task: TaskType) => {
    try {
      if (!task._id) {
        console.warn("Task is missing an ID, cannot set up notifications");
        return;
      }
      const tasksEnabled = await AsyncStorage.getItem("notification_tasks");
      if (tasksEnabled === "true") {
        await setupNotificationForSingleTask(task);
        const cachedTasksString = await AsyncStorage.getItem("cachedTasks");
        let cachedTasks: TaskType[] = cachedTasksString ? JSON.parse(cachedTasksString) : [];
        cachedTasks = cachedTasks.filter((t) => t._id !== task._id);
        cachedTasks.push(task);
        await AsyncStorage.setItem("cachedTasks", JSON.stringify(cachedTasks));
        console.log(`Scheduled notifications for new/updated task: ${task.title}`);
      } else {
        console.log("Task notifications are disabled. Not setting up notifications.");
      }
    } catch (error) {
      console.error("Error handling new/updated task:", error);
      throw error;
    }
  };

  const scheduleDailyNotification = async ({
    title,
    body,
    hour,
    minute,
    type,
    navigateTo,
  }: {
    title: string;
    body: string;
    hour: number;
    minute: number;
    type: string;
    navigateTo: string;
  }) => {
    try {
      const triggerDate = new Date();
      triggerDate.setHours(hour, minute, 0, 0);
      if (triggerDate < new Date()) {
        triggerDate.setDate(triggerDate.getDate() + 1);
      }
      const notificationId = `${type}-${hour}-${minute}`;
      await Notifications.scheduleNotificationAsync({
        identifier: notificationId,
        content: {
          title,
          body,
          data: { type, navigateTo },
        },
        trigger: {
          hour,
          minute,
          repeats: true,
        },
      });
      console.log(`Scheduled daily notification "${title}" at ${hour}:${minute} (ID: ${notificationId})`);
    } catch (error) {
      console.error(`Error scheduling daily notification "${title}":`, error);
      throw error;
    }
  };

  const setupStoryNotifications = async () => {
    try {
      await scheduleDailyNotification({
        title: "Daily Islamic Story",
        body: "Time for your daily inspiring story",
        hour: 20,
        minute: 0,
        type: "storyTime",
        navigateTo: "StoryScreen",
      });
    } catch (error) {
      console.error("Error setting up story notification:", error);
      throw error;
    }
  };

  const fetchUpcomingEventsAndScheduleNotifications = async () => {
    try {
      await cancelServiceNotifications("events");
      let allEvents: { [key: string]: any } = {};
      const importantEvents = {
        Ramadan: "The holy month of fasting",
        "Eid-ul-Fitr": "A festival marking the end of Ramadan.",
        "Eid-ul-Adha": "The 'Festival of Sacrifice,'.",
        Ashura: "The 10th day of Muharram.",
        "Lailat-ul-Qadr": "The 'Night of Power,'.",
        "Mawlid al-Nabi": "The observance of the birth of Prophet Muhammad (SAW).",
        "Lailat-ul-Miraj": "The night journey and ascension of Prophet Muhammad (SAW).",
        "Beginning of the holy months": "The start of the special Islamic months.",
        "Islamic New Year": "The beginning of the Islamic (Hijri) calendar.",
      };

      const currentHijriYear = 1446;
      try {
        for (let month = 1; month <= 12; month++) {
          const response = await fetch(
            `https://api.aladhan.com/v1/hijriCalendar?month=${month}&year=${currentHijriYear}&latitude=33.6844&longitude=73.0479&method=1`
          );
          const data = await response.json();

          if (data.data && Array.isArray(data.data)) {
            data.data.forEach((day: any) => {
              if (day.date.hijri.holidays.length > 0) {
                const holiday = day.date.hijri.holidays[0];
                Object.keys(importantEvents).forEach((event) => {
                  if (holiday.toLowerCase().includes(event.toLowerCase())) {
                    const hijriDate = `${day.date.hijri.year}-${day.date.hijri.month.number}-${day.date.hijri.day}`;
                    const eventData = {
                      name: holiday,
                      description: importantEvents[event],
                      color: "#4CAF50",
                      date: {
                        hijri: day.date.hijri,
                        gregorian: day.date.gregorian,
                      },
                    };
                    allEvents[hijriDate] = eventData;
                  }
                });
              }
            });
          }
        }
        await AsyncStorage.setItem("upcomingIslamicEvents", JSON.stringify(allEvents));
        // Schedule notifications only for new events
        Object.values(allEvents).forEach((eventData: any) => {
          scheduleRecurringEventNotifications(eventData);
        });
      } catch (error) {
        console.error("Failed to fetch events, using cached events:", error);
        const cachedEventsString = await AsyncStorage.getItem("upcomingIslamicEvents");
        if(cachedEventsString) {
          allEvents = JSON.parse(cachedEventsString);
          // Schedule notifications for cached events to ensure offline support
          Object.values(allEvents).forEach((eventData: any) => {
            scheduleRecurringEventNotifications(eventData);
          });
        }
      }

      return allEvents;
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      throw new Error("Failed to fetch events.");
    }
  };

  const scheduleRecurringEventNotifications = async (eventData: any) => {
    try {
      const gregorianDate = eventData.date.gregorian;
      const eventDate = new Date(
        `${gregorianDate.year}-${gregorianDate.month.number.toString().padStart(2, "0")}-${gregorianDate.day.toString().padStart(2, "0")}T00:00:00`
      );

      const notificationStartDate = new Date(eventDate);
      notificationStartDate.setDate(eventDate.getDate() - 14);
      const now = new Date();
      if (notificationStartDate < now) {
        notificationStartDate.setTime(now.getTime() + 60000);
      }

      const msPerDay = 24 * 60 * 60 * 1000;
      const daysUntilEvent = Math.ceil((eventDate.getTime() - notificationStartDate.getTime()) / msPerDay);
      const notificationTimes = [
        { hour: 9, minute: 0 },
        { hour: 18, minute: 0 },
      ];

      for (let daysRemaining = daysUntilEvent; daysRemaining > 0; daysRemaining--) {
        const notificationDate = new Date(eventDate);
        notificationDate.setDate(notificationDate.getDate() - daysRemaining);
        const timesToSchedule = daysRemaining <= 3 ? notificationTimes : [notificationTimes[0]];

        for (const time of timesToSchedule) {
          notificationDate.setHours(time.hour, time.minute, 0, 0);
          if (notificationDate <= now) continue;

          const notificationId = `event-${eventData.date.hijri.year}-${eventData.date.hijri.month.number}-${eventData.date.hijri.day}-${daysRemaining}-${time.hour}`;
          // Check if notification is already scheduled
          const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
          if (scheduledNotifications.some((n) => n.identifier === notificationId)) {
            console.log(`Notification already exists for ${eventData.name} (ID: ${notificationId})`);
            continue;
          }

          let message =
            daysRemaining === 1
              ? `${eventData.name} is TOMORROW! Prepare for this blessed occasion. ${eventData.description}`
              : `${eventData.name} is in ${daysRemaining} days (${gregorianDate.day} ${gregorianDate.month.en}). ${eventData.description}`;

          await Notifications.scheduleNotificationAsync({
            identifier: notificationId,
            content: {
              title: `Upcoming: ${eventData.name}`,
              body: message.substring(0, 240),
              data: {
                type: "events",
                eventId: notificationId,
                navigateTo: "EventsScreen",
                daysRemaining,
              },
            },
            trigger: notificationDate,
          });
          console.log(
            `Scheduled notification for ${eventData.name} (${daysRemaining} days before) at ${notificationDate.toDateString()} ${time.hour}:${time.minute} (ID: ${notificationId})`
          );
        }
      }

      const dayOfEventNotification = new Date(eventDate);
      dayOfEventNotification.setHours(7, 0, 0, 0);
      const dayOfNotificationId = `event-${eventData.date.hijri.year}-${eventData.date.hijri.month.number}-${eventData.date.hijri.day}-day-of`;
      if (dayOfEventNotification > now) {
        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
        if (!scheduledNotifications.some((n) => n.identifier === dayOfNotificationId)) {
          await Notifications.scheduleNotificationAsync({
            identifier: dayOfNotificationId,
            content: {
              title: `Today is ${eventData.name}!`,
              body: `Today we observe ${eventData.name}. ${eventData.description}`,
              data: {
                type: "events",
                eventId: dayOfNotificationId,
                navigateTo: "EventsScreen",
                daysRemaining: 0,
              },
            },
            trigger: dayOfEventNotification,
          });
          console.log(`Scheduled day-of notification for ${eventData.name} (ID: ${dayOfNotificationId})`);
        }
      }
    } catch (error) {
      console.error(`Error scheduling notifications for event ${eventData.name}:`, error);
    }
  };

  const scheduleWeeklyNotification = async ({
    title,
    body,
    dayOfWeek,
    hour,
    minute,
    type,
    navigateTo,
  }: {
    title: string;
    body: string;
    dayOfWeek: number;
    hour: number;
    minute: number;
    type: string;
    navigateTo: string;
  }) => {
    try {
      const notificationId = `weekly-${type}-${dayOfWeek}-${hour}-${minute}`;
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      if (scheduledNotifications.some((n) => n.identifier === notificationId)) {
        console.log(`Weekly notification already exists (ID: ${notificationId})`);
        return;
      }
      await Notifications.scheduleNotificationAsync({
        identifier: notificationId,
        content: {
          title,
          body,
          data: { type, navigateTo },
        },
        trigger: {
          weekday: dayOfWeek,
          hour,
          minute,
          repeats: true,
        },
      });
      console.log(`Scheduled weekly notification (ID: ${notificationId}) for day ${dayOfWeek} at ${hour}:${minute}`);
      return notificationId;
    } catch (error) {
      console.error("Error scheduling weekly notification:", error);
      throw error;
    }
  };

  const setupSpecialEventNotifications = async () => {
    try {
      const events = await fetchUpcomingEventsAndScheduleNotifications();
      console.log(`Scheduled notifications for ${Object.keys(events).length} Islamic events`);
      await scheduleWeeklyNotification({
        title: "Islamic Calendar Update",
        body: "Check your app for upcoming important Islamic dates and events this week",
        dayOfWeek: 1,
        hour: 10,
        minute: 0,
        type: "events",
        navigateTo: "EventsScreen",
      });
      return events;
    } catch (error) {
      console.error("Error setting up special event notifications:", error);
      throw error;
    }
  };

  const getNotificationSettings = async () => {
    try {
      const prayerEnabled = (await AsyncStorage.getItem("notification_prayerTime")) === "true";
      const tasksEnabled = (await AsyncStorage.getItem("notification_tasks")) === "true";
      const storyEnabled = (await AsyncStorage.getItem("notification_storyTime")) === "true";
      const eventsEnabled = (await AsyncStorage.getItem("notification_events")) === "true";

      return {
        prayerTime: prayerEnabled,
        tasks: tasksEnabled,
        storyTime: storyEnabled,
        events: eventsEnabled,
      };
    } catch (error) {
      console.error("Error getting notification settings:", error);
      return {
        prayerTime: false,
        tasks: false,
        storyTime: false,
        events: false,
      };
    }
  };

  return {
    hasPermission,
    loading,
    requestPermissions,
    toggleNotificationService,
    fetchAndSchedulePrayerTimes,
    getNotificationSettings,
    cancelTaskNotifications,
    setupNotificationForSingleTask,
    setupTaskNotifications,
    handleNewOrUpdatedTask,
  };
}