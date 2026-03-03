# ✅ Task Master — Firebase Web App

> **Project**: Task Master To-Do List App  
> **Authors**: Gokul B (U22CA0036) & Gopalakrishnan M (U22CA0035)  
> **Class**: III BCA-A | **Guide**: Mr. M. Senthilkumar

---

## 📁 File Structure

```
taskmaster-firebase/
├── login.html            ← Login page (Email + Google)
├── register.html         ← Register page (Email + Google)
├── app.html              ← Main Task Manager dashboard
├── css/
│   └── style.css         ← All styles (shared across pages)
└── js/
    ├── firebase-config.js ← Firebase setup reference
    ├── login.js          ← Login logic (Firebase Auth)
    ├── register.js       ← Register logic (Auth + Firestore)
    └── app.js            ← App logic (Firestore CRUD + real-time)
```

---

## 🔥 STEP-BY-STEP FIREBASE SETUP

### Step 1 — Create Firebase Project
1. Go to **https://console.firebase.google.com**
2. Click **"Add project"** → Name it (e.g. `taskmaster`)
3. Disable Google Analytics (optional) → **Create project**

---

### Step 2 — Enable Authentication
1. In Firebase Console → **Authentication** → **Get Started**
2. Click **Sign-in method** tab
3. Enable **Email/Password** → Save
4. *(Optional)* Enable **Google** → Add support email → Save

---

### Step 3 — Create Firestore Database
1. Firebase Console → **Firestore Database** → **Create database**
2. Choose **"Start in test mode"** → Next → Select region → **Done**

---

### Step 4 — Set Firestore Security Rules
Go to **Firestore → Rules** tab and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
Click **Publish**.

---

### Step 5 — Get Your Firebase Config
1. Firebase Console → **Project Settings** (⚙️ gear icon)
2. Scroll to **"Your apps"** → Click **</>** Web icon
3. Register app → Copy the `firebaseConfig` object

---

### Step 6 — Add Config to All JS Files
Open **each of these 3 files** and replace the placeholder config:

- `js/login.js`
- `js/register.js`
- `js/app.js`

Replace this block in all three:
```javascript
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",           // ← replace
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
```

---

### Step 7 — Run the App

> ⚠️ **IMPORTANT**: Firebase JS SDK uses ES Modules (`import/export`).
> You MUST serve these files through a web server — NOT by opening HTML files directly.

#### Option A — VS Code Live Server (Easiest)
1. Install **Live Server** extension in VS Code
2. Right-click `login.html` → **Open with Live Server**

#### Option B — Python HTTP Server
```bash
cd taskmaster-firebase
python -m http.server 5500
# Open: http://localhost:5500/login.html
```

#### Option C — Node.js
```bash
npx serve taskmaster-firebase
```

---

## 🔄 How Firebase is Used

| Feature | Firebase Service |
|---|---|
| User Registration | Firebase Authentication |
| Email/Password Login | Firebase Authentication |
| Google Sign-In | Firebase Auth + GoogleAuthProvider |
| Password Reset | Firebase Auth `sendPasswordResetEmail` |
| User Profile Storage | Firestore → `users/{uid}` |
| Task Storage | Firestore → `users/{uid}/tasks/{taskId}` |
| Real-time Updates | Firestore `onSnapshot` listener |
| Auth State Persistence | `onAuthStateChanged` |

---

## 🗄️ Firestore Data Structure

```
Firestore
└── users/
    └── {userId}/                    ← user document
        ├── fullName: "Gokul B"
        ├── email: "gokul@example.com"
        ├── createdAt: timestamp
        └── tasks/
            └── {taskId}/            ← task document
                ├── title: "Submit project"
                ├── cat: "Work"
                ├── pri: "High"
                ├── date: "2025-03-15"
                ├── done: false
                ├── createdAt: timestamp
                └── updatedAt: timestamp
```

---

## ✨ Features

- 🔐 Firebase Authentication (Email + Google)
- 📝 Add / Edit / Delete tasks
- ✅ Mark complete with real-time sync
- 📂 Filter by category
- 🔼 Sort by date, priority, A-Z
- 🔍 Live search
- ⚠️ Overdue detection
- 📊 Progress ring + stats
- 🌐 Real-time Firestore listener
- 🚪 Auth guard (redirects if not logged in)
- 🔄 Auto-redirect if already logged in
