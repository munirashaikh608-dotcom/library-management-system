// ---------- in-memory event store ----------
let events = [
  {
    id: crypto.randomUUID(),
    name: "Annual Tech Fest",
    date: "2026-09-12",
    time: "10:00",
    venue: "Main Auditorium",
    category: "Workshop",
    desc: "A day of coding contests, project showcases and guest talks."
  },
  {
    id: crypto.randomUUID(),
    name: "Cultural Night",
    date: "2026-09-20",
    time: "18:30",
    venue: "Open Air Theatre",
    category: "Cultural",
    desc: "Music, dance and drama performances by student clubs."
  }
];

// ---------- element refs ----------
const form        = document.getElementById("event-form");
const nameInput    = document.getElementById("ev-name");
const dateInput    = document.getElementById("ev-date");
const timeInput    = document.getElementById("ev-time");
const venueInput   = document.getElementById("ev-venue");
const catInput     = document.getElementById("ev-category");
const descInput    = document.getElementById("ev-desc");
const formMsg      = document.getElementById("form-msg");

const listEl       = document.getElementById("event-list");
const emptyState   = document.getElementById("empty-state");
const countBadge   = document.getElementById("event-count");
const searchInput  = document.getElementById("search-input");
const sortSelect   = document.getElementById("sort-select");

const modalBackdrop = document.getElementById("modal-backdrop");
const modalTitle     = document.getElementById("modal-title");
const modalMeta      = document.getElementById("modal-meta");
const modalDesc      = document.getElementById("modal-desc");
const modalDelete    = document.getElementById("modal-delete");
const modalClose     = document.getElementById("modal-close");
const modalCancel    = document.getElementById("modal-cancel");

let activeEventId = null;

// ---------- helpers ----------
const monthShort = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

function formatDateParts(isoDate){
  if(!isoDate) return { day: "--", mon: "" };
  const d = new Date(isoDate + "T00:00:00");
  return { day: String(d.getDate()).padStart(2,"0"), mon: monthShort[d.getMonth()] };
}

function formatDateLong(isoDate){
  if(!isoDate) return "No date set";
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString(undefined, { day:"numeric", month:"long", year:"numeric" });
}

function showMessage(text, isError=false){
  formMsg.textContent = text;
  formMsg.classList.toggle("error", isError);
  if(!isError){
    setTimeout(() => { if(formMsg.textContent === text) formMsg.textContent = ""; }, 2500);
  }
}

// ---------- ADD EVENT ----------
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const date = dateInput.value;

  if(!name || !date){
    showMessage("Event name and date are required.", true);
    return;
  }

  events.push({
    id: crypto.randomUUID(),
    name,
    date,
    time: timeInput.value,
    venue: venueInput.value.trim(),
    category: catInput.value,
    desc: descInput.value.trim()
  });

  form.reset();
  showMessage(`"${name}" was added.`);
  renderEvents();
});

// ---------- DISPLAY EVENTS ----------
function getFilteredSortedEvents(){
  const query = searchInput.value.trim().toLowerCase();

  let result = events.filter(ev => {
    if(!query) return true;
    return (
      ev.name.toLowerCase().includes(query) ||
      (ev.venue || "").toLowerCase().includes(query) ||
      (ev.category || "").toLowerCase().includes(query)
    );
  });

  const sortMode = sortSelect.value;
  result = result.slice().sort((a, b) => {
    if(sortMode === "name-asc") return a.name.localeCompare(b.name);
    if(sortMode === "date-desc") return (b.date || "").localeCompare(a.date || "");
    return (a.date || "").localeCompare(b.date || ""); // date-asc default
  });

  return result;
}

function renderEvents(){
  const list = getFilteredSortedEvents();
  listEl.innerHTML = "";

  const noEventsAtAll = events.length === 0;
  const noResults = list.length === 0 && !noEventsAtAll;

  emptyState.classList.toggle("show", noEventsAtAll);
  emptyState.querySelector("p").textContent = noEventsAtAll
    ? "No events yet — add your first one on the left."
    : "No matching events.";
  if(noResults) emptyState.classList.add("show");

  countBadge.textContent = `${events.length} event${events.length === 1 ? "" : "s"}`;

  list.forEach(ev => {
    const { day, mon } = formatDateParts(ev.date);

    const card = document.createElement("article");
    card.className = "event-card";
    card.dataset.id = ev.id;
    card.innerHTML = `
      <div class="card-date">
        <span class="day">${day}</span>
        <span class="mon">${mon}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${escapeHtml(ev.name)}</h3>
        <div class="card-meta">
          ${ev.venue ? `<span>📍 ${escapeHtml(ev.venue)}</span>` : ""}
          ${ev.time ? `<span>🕒 ${ev.time}</span>` : ""}
        </div>
        <span class="card-tag">${escapeHtml(ev.category || "General")}</span>
      </div>
      <div class="card-actions">
        <button class="icon-btn" data-action="delete" title="Delete event">🗑</button>
      </div>
    `;
    card.addEventListener("click", (e) => {
      if(e.target.closest('[data-action="delete"]')){
        e.stopPropagation();
        deleteEvent(ev.id);
        return;
      }
      openModal(ev.id);
    });
    listEl.appendChild(card);
  });
}

function escapeHtml(str=""){
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---------- SEARCH EVENT ----------
searchInput.addEventListener("input", renderEvents);
sortSelect.addEventListener("change", renderEvents);

// ---------- DELETE EVENT ----------
function deleteEvent(id){
  const ev = events.find(e => e.id === id);
  events = events.filter(e => e.id !== id);
  renderEvents();
  closeModal();
  if(ev) showMessage(`"${ev.name}" was deleted.`);
}

// ---------- EVENT DETAIL MODAL ----------
function openModal(id){
  const ev = events.find(e => e.id === id);
  if(!ev) return;
  activeEventId = id;

  modalTitle.textContent = ev.name;
  modalMeta.innerHTML = `
    <dt>Date</dt><dd>${formatDateLong(ev.date)}</dd>
    ${ev.time ? `<dt>Time</dt><dd>${ev.time}</dd>` : ""}
    ${ev.venue ? `<dt>Venue</dt><dd>${escapeHtml(ev.venue)}</dd>` : ""}
    <dt>Category</dt><dd>${escapeHtml(ev.category || "General")}</dd>
  `;
  modalDesc.textContent = ev.desc || "No additional description provided.";

  modalBackdrop.classList.add("show");
}

function closeModal(){
  modalBackdrop.classList.remove("show");
  activeEventId = null;
}

modalClose.addEventListener("click", closeModal);
modalCancel.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", (e) => {
  if(e.target === modalBackdrop) closeModal();
});
modalDelete.addEventListener("click", () => {
  if(activeEventId) deleteEvent(activeEventId);
});
document.addEventListener("keydown", (e) => {
  if(e.key === "Escape") closeModal();
});

// ---------- init ----------
renderEvents();
