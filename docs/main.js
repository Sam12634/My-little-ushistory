// main.js
// Full game logic: Supabase, save system, drag & drop, hints, discovery tracking

import supabase from "./src/utils/supabaseClient.js";
import { loadUsername, saveUsername, loadProgress, saveDiscovery, syncLocalToSupabase } from "./src/utils/saveSystem.js";
import { elements as localElements } from "./src/game/elements.js";
import { combinations as localCombinations } from "./src/game/combinations.js";

// --------------------------------------------------
// Game State
// --------------------------------------------------
let username = null;
let elements = [];
let combinations = [];
let nameMap = {};
let combinationsNameBased = [];
let comboLookup = {};
let discoveredElements = [];

let slotA = null;
let slotB = null;

let currentComboId = null;
let currentHintLevel = 0;
let currentHints = [];

// --------------------------------------------------
// Utility
// --------------------------------------------------
function normalizeCombo(a, b) {
  return [a, b].sort().join("-");
}

function displayHint(text) {
  const el = document.getElementById("hintDisplay");
  if (el) el.innerText = text || "";
}

// --------------------------------------------------
// Username Modal
// --------------------------------------------------
function showUsernameModal() {
  document.getElementById("username-modal").style.display = "flex";
}

function hideUsernameModal() {
  document.getElementById("username-modal").style.display = "none";
}

function setupUsernameModal() {
  const saved = loadUsername();
  if (saved) {
    username = saved;
    hideUsernameModal();
    return;
  }

  showUsernameModal();

  document.getElementById("username-submit").addEventListener("click", () => {
    const input = document.getElementById("username-input").value.trim();
    if (input.length > 0) {
      username = input;
      saveUsername(input);
      hideUsernameModal();
      initAfterUsername();
    }
  });
}

// --------------------------------------------------
// Supabase Fetchers
// --------------------------------------------------
async function fetchElementsFromSupabase() {
  const { data, error } = await supabase
    .from("elements")
    .select("element_id, element_name, tier, description");

  if (error) return null;
  return data;
}

async function fetchCombinationsFromSupabase() {
  const { data, error } = await supabase
    .from("combinations")
    .select("combo_id, element_a_id, element_b_id, result_id, notes");

  if (error) return null;
  return data;
}

async function fetchHints(comboId) {
  const { data, error } = await supabase
    .from("hints")
    .select("hint_level, hint_text")
    .eq("combo_id", comboId)
    .order("hint_level", { ascending: true });

  if (error) return [];
  return data || [];
}

// --------------------------------------------------
// Data Processing
// --------------------------------------------------
function buildNameMap() {
  nameMap = {};
  for (const el of elements) {
    nameMap[el.element_id] = el.element_name;
  }
}

function convertCombinationsToNameBased() {
  const converted = [];

  for (const c of combinations) {
    const aName = nameMap[c.element_a_id];
    const bName = nameMap[c.element_b_id];
    const rName = nameMap[c.result_id];

    if (!aName || !bName || !rName) continue;

    converted.push({
      combo_id: c.combo_id,
      elementA: aName,
      elementB: bName,
      result: rName,
      notes: c.notes
    });
  }

  return converted;
}

function buildComboLookup(nameBased) {
  comboLookup = {};
  for (const c of nameBased) {
    const key = normalizeCombo(c.elementA, c.elementB);
    comboLookup[key] = c.combo_id;
  }
}

// --------------------------------------------------
// Sidebar Rendering
// --------------------------------------------------
function renderSidebar() {
  const container = document.getElementById("sidebar-elements");
  container.innerHTML = "";

  // Group by tier
  const tiers = {};
  for (const el of elements) {
    if (!tiers[el.tier]) tiers[el.tier] = [];
    tiers[el.tier].push(el);
  }

  const sortedTiers = Object.keys(tiers).sort((a, b) => Number(a) - Number(b));

  for (const tier of sortedTiers) {
    const header = document.createElement("h3");
    header.innerText = `Tier ${tier}`;
    container.appendChild(header);

    tiers[tier].forEach((el) => {
      const div = document.createElement("div");
      div.className = "sidebar-element";
      div.innerText = el.element_name;
      div.draggable = true;

      div.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", el.element_name);
      });

      container.appendChild(div);
    });
  }
}

// --------------------------------------------------
// Drag & Drop Logic
// --------------------------------------------------
function setupDropZone() {
  const dropZone = document.getElementById("drop-zone");
  const slotAEl = document.getElementById("slotA");
  const slotBEl = document.getElementById("slotB");

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("drag-over");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("drag-over");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("drag-over");

    const name = e.dataTransfer.getData("text/plain");
    if (!slotA) {
      slotA = name;
      slotAEl.innerText = name;
      slotAEl.classList.add("filled");
    } else if (!slotB) {
      slotB = name;
      slotBEl.innerText = name;
      slotBEl.classList.add("filled");
    }
  });
}

// --------------------------------------------------
// Combine Logic
// --------------------------------------------------
function clearSlots() {
  slotA = null;
  slotB = null;

  const slotAEl = document.getElementById("slotA");
  const slotBEl = document.getElementById("slotB");

  slotAEl.innerText = "Drop first element";
  slotBEl.innerText = "Drop second element";

  slotAEl.classList.remove("filled");
  slotBEl.classList.remove("filled");
}

async function handleCombine() {
  if (!slotA || !slotB) return;

  const key = normalizeCombo(slotA, slotB);
  currentComboId = comboLookup[key] || null;

  currentHintLevel = 0;
  currentHints = [];
  displayHint("");

  const result = combinationsNameBased.find(
    (c) =>
      (c.elementA === slotA && c.elementB === slotB) ||
      (c.elementA === slotB && c.elementB === slotA)
  );

  if (result) {
    alert(`You discovered: ${result.result}`);

    // Save discovery
    const resultId = Object.keys(nameMap).find(
      (id) => nameMap[id] === result.result
    );
    if (resultId) {
      await saveDiscovery(username, resultId);
    }
  } else {
    alert("No discovery found.");
  }

  clearSlots();
}

// --------------------------------------------------
// Hint Logic
// --------------------------------------------------
async function handleHint() {
  if (!currentComboId) {
    displayHint("Try combining elements first.");
    return;
  }

  if (currentHints.length === 0) {
    currentHints = await fetchHints(currentComboId);
  }

  if (currentHintLevel < currentHints.length) {
    displayHint(currentHints[currentHintLevel].hint_text);
    currentHintLevel++;
  } else {
    displayHint("No more hints available.");
  }
}

// --------------------------------------------------
// Initialization
// --------------------------------------------------
async function initAfterUsername() {
  await syncLocalToSupabase(username);

  let fetchedElements = await fetchElementsFromSupabase();
  let fetchedCombos = await fetchCombinationsFromSupabase();

  elements = fetchedElements || localElements;
  combinations = fetchedCombos || localCombinations;

  buildNameMap();
  combinationsNameBased = convertCombinationsToNameBased();
  buildComboLookup(combinationsNameBased);

  discoveredElements = await loadProgress(username);

  renderSidebar();
  setupDropZone();

  document.getElementById("combineButton").addEventListener("click", handleCombine);
  document.getElementById("hintButton").addEventListener("click", handleHint);
}

document.addEventListener("DOMContentLoaded", () => {
  setupUsernameModal();
  if (username) initAfterUsername();
});
