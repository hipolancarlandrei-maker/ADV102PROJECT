// app/(app)/home.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  Switch,
  ImageBackground,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../context/AuthContext";
import { useAssignments } from "../../context/AssignmentContext";
import { useTheme, BackgroundType } from "../../context/ThemeContext";
import { AssignmentCard } from "../../components/AssignmentCard";
import { Calendar } from "../../components/Calendar";
import { AddAssignmentModal } from "../../components/AddAssignmentModal";

export default function HomeScreen() {
  const { logout } = useAuth();
  const {
    theme,
    mode,
    toggleTheme,
    backgroundType,
    setBackgroundType,
    backgroundUri,
    customBackgroundUri,
    setCustomBackgroundUri,
  } = useTheme();
  const [backgroundPickerLoading, setBackgroundPickerLoading] = useState(false);
  const {
    assignments,
    getAssignmentsDueToday,
    getAssignmentsDueTomorrow,
    getAssignmentsByDate,
    addAssignment,
    toggleAssignmentComplete,
    deleteAssignment,
  } = useAssignments();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const assignmentsToday = getAssignmentsDueToday();
  const assignmentsTomorrow = getAssignmentsDueTomorrow();

  // Get all assignment dates for highlighting in calendar
  const assignmentDates = assignments.map((a) => new Date(a.dueDate));

  // Get assignments for selected date
  const selectedDateAssignments = selectedDate ? getAssignmentsByDate(selectedDate) : [];

  const handleAddAssignment = (
    title: string,
    description: string,
    dueDate: Date,
    color: string
  ) => {
    addAssignment({
      title,
      description,
      dueDate,
      completed: false,
      color,
    });
  };

  const handleBackgroundSelection = async (type: BackgroundType) => {
    if (type === "none") {
      setBackgroundType("none");
      setCustomBackgroundUri("");
      return;
    }

    setBackgroundPickerLoading(true);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("Permission required", "Please allow photo library access to choose a background.");
      setBackgroundPickerLoading(false);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    setBackgroundPickerLoading(false);

    if (result.canceled) {
      return;
    }

    const uri = result.assets?.[0]?.uri;
    if (!uri) {
      Alert.alert("Selection failed", "Could not load the selected image. Please try again.");
      return;
    }

    setBackgroundType(type);
    setCustomBackgroundUri(uri);
  };

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          setShowSettingsModal(false);
          await logout();
        },
      },
    ]);
  };

  const content = (
    <View style={[styles.container, { backgroundColor: backgroundType === "none" ? theme.colors.background : "transparent" }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Assignment Tracker</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Left Section - Assignments */}
        <View style={styles.leftSection}>
          {/* Assignments Due Today */}
          <View style={styles.assignmentSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Assignment Due Today:</Text>
            </View>
            <View style={[styles.assignmentsList, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              {assignmentsToday.length === 0 ? (
                <View style={[styles.emptyBox, { backgroundColor: theme.colors.inputBg }]}>
                  <Text style={[styles.emptyText, { color: theme.colors.subtext }]}>None! Yehey!</Text>
                </View>
              ) : (
                assignmentsToday
                  .filter(assignment => assignment && typeof assignment === 'object' && assignment.id)
                  .map((assignment) => (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      onToggleComplete={toggleAssignmentComplete}
                      onDelete={deleteAssignment}
                    />
                  ))
              )}
            </View>
          </View>

          {/* Assignments Due Tomorrow */}
          <View style={styles.assignmentSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Assignment Due Tomorrow</Text>
            </View>
            <View style={[styles.assignmentsList, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              {assignmentsTomorrow.length === 0 ? (
                <View style={[styles.emptyBox, { backgroundColor: theme.colors.inputBg }]}>
                  <Text style={[styles.emptyText, { color: theme.colors.subtext }]}>None! Yehey!</Text>
                </View>
              ) : (
                assignmentsTomorrow
                  .filter(assignment => assignment && typeof assignment === 'object' && assignment.id)
                  .map((assignment) => (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      onToggleComplete={toggleAssignmentComplete}
                      onDelete={deleteAssignment}
                    />
                  ))
              )}
            </View>
          </View>
        </View>

        {/* Right Section - Calendar */}
        <View style={styles.rightSection}>
          <Calendar
            onDateSelect={setSelectedDate}
            highlightDates={assignmentDates}
          />

          {/* Selected Date Tasks */}
          {selectedDate && (
            <View style={styles.assignmentSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Tasks for {selectedDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </Text>
              </View>
              <View style={[styles.assignmentsList, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                {selectedDateAssignments.length === 0 ? (
                  <View style={[styles.emptyBox, { backgroundColor: theme.colors.inputBg }]}>
                    <Text style={[styles.emptyText, { color: theme.colors.subtext }]}>No tasks on this date</Text>
                  </View>
                ) : (
                  selectedDateAssignments
                    .filter(assignment => assignment && typeof assignment === 'object' && assignment.id)
                    .map((assignment) => (
                      <AssignmentCard
                        key={assignment.id}
                        assignment={assignment}
                        onToggleComplete={toggleAssignmentComplete}
                        onDelete={deleteAssignment}
                      />
                    ))
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
        <TouchableOpacity style={[styles.navButton, { backgroundColor: theme.colors.inputBg }]}>
          <Text style={[styles.navIcon, { color: theme.colors.subtext }]}>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonPrimary]}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={[styles.navIcon, { color: theme.colors.buttonText }]}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navButton, { backgroundColor: theme.colors.inputBg }]} onPress={() => setShowSettingsModal(true)}>
          <Text style={[styles.navIcon, { color: theme.colors.subtext }]}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showSettingsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.modalOverlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Settings</Text>
              <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                <Text style={[styles.closeText, { color: theme.colors.accent }]}>Close</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.settingRow}>
              <View>
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Dark mode</Text>
                <Text style={[styles.settingDescription, { color: theme.colors.subtext }]}>Switch the app theme.</Text>
              </View>
              <Switch
                value={mode === "dark"}
                onValueChange={toggleTheme}
                trackColor={{ false: "#6b7280", true: theme.colors.accent }}
                thumbColor={mode === "dark" ? "#fff" : "#f4f3f4"}
              />
            </View>

            <View style={styles.settingRow}>
              <View>
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Background</Text>
                <Text style={[styles.settingDescription, { color: theme.colors.subtext }]}>Choose a default look, a static image, or a GIF background.</Text>
              </View>
            </View>

            <View style={styles.backgroundOptions}>
              {(["none", "static", "gif"] as BackgroundType[]).map((type) => {
                const label =
                  type === "none"
                    ? "Default"
                    : type === "static"
                      ? "Static Image"
                      : "GIF Background";

                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.backgroundOption,
                      {
                        backgroundColor:
                          backgroundType === type ? theme.colors.inputBg : theme.colors.card,
                        borderColor:
                          backgroundType === type ? theme.colors.accent : theme.colors.border,
                      },
                    ]}
                    onPress={() => handleBackgroundSelection(type)}
                  >
                    <Text style={[styles.backgroundOptionText, { color: theme.colors.text }]}>{label}</Text>
                    {backgroundType === type && (
                      <Text style={[styles.settingDescription, { color: theme.colors.accent, marginTop: 6 }]}>Selected</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {backgroundPickerLoading && (
              <Text style={[styles.settingDescription, { color: theme.colors.accent, textAlign: "center", marginBottom: 12 }]}>Picking background image...</Text>
            )}

            <View style={[styles.backgroundPreview, { borderColor: theme.colors.border, backgroundColor: theme.colors.inputBg }]}>
              <Text style={[styles.previewText, { color: theme.colors.text }]}>Background choice will appear behind the home page content.</Text>
            </View>

            <TouchableOpacity
              style={[styles.signOutButton, { backgroundColor: theme.colors.button }]}
              onPress={handleLogout}
            >
              <Text style={[styles.signOutText, { color: theme.colors.buttonText }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <AddAssignmentModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddAssignment}
      />
    </View>
  );

  return backgroundType !== "none" ? (
    <ImageBackground
      source={{ uri: backgroundUri }}
      style={styles.background}
      imageStyle={{ opacity: 0.28 }}
      resizeMode="cover"
    >
      {content}
    </ImageBackground>
  ) : (
    content
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  logoutButton: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  leftSection: {
    width: "100%",
  },
  rightSection: {
    width: "100%",
  },
  assignmentSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  assignmentsList: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  backgroundOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backgroundOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#F8FAFC",
    marginRight: 10,
  },
  backgroundOptionSelected: {
    borderColor: "#3B82F6",
    backgroundColor: "#DBEAFE",
  },
  backgroundOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    textAlign: "center",
  },
  backgroundPreview: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 18,
  },
  previewText: {
    fontSize: 14,
    fontWeight: "500",
  },
  background: {
    flex: 1,
  },
  closeText: {
    fontSize: 16,
    fontWeight: "600",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  signOutButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "700",
  },
  emptyBox: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingVertical: 8,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
  },
  navButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonPrimary: {
    backgroundColor: "#FF6B6B",
  },
  navIcon: {
    fontSize: 20,
    color: "#1a1a1a",
    fontWeight: "600",
  },
});