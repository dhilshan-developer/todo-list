// ═══════════════════════════════════════════════════════════
// TASK MASTER — login.js
// Firebase Authentication: Email/Password + Google Sign-In
// ═══════════════════════════════════════════════════════════

import { initializeApp }                    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword,
         GoogleAuthProvider, signInWithPopup,
         sendPasswordResetEmail, onAuthStateChanged }
                                             from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ── PASTE YOUR FIREBASE CONFIG HERE ─────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyCAe0JzjctZLGdH8WPt8WyvBAnvypgAowg",
  authDomain: "taskmaster-229b7.firebaseapp.com",
  projectId: "taskmaster-229b7",
  storageBucket: "taskmaster-229b7.firebasestorage.app",
  messagingSenderId: "457772058190",
  appId: "1:457772058190:web:912b298f13313822bca51f"
}; 

const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
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

function toast(txt, err = false) {
  const t = document.getElementById('toast');
  t.textContent = txt;
  t.className   = 'show' + (err ? ' err' : '');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.className = '', 3000);
}

function toggleEye(id, btn) {
  const f = document.getElementById(id);
  f.type = f.type === 'password' ? 'text' : 'password';
  btn.textContent = f.type === 'password' ? '👁' : '🙈';
}
window.toggleEye = toggleEye;

// ── EMAIL / PASSWORD LOGIN ────────────────────────────────
window.handleLogin = async function () {
  hideMsg();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email)    { showMsg('Please enter your email address.'); return; }
  if (!password) { showMsg('Please enter your password.');      return; }

  setLoading('loginBtn', true);
  try {
    await signInWithEmailAndPassword(auth, email, password);
    toast('✓ Login successful! Redirecting...');
    setTimeout(() => window.location.href = 'app.html', 800);
  } catch (err) {
    setLoading('loginBtn', false);
    const codes = {
      'auth/user-not-found':   'No account found with this email.',
      'auth/wrong-password':   'Incorrect password. Please try again.',
      'auth/invalid-email':    'Please enter a valid email address.',
      'auth/too-many-requests':'Too many attempts. Please try again later.',
      'auth/user-disabled':    'This account has been disabled.',
    };
    showMsg(codes[err.code] || 'Login failed: ' + err.message);
  }
};

// ── GOOGLE SIGN IN ────────────────────────────────────────
window.handleGoogle = async function () {
  setLoading('googleBtn', true);
  try {
    await signInWithPopup(auth, provider);
    toast('✓ Signed in with Google!');
    setTimeout(() => window.location.href = 'app.html', 800);
  } catch (err) {
    setLoading('googleBtn', false);
    if (err.code !== 'auth/popup-closed-by-user') {
      showMsg('Google sign-in failed: ' + err.message);
    }
  }
};

// ── FORGOT PASSWORD ───────────────────────────────────────
window.forgotPassword = async function () {
  const email = document.getElementById('email').value.trim();
  if (!email) { showMsg('Enter your email above, then click Forgot Password.'); return; }
  try {
    await sendPasswordResetEmail(auth, email);
    showMsg('✓ Password reset email sent! Check your inbox.', 'success');
  } catch (err) {
    showMsg('Could not send reset email: ' + err.message);
  }
};

// ── Enter key support ─────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') window.handleLogin();
});
