import React, { createContext, useContext, useState, useEffect } from "react";

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  color?: string;
}

interface AssignmentContextType {
  assignments: Assignment[];
  addAssignment: (assignment: Omit<Assignment, "id">) => void;
  updateAssignment: (id: string, assignment: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  getAssignmentsDueToday: () => Assignment[];
  getAssignmentsDueTomorrow: () => Assignment[];
  getAssignmentsByDate: (date: Date) => Assignment[];
  toggleAssignmentComplete: (id: string) => void;
}

const AssignmentContext = createContext<AssignmentContextType | undefined>(
  undefined
);

export function AssignmentProvider({ children }: { children: React.ReactNode }) {
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: "1",
      title: "NET101 - MAC Address",
      description: "Network configuration task",
      dueDate: new Date(),
      completed: false,
      color: "#EF4444", // red
    },
    {
      id: "2",
      title: "EASH - Reflection on Sacrifice, Compassion and Renewal",
      description: "Essay assignment",
      dueDate: new Date(Date.now() + 86400000),
      completed: false,
      color: "#F59E0B", // orange
    },
    {
      id: "3",
      title: "STAT200 - Survey Analysis",
      description: "Green-light planning task",
      dueDate: new Date(Date.now() + 2 * 86400000),
      completed: false,
      color: "#34D399", // green
    },
  ]);

  // Validate assignments on mount
  useEffect(() => {
    setAssignments(currentAssignments =>
      currentAssignments.filter(assignment =>
        assignment &&
        typeof assignment === 'object' &&
        typeof assignment.id === 'string' &&
        typeof assignment.title === 'string'
      )
    );
  }, []);

  const addAssignment = (assignment: Omit<Assignment, "id">) => {
    // Validate assignment data
    if (!assignment || typeof assignment.title !== 'string' || assignment.title.trim() === '') {
      console.warn('Invalid assignment data provided to addAssignment');
      return;
    }

    const newAssignment: Assignment = {
      ...assignment,
      id: Date.now().toString(),
      title: assignment.title.trim(),
      description: typeof assignment.description === 'string' ? assignment.description.trim() : '',
      dueDate: assignment.dueDate instanceof Date ? assignment.dueDate : new Date(),
      completed: Boolean(assignment.completed),
      color: typeof assignment.color === 'string' ? assignment.color : '#FF6B6B',
    };
    setAssignments([...assignments, newAssignment]);
  };

  const updateAssignment = (id: string, updates: Partial<Assignment>) => {
    setAssignments(
      assignments.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  };

  const deleteAssignment = (id: string) => {
    setAssignments(assignments.filter((a) => a.id !== id));
  };

  const toggleAssignmentComplete = (id: string) => {
    setAssignments(
      assignments.map((a) =>
        a.id === id ? { ...a, completed: !a.completed } : a
      )
    );
  };

  const getAssignmentsDueToday = () => {
    const today = new Date();
    return assignments.filter((a) => {
      const dueDate = new Date(a.dueDate);
      return (
        dueDate.getDate() === today.getDate() &&
        dueDate.getMonth() === today.getMonth() &&
        dueDate.getFullYear() === today.getFullYear()
      );
    });
  };

  const getAssignmentsDueTomorrow = () => {
    const tomorrow = new Date(Date.now() + 86400000);
    return assignments.filter((a) => {
      const dueDate = new Date(a.dueDate);
      return (
        dueDate.getDate() === tomorrow.getDate() &&
        dueDate.getMonth() === tomorrow.getMonth() &&
        dueDate.getFullYear() === tomorrow.getFullYear()
      );
    });
  };

  const getAssignmentsByDate = (date: Date) => {
    return assignments.filter((a) => {
      const dueDate = new Date(a.dueDate);
      return (
        dueDate.getDate() === date.getDate() &&
        dueDate.getMonth() === date.getMonth() &&
        dueDate.getFullYear() === date.getFullYear()
      );
    });
  };

  return (
    <AssignmentContext.Provider
      value={{
        assignments,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        getAssignmentsDueToday,
        getAssignmentsDueTomorrow,
        getAssignmentsByDate,
        toggleAssignmentComplete,
      }}
    >
      {children}
    </AssignmentContext.Provider>
  );
}

export function useAssignments() {
  const context = useContext(AssignmentContext);
  if (!context) {
    throw new Error("useAssignments must be used inside <AssignmentProvider>");
  }
  return context;
}
