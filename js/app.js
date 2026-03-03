// ═══════════════════════════════════════════════════════════
// TASK MASTER — app.js
// Firebase Firestore: Real-time task CRUD + Auth guard
// ═══════════════════════════════════════════════════════════

import { initializeApp }               from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut }
                                        from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore,
         collection, doc,
         addDoc, updateDoc, deleteDoc, getDocs,
         onSnapshot, query, orderBy,
         serverTimestamp, Timestamp }   from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ── STATE ────────────────────────────────────────────────
let tasks      = [];
let activeCat  = 'All';
let activeSort = 'date';
let selPri     = 'Low';
let editId     = null;
let currentUid = null;
let unsubscribe= null;

// ── AUTH GUARD ────────────────────────────────────────────
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  currentUid = user.uid;
  document.getElementById('userName').textContent =
    user.displayName ? user.displayName.split(' ')[0] : user.email;

  // DB indicator
  document.getElementById('dbDot').classList.add('live');
  document.getElementById('dbStatus').textContent = 'Firebase Connected';

  subscribeToTasks();
});

// ── REALTIME LISTENER (Firestore) ─────────────────────────
function subscribeToTasks() {
  showSkeletons();
  const ref = collection(db, 'users', currentUid, 'tasks');
  const q   = query(ref, orderBy('createdAt', 'desc'));

  unsubscribe = onSnapshot(q, snap => {
    tasks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderTasks();
  }, err => {
    console.error(err);
    toast('⚠ Firestore error: ' + err.message, true);
  });
}

// ── ADD TASK ──────────────────────────────────────────────
window.addTask = async function () {
  const title = document.getElementById('taskInput').value.trim();
  if (!title) { toast('Please enter a task title.', true); return; }

  const newTask = {
    title,
    cat:       document.getElementById('catSel').value,
    pri:       selPri,
    date:      document.getElementById('dateInput').value || null,
    done:      false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await addDoc(collection(db, 'users', currentUid, 'tasks'), newTask);
    document.getElementById('taskInput').value = '';
    toast('✓ Task added!');
  } catch (e) {
    toast('Failed to add task: ' + e.message, true);
  }
};

// ── TOGGLE DONE ───────────────────────────────────────────
window.toggleDone = async function (id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  try {
    await updateDoc(doc(db, 'users', currentUid, 'tasks', id), {
      done: !t.done,
      updatedAt: serverTimestamp(),
    });
  } catch (e) { toast('Update failed.', true); }
};

// ── DELETE TASK ───────────────────────────────────────────
window.deleteTask = async function (id) {
  try {
    await deleteDoc(doc(db, 'users', currentUid, 'tasks', id));
    toast('🗑 Task deleted.');
  } catch (e) { toast('Delete failed.', true); }
};

// ── EDIT MODAL ────────────────────────────────────────────
window.openEdit = function (id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  editId = id;
  document.getElementById('eTitle').value = t.title;
  document.getElementById('eCat').value   = t.cat;
  document.getElementById('eDate').value  = t.date || '';
  document.getElementById('ePri').value   = t.pri;
  document.getElementById('editModal').classList.add('open');
};

window.closeModal = function () {
  document.getElementById('editModal').classList.remove('open');
  editId = null;
};

window.saveEdit = async function () {
  const t = tasks.find(x => x.id === editId);
  if (!t) return;
  const title = document.getElementById('eTitle').value.trim() || t.title;
  try {
    await updateDoc(doc(db, 'users', currentUid, 'tasks', editId), {
      title,
      cat:       document.getElementById('eCat').value,
      date:      document.getElementById('eDate').value || null,
      pri:       document.getElementById('ePri').value,
      updatedAt: serverTimestamp(),
    });
    closeModal();
    toast('✏ Task updated!');
  } catch (e) { toast('Update failed.', true); }
};

// ── CONTROLS ──────────────────────────────────────────────
window.filterCat = function (btn) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeCat = btn.dataset.cat;
  renderTasks();
};

window.setSort = function (btn) {
  document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeSort = btn.dataset.s;
  renderTasks();
};

window.setPri = function (btn) {
  document.querySelectorAll('.pri-chip').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
  selPri = btn.dataset.p;
};

// ── RENDER ────────────────────────────────────────────────
window.renderTasks = function () {
  const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const today  = new Date(); today.setHours(0,0,0,0);

  let visible = tasks.filter(t => {
    if (activeCat !== 'All' && t.cat !== activeCat) return false;
    if (search && !t.title.toLowerCase().includes(search)) return false;
    return true;
  });

  const priO = { High:0, Medium:1, Low:2 };
  if (activeSort === 'date') {
    visible.sort((a,b) => (a.date||'9999') < (b.date||'9999') ? -1 : 1);
  } else if (activeSort === 'pri') {
    visible.sort((a,b) => priO[a.pri] - priO[b.pri]);
  } else if (activeSort === 'alpha') {
    visible.sort((a,b) => a.title.localeCompare(b.title));
  }

  // counts
  const cats = ['Work','Personal','Shopping','Health','Other'];
  document.getElementById('c-All').textContent = tasks.length;
  cats.forEach(c => {
    const el = document.getElementById('c-' + c);
    if (el) el.textContent = tasks.filter(t => t.cat === c).length;
  });

  // stats
  const done  = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const ov    = tasks.filter(t => t.date && !t.done && new Date(t.date) < today).length;
  document.getElementById('qHigh').textContent = tasks.filter(t => t.pri==='High'   && !t.done).length;
  document.getElementById('qMed').textContent  = tasks.filter(t => t.pri==='Medium' && !t.done).length;
  document.getElementById('qLow').textContent  = tasks.filter(t => t.pri==='Low'    && !t.done).length;
  document.getElementById('qPend').textContent = tasks.filter(t => !t.done).length;
  document.getElementById('qDone').textContent = done;
  document.getElementById('qOver').textContent = ov;

  // ring
  const pct  = total ? Math.round(done/total*100) : 0;
  const circ = 188;
  document.getElementById('ringFill').style.strokeDashoffset = circ - circ * pct / 100;
  document.getElementById('ringPct').textContent  = pct + '%';
  document.getElementById('ringSub').textContent  = done + ' of ' + total + ' complete';

  // count
  document.getElementById('countLbl').textContent =
    visible.length + ' task' + (visible.length !== 1 ? 's' : '');

  // list
  const list = document.getElementById('taskList');
  if (!visible.length) {
    list.innerHTML = `<div class="empty"><div class="big">✅</div>
      <p>${search ? 'No tasks match your search.' : 'No tasks yet. Add one above!'}</p></div>`;
    return;
  }

  list.innerHTML = visible.map(t => {
    const isOv = t.date && !t.done && new Date(t.date) < today;
    const dateStr = t.date
      ? new Date(t.date + 'T00:00:00').toLocaleDateString('en-IN', {month:'short',day:'numeric',year:'numeric'})
      : '';
    return `
    <div class="task-card ${t.done?'done':''}" data-cat="${esc(t.cat)}">
      <div class="tc-check ${t.done?'checked':''}" onclick="toggleDone('${t.id}')"></div>
      <div class="tc-body">
        <div class="tc-title">${esc(t.title)}</div>
        <div class="tc-meta">
          <span class="badge b-cat">${esc(t.cat)}</span>
          <span class="badge b-${t.pri.toLowerCase()}">${esc(t.pri)}</span>
          ${dateStr ? `<span class="tc-date ${isOv?'ov':''}">${isOv?'⚠ Overdue · ':''}${dateStr}</span>` : ''}
        </div>
      </div>
      <div class="tc-actions">
        <button class="ic-btn" onclick="openEdit('${t.id}')" title="Edit">✏</button>
        <button class="ic-btn del" onclick="deleteTask('${t.id}')" title="Delete">🗑</button>
      </div>
    </div>`;
  }).join('');
};

// ── SKELETON LOADER ───────────────────────────────────────
function showSkeletons() {
  document.getElementById('taskList').innerHTML = Array(3).fill(`
    <div class="skel">
      <div class="skel-box" style="width:19px;height:19px"></div>
      <div style="flex:1;display:flex;flex-direction:column;gap:.5rem">
        <div class="skel-box" style="height:13px;width:55%"></div>
        <div class="skel-box" style="height:10px;width:30%"></div>
      </div>
    </div>`).join('');
}

// ── LOGOUT ────────────────────────────────────────────────
window.handleLogout = async function () {
  if (unsubscribe) unsubscribe();
  await signOut(auth);
  window.location.href = 'login.html';
};

// ── TOAST ─────────────────────────────────────────────────
function toast(msg, err = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = 'show' + (err ? ' err' : '');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.className = '', 2800);
}

// ── KEYBOARD ──────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.activeElement?.id === 'taskInput') window.addTask();
  if (e.key === 'Escape') window.closeModal();
});

// Close modal on backdrop click
document.getElementById('editModal')?.addEventListener('click', e => {
  if (e.target === document.getElementById('editModal')) window.closeModal();
});

// Set default date
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('dateInput').valueAsDate = new Date();
});

// ── HELPER ────────────────────────────────────────────────
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
