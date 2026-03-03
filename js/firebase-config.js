// ═══════════════════════════════════════════════════════════
// TASK MASTER — firebase-config.js
// ─────────────────────────────────────────────────────────
// HOW TO SET UP YOUR FIREBASE PROJECT:
//
// 1. Go to https://console.firebase.google.com
// 2. Click "Add project" → give it a name (e.g. "taskmaster")
// 3. Once created, click the </> Web icon to add a web app
// 4. Copy the firebaseConfig object below and REPLACE the
//    placeholder values with your real config values.
//
// 5. Enable Authentication:
//    Firebase Console → Authentication → Sign-in method
//    → Enable "Email/Password"
//
// 6. Enable Firestore Database:
//    Firebase Console → Firestore Database → Create database
//    → Start in test mode (for development)
//
// 7. Firestore Security Rules (Firestore → Rules tab):
//    rules_version = '2';
//    service cloud.firestore {
//      match /databases/{database}/documents {
//        match /users/{userId}/tasks/{taskId} {
//          allow read, write: if request.auth != null && request.auth.uid == userId;
//        }
//        match /users/{userId} {
//          allow read, write: if request.auth != null && request.auth.uid == userId;
//        }
//      }
//    }
// ═══════════════════════════════════════════════════════════

const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

// Initialize Firebase
import { initializeApp }              from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth }                    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore }               from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
