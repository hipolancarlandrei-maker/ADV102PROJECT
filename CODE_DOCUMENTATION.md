# Expo Firebase Assignment Tracker

A comprehensive React Native application built with Expo, Firebase, and TypeScript, featuring user authentication, assignment management, theming, and customizable backgrounds.

## Table of Contents

- [Introduction](#introduction)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Installation & Setup](#installation--setup)
- [Firebase Configuration](#firebase-configuration)
- [Code Architecture](#code-architecture)
- [Core Components](#core-components)
- [State Management](#state-management)
- [Navigation Flow](#navigation-flow)
- [Theming System](#theming-system)
- [Assignment Management](#assignment-management)
- [Calendar Integration](#calendar-integration)
- [Settings & Customization](#settings--customization)

## Introduction

This application serves as a digital assignment tracker with Firebase authentication. Users can create accounts, manage their assignments with due dates and priority colors, view assignments in a calendar format, and customize the app's appearance with light/dark themes and background images.

The app demonstrates modern React Native development practices including:
- File-based routing with expo-router
- Context-based state management
- Firebase authentication and persistence
- AsyncStorage for local data persistence
- Custom theming and UI components
- Image picker integration

## Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Routing**: expo-router v6 (file-based routing)
- **Authentication**: Firebase Authentication v12
- **Database**: Firebase Firestore (for future expansion)
- **State Management**: React Context API
- **Storage**: AsyncStorage for local persistence
- **Image Handling**: expo-image-picker
- **Language**: TypeScript
- **Styling**: StyleSheet with theme-aware components

## Project Structure

```
ExpoFirebaseAuth/
├── app/                          # Main application directory (expo-router)
│   ├── _layout.tsx              # Root layout with providers
│   ├── index.tsx                # Auth redirect logic
│   ├── (app)/                   # Protected app routes
│   │   ├── _layout.tsx          # App layout with auth guard
│   │   └── home.tsx             # Main home screen
│   └── (auth)/                  # Authentication routes
│       ├── _layout.tsx          # Auth layout
│       ├── login.tsx            # Login screen
│       └── register.tsx         # Registration screen
├── components/                   # Reusable UI components
│   ├── AddAssignmentModal.tsx   # Assignment creation modal
│   ├── AssignmentCard.tsx       # Individual assignment display
│   ├── Calendar.tsx             # Calendar component
│   └── DatePickerModal.tsx      # Date selection modal
├── context/                      # React Context providers
│   ├── AuthContext.tsx          # Firebase authentication
│   ├── AssignmentContext.tsx    # Assignment state management
│   └── ThemeContext.tsx         # Theme and background management
├── firebase/                     # Firebase configuration
│   └── firebaseConfig.ts        # Firebase app initialization
├── assets/                       # Static assets
├── package.json                  # Dependencies and scripts
├── app.json                      # Expo configuration
└── tsconfig.json                 # TypeScript configuration
```

## Key Features

### 🔐 Authentication
- Email/password registration and login
- Firebase authentication with persistence
- Automatic session restoration
- Protected routes with auth guards

### 📝 Assignment Management
- Create assignments with title, description, due date, and priority color
- Mark assignments as complete/incomplete
- Delete assignments
- Color-coded priority system (green, orange, red)

### 📅 Calendar Integration
- View assignments by due date
- Month navigation (previous/next)
- Highlight dates with assignments
- Click dates to view assignments for that day

### 🎨 Theming & Customization
- Light and dark mode toggle
- Custom background selection:
  - Default (no background)
  - Static image (user-selected)
  - GIF background (user-selected)
- Persistent theme and background preferences

### ⚙️ Settings
- Theme toggle
- Background selection with image picker
- Sign out functionality

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Firebase project

### Installation Steps

1. **Clone and install dependencies:**
   ```bash
   cd ExpoFirebaseAuth
   npm install
   ```

2. **Configure Firebase:**
   - Create a Firebase project at https://console.firebase.google.com/
   - Enable Authentication with Email/Password provider
   - Copy your Firebase config to `firebase/firebaseConfig.ts`

3. **Start the development server:**
   ```bash
   npx expo start
   ```

4. **Run on device/emulator:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

## Firebase Configuration

### firebase/firebaseConfig.ts
```typescript
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with React Native persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
```

## Code Architecture

### File-Based Routing (expo-router)

The app uses expo-router for navigation, where file structure determines routes:

- `app/_layout.tsx`: Root layout wrapping the entire app
- `app/index.tsx`: Initial route that redirects based on auth state
- `app/(auth)/login.tsx`: Login screen
- `app/(auth)/register.tsx`: Registration screen
- `app/(app)/home.tsx`: Protected home screen

Route groups `(auth)` and `(app)` organize related screens without affecting URLs.

### Provider Pattern

The app uses multiple context providers layered in `_layout.tsx`:

```typescript
// app/_layout.tsx
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AssignmentProvider>
            <Slot />
          </AssignmentProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
```

This provides global state for themes, authentication, and assignments.

## Core Components

### AuthContext (context/AuthContext.tsx)

Manages Firebase authentication state:

- `user`: Current authenticated user or null
- `loading`: Loading state during auth checks
- `register(email, password)`: Create new account
- `login(email, password)`: Sign in existing user
- `logout()`: Sign out current user

Uses `onAuthStateChanged` to listen for auth changes and update state accordingly.

### AssignmentContext (context/AssignmentContext.tsx)

Manages assignment data:

- `assignments`: Array of assignment objects
- `addAssignment(assignment)`: Add new assignment
- `toggleAssignmentComplete(id)`: Toggle completion status
- `deleteAssignment(id)`: Remove assignment
- Helper functions for filtering by date

Assignments are stored locally using AsyncStorage for persistence.

### ThemeContext (context/ThemeContext.tsx)

Manages app theming and backgrounds:

- `mode`: "light" or "dark"
- `theme.colors`: Color palette object
- `backgroundType`: "none", "static", or "gif"
- `backgroundUri`: Current background image URL
- `customBackgroundUri`: User-selected background
- `toggleTheme()`: Switch light/dark mode
- `setBackgroundType(type)`: Change background type
- `setCustomBackgroundUri(uri)`: Set custom background

## State Management

### Authentication State
- Firebase handles auth state persistence
- AuthContext provides user state to components
- Layout components check auth state for route protection

### Assignment State
- Stored in AsyncStorage as JSON
- Context provides CRUD operations
- Components subscribe to assignment changes

### Theme State
- Theme mode and background preferences stored in AsyncStorage
- ThemeContext provides colors and background URIs
- Components use theme colors for styling

## Navigation Flow

### Initial Load
1. App starts at `app/index.tsx`
2. AuthContext checks Firebase auth state
3. If user authenticated → redirect to `/home`
4. If not authenticated → redirect to `/login`

### Authentication Flow
1. User visits login/register screens
2. Firebase auth methods called
3. On success → redirect to `/home`
4. AuthContext updates user state
5. Protected routes now accessible

### Protected Routes
- `app/(app)/_layout.tsx` checks auth state
- If no user → redirect to `/login`
- If user exists → render app content

## Theming System

### Color Palettes
Two complete color schemes defined in ThemeContext:

```typescript
const lightColors = {
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#0F172A",
  // ... more colors
};

const darkColors = {
  background: "#050816",
  card: "#0B1120",
  text: "#E2E8F0",
  // ... more colors
};
```

### Theme Application
Components receive theme via `useTheme()` hook:

```typescript
const { theme } = useTheme();
return (
  <View style={{ backgroundColor: theme.colors.background }}>
    <Text style={{ color: theme.colors.text }}>Content</Text>
  </View>
);
```

### Background System
- Background images rendered with `ImageBackground`
- Opacity set to 28% for subtle effect
- User can select custom images via image picker
- Background choice persisted in AsyncStorage

## Assignment Management

### Assignment Structure
```typescript
interface Assignment {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  color: string; // Priority color
}
```

### CRUD Operations
- **Create**: AddAssignmentModal collects data, calls `addAssignment()`
- **Read**: Context provides filtered views (today, tomorrow, by date)
- **Update**: `toggleAssignmentComplete()` updates completion status
- **Delete**: `deleteAssignment()` removes from array

### Color Coding
Assignments use priority colors:
- Green (#34D399): Low priority
- Orange (#F59E0B): Medium priority  
- Red (#EF4444): High priority

## Calendar Integration

### Calendar Component
- Displays current month with navigation arrows
- Highlights dates containing assignments
- Shows dots on assignment dates
- Clickable dates to view assignments

### Date Selection
- Calendar used in two contexts:
  1. Home screen: View assignments by date
  2. Add assignment modal: Select due date

### Month Navigation
- Previous/Next buttons update displayed month
- Assignment highlighting updates dynamically
- Maintains current date selection

## Settings & Customization

### Settings Modal
Accessible via bottom navigation gear icon:

- **Dark Mode Toggle**: Switch between light/dark themes
- **Background Selection**: Choose from three options
- **Sign Out**: Logout with confirmation

### Background Selection
When user selects "Static Image" or "GIF Background":
1. Request photo library permissions
2. Open image picker
3. User selects image
4. Store URI in AsyncStorage
5. Update home background

### Permissions
App requests necessary permissions:
- Photo library access for background selection
- Handled gracefully with user-friendly error messages

## Development Notes

### TypeScript Usage
- Strict typing throughout the codebase
- Interfaces defined for all data structures
- Type-safe Firebase operations
- Proper error handling with typed exceptions

### Performance Considerations
- Context providers prevent unnecessary re-renders
- AsyncStorage operations are batched
- Image backgrounds use opacity for performance
- Calendar only renders visible month

### Error Handling
- Firebase auth errors mapped to user-friendly messages
- Image picker failures handled gracefully
- AsyncStorage operations include error catching
- Loading states prevent multiple simultaneous operations

### Future Enhancements
- Cloud storage for assignments (Firebase Firestore)
- Push notifications for due assignments
- Assignment categories/tags
- Export/import functionality
- Offline sync capabilities

This documentation provides a comprehensive overview of the application's architecture, features, and implementation details for academic presentation purposes.</content>
<parameter name="filePath">c:\Users\ADMIN\Desktop\FirebaseNExpo\ExpoFirebaseAuth\CODE_DOCUMENTATION.md