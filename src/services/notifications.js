import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "habit_notifications_v1";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

const readMap = async () => {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
};

const writeMap = async (map) => { 
    await AsyncStorage.setItem(KEY, JSON.stringify(map));
};

const parseTime = (hhmm) => {
    const [h, m] = (hhmm || "").split(":").map((x) => parseInt(x, 10));
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return {hour: h, minute: m};
 };

 export const ensureNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === "granted") return true;

    const req = await Notifications.requestPermissionsAsync();
    return req.status === "granted";
 };

 export const cancelHabitNotifications = async (habitId) => {
    const map = await readMap();
    const ids = map[habitId];

    if (!ids) return;

    const list = Array.isArray(ids) ? ids : [ids];

    await Promise.all(
        list.map((id) => Notifications.cancelScheduledNotificationAsync(id))
    );

    delete map[habitId];
    await writeMap(map);
 };

export const scheduleHabitNotifications = async (habit) => {
    if (!habit?._id) return;
    if (!habit?.reminderTime) return;

    const ok = await ensureNotificationPermission();
    if (!ok) return;

    await cancelHabitNotifications(habit._id);

    const t = parseTime(habit.reminderTime);
    if (!t) return;

    if (habit.frequency === "daily") {
        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: "Habit reminder",
                body: habit.title,
            },
            trigger: { hour: t.hour, minute: t.minute, repeats: true },
        });

        const map = await readMap();
        map[habit._id] = id;
        await writeMap(map);
        return;
    }

    //Weekdays trigger (Mon-Fri)
    if (habit.frequency === "weekdays") {
        const weekdays = [2, 3, 4, 5, 6];

        const ids = await Promise.all(
            weekdays.map((weekday) => 
            Notifications.scheduleNotificationAsync({
                content: {
                    title: "Habit reminder",
                    body: habit.title,
                },
                trigger: {
                    weekday,
                    hour: t.hour,
                    minute: t.minute,
                    repeats: true,
                },
            }))
        );

        const map = await readMap();
        map[habit._id] = ids;
        await writeMap(map);
        return;
    }

        //Weekends trigger (Mon-Fri)
    if (habit.frequency === "weekends") {
        const weekends = [1, 7];

        const ids = await Promise.all(
            weekends.map((weekend) => 
            Notifications.scheduleNotificationAsync({
                content: {
                    title: "Habit reminder",
                    body: habit.title,
                },
                trigger: {
                    weekend,
                    hour: t.hour,
                    minute: t.minute,
                    repeats: true,
                },
            }))
        );

        const map = await readMap();
        map[habit._id] = ids;
        await writeMap(map);
        return;
    }

    // Custom: (MVP) treat like daily for now 
    const id = await Notifications.scheduleNotificationAsync({
        content: { title: "Habit reminder", body: habit.title },
        trigger: { hour: t.hour, minute: t.minute, repeats: true },
    });

    const map = await readMap();
    map[habit._id] = id;
    await writeMap(map);
};