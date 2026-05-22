import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Pressable,
  Platform,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { DatePickerModal } from "./DatePickerModal";

interface AddAssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (title: string, description: string, dueDate: Date, color: string) => void;
}

const COLORS = ["#34D399", "#F59E0B", "#EF4444"];

export function AddAssignmentModal({
  visible,
  onClose,
  onAdd,
}: AddAssignmentModalProps) {
  const { theme } = useTheme();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleAdd = () => {
    if (title.trim()) {
      onAdd(title, description, dueDate, selectedColor);
      setTitle("");
      setDescription("");
      setSelectedColor(COLORS[0]);
      setDueDate(new Date());
      onClose();
    }
  };

  const handleDateSelect = (date: Date) => {
    setDueDate(date);
  };

  const dateStr = dueDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: theme.colors.modalOverlay }]}> 
        <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}> 
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>New Assignment</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: theme.colors.subtext }]}>×</Text>
            </Pressable>
          </View>

          <View style={styles.content}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.subtext }]}>Title</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.inputBg, color: theme.colors.text, borderColor: theme.colors.border }]}
                placeholder="Enter assignment title"
                placeholderTextColor={theme.colors.placeholder}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.subtext }]}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.colors.inputBg, color: theme.colors.text, borderColor: theme.colors.border }]}
                placeholder="Enter description (optional)"
                placeholderTextColor={theme.colors.placeholder}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Due Date: {dateStr}</Text>
              <View style={styles.datePickerSection}>
                <TouchableOpacity
                  style={styles.calendarButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.calendarButtonIcon}>📅</Text>
                  <Text style={styles.calendarButtonText}>Pick from Calendar</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.colorPicker}>
              <Text style={[styles.label, { color: theme.colors.subtext }]}>Priority color</Text>
              <View style={styles.colors}>
                {COLORS.map((color) => (
                  <Pressable
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.selectedColor,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  >
                    {selectedColor === color && (
                      <Text style={styles.checkmark}>✔</Text>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.colors.button }]}
              onPress={handleAdd}
            >
              <Text style={[styles.addButtonText, { color: theme.colors.buttonText }]}>Add Assignment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    <DatePickerModal
      visible={showDatePicker}
      onClose={() => setShowDatePicker(false)}
      onSelectDate={handleDateSelect}
      selectedDate={dueDate}
    />
  </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
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
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  textArea: {
    paddingVertical: 10,
    textAlignVertical: "top",
  },
  dateButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  dateButton: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  dateButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  datePickerSection: {
    gap: 10,
  },
  calendarButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  calendarButtonIcon: {
    fontSize: 18,
  },
  calendarButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  colorPicker: {
    marginBottom: 20,
  },
  colors: {
    flexDirection: "row",
    gap: 12,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColor: {
    borderColor: "#000",
  },
  checkmark: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  addButton: {
    flex: 1,
    backgroundColor: "#FF6B6B",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
