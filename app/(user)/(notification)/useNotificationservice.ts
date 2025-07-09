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
  duration?: number;
  createdAt?: string;
};

const prayerIcons = {
  Fajr: "🌅",
  Sunrise: "🌄",
  Dhuhr: "☀️",
  Asr: "🌤️",
  Maghrib: "🌅",
  Isha: "🌙",
};

// Set global notification handler
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

  // Initialize permissions and listeners
  useEffect(() => {
    initializeNotifications();
    
    const receivedSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      }
    );

    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      handleNotificationResponse(response);
    });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, [navigation]);

  const initializeNotifications = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setHasPermission(status === "granted");
  };

  const handleNotificationResponse = (response: any) => {
    const data = response.notification.request.content.data;
    
    switch (data?.type) {
      case "prayerTime":
        navigation.navigate("(namaz)/index");
        break;
      case "tasks":
        navigation.navigate("(more)/Schedule");
        break;
      case "storyTime":
        navigation.navigate("(detailsscreens)/StoriesDetails");
        break;
      case "events":
        navigation.navigate("(detailsscreens)/EventsDetails");
        break;
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
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

  // Utility functions
  const createTriggerDate = (timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const triggerDate = new Date();
    triggerDate.setHours(hours, minutes, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (triggerDate <= new Date()) {
      triggerDate.setDate(triggerDate.getDate() + 1);
    }
    
    return triggerDate;
  };

  const cancelNotificationsByType = async (type: string): Promise<void> => {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const typeNotifications = scheduledNotifications
        .filter(notification => notification.content.data?.type === type)
        .map(notification => notification.identifier);

      await Promise.all(
        typeNotifications.map(id => Notifications.cancelScheduledNotificationAsync(id))
      );
      
      console.log(`Canceled ${typeNotifications.length} notifications for ${type}`);
    } catch (error) {
      console.error(`Error canceling ${type} notifications:`, error);
    }
  };

  // Prayer time functions
  const fetchPrayerTimes = async (): Promise<PrayerTime[]> => {
    try {
      const response = await axios.get("https://api.aladhan.com/v1/timingsByCity", {
        params: { city, country, method: 1, school: 1, adjustment: 0 },
      });

      const timings = response.data.data.timings;
      const prayerTimes: PrayerTime[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]
        .map(name => ({
          name,
          time: timings[name],
          icon: prayerIcons[name],
        }));

      // Cache the prayer times
      await AsyncStorage.setItem("prayerTimes", JSON.stringify(prayerTimes));
      await AsyncStorage.setItem("prayerTimesLastFetched", new Date().toISOString());
      
      return prayerTimes;
    } catch (error) {
      console.error("Error fetching prayer times:", error);
      
      // Try to use cached times
      const cachedTimes = await AsyncStorage.getItem("prayerTimes");
      if (cachedTimes) {
        return JSON.parse(cachedTimes);
      }
      
      throw new Error("No prayer times available");
    }
  };

  const schedulePrayerNotifications = async (prayerTimes: PrayerTime[]): Promise<void> => {
    await cancelNotificationsByType("prayerTime");
    
    for (const prayer of prayerTimes) {
      try {
        const triggerDate = createTriggerDate(prayer.time);
        const notificationId = `prayer-${prayer.name}-${triggerDate.getTime()}`;
        
        await Notifications.scheduleNotificationAsync({
          identifier: notificationId,
          content: {
            title: `${prayer.icon} ${prayer.name} Prayer Time`,
            body: `It's time for ${prayer.name} prayer (${prayer.time}). Learn how to pray correctly.`,
            data: {
              type: "prayerTime",
              prayerName: prayer.name,
            },
          },
          trigger: triggerDate,
        });
        
        console.log(`Scheduled ${prayer.name} prayer notification for ${triggerDate.toLocaleString()}`);
      } catch (error) {
        console.error(`Error scheduling ${prayer.name} prayer notification:`, error);
      }
    }
  };

  // Task notification functions
  const fetchUserTasks = async (): Promise<TaskType[]> => {
    if (!user?.user?._id) throw new Error("User not authenticated");
    
    const userToken = await AsyncStorage.getItem("userToken");
    if (!userToken) throw new Error("User token not found");

    try {
      const response = await axios.get(`${BASE_URL}/schedule/user/${user.user._id}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      });
      
      const tasks = response.data || [];
      await AsyncStorage.setItem("cachedTasks", JSON.stringify(tasks));
      return tasks;
    } catch (error) {
      console.error("Error fetching tasks, using cached tasks:", error);
      
      const cachedTasks = await AsyncStorage.getItem("cachedTasks");
      if (cachedTasks) {
        return JSON.parse(cachedTasks);
      }
      
      throw error;
    }
  };

  const isTaskActive = (task: TaskType): boolean => {
    if (!task.createdAt || !task.duration) return true;
    
    const createdDate = new Date(task.createdAt);
    const now = new Date();
    const endDate = new Date(createdDate.getTime() + task.duration * 24 * 60 * 60 * 1000);
    
    return now <= endDate;
  };

  const scheduleTaskNotification = async (task: TaskType): Promise<void> => {
    const { time, title, _id } = task;
    
    if (!time || !title || !_id) {
      console.warn("Task missing required fields:", task);
      return;
    }

    if (!isTaskActive(task)) {
      console.log(`Task "${title}" is expired, skipping notification`);
      return;
    }

    try {
      const [hours, minutes] = time.split(":").map(Number);
      if (isNaN(hours) || isNaN(minutes)) {
        console.warn(`Invalid time format for task "${title}": ${time}`);
        return;
      }

      // Cancel existing notifications for this task
      await cancelTaskNotifications(_id);

      const notificationId = `task-${_id}`;
      
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

      console.log(`Scheduled task notification for "${title}" at ${hours}:${minutes} (ID: ${notificationId})`);
    } catch (error) {
      console.error(`Error scheduling notification for task "${title}":`, error);
    }
  };

  const cancelTaskNotifications = async (taskId: string): Promise<void> => {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const taskNotifications = scheduledNotifications
        .filter(notification => notification.content.data?.taskId === taskId)
        .map(notification => notification.identifier);

      await Promise.all(
        taskNotifications.map(id => Notifications.cancelScheduledNotificationAsync(id))
      );
      
      console.log(`Canceled ${taskNotifications.length} notifications for task: ${taskId}`);
    } catch (error) {
      console.error("Error canceling task notifications:", error);
    }
  };

  const setupTaskNotifications = async (tasks: TaskType[]): Promise<void> => {
    await cancelNotificationsByType("tasks");
    
    if (!tasks || tasks.length === 0) {
      console.log("No tasks to schedule notifications for");
      return;
    }

    let scheduledCount = 0;
    for (const task of tasks) {
      if (isTaskActive(task)) {
        await scheduleTaskNotification(task);
        scheduledCount++;
      }
    }

    console.log(`Scheduled notifications for ${scheduledCount} active tasks`);
  };

  // Story and events notification functions
  const scheduleStoryNotifications = async (): Promise<void> => {
    await cancelNotificationsByType("storyTime");
    
    await Notifications.scheduleNotificationAsync({
      identifier: "daily-story",
      content: {
        title: "Daily Islamic Story",
        body: "Time for your daily inspiring story",
        data: { type: "storyTime" },
      },
      trigger: { hour: 20, minute: 0, repeats: true },
    });
    
    console.log("Scheduled daily story notification for 8:00 PM");
  };

  const setupEventNotifications = async (): Promise<void> => {
    await cancelNotificationsByType("events");
    
    // Schedule weekly Islamic calendar update
    await Notifications.scheduleNotificationAsync({
      identifier: "weekly-events",
      content: {
        title: "Islamic Calendar Update",
        body: "Check your app for upcoming important Islamic dates and events this week",
        data: { type: "events" },
      },
      trigger: { weekday: 1, hour: 10, minute: 0, repeats: true },
    });
    
    console.log("Scheduled weekly Islamic calendar notification");
  };

  // Main toggle function
  const toggleNotificationService = async (serviceType: string, enabled: boolean): Promise<void> => {
    try {
      if (!hasPermission) {
        const granted = await requestPermissions();
        if (!granted) throw new Error("Notification permission not granted");
      }

      setLoading(true);
      
      if (enabled) {
        switch (serviceType) {
          case "prayerTime":
            if (!city || !country) throw new Error("City and country are required");
            const prayerTimes = await fetchPrayerTimes();
            await schedulePrayerNotifications(prayerTimes);
            break;
            
          case "tasks":
            const tasks = await fetchUserTasks();
            await setupTaskNotifications(tasks);
            break;
            
          case "storyTime":
            await scheduleStoryNotifications();
            break;
            
          case "events":
            await setupEventNotifications();
            break;
            
          default:
            throw new Error(`Unknown service type: ${serviceType}`);
        }
      } else {
        await cancelNotificationsByType(serviceType);
      }

      await AsyncStorage.setItem(`notification_${serviceType}`, String(enabled));
      console.log(`${serviceType} notifications ${enabled ? "enabled" : "disabled"}`);
    } catch (error) {
      console.error(`Error toggling ${serviceType} notification service:`, error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Handle individual task updates
  const handleNewOrUpdatedTask = async (task: TaskType): Promise<void> => {
    try {
      if (!task._id) {
        console.warn("Task missing ID, cannot set up notifications");
        return;
      }

      const tasksEnabled = await AsyncStorage.getItem("notification_tasks");
      if (tasksEnabled === "true") {
        await scheduleTaskNotification(task);
        
        // Update cached tasks
        const cachedTasksString = await AsyncStorage.getItem("cachedTasks");
        let cachedTasks: TaskType[] = cachedTasksString ? JSON.parse(cachedTasksString) : [];
        cachedTasks = cachedTasks.filter(t => t._id !== task._id);
        cachedTasks.push(task);
        await AsyncStorage.setItem("cachedTasks", JSON.stringify(cachedTasks));
        
        console.log(`Updated notification for task: ${task.title}`);
      }
    } catch (error) {
      console.error("Error handling new/updated task:", error);
    }
  };

  // Get current notification settings
  const getNotificationSettings = async () => {
    try {
      const [prayerEnabled, tasksEnabled, storyEnabled, eventsEnabled] = await Promise.all([
        AsyncStorage.getItem("notification_prayerTime"),
        AsyncStorage.getItem("notification_tasks"),
        AsyncStorage.getItem("notification_storyTime"),
        AsyncStorage.getItem("notification_events"),
      ]);

      return {
        prayerTime: prayerEnabled === "true",
        tasks: tasksEnabled === "true",
        storyTime: storyEnabled === "true",
        events: eventsEnabled === "true",
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
    getNotificationSettings,
    handleNewOrUpdatedTask,
    cancelTaskNotifications,
  };
}