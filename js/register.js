// ═══════════════════════════════════════════════════════════
// TASK MASTER — register.js
// Firebase: Create user + save profile to Firestore
// ═══════════════════════════════════════════════════════════

import { initializeApp }                    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword,
         updateProfile, GoogleAuthProvider,
         signInWithPopup, onAuthStateChanged }
                                             from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp }
                                             from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── PASTE YOUR FIREBASE CONFIG HERE ─────────────────────
const firebaseConfig = {
  apiKey: "",
  authDomain: "taskmaster-229b7.firebaseapp.com",
  projectId: "taskmaster-229b7",
  storageBucket: "taskmaster-229b7.firebasestorage.app",
  messagingSenderId: "457772058190",
  appId: "1:457772058190:web:912b298f13313822bca51f"
};
// ─────────────────────────────────────────────────────────

const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const db       = getFirestore(app);
const provider = new GoogleAuthProvider();

// Redirect if already logged in
onAuthStateChanged(auth, user => {
  if (user) window.location.href = 'app.html';
});

// ── HELPERS ──────────────────────────────────────────────
function showMsg(txt, type = 'error') {
  const el = document.getElementById('msg');
  el.textContent = txt;
  el.className   = `form-msg ${type}`;
}
function hideMsg() { document.getElementById('msg').className = 'form-msg'; }

function setLoading(btnId, on) {
  const btn = document.getElementById(btnId);
  btn.classList.toggle('loading', on);
  btn.disabled = on;
}

function toast(txt) {
  const t = document.getElementById('toast');
  t.textContent = txt;
  t.className   = 'show';
  clearTimeout(t._t);
  t._t = setTimeout(() => t.className = '', 3000);
}

window.toggleEye = function(id, btn) {
  const f = document.getElementById(id);
  f.type = f.type === 'password' ? 'text' : 'password';
  btn.textContent = f.type === 'password' ? '👁' : '🙈';
};

// ── Save user profile to Firestore ───────────────────────
async function saveUserProfile(uid, data) {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// ── EMAIL / PASSWORD REGISTER ─────────────────────────────
window.handleRegister = async function () {
  hideMsg();

  const firstName = document.getElementById('firstName').value.trim();
  const lastName  = document.getElementById('lastName').value.trim();
  const email     = document.getElementById('email').value.trim();
  const password  = document.getElementById('password').value;
  const confirm   = document.getElementById('confirmPw').value;
  const terms     = document.getElementById('terms').checked;

  // Validate
  if (!firstName)     { showMsg('Please enter your first name.'); return; }
  if (!lastName)      { showMsg('Please enter your last name.'); return; }
  if (!email)         { showMsg('Please enter your email address.'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showMsg('Please enter a valid email address.'); return; }
  if (!password)      { showMsg('Please create a password.'); return; }
  if (password.length < 6) { showMsg('Password must be at least 6 characters.'); return; }
  if (password !== confirm) { showMsg('Passwords do not match.'); return; }
  if (!terms)         { showMsg('Please accept the Terms of Service.'); return; }

  setLoading('registerBtn', true);

  try {
    // 1. Create Auth account
    const cred     = await createUserWithEmailAndPassword(auth, email, password);
    const user     = cred.user;
    const fullName = `${firstName} ${lastName}`;

    // 2. Update display name
    await updateProfile(user, { displayName: fullName });

    // 3. Save profile to Firestore
    await saveUserProfile(user.uid, {
      uid:       user.uid,
      firstName,
      lastName,
      fullName,
      email,
      photoURL:  user.photoURL || null,
      taskCount: 0,
    });

    showMsg('✓ Account created! Redirecting...', 'success');
    setTimeout(() => window.location.href = 'app.html', 1000);

  } catch (err) {
    setLoading('registerBtn', false);
    const codes = {
      'auth/email-already-in-use': 'This email is already registered. Sign in instead.',
      'auth/invalid-email':        'Please enter a valid email address.',
      'auth/weak-password':        'Password is too weak. Use at least 6 characters.',
    };
    showMsg(codes[err.code] || 'Registration failed: ' + err.message);
  }
};

// ── GOOGLE SIGN UP ────────────────────────────────────────
window.handleGoogle = async function () {
  setLoading('googleRegBtn', true);
  try {
    const result = await signInWithPopup(auth, provider);
    const user   = result.user;
    const names  = (user.displayName || '').split(' ');

    await saveUserProfile(user.uid, {
      uid:       user.uid,
      firstName: names[0] || '',
      lastName:  names.slice(1).join(' ') || '',
      fullName:  user.displayName || '',
      email:     user.email,
      photoURL:  user.photoURL || null,
      taskCount: 0,
    });

    toast('✓ Signed up with Google!');
    setTimeout(() => window.location.href = 'app.html', 800);
  } catch (err) {
    setLoading('googleRegBtn', false);
    if (err.code !== 'auth/popup-closed-by-user') {
      showMsg('Google sign-up failed: ' + err.message);
    }
  }
};
