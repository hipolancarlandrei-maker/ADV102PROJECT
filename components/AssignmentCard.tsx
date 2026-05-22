import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Assignment } from "../context/AssignmentContext";
import { useTheme } from "../context/ThemeContext";

interface AssignmentCardProps {
  assignment: Assignment;
  onToggleComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function AssignmentCard({
  assignment,
  onToggleComplete,
  onDelete,
}: AssignmentCardProps) {
  // Safety checks for assignment data
  if (!assignment || typeof assignment !== 'object') {
    return null;
  }

  const safeTitle = typeof assignment.title === 'string' ? assignment.title : 'Untitled Assignment';
  const safeDescription = typeof assignment.description === 'string' ? assignment.description : '';
  const safeColor = typeof assignment.color === 'string' ? assignment.color : '#FF6B6B';
  const safeCompleted = Boolean(assignment.completed);

  const dateStr = assignment.dueDate instanceof Date
    ? assignment.dueDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : 'Invalid Date';

  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.card, borderLeftColor: safeColor },
        safeCompleted && styles.completedContainer,
      ]}
    >
      <View style={styles.content}>
        <TouchableOpacity
          style={[
            styles.checkbox,
            safeCompleted && styles.checkboxChecked,
          ]}
          onPress={() => onToggleComplete?.(assignment.id)}
        >
          {safeCompleted && (
            <Text style={styles.checkmark}>✔</Text>
          )}
        </TouchableOpacity>

        <View style={styles.textContent}>
          <Text
            style={[
              styles.title,
              { color: theme.colors.text },
              safeCompleted && styles.completedText,
            ]}
            numberOfLines={2}
          >
            {safeTitle}
          </Text>
          {safeDescription ? (
            <Text style={[styles.description, { color: theme.colors.subtext }]} numberOfLines={1}>
              {safeDescription}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.rightSection}>
        <Text style={[styles.dueDate, { color: theme.colors.subtext }]}>{dateStr}</Text>
        {onDelete && (
          <Pressable
            style={styles.deleteButton}
            onPress={() => onDelete(assignment.id)}
          >
            <Text style={styles.deleteText}>×</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B6B",
  },
  completedContainer: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#ddd",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#4ECDC4",
    borderColor: "#4ECDC4",
  },
  checkmark: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#888",
  },
  description: {
    fontSize: 12,
    color: "#666",
  },
  rightSection: {
    alignItems: "flex-end",
  },
  dueDate: {
    fontSize: 12,
    fontWeight: "500",
    color: "#94A3B8",
  },
  deleteButton: {
    marginTop: 4,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: {
    fontSize: 16,
    color: "#999",
  },
});
