# Expo Firebase Authentication App

A full-stack React Native authentication application built with **Expo**, **Firebase**, and **TypeScript**. Features email/password signup, login, and a protected home screen with logout functionality.

---

## Features

✅ **User Authentication**
- Email/password sign up with validation
- Email/password login
- Persistent authentication (survives app restarts)
- Logout functionality

✅ **Protected Routes**
- Auto-redirect to login if not authenticated
- Auto-redirect to home if authenticated
- Loading screen while checking auth state

✅ **Error Handling**
- Friendly error messages for common Firebase errors
- Network error detection
- Rate limiting warnings

✅ **Modern Stack**
- React Native with TypeScript
- Expo Router for file-based navigation
- Firebase JS SDK for authentication
- AsyncStorage for session persistence

---

## Project Structure

```
ExpoFirebaseAuth/
├── app/
│   ├── _layout.tsx              # Root layout with AuthProvider
│   ├── index.tsx                # Entry point (redirect router)
│   ├── (app)/
│   │   ├── _layout.tsx          # Protected app layout
│   │   └── home.tsx             # Home screen (requires login)
│   └── (auth)/
│       ├── _layout.tsx          # Auth group layout
│       ├── login.tsx            # Login screen
│       └── register.tsx         # Sign up screen
├── context/
│   └── AuthContext.tsx          # Global auth state & methods
├── firebase/
│   └── firebaseConfig.ts        # Firebase initialization
├── .env                         # Firebase credentials (not committed)
├── app.json                     # Expo configuration
├── package.json                 # Dependencies
└── tsconfig.json                # TypeScript config
```

---

## Installation & Setup

### Prerequisites
- **Node.js** v18+ (check: `node -v`)
- **npm** v9+ (check: `npm -v`)
- **Expo Account** at https://expo.dev (free)
- **Firebase Account** at https://console.firebase.google.com (free)
- **Android/iOS device or emulator**
- **Expo Go app** installed on your phone (from Play Store or App Store)

### Step 1: Clone or Create Project

```bash
cd your-workspace
git clone <your-repo> ExpoFirebaseAuth
cd ExpoFirebaseAuth
```

Or create new:
```bash
npx create-expo-app@latest ExpoFirebaseAuth --template blank-typescript
cd ExpoFirebaseAuth
```

### Step 2: Install Dependencies

```bash
# Fix peer dependency conflicts
echo legacy-peer-deps=true > .npmrc

# Install Expo Router & UI packages
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar

# Install Firebase
npm install firebase --legacy-peer-deps

# Install AsyncStorage for auth persistence
npx expo install @react-native-async-storage/async-storage
```

### Step 3: Firebase Setup

1. Go to https://console.firebase.google.com
2. Click "Add project" → enter name → Create project
3. Click the **Web app icon** (</>) → register app
4. Copy your Firebase config
5. Go to **Build → Authentication** → Enable **Email/Password**

### Step 4: Configure Environment

Create `.env` in project root:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Step 5: Run the App

**On Android Device (USB):**

```bash
# Enable USB Debugging on phone
# Connect phone via USB
# Run:
adb reverse tcp:8081 tcp:8081
adb reverse tcp:19000 tcp:19000
npx expo start --localhost --clear
```

Then open **Expo Go** on your phone:
1. Tap "Enter URL manually"
2. Type: `exp://localhost:8081`
3. Tap Connect

**On WiFi (same network):**

```bash
npx expo start --lan --clear
```

Then scan the QR code in Expo Go.

---

## How It Works

### Authentication Flow

```
1. App loads → AuthContext checks Firebase auth state
2. If loading → Show loading spinner
3. If logged in → Redirect to (app)/home
4. If not logged in → Redirect to (auth)/login
```

### Sign Up Flow
```
1. User enters email & password
2. Click "Create Account"
3. Firebase creates user → auto-logs in
4. onAuthStateChanged fires → user state updates
5. Auto-redirect to home screen
```

### Login Flow
```
1. User enters email & password
2. Click "Sign In"
3. Firebase authenticates user
4. onAuthStateChanged fires → user state updates
5. Auto-redirect to home screen
```

### Logout Flow
```
1. User taps "Sign Out" on home
2. Confirm alert appears
3. Firebase signs out user
4. onAuthStateChanged fires → user set to null
5. Auto-redirect to login screen
```

---

## Key Files Explained

### `firebase/firebaseConfig.ts`
- Initializes Firebase app
- Sets up auth with AsyncStorage persistence (survives app restarts)
- Exports `auth` instance used throughout the app

### `context/AuthContext.tsx`
- Creates global auth state with React Context
- Manages `user`, `loading`, and auth methods
- `onAuthStateChanged` listener syncs with Firebase
- `useAuth()` hook for accessing auth state in components

### `app/index.tsx`
- Entry point (initial router)
- Decides: Show spinner → redirect to login OR redirect to home
- Waits for Firebase to restore session

### `app/(auth)/login.tsx` & `app/(auth)/register.tsx`
- Login and signup forms
- Error handling with user-friendly messages
- Disabled submit button while submitting

### `app/(app)/home.tsx`
- Protected screen (only visible when logged in)
- Displays user email
- Sign out button with confirmation alert

---

## Common Errors & Fixes

### ❌ "Cannot find module 'firebase/auth/react-native'"
**Fix:** Use `getReactNativePersistence` from `firebase/auth` (already fixed in this project)

### ❌ "Cannot find module 'expo-router/entry'"
**Fix:** Ensure `app.json` has `"main": "expo-router/entry"`

### ❌ "FirebaseApp named '[DEFAULT]' already exists"
**Fix:** Already handled via `getApps().length === 0` guard in firebaseConfig.ts

### ❌ Login/signup doesn't redirect
**Fix:** 
- Ensure Firebase Email/Password is enabled in Firebase Console
- Check `.env` has correct Firebase credentials
- Verify auth config uses AsyncStorage persistence

### ❌ "Text strings must be rendered within a <Text> component"
**Fix:** Ensure all text is wrapped in `<Text>` components (no stray strings in JSX)

### ❌ npm peer dependency errors
**Fix:** Already have `.npmrc` with `legacy-peer-deps=true`

---

## Development Commands

```bash
# Start dev server
npx expo start --localhost --clear

# Clear all caches (if you have issues)
rm -r .expo node_modules/.cache
npx expo start --localhost --clear

# Full rebuild
rm -Recurse -Force node_modules
npm install --legacy-peer-deps
npx expo start --localhost --clear

# Login to Expo
npx expo login

# Check who you're logged in as
npx expo whoami
```

---

## Security Notes

⚠️ **Never commit `.env` file** — it contains Firebase API keys  
⚠️ **Enable Firebase security rules** if you add Firestore/Storage  
⚠️ **Use strong passwords** for test accounts  
⚠️ **Firebase rules default to deny** — configure for your needs

---

## Next Steps

After getting this working, you can add:

1. **Password Reset** — `sendPasswordResetEmail(auth, email)`
2. **User Profiles** — Save user data in Firestore
3. **Profile Pictures** — Upload to Firebase Storage
4. **Google Sign-In** — Via `expo-auth-session`
5. **Phone Authentication** — Firebase phone sign-in
6. **Production Build** — `eas build --platform android`

---

## Deployment

### Build for Android:
```bash
npm install -g eas-cli
eas build --platform android
```

### Build for iOS (Mac only):
```bash
eas build --platform ios
```

Learn more: https://docs.expo.dev/build/introduction/

---

## Resources

- 📚 [Expo Documentation](https://docs.expo.dev)
- 📚 [Firebase JS SDK](https://firebase.google.com/docs/web)
- 📚 [React Navigation](https://reactnavigation.org)
- 📚 [React Native Docs](https://reactnative.dev)

---

## License

MIT

---

**Built with ❤️ using Expo SDK 54 + Firebase JS SDK v12**  
Ready for production. Enjoy! 🚀
