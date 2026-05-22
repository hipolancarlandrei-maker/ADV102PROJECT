import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  selectedDate: Date;
}

export function DatePickerModal({
  visible,
  onClose,
  onSelectDate,
  selectedDate,
}: DatePickerModalProps) {
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));

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

  const isSelected = (day: number | null) => {
    if (!day) return false;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
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

  const handleDayPress = (day: number | null) => {
    if (day) {
      const selectedDateNew = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      onSelectDate(selectedDateNew);
      onClose();
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: theme.colors.modalOverlay }]}> 
        <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}> 
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Pick a Date</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: theme.colors.subtext }]}>×</Text>
            </Pressable>
          </View>

          <View style={styles.monthNav}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
              <Text style={[styles.navButtonText, { color: theme.colors.accent }]}>‹</Text>
            </TouchableOpacity>
            <Text style={[styles.monthYear, { color: theme.colors.text }]}>{monthName}</Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
              <Text style={[styles.navButtonText, { color: theme.colors.accent }]}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.weekDays}>
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
              <Text key={day} style={[styles.weekDay, { color: theme.colors.subtext }]}>
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
                  isSelected(day) && [styles.selectedDay, { backgroundColor: theme.colors.accent }],
                  isToday(day) && [styles.todayDay, { borderColor: theme.colors.accent }],
                ]}
                onPress={() => handleDayPress(day)}
                disabled={!day}
              >
                {day && (
                  <Text
                    style={[
                      styles.dayText,
                      { color: theme.colors.text },
                      isSelected(day) && styles.selectedDayText,
                      isToday(day) && !isSelected(day) && styles.todayDayText,
                    ]}
                  >
                    {day}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.inputBg }]} onPress={onClose}>
            <Text style={[styles.buttonText, { color: theme.colors.text }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "85%",
    maxWidth: 350,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 24,
    color: "#999",
  },
  monthNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  navButtonText: {
    fontSize: 24,
    color: "#007AFF",
    fontWeight: "600",
  },
  monthYear: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
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
    marginBottom: 16,
  },
  day: {
    width: "14.28%",
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  emptyDay: {
    backgroundColor: "transparent",
  },
  selectedDay: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  selectedDayText: {
    color: "#fff",
    fontWeight: "600",
  },
  todayDay: {
    borderWidth: 2,
    borderColor: "#FF6B6B",
  },
  todayDayText: {
    color: "#FF6B6B",
    fontWeight: "600",
  },
  dayText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
});
