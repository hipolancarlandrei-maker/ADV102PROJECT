import React, { createContext, useContext, useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "./AuthContext";

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
  addAssignment: (assignment: Omit<Assignment, "id">) => Promise<void>;
  updateAssignment: (id: string, assignment: Partial<Assignment>) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  getAssignmentsDueToday: () => Assignment[];

  getAssignmentsDueTomorrow: () => Assignment[];
  getAssignmentsByDate: (date: Date) => Assignment[];
  toggleAssignmentComplete: (id: string) => Promise<void>;
}

const AssignmentContext = createContext<AssignmentContextType | undefined>(undefined);

function toJsDate(dueDate: any): Date {
  if (!dueDate) return new Date();
  if (dueDate instanceof Date) return dueDate;
  // Firestore Timestamp
  if (typeof dueDate?.toDate === "function") return dueDate.toDate();
  return new Date(dueDate);
}

function assignmentFromDoc(docData: any, id: string): Assignment {
  return {
    id,
    title: String(docData?.title ?? ""),
    description: typeof docData?.description === "string" ? docData.description : "",
    dueDate: toJsDate(docData?.dueDate),
    completed: Boolean(docData?.completed),
    color: typeof docData?.color === "string" ? docData.color : undefined,
  };
}

export function AssignmentProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.uid;

  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Load assignments from Firestore (real-time)
  useEffect(() => {
    if (!userId) return;


    const q = query(
      collection(db, `users/${userId}/assignments`),
      orderBy("dueDate", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const next: Assignment[] = snapshot.docs.map((d) => assignmentFromDoc(d.data(), d.id));
      setAssignments(next);
    });

    return () => unsubscribe();
  }, [userId]);

  // When user logs out we intentionally keep local state so recently created assignments stay visible.
  // (Firestore real-time listener is also removed via unsubscribe when userId changes.)



  const addAssignment = async (assignment: Omit<Assignment, "id">) => {
    if (!userId) {
      console.warn("No user logged in; cannot save assignment.");
      return;
    }

    if (!assignment || typeof assignment.title !== "string" || assignment.title.trim() === "") {
      console.warn("Invalid assignment data provided to addAssignment");
      return;
    }

    const payload = {
      title: assignment.title.trim(),
      description: typeof assignment.description === "string" ? assignment.description.trim() : "",
      dueDate: Timestamp.fromDate(
        assignment.dueDate instanceof Date ? assignment.dueDate : new Date()
      ),
      completed: Boolean(assignment.completed),
      color: typeof assignment.color === "string" ? assignment.color : "#FF6B6B",
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, `users/${userId}/assignments`), payload);
  };

  const updateAssignment = async (id: string, updates: Partial<Assignment>) => {
    if (!userId) return;

    const payload: any = {};
    if (typeof updates.title === "string") payload.title = updates.title;
    if (typeof updates.description === "string") payload.description = updates.description;
    if (updates.dueDate) {
      const d = updates.dueDate instanceof Date ? updates.dueDate : new Date(updates.dueDate as any);
      payload.dueDate = Timestamp.fromDate(d);
    }
    if (typeof updates.completed === "boolean") payload.completed = updates.completed;
    if (typeof updates.color === "string") payload.color = updates.color;

    await updateDoc(doc(db, `users/${userId}/assignments`, id), payload);
  };

  const deleteAssignment = async (id: string) => {
    if (!userId) return;
    await deleteDoc(doc(db, `users/${userId}/assignments`, id));
  };

  const toggleAssignmentComplete = async (id: string) => {
    if (!userId) return;
    const current = assignments.find((a) => a.id === id);
    const nextCompleted = !current?.completed;
    await updateDoc(doc(db, `users/${userId}/assignments`, id), {
      completed: nextCompleted,
    });
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
