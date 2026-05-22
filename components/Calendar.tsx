import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface CalendarProps {
  onDateSelect?: (date: Date) => void;
  highlightDates?: Date[];
}

export function Calendar({ onDateSelect, highlightDates = [] }: CalendarProps) {
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const isHighlighted = (day: number | null) => {
    if (!day) return false;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return highlightDates.some(
      (d) =>
        d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
    );
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleDayPress = (day: number | null) => {
    if (day) {
      const selectedDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      onDateSelect?.(selectedDate);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}> 
      <View style={styles.monthNav}>
        <TouchableOpacity style={[styles.navButton, { backgroundColor: theme.colors.inputBg }]} onPress={handlePrevMonth}>
          <Text style={[styles.navButtonText, { color: theme.colors.accent }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.monthYear, { color: theme.colors.text }]}>{monthName}</Text>
        <TouchableOpacity style={[styles.navButton, { backgroundColor: theme.colors.inputBg }]} onPress={handleNextMonth}>
          <Text style={[styles.navButtonText, { color: theme.colors.accent }]}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekDays}>
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
          <Text key={day} style={[styles.weekDay, { color: theme.colors.subtext }] }>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.calendar}>
        {days.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.day,
              { borderColor: theme.colors.border },
              day === null && styles.emptyDay,
              isToday(day) && [styles.todayDay, { backgroundColor: theme.colors.accent }],
              isHighlighted(day) && [styles.highlightedDay, { backgroundColor: theme.colors.inputBg }],
            ]}
            onPress={() => handleDayPress(day)}
            disabled={!day}
          >
            {day && (
              <Text
                style={[
                  styles.dayText,
                  { color: theme.colors.text },
                  isToday(day) && styles.todayText,
                  isHighlighted(day) && styles.highlightedText,
                ]}
              >
                {day}
              </Text>
            )}
            {isHighlighted(day) && <View style={styles.dot} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
  },
  monthYear: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
    textAlign: "center",
  },
  monthNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  navButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  navButtonText: {
    fontSize: 20,
    fontWeight: "700",
  },
  weekDays: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  weekDay: {
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
    width: "14.28%",
    textAlign: "center",
  },
  calendar: {
    flexWrap: "wrap",
    flexDirection: "row",
  },
  day: {
    width: "14.28%",
    paddingVertical: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  emptyDay: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
  todayDay: {
    backgroundColor: "#FF6B6B",
  },
  todayText: {
    color: "#fff",
    fontWeight: "600",
  },
  highlightedDay: {
    backgroundColor: "#E2E8F0",
  },
  highlightedText: {
    fontWeight: "600",
  },
  dot: {
    width: 4,
    height: 4,
    backgroundColor: "#FF6B6B",
    borderRadius: 2,
    marginTop: 2,
  },
});
