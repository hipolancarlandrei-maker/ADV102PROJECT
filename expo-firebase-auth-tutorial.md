# Expo React Native + Firebase Authentication — Full Tutorial

> **Stack:** Expo SDK 54 · expo-router v6 · Firebase JS SDK v11 · React Native  
> **Goal:** A working app with Sign Up, Log In, and protected home screen  
> **Last verified & battle-tested:** April 2026 — every step confirmed working on a real Windows 11 + Android device

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Create the Expo Project](#2-create-the-expo-project)
3. [Final File Structure](#3-final-file-structure)
4. [Set Up Firebase Project](#4-set-up-firebase-project)
5. [Install Dependencies](#5-install-dependencies)
6. [Environment Variables](#6-environment-variables)
7. [Firebase Config File](#7-firebase-config-file)
8. [Auth Context (Global State)](#8-auth-context-global-state)
9. [Root Layout](#9-root-layout)
10. [Auth Screens](#10-auth-screens)
11. [Protected Home Screen](#11-protected-home-screen)
12. [Running the App](#12-running-the-app)
13. [Common Errors & Fixes](#13-common-errors--fixes)
14. [What's Next](#14-whats-next)

---

## 1. Prerequisites

Make sure you have the following installed **before** starting:

| Tool | Version | How to check |
|---|---|---|
| Node.js | v18+ | `node -v` |
| npm | v9+ | `npm -v` |
| Git | any | `git --version` |
| Expo CLI | latest (via npx) | `npx expo --version` |

You also need:
- A **Firebase account** at https://console.firebase.google.com
- An **Expo account** at https://expo.dev/signup — Expo Go requires login to load dev builds
- **Expo Go** app installed on your Android/iOS phone

> ⚠️ **Do NOT globally install `expo-cli` anymore.** Expo retired the old global CLI. If you have it, uninstall it first:
> ```powershell
> npm uninstall -g expo-cli
> ```
> Always use `npx expo` instead — it uses the local CLI inside your project.

> ⚠️ **Windows folder naming rule:** Never put your project in a path with `&`, spaces, or special characters. Use a clean path like `C:\Dev\ExpoFirebaseAuth`. A folder named `Firebase & React` will break Node's path resolution silently.

---

## 2. Create the Expo Project

> ⚠️ **Windows users:** Create your project in a clean path with **no spaces or special characters**. Recommended location:
> ```powershell
> cd C:\
> mkdir Dev
> cd Dev
> ```

Run the following to bootstrap a new Expo project with **expo-router** (file-based routing — the modern standard):

```powershell
npx create-expo-app@latest ExpoFirebaseAuth --template blank-typescript
cd ExpoFirebaseAuth
```

> This uses the blank TypeScript template. If you prefer JavaScript, use `--template blank`.

### Create a .npmrc file immediately

Before installing anything, create a `.npmrc` file in your project root to avoid peer dependency errors throughout the project:

```powershell
# Run this in your project folder
echo legacy-peer-deps=true > .npmrc
```

This tells npm to use lenient dependency resolution — required because Firebase and Expo have a React version mismatch that would otherwise block every install.

### Install expo-router dependencies

```powershell
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
```

---

## 3. Final File Structure

Here is **exactly** what your project will look like when done. Build toward this:

```
ExpoFirebaseAuth/
├── app/
│   ├── _layout.tsx          ← Root layout (wraps everything in AuthProvider)
│   ├── index.tsx            ← Redirect entry point
│   ├── (auth)/
│   │   ├── _layout.tsx      ← Auth group layout (no header)
│   │   ├── login.tsx        ← Login screen
│   │   └── register.tsx     ← Register / Sign Up screen
│   └── (app)/
│       ├── _layout.tsx      ← Protected group layout
│       └── home.tsx         ← Home screen (requires login)
├── context/
│   └── AuthContext.tsx      ← Firebase auth state + helper functions
├── firebase/
│   └── firebaseConfig.ts    ← Firebase initialization
├── .env                     ← Firebase keys (never commit this!)
├── .npmrc                   ← legacy-peer-deps=true (fixes install conflicts)
├── .gitignore
├── app.json
├── package.json
└── tsconfig.json
```

---

## 4. Set Up Firebase Project

### Step 1 — Create a Firebase project

1. Go to https://console.firebase.google.com
2. Click **"Add project"**
3. Enter a project name (e.g., `ExpoFirebaseAuth`) → Continue
4. Disable Google Analytics if you don't need it → **Create project**

### Step 2 — Register a Web App

1. On the project dashboard, click the **`</>`** (Web) icon
2. Give it a nickname (e.g., `expo-app`) — do NOT enable Firebase Hosting
3. Click **Register app**
4. Copy the `firebaseConfig` object — you'll need it in `.env`

### Step 3 — Enable Email/Password Authentication

1. In the left sidebar, go to **Build → Authentication**
2. Click **Get started**
3. Under **Sign-in method**, click **Email/Password**
4. Toggle **Enable** → Save

> That's all you need on the Firebase console for now.

---

## 5. Install Dependencies

From inside your project folder:

```powershell
# Firebase JS SDK
npm install firebase

# Async storage (required for Firebase auth persistence on React Native)
npx expo install @react-native-async-storage/async-storage
```

> ⚠️ If you did **not** create `.npmrc` in Step 2, add `--legacy-peer-deps` to the firebase install:
> ```powershell
> npm install firebase --legacy-peer-deps
> ```
> This is required because Firebase's `react-dom` expects a slightly newer React version than Expo ships with. They're fully compatible — npm is just being strict about it.

> ✅ Always use `npx expo install` for Expo-specific packages — it picks the version compatible with your Expo SDK. Use plain `npm install` for non-Expo packages like `firebase`.

---

## 6. Environment Variables

Create a `.env` file at the **root** of your project:

```bash
# .env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Replace each value with what Firebase gave you in Step 2 of section 4.

> ⚠️ **Important:** Variables in Expo must start with `EXPO_PUBLIC_` to be accessible in your app code. Any other prefix won't work.

Add `.env` to `.gitignore` so you never commit your API keys:

```bash
# .gitignore  (add this line if it's not already there)
.env
```

---

## 7. Firebase Config File

Create the folder and file:

```bash
mkdir firebase
touch firebase/firebaseConfig.ts
```

```typescript
// firebase/firebaseConfig.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Prevent re-initializing on hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use AsyncStorage so login persists between app restarts
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export default app;
```

> **Why `getApps().length === 0`?** Expo's fast refresh re-runs your modules. Without this guard, Firebase throws "app already initialized" on every hot reload.

---

## 8. Auth Context (Global State)

Create the context folder and file:

```bash
mkdir context
touch context/AuthContext.tsx
```

```typescript
// context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // true while Firebase checks session

  // Listen to Firebase auth state changes (login / logout / session restore)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe; // cleanup listener on unmount
  }, []);

  // ── Auth methods ──────────────────────────────────────────────────────────

  const register = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
```

---

## 9. Root Layout

### `app/_layout.tsx` — Wraps the whole app in the AuthProvider

```typescript
// app/_layout.tsx
import { Slot } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Slot /> {/* renders whatever child route is active */}
      </AuthProvider>
    </SafeAreaProvider>
  );
}
```

### `app/index.tsx` — Entry redirect based on auth state

```typescript
// app/index.tsx
import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { user, loading } = useAuth();

  // While Firebase is restoring the session, show a spinner
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Route based on auth state
  return user ? <Redirect href="/(app)/home" /> : <Redirect href="/(auth)/login" />;
}
```

### `app/(auth)/_layout.tsx` — Auth group (Login / Register)

```typescript
// app/(auth)/_layout.tsx
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
```

### `app/(app)/_layout.tsx` — Protected group layout

```typescript
// app/(app)/_layout.tsx
import { Stack, Redirect } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { ActivityIndicator, View } from "react-native";

export default function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // If not logged in, kick back to login
  if (!user) return <Redirect href="/(auth)/login" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
```

---

## 10. Auth Screens

### `app/(auth)/login.tsx`

```typescript
// app/(auth)/login.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link, router } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      setSubmitting(true);
      await login(email.trim(), password);
      // onAuthStateChanged in AuthContext will update user state,
      // and index.tsx will redirect automatically
    } catch (error: any) {
      Alert.alert("Login Failed", friendlyError(error.code));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in to your account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="current-password"
      />

      <TouchableOpacity
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>
          {submitting ? "Signing in..." : "Sign In"}
        </Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <Link href="/(auth)/register" style={styles.link}>
          Sign Up
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function friendlyError(code: string): string {
  switch (code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";
    case "auth/network-request-failed":
      return "Network error. Check your connection.";
    default:
      return "Something went wrong. Please try again.";
  }
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#888",
    marginBottom: 36,
  },
  input: {
    backgroundColor: "#1c1c1e",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#fff",
    fontSize: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#2c2c2e",
  },
  button: {
    backgroundColor: "#4f7df7",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    color: "#888",
    fontSize: 14,
  },
  link: {
    color: "#4f7df7",
    fontSize: 14,
    fontWeight: "600",
  },
});
```

---

### `app/(auth)/register.tsx`

```typescript
// app/(auth)/register.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function RegisterScreen() {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirm) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }

    try {
      setSubmitting(true);
      await register(email.trim(), password);
      // Firebase auto-logs you in after register.
      // onAuthStateChanged will fire → index.tsx redirects to home.
    } catch (error: any) {
      Alert.alert("Registration Failed", friendlyError(error.code));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Join us today — it's free</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />

      <TextInput
        style={styles.input}
        placeholder="Password (min 6 characters)"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#888"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        autoComplete="new-password"
      />

      <TouchableOpacity
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>
          {submitting ? "Creating account..." : "Create Account"}
        </Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Link href="/(auth)/login" style={styles.link}>
          Sign In
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

function friendlyError(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "That email is already registered.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/network-request-failed":
      return "Network error. Check your connection.";
    default:
      return "Something went wrong. Please try again.";
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#888",
    marginBottom: 36,
  },
  input: {
    backgroundColor: "#1c1c1e",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#fff",
    fontSize: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#2c2c2e",
  },
  button: {
    backgroundColor: "#4f7df7",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    color: "#888",
    fontSize: 14,
  },
  link: {
    color: "#4f7df7",
    fontSize: 14,
    fontWeight: "600",
  },
});
```

---

## 11. Protected Home Screen

```typescript
// app/(app)/home.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function HomeScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          // onAuthStateChanged fires → index.tsx redirects to login
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>You're in! 🎉</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <Text style={styles.uid}>UID: {user?.uid}</Text>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  greeting: {
    fontSize: 36,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 10,
  },
  email: {
    fontSize: 17,
    color: "#4f7df7",
    marginBottom: 6,
  },
  uid: {
    fontSize: 12,
    color: "#555",
    marginBottom: 48,
  },
  button: {
    backgroundColor: "#2c2c2e",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  buttonText: {
    color: "#ff453a",
    fontSize: 15,
    fontWeight: "600",
  },
});
```

---

## 12. Running the App

### Configure `app.json`

Replace your entire `app.json` with this. Every field here is required — missing any of them causes real errors:

```json
{
  "expo": {
    "name": "ExpoFirebaseAuth",
    "slug": "ExpoFirebaseAuth",
    "scheme": "expofirebaseauth",
    "version": "1.0.0",
    "main": "expo-router/entry",
    "orientation": "portrait",
    "platforms": ["ios", "android"],
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "package": "com.expofirebaseauth",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "edgeToEdgeEnabled": true
    },
    "plugins": [
      "expo-router"
    ]
  }
}
```

Key fields explained:

| Field | Why it's needed |
|---|---|
| `"scheme"` | Required for deep linking with expo-router |
| `"main": "expo-router/entry"` | Tells Expo to use file-based routing from `app/` folder |
| `"platforms": ["ios", "android"]` | Prevents Expo from auto-adding `react-native-web` |
| `"android.package"` | Required to open app on Android device — must be reverse-domain format |

### Create an Expo Account

Expo Go now requires you to be logged in to load development builds.

1. Create a free account at https://expo.dev/signup
2. Log in on your PC:
```powershell
npx expo login
```
3. Verify:
```powershell
npx expo whoami
```
4. Also log in inside the **Expo Go** app on your phone using the same account.

### Running on a Physical Android Phone (Recommended)

**The most reliable method on Windows is USB with port forwarding.** This bypasses all WiFi, firewall, and network issues entirely.

**Step 1 — Install ADB** (if not already done):
- Download Platform Tools: https://developer.android.com/tools/releases/platform-tools
- Extract to `C:\Users\ADMIN\Documents\adb`
- Add to PATH:
```powershell
$env:Path += ";C:\Users\ADMIN\Documents\adb"
[Environment]::SetEnvironmentVariable("Path", [Environment]::GetEnvironmentVariable("Path","Machine") + ";C:\Users\ADMIN\Documents\adb", "Machine")
```

**Step 2 — Enable USB Debugging on your phone:**
1. Settings → About Phone → tap **Build Number** 7 times
2. Settings → Developer Options → enable **USB Debugging**
3. Plug phone into PC via USB → tap **Allow** on the popup

**Step 3 — Confirm phone is detected:**
```powershell
adb devices
```
Must show `device` — not `unauthorized`.

**Step 4 — Forward ports through USB:**
```powershell
adb reverse tcp:8081 tcp:8081
adb reverse tcp:19000 tcp:19000
```

**Step 5 — Start Metro:**
```powershell
npx expo start --localhost --clear
```

**Step 6 — On your phone in Expo Go:**
1. Tap **"Enter URL manually"**
2. Type: `exp://localhost:8081`
3. Tap **Connect**

> ✅ Re-run the `adb reverse` commands every time you replug your phone.

### Other Options

| Method | Command | Requirement |
|---|---|---|
| Same WiFi | `npx expo start --lan` | Phone + PC on same network, firewall port 8081 open |
| Tunnel | `npx expo start --tunnel` | Installs ngrok, works on different networks |
| Android emulator | Press `a` | Requires full Android Studio install |
| iOS simulator | Press `i` | Mac only |

---

## 13. Common Errors & Fixes

### ❌ `auth/configuration-not-found`
**Cause:** Your `.env` values are wrong or missing, or Email/Password isn't enabled in Firebase.  
**Fix:** Double-check `.env` values and re-enable Email/Password auth in Firebase console.

---

### ❌ `Cannot find module 'expo-router/entry'`
**Cause:** `expo-router` not installed, or `app.json` missing `"main": "expo-router/entry"`.  
**Fix:** Run `npx expo install expo-router` and confirm `app.json`.

---

### ❌ `FirebaseApp named '[DEFAULT]' already exists`
**Cause:** Firebase initializing twice due to hot reload.  
**Fix:** Already handled in the config with `getApps().length === 0` guard.

---

### ❌ `AsyncStorage has been extracted from react-native`
**Cause:** Using the wrong AsyncStorage package.  
**Fix:** Make sure you installed `@react-native-async-storage/async-storage` (not the old built-in one).

---

### ❌ `npm ERESOLVE could not resolve` during `npm install firebase`
**Cause:** Firebase's `react-dom` expects a slightly newer React patch version than Expo ships.  
**Fix:**
```powershell
npm install firebase --legacy-peer-deps
```
Or permanently fix by adding this to `.npmrc` in your project root:
```
legacy-peer-deps=true
```

---

### ❌ `react-native-web` errors / web support errors
**Cause:** Expo auto-added `react-native-web` when it detected a web entry point.  
**Fix:**
```powershell
npm uninstall react-native-web --legacy-peer-deps
npm install --legacy-peer-deps
```
And make sure `app.json` has `"platforms": ["ios", "android"]`.

---

### ❌ `Required property 'android.package' is not found`
**Cause:** Missing `package` field in the `android` section of `app.json`.  
**Fix:** Add it to your `app.json`:
```json
"android": {
  "package": "com.expofirebaseauth"
}
```

---

### ❌ `java.io.IOException: failed to download remote update` on phone
**Cause:** Phone can't reach your PC over WiFi — network mismatch or firewall blocking port 8081.  
**Fix:** Use USB port forwarding instead:
```powershell
adb reverse tcp:8081 tcp:8081
adb reverse tcp:19000 tcp:19000
npx expo start --localhost --clear
```
Then connect via `exp://localhost:8081` in Expo Go.

---

### ❌ Expo Go shows login screen / requires account
**Cause:** Newer Expo Go versions require an Expo account.  
**Fix:** Create account at https://expo.dev/signup then:
```powershell
npx expo login
npx expo whoami
```
Also log in inside the Expo Go app on your phone.

---

### ❌ `adb` not recognized / Android SDK path errors
**Cause:** ADB not installed or not in PATH.  
**Fix:** Download Platform Tools from https://developer.android.com/tools/releases/platform-tools, extract to a simple folder, then:
```powershell
$env:Path += ";C:\Users\ADMIN\Documents\adb"
[Environment]::SetEnvironmentVariable("Path", [Environment]::GetEnvironmentVariable("Path","Machine") + ";C:\Users\ADMIN\Documents\adb", "Machine")
```

---

### ❌ Redirect loop between login and home
**Cause:** `loading` state isn't being checked before redirecting.  
**Fix:** Confirm the `if (loading) return <ActivityIndicator />` lines are in both `index.tsx` and `(app)/_layout.tsx`.

---

## 14. What's Next

Once this is working, here's what you can add:

**User experience improvements:**
- Password reset screen using `sendPasswordResetEmail(auth, email)`
- Display name on registration using `updateProfile(user, { displayName })`
- Form validation library like `react-hook-form` + `zod`

**Firebase features:**
- **Firestore** — store user profiles, posts, data
- **Firebase Storage** — profile picture uploads
- **Google Sign-In** — with `expo-auth-session`

**App improvements:**
- Loading skeleton screens
- Toast notifications instead of `Alert`
- Splash screen customization
- EAS Build for production APK/IPA: `eas build --platform android`

---

## Quick Command Reference

```powershell
# 1. Create project (use a clean path — no spaces or & in folder names)
cd C:\Dev
npx create-expo-app@latest ExpoFirebaseAuth --template blank-typescript
cd ExpoFirebaseAuth

# 2. Fix peer deps permanently
echo legacy-peer-deps=true > .npmrc

# 3. Install Expo dependencies
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar

# 4. Install Firebase
npm install firebase
npx expo install @react-native-async-storage/async-storage

# 5. Login to Expo
npx expo login

# 6. Start (WiFi)
npx expo start --lan --clear

# 6. Start (USB — most reliable on Windows)
adb reverse tcp:8081 tcp:8081
adb reverse tcp:19000 tcp:19000
npx expo start --localhost --clear
# Then in Expo Go → Enter URL manually → exp://localhost:8081

# Full clean reinstall if things break
Remove-Item -Recurse -Force node_modules
npm install
npx expo start --clear
```

---

*Built with ❤️ using Expo SDK 54 + Firebase JS SDK v11*  
*Battle-tested on Windows 11 + Android — April 2026*
