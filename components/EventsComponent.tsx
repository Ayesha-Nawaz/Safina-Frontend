import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
} from "react-native";
import { Calendar } from "react-native-calendars";
import moment from "moment-hijri";
import { LinearGradient } from "expo-linear-gradient";
import Loader from "@/components/Loader";
import { Link } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
// Import from Events.ts
import {
  eventSignificance,
  eventTranslations,
  eventDescriptionsUrdu,
  getKidsGuidance,
} from "@/assets/data/Events"; // Adjust the path if needed

const EventsComponent = () => {
  const [islamicDate, setIslamicDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState({});
  const [futureEvents, setFutureEvents] = useState([]);
  const [error, setError] = useState(null);
  const [selectedDateFormat, setSelectedDateFormat] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([fetchIslamicDate(), fetchUpcomingEvents()]);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Using offline data.");

      // Use fallback events if API fails
      const fallbackEvents = {
        "1447-1-1": {
          name: "Islamic New Year",
          description:
            "The beginning of the Islamic (Hijri) calendar, marking the migration (Hijrah) of Prophet Muhammad (SAW) from Makkah to Madinah.",
          color: "#4CAF50",
          date: {
            hijri: {
              day: "1",
              month: {
                number: "1",
                en: "Muharram",
              },
              year: "1447",
            },
            gregorian: {
              date: "07-07-2025",
              day: "07",
              month: {
                number: "07",
                en: "July",
              },
              year: "2025",
            },
          },
        },
        "1447-1-9": {
          name: "Ashura",
          description:
            "The 9th and 10th days of Muharram, observed for various reasons, including the day Prophet Musa (AS) and the Israelites were saved from Pharaoh, and the martyrdom of Imam Hussain (RA) in Karbala.",
          color: "#4CAF50",
          date: {
            hijri: {
              day: "9",
              month: {
                number: "1",
                en: "Muharram",
              },
              year: "1447",
            },
            gregorian: {
              date: "05-07-2025",
              day: "05",
              month: {
                number: "07",
                en: "July",
              },
              year: "2025",
            },
          },
        },
        "1447-1-10": {
          name: "Ashura",
          description:
            "The 9th and 10th days of Muharram, observed for various reasons, including the day Prophet Musa (AS) and the Israelites were saved from Pharaoh, and the martyrdom of Imam Hussain (RA) in Karbala.",
          color: "#4CAF50",
          date: {
            hijri: {
              day: "10",
              month: {
                number: "1",
                en: "Muharram",
              },
              year: "1447",
            },
            gregorian: {
              date: "06-07-2025",
              day: "06",
              month: {
                number: "07",
                en: "July",
              },
              year: "2025",
            },
          },
        },
        "1447-3-12": {
          name: "Mawlid al-Nabi",
          description:
            "The observance of the birth of Prophet Muhammad (SAW), celebrated by many Muslims worldwide.",
          color: "#4CAF50",
          date: {
            hijri: {
              day: "12",
              month: {
                number: "3",
                en: "Rabi al-Awwal",
              },
              year: "1447",
            },
            gregorian: {
              date: "11-09-2025",
              day: "11",
              month: {
                number: "09",
                en: "September",
              },
              year: "2025",
            },
          },
        },
        "1447-7-27": {
          name: "Lailat-ul-Miraj",
          description:
            "The night journey and ascension of Prophet Muhammad (SAW) to the heavens, where he was granted the command of five daily prayers.",
          color: "#4CAF50",
          date: {
            hijri: {
              day: "27",
              month: {
                number: "7",
                en: "Rajab",
              },
              year: "1447",
            },
            gregorian: {
              date: "23-01-2026",
              day: "23",
              month: {
                number: "01",
                en: "January",
              },
              year: "2026",
            },
          },
        },
        "1447-9-1": {
          name: "Ramadan",
          description:
            "The holy month of fasting, prayer, and reflection for Muslims, during which the Quran was revealed.",
          color: "#4CAF50",
          date: {
            hijri: {
              day: "1",
              month: {
                number: "9",
                en: "Ramadan",
              },
              year: "1447",
            },
            gregorian: {
              date: "28-02-2026",
              day: "28",
              month: {
                number: "02",
                en: "February",
              },
              year: "2026",
            },
          },
        },
        "1447-10-1": {
          name: "Eid-ul-Fitr",
          description:
            "A festival marking the end of Ramadan, celebrated with prayers, charity, and feasts.",
          color: "#4CAF50",
          date: {
            hijri: {
              day: "1",
              month: {
                number: "10",
                en: "Shawwal",
              },
              year: "1447",
            },
            gregorian: {
              date: "30-03-2026",
              day: "30",
              month: {
                number: "03",
                en: "March",
              },
              year: "2026",
            },
          },
        },
        "1447-12-10": {
          name: "Eid-ul-Adha",
          description:
            "The 'Festival of Sacrifice,' commemorating Prophet Ibrahim's (AS) willingness to sacrifice his son in obedience to Allah.",
          color: "#4CAF50",
          date: {
            higregorian: {
              date: "26-05-2026",
              day: "26",
              month: {
                number: "05",
                en: "May",
              },
              year: "2026",
            },
          },
        },
      };

      setUpcomingEvents(fallbackEvents);
      convertAndMarkDates(fallbackEvents);
      filterFutureEvents(fallbackEvents);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const fetchIslamicDate = async () => {
    try {
      // Use Pakistan's coordinates (Islamabad) and method 1 for University of Islamic Sciences, Karachi
      // Changed adjustment from 1 to 0 to get correct Islamic date
      const response = await fetch(
        "http://api.aladhan.com/v1/gToH?latitude=33.6844&longitude=73.0479&method=1&adjustment=0"
      );
      const data = await response.json();

      if (data.data && data.data.hijri) {
        // Adjust the Islamic date by subtracting one day
        let adjustedDay = parseInt(data.data.hijri.day) - 1;
        let adjustedMonth = data.data.hijri.month;
        let adjustedYear = data.data.hijri.year;

        // Handle month rollover when day becomes 0
        if (adjustedDay === 0) {
          let newMonth = parseInt(adjustedMonth.number) - 1;
          let newYear = parseInt(adjustedYear);

          if (newMonth === 0) {
            newMonth = 12;
            newYear = newYear - 1;
          }

          // Get the last day of the previous month (approximate)
          const daysInMonth = {
            1: 30,
            2: 29,
            3: 30,
            4: 29,
            5: 30,
            6: 29,
            7: 30,
            8: 29,
            9: 30,
            10: 29,
            11: 30,
            12: 29,
          };
          adjustedDay = daysInMonth[newMonth];

          const monthNames = {
            1: "Muharram",
            2: "Safar",
            3: "Rabi al-Awwal",
            4: "Rabi al-Thani",
            5: "Jumada al-Awwal",
            6: "Jumada al-Thani",
            7: "Rajab",
            8: "Sha'ban",
            9: "Ramadan",
            10: "Shawwal",
            11: "Dhu al-Qi'dah",
            12: "Dhu al-Hijjah",
          };

          adjustedMonth = {
            number: newMonth.toString(),
            en: monthNames[newMonth],
          };
          adjustedYear = newYear.toString();
        }

        setIslamicDate({
          day: adjustedDay.toString(),
          month: adjustedMonth,
          year: adjustedYear,
        });
      } else {
        throw new Error("Invalid API response");
      }
    } catch (error) {
      console.error("Error fetching Islamic date:", error);
      // Set fallback Islamic date based on current date
      const today = moment().format("YYYY-MM-DD");

      // Calculate proper Islamic date based on current Gregorian date (adjusted)
      if (today === "2025-07-05") {
        setIslamicDate({
          day: "9",
          month: {
            number: "1",
            en: "Muharram",
          },
          year: "1447",
        });
      } else if (today === "2025-07-04") {
        setIslamicDate({
          day: "8",
          month: {
            number: "1",
            en: "Muharram",
          },
          year: "1447",
        });
      } else if (today === "2025-07-06") {
        setIslamicDate({
          day: "10",
          month: {
            number: "1",
            en: "Muharram",
          },
          year: "1447",
        });
      } else {
        // For other dates, use a more dynamic calculation or default
        setIslamicDate({
          day: "1",
          month: {
            number: "1",
            en: "Muharram",
          },
          year: "1447",
        });
      }
    }
  };
  const filterFutureEvents = (events) => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const oneMonthFromToday = moment().add(30, "days").format("YYYY-MM-DD");
      const futureEventsList = [];

      Object.entries(events).forEach(([hijriDate, event]) => {
        if (event.date && event.date.gregorian) {
          const gregorianDate = `${event.date.gregorian.year}-${String(
            event.date.gregorian.month.number
          ).padStart(2, "0")}-${String(event.date.gregorian.day).padStart(
            2,
            "0"
          )}`;

          // Only include events that are between today and 30 days from today
          if (gregorianDate >= today && gregorianDate <= oneMonthFromToday) {
            const daysAway = moment(gregorianDate).diff(moment(today), "days");
            let timeLabel;

            if (daysAway === 0) {
              timeLabel = "Today";
            } else if (daysAway === 1) {
              timeLabel = "Tomorrow";
            } else if (daysAway < 7) {
              timeLabel = `${daysAway} days away`;
            } else {
              const weeks = Math.floor(daysAway / 7);
              timeLabel = `${weeks} week${weeks > 1 ? "s" : ""} away`;
            }

            futureEventsList.push({
              ...event,
              gregorianDateStr: gregorianDate,
              daysAway: daysAway,
              timeLabel: timeLabel,
            });
          }
        }
      });

      futureEventsList.sort((a, b) => a.daysAway - b.daysAway);
      setFutureEvents(futureEventsList);
    } catch (error) {
      console.error("Error filtering future events:", error);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      let allEvents = {};
      const importantEvents = {
        "Islamic New Year":
          "The beginning of the Islamic (Hijri) calendar, marking the migration (Hijrah) of Prophet Muhammad (SAW) from Makkah to Madinah.",
        Ashura:
          "The 9th and 10th days of Muharram, observed for various reasons, including the day Prophet Musa (AS) and the Israelites were saved from Pharaoh, and the martyrdom of Imam Hussain (RA) in Karbala.",
        "Mawlid al-Nabi":
          "The observance of the birth of Prophet Muhammad (SAW), celebrated by many Muslims worldwide.",
        "Lailat-ul-Miraj":
          "The night journey and ascension of Prophet Muhammad (SAW) to the heavens, where he was granted the command of five daily prayers.",
        Ramadan:
          "The holy month of fasting, prayer, and reflection for Muslims, during which the Quran was revealed.",
        "Eid-ul-Fitr":
          "A festival marking the end of Ramadan, celebrated with prayers, charity, and feasts.",
        "Eid-ul-Adha":
          "The 'Festival of Sacrifice,' commemorating Prophet Ibrahim's (AS) willingness to sacrifice his son in obedience to Allah.",
        "Lailat-ul-Qadr":
          "The 'Night of Power,' one of the last ten nights of Ramadan, believed to be when the first verses of the Quran were revealed to Prophet Muhammad (SAW).",
      };

      // Fetch events for the new Hijri year 1447, using Pakistan's method
      for (let month = 1; month <= 12; month++) {
        const response = await fetch(
          `https://api.aladhan.com/v1/hijriCalendar?month=${month}&year=1447&latitude=33.6844&longitude=73.0479&method=1&adjustment=1`
        );
        const data = await response.json();

        if (data.data && Array.isArray(data.data)) {
          data.data.forEach((day) => {
            if (day.date.hijri.holidays && day.date.hijri.holidays.length > 0) {
              const holiday = day.date.hijri.holidays[0];
              const hijriDate = day.date.hijri;
              const gregorianDate = day.date.gregorian;

              const formattedHijriDate = `${hijriDate.year}-${hijriDate.month.number}-${hijriDate.day}`;

              Object.keys(importantEvents).forEach((event) => {
                if (holiday.toLowerCase().includes(event.toLowerCase())) {
                  allEvents[formattedHijriDate] = {
                    name: event,
                    description: importantEvents[event],
                    color: "#4CAF50",
                    date: {
                      hijri: hijriDate,
                      gregorian: gregorianDate,
                    },
                  };
                }
              });
            }
          });
        }
      }

      // Ensure Ashura is included for both 9th and 10th Muharram
      allEvents["1447-1-9"] = {
        name: "Ashura",
        description: importantEvents["Ashura"],
        color: "#4CAF50",
        date: {
          hijri: {
            day: "9",
            month: {
              number: "1",
              en: "Muharram",
            },
            year: "1447",
          },
          gregorian: {
            date: "05-07-2025",
            day: "05",
            month: {
              number: "07",
              en: "July",
            },
            year: "2025",
          },
        },
      };
      allEvents["1447-1-10"] = {
        name: "Ashura",
        description: importantEvents["Ashura"],
        color: "#4CAF50",
        date: {
          hijri: {
            day: "10",
            month: {
              number: "1",
              en: "Muharram",
            },
            year: "1447",
          },
          gregorian: {
            date: "06-07-2025",
            day: "06",
            month: {
              number: "07",
              en: "July",
            },
            year: "2025",
          },
        },
      };

      setUpcomingEvents(allEvents);
      convertAndMarkDates(allEvents);
      filterFutureEvents(allEvents);
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      throw error;
    }
  };

  const convertAndMarkDates = (events) => {
    try {
      let marked = {};

      Object.entries(events).forEach(([hijriDate, event]) => {
        if (event.date && event.date.gregorian) {
          const gregorianDate = `${event.date.gregorian.year}-${String(
            event.date.gregorian.month.number
          ).padStart(2, "0")}-${String(event.date.gregorian.day).padStart(
            2,
            "0"
          )}`;

          marked[gregorianDate] = {
            selected: true,
            selectedColor: "#8B5CF6",
            selectedTextColor: "#FFFFFF",
          };
        }
      });

      setMarkedDates(marked);
    } catch (error) {
      console.error("Error marking dates:", error);
    }
  };

  const onDayPress = (day) => {
    try {
      highlightDateInCalendar(day.dateString);

      if (markedDates[day.dateString]) {
        const selectedHijriDate = Object.keys(upcomingEvents).find(
          (hijriDate) => {
            if (
              upcomingEvents[hijriDate].date &&
              upcomingEvents[hijriDate].date.gregorian
            ) {
              const gregorianDate = `${
                upcomingEvents[hijriDate].date.gregorian.year
              }-${String(
                upcomingEvents[hijriDate].date.gregorian.month.number
              ).padStart(2, "0")}-${String(
                upcomingEvents[hijriDate].date.gregorian.day
              ).padStart(2, "0")}`;
              return gregorianDate === day.dateString;
            }
            return false;
          }
        );

        // Ensure both Ashura dates point to the same event details
        if (
          selectedHijriDate === "1447-1-9" ||
          selectedHijriDate === "1447-1-10"
        ) {
          setSelectedEvent(upcomingEvents["1447-1-10"]);
        } else {
          setSelectedEvent(upcomingEvents[selectedHijriDate]);
        }
      } else {
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error("Error handling day press:", error);
      setSelectedEvent(null);
    }
  };

  const highlightDateInCalendar = (dateString) => {
    const updatedMarkedDates = { ...markedDates };

    Object.keys(updatedMarkedDates).forEach((date) => {
      if (updatedMarkedDates[date]) {
        updatedMarkedDates[date] = {
          ...updatedMarkedDates[date],
          selectedColor: "#8B5CF6",
        };
      }
    });

    if (updatedMarkedDates[dateString]) {
      updatedMarkedDates[dateString] = {
        ...updatedMarkedDates[dateString],
        selectedColor: "#FF61D2",
      };
    }

    setMarkedDates(updatedMarkedDates);
  };

  const handleUpcomingEventSelect = (event) => {
    setSelectedEvent(event);

    if (event.date && event.date.gregorian) {
      const gregorianDate = `${event.date.gregorian.year}-${String(
        event.date.gregorian.month.number
      ).padStart(2, "0")}-${String(event.date.gregorian.day).padStart(2, "0")}`;
      highlightDateInCalendar(gregorianDate);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
  };

  const currentGregorianDate = new Date();
  const gregorianDateStr = currentGregorianDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const getEventIcon = (eventName) => {
    const name = eventName.toLowerCase();
    if (name.includes("eid")) return "gift-outline";
    if (name.includes("ramadan")) return "moon-waning-crescent";
    if (name.includes("ashura")) return "candle";
    if (name.includes("qadr")) return "star-four-points";
    if (name.includes("mawlid")) return "mosque";
    if (name.includes("miraj")) return "ladder";
    if (name.includes("new year")) return "calendar-refresh";
    return "star-crescent";
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#8B5CF6"]}
        />
      }
    >
      <LinearGradient
        colors={["#8B5CF6", "#EC4899"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Islamic Event Calendar</Text>
        </View>
      </LinearGradient>

      {loading ? (
        <Loader text="Loading Calendar..." />
      ) : (
        <View style={styles.content}>
          <View style={styles.dateCardsContainer}>
            <TouchableOpacity
              style={[
                styles.dateCard,
                selectedDateFormat === "gregorian"
                  ? styles.selectedDateCard
                  : null,
              ]}
              onPress={() => setSelectedDateFormat("gregorian")}
            >
              <View style={styles.dateCardContent}>
                <View style={styles.dateCardHeader}>
                  <View
                    style={[
                      styles.dateCardIcon,
                      selectedDateFormat === "gregorian"
                        ? { backgroundColor: "#FDF2F8" }
                        : null,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="calendar-month"
                      size={24}
                      color={
                        selectedDateFormat === "gregorian"
                          ? "#EC4899"
                          : "#6B7280"
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.dateCardTitle,
                      selectedDateFormat === "gregorian"
                        ? { color: "#EC4899" }
                        : null,
                    ]}
                  >
                    Gregorian
                  </Text>
                </View>
                <Text
                  style={[
                    styles.dateCardDate,
                    selectedDateFormat === "gregorian"
                      ? { color: "#EC4899" }
                      : null,
                  ]}
                >
                  {gregorianDateStr}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.dateCard,
                selectedDateFormat === "hijri" ? styles.selectedDateCard : null,
              ]}
              onPress={() => setSelectedDateFormat("hijri")}
            >
              <View style={styles.dateCardContent}>
                <View style={styles.dateCardHeader}>
                  <View
                    style={[
                      styles.dateCardIcon,
                      selectedDateFormat === "hijri"
                        ? { backgroundColor: "#F5F3FF" }
                        : null,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="star-crescent"
                      size={24}
                      color={
                        selectedDateFormat === "hijri" ? "#8B5CF6" : "#6B7280"
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.dateCardTitle,
                      selectedDateFormat === "hijri"
                        ? { color: "#8B5CF6" }
                        : null,
                    ]}
                  >
                    Hijri
                  </Text>
                </View>
                {islamicDate ? (
                  <Text
                    style={[
                      styles.dateCardDate,
                      selectedDateFormat === "hijri"
                        ? { color: "#8B5CF6" }
                        : null,
                    ]}
                  >
                    {islamicDate.day} {islamicDate.month.en}, {islamicDate.year}{" "}
                    AH
                  </Text>
                ) : (
                  <Text style={styles.dateCardDate}>Loading...</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
          {error && (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={20}
                color="#EF4444"
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {futureEvents.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Upcoming Events</Text>
                <MaterialCommunityIcons
                  name="calendar-clock"
                  size={22}
                  color="#EC4899"
                />
              </View>

              {futureEvents.map((event, index) => (
                <Link
                  key={index}
                  href={{
                    pathname: "(detailsscreens)/EventsDetail",
                    params: { event: JSON.stringify(event) },
                  }}
                  asChild
                >
                  <TouchableOpacity
                    style={styles.upcomingEventCard}
                    activeOpacity={0.7}
                  >
                    <View style={styles.upcomingEventIcon}>
                      <MaterialCommunityIcons
                        name={getEventIcon(event.name)}
                        size={20}
                        color="#6D28D9"
                      />
                    </View>

                    <View style={styles.upcomingEventContent}>
                      <Text style={styles.upcomingEventName}>{event.name}</Text>
                      {selectedDateFormat === "hijri" ? (
                        <Text style={styles.upcomingEventDate}>
                          {event.date.hijri.day} {event.date.hijri.month.en}{" "}
                          {event.date.hijri.year}
                        </Text>
                      ) : selectedDateFormat === "gregorian" ? (
                        <Text style={styles.upcomingEventDate}>
                          {event.date.gregorian.day}{" "}
                          {event.date.gregorian.month.en}{" "}
                          {event.date.gregorian.year}
                        </Text>
                      ) : null}
                    </View>

                    <View style={styles.upcomingEventTimeContainer}>
                      <Text style={styles.upcomingEventTime}>
                        {event.timeLabel}
                      </Text>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={16}
                        color="#6D28D9"
                      />
                    </View>
                  </TouchableOpacity>
                </Link>
              ))}
            </View>
          )}

          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Calendar</Text>
              <MaterialCommunityIcons
                name="calendar-range"
                size={22}
                color="#EC4899"
              />
            </View>

            <View style={styles.calendarContainer}>
              <Calendar
                markedDates={markedDates}
                onDayPress={onDayPress}
                theme={{
                  calendarBackground: "#FFFFFF",
                  textSectionTitleColor: "#8B5CF6",
                  selectedDayBackgroundColor: "#8B5CF6",
                  selectedDayTextColor: "#FFFFFF",
                  todayTextColor: "#EC4899",
                  dayTextColor: "#1F2937",
                  textDisabledColor: "#94A3B8",
                  dotColor: "#8B5CF6",
                  selectedDotColor: "#FFFFFF",
                  arrowColor: "#FF61D2",
                  monthTextColor: "#FF61D2",
                  textDayFontFamily: "Poppins-Regular",
                  textMonthFontFamily: "Poppins-Bold",
                  textDayHeaderFontFamily: "Poppins-Bold",
                  textDayFontSize: 14,
                  textMonthFontSize: 17,
                  textDayHeaderFontSize: 12,
                }}
              />
            </View>
          </View>

          {selectedEvent ? (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Event Details</Text>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={22}
                  color="#4F46E5"
                />
              </View>

              <Link
                href={{
                  pathname: "(detailsscreens)/EventsDetail",
                  params: { event: JSON.stringify(selectedEvent) },
                }}
                asChild
              >
                <TouchableOpacity style={styles.eventCard} activeOpacity={0.8}>
                  <LinearGradient
                    colors={["#F5F3FF", "#EDE9FE"]}
                    style={styles.eventHeaderIcon}
                  >
                    <MaterialCommunityIcons
                      name={getEventIcon(selectedEvent.name)}
                      size={26}
                      color="#6D28D9"
                    />
                  </LinearGradient>

                  <View style={styles.eventContent}>
                    <Text style={styles.eventName}>{selectedEvent.name}</Text>
                    <Text style={styles.eventDesc}>
                      {selectedEvent.description}
                    </Text>

                    {selectedDateFormat === "hijri" && (
                      <View style={styles.eventCardFooter}>
                        <MaterialCommunityIcons
                          name="calendar-clock"
                          size={16}
                          color="#6D28D9"
                        />
                        <Text style={styles.eventCardFooterText}>
                          {selectedEvent.date.hijri.day}{" "}
                          {selectedEvent.date.hijri.month.en}{" "}
                          {selectedEvent.date.hijri.year} AH
                        </Text>
                      </View>
                    )}

                    {selectedDateFormat === "gregorian" && (
                      <View style={styles.eventCardFooter}>
                        <MaterialCommunityIcons
                          name="calendar-clock"
                          size={16}
                          color="#6D28D9"
                        />
                        <Text style={styles.eventCardFooterText}>
                          {selectedEvent.date.gregorian.day}{" "}
                          {selectedEvent.date.gregorian.month.en}{" "}
                          {selectedEvent.date.gregorian.year}
                        </Text>
                      </View>
                    )}

                    <View style={styles.tapForMoreContainer}>
                      <Text style={styles.tapForMore}>View Details</Text>
                      <MaterialCommunityIcons
                        name="arrow-right"
                        size={16}
                        color="#6D28D9"
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              </Link>
            </View>
          ) : (
            <View style={styles.instructionBox}>
              <MaterialCommunityIcons
                name="gesture-tap"
                size={28}
                color="#6D28D9"
              />
              <Text style={styles.instructionText}>
                Tap on a marked date to view event details
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  headerGradient: {
    height: 190,
    paddingTop: 30,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  header: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 25,
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 8,
    opacity: 0.9,
  },
  content: {
    padding: 16,
    marginTop: -85,
  },
  dateCardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
 dateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedDateCard: {
    borderWidth: 2,
    borderColor: "#FF61D2",
    backgroundColor: "#FDFAFF",
  },
  dateCardContent: {
    flex: 1,
  },
  dateCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dateCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F5F3FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  dateCardTitle: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#6B7280",
  },
  dateCardDate: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "#1F2937",
    lineHeight: 18,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#B91C1C",
    marginLeft: 8,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    flex: 1,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: "#FF61D2",
  },
  calendarContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  eventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#7C3AED",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    borderLeftColor: "#FF61D2",
    borderLeftWidth: 6,
  },
  eventHeaderIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  eventContent: {
    flex: 1,
  },
  eventName: {
    fontSize: 17,
    fontFamily: "Poppins-Bold",
    color: "#FF61D2",
    marginBottom: 4,
  },
  eventDesc: {
    fontSize: 13,
    color: "#4B5563",
    fontFamily: "Poppins-Regular",
    lineHeight: 20,
  },
  eventCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  eventCardFooterText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#6B7280",
    marginLeft: 6,
  },
  tapForMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 6,
  },
  tapForMore: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: "#6D28D9",
    marginRight: 4,
  },
  instructionBox: {
    backgroundColor: "#F5F3FF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    shadowColor: "#7C3AED",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  instructionText: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: "#4F46E5",
    textAlign: "center",
    marginTop: 8,
  },
  upcomingEventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#7C3AED",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  upcomingEventIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  upcomingEventContent: {
    flex: 1,
  },
  upcomingEventName: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: "#4F46E5",
    marginBottom: 2,
  },
  upcomingEventDate: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
  },
  upcomingEventTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  upcomingEventTime: {
    fontSize: 11,
    fontFamily: "Poppins-Medium",
    color: "#6D28D9",
    marginRight: 2,
  },
});

export default EventsComponent;
