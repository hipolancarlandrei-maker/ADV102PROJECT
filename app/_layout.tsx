// app/_layout.tsx
import { Slot } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { AssignmentProvider } from "../context/AssignmentContext";
import { ThemeProvider } from "../context/ThemeContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AssignmentProvider>
            <Slot /> {/* renders whatever child route is active */}
          </AssignmentProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}