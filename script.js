const els = {
  taskForm: document.getElementById("taskForm"),
  title: document.getElementById("title"),
  note: document.getElementById("note"),
  priority: document.getElementById("priority"),
  due: document.getElementById("due"),

  list: document.getElementById("list"),
  emptyState: document.getElementById("emptyState"),

  pills: Array.from(document.querySelectorAll(".pill")),
  search: document.getElementById("search"),

  totalChip: document.getElementById("totalChip"),
  activeChip: document.getElementById("activeChip"),
  doneChip: document.getElementById("doneChip"),

  themeBtn: document.getElementById("themeBtn"),
  clearBtn: document.getElementById("clearBtn"),

  modal: document.getElementById("modal"),
  closeModal: document.getElementById("closeModal"),
  editTitle: document.getElementById("editTitle"),
  editNote: document.getElementById("editNote"),
  editPriority: document.getElementById("editPriority"),
  editDue: document.getElementById("editDue"),
  saveEdit: document.getElementById("saveEdit"),
  deleteFromModal: document.getElementById("deleteFromModal"),
};

const STORAGE_KEY = "taskmate.tasks.v1";
const THEME_KEY = "taskmate.theme.v1";

let state = {
  tasks: [],
  filter: "all",   // all | active | done
  query: "",
  editingId: null
};

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const theme = localStorage.getItem(THEME_KEY);
    if (raw) state.tasks = JSON.parse(raw) || [];
    if (theme) setTheme(theme);
    else setTheme("dark");
  } catch {
    state.tasks = [];
    setTheme("dark");
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
}

function setTheme(theme) {
  if (theme === "light") document.documentElement.setAttribute("data-theme", "light");
  else document.documentElement.removeAttribute("data-theme");

  localStorage.setItem(THEME_KEY, theme);
  els.themeBtn.innerHTML = theme === "light" ? "🌙 <span class='hide-sm'>Theme</span>" : "☀️ <span class='hide-sm'>Theme</span>";
}

function toggleTheme() {
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  setTheme(isLight ? "dark" : "light");
}

function formatDue(due) {
  if (!due) return "";
  // yyyy-mm-dd -> readable
  const [y, m, d] = due.split("-").map(Number);
  if (!y || !m || !d) return due;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function matchesQuery(task, q) {
  if (!q) return true;
  const hay = `${task.title} ${task.note || ""}`.toLowerCase();
  return hay.includes(q.toLowerCase());
}

function getVisibleTasks() {
  let tasks = [...state.tasks];

  if (state.filter === "active") tasks = tasks.filter(t => !t.done);
  if (state.filter === "done") tasks = tasks.filter(t => t.done);

  if (state.query) tasks = tasks.filter(t => matchesQuery(t, state.query));

  // Sort: done last, then due sooner, then createdAt desc
  tasks.sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const ad = a.due ? a.due : "9999-12-31";
    const bd = b.due ? b.due : "9999-12-31";
    if (ad !== bd) return ad.localeCompare(bd);
    return b.createdAt - a.createdAt;
  });

  return tasks;
}

function updateStats() {
  const total = state.tasks.length;
  const done = state.tasks.filter(t => t.done).length;
  const active = total - done;

  els.totalChip.textContent = `Total: ${total}`;
  els.activeChip.textContent = `Active: ${active}`;
  els.doneChip.textContent = `Done: ${done}`;
}

function render() {
  const visible = getVisibleTasks();
  els.list.innerHTML = "";

  if (state.tasks.length === 0) {
    els.emptyState.style.display = "block";
  } else {
    els.emptyState.style.display = visible.length === 0 ? "block" : "none";
  }

  visible.forEach(task => {
    const li = document.createElement("li");
    li.className = `item ${task.done ? "done" : ""}`;
    li.dataset.id = task.id;

    li.innerHTML = `
      <div class="item-top">
        <div class="item-title">
          <button class="checkbox ${task.done ? "is-checked" : ""}" type="button" data-action="toggle" aria-label="Toggle done">
            <span>${task.done ? "✓" : ""}</span>
          </button>

          <div class="title-wrap">
            <p class="title">${escapeHtml(task.title)}</p>
            ${task.note ? `<p class="note">${escapeHtml(task.note)}</p>` : `<p class="note muted">No note</p>`}
          </div>
        </div>

        <div class="item-actions">
          <button class="icon-btn" type="button" data-action="edit" aria-label="Edit">✏️</button>
          <button class="icon-btn" type="button" data-action="delete" aria-label="Delete">🗑️</button>
        </div>
      </div>

      <div class="meta">
        <div class="badges">
          <span class="badge ${task.priority}">Priority: ${task.priority}</span>
          ${task.due ? `<span class="badge">Due: ${escapeHtml(formatDue(task.due))}</span>` : `<span class="badge">No due</span>`}
        </div>
        <span class="badge">Created: ${new Date(task.createdAt).toLocaleString()}</span>
      </div>
    `;

    els.list.appendChild(li);
  });

  updateStats();
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function addTask({ title, note, priority, due }) {
  const task = {
    id: uid(),
    title: title.trim(),
    note: note.trim(),
    priority,
    due: due || "",
    done: false,
    createdAt: Date.now()
  };
  state.tasks.unshift(task);
  save();
  render();
}

function toggleDone(id) {
  const t = state.tasks.find(x => x.id === id);
  if (!t) return;
  t.done = !t.done;
  save();
  render();
}

function deleteTask(id) {
  state.tasks = state.tasks.filter(x => x.id !== id);
  save();
  render();
}

function openModal(id) {
  const t = state.tasks.find(x => x.id === id);
  if (!t) return;

  state.editingId = id;
  els.editTitle.value = t.title;
  els.editNote.value = t.note || "";
  els.editPriority.value = t.priority;
  els.editDue.value = t.due || "";

  els.modal.classList.add("is-open");
  els.modal.setAttribute("aria-hidden", "false");
  els.editTitle.focus();
}

function closeModal() {
  state.editingId = null;
  els.modal.classList.remove("is-open");
  els.modal.setAttribute("aria-hidden", "true");
}

function saveEdit() {
  const id = state.editingId;
  const t = state.tasks.find(x => x.id === id);
  if (!t) return;

  const title = els.editTitle.value.trim();
  if (!title) {
    els.editTitle.focus();
    return;
  }

  t.title = title;
  t.note = els.editNote.value.trim();
  t.priority = els.editPriority.value;
  t.due = els.editDue.value || "";

  save();
  closeModal();
  render();
}

function clearAll() {
  if (state.tasks.length === 0) return;
  const ok = confirm("Clear all tasks? This cannot be undone.");
  if (!ok) return;
  state.tasks = [];
  save();
  render();
}

function setFilter(filter) {
  state.filter = filter;
  els.pills.forEach(p => p.classList.toggle("is-active", p.dataset.filter === filter));
  render();
}

/* Events */
els.taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = els.title.value.trim();
  if (!title) return;

  addTask({
    title,
    note: els.note.value,
    priority: els.priority.value,
    due: els.due.value
  });

  els.taskForm.reset();
  els.priority.value = "medium";
  els.title.focus();
});

els.list.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const li = e.target.closest(".item");
  if (!li) return;

  const id = li.dataset.id;
  const action = btn.dataset.action;

  if (action === "toggle") toggleDone(id);
  if (action === "delete") deleteTask(id);
  if (action === "edit") openModal(id);
});

els.pills.forEach(p => {
  p.addEventListener("click", () => setFilter(p.dataset.filter));
});

els.search.addEventListener("input", (e) => {
  state.query = e.target.value.trim();
  render();
});

els.themeBtn.addEventListener("click", toggleTheme);
els.clearBtn.addEventListener("click", clearAll);

els.closeModal.addEventListener("click", closeModal);
els.modal.addEventListener("click", (e) => {
  if (e.target === els.modal) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    els.search.focus();
  }
});

els.saveEdit.addEventListener("click", saveEdit);
els.deleteFromModal.addEventListener("click", () => {
  if (!state.editingId) return;
  deleteTask(state.editingId);
  closeModal();
});

/* Init */
load();
render();
