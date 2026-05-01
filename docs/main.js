// main.js
// Supabase-first, local fallback, UUID-aware, tier-grouped UI

import supabase from "./src/utils/supabaseClient.js";
import { elements as localElements } from "./src/game/elements.js";
import { combinations as localCombinations } from "./src/game/combinations.js";

// -----------------------------
// Config
// -----------------------------
const USE_SUPABASE = true; // always try Supabase first

// -----------------------------
// Game state
// -----------------------------
let elements = [];          // full element objects
let combinations = [];      // full combination objects
let nameMap = {};           // uuid → element_name
let comboLookup = {};       // "A-B" → combo_id

let selectedA = null;
let selectedB = null;

let currentComboId = null;
let currentHintLevel = 0;
let currentHints = [];

// -----------------------------
// Utility helpers
// -----------------------------
function normalizeCombo(a, b) {
  return [a, b].sort().join("-");
}

function displayHint(text) {
  const el = document.getElementById("hintDisplay");
  if (el) el.innerText = text || "";
}

function updateSelectedDisplay() {
  const el = document.getElementById("selected-elements");
  if (el) el.innerText = `${selectedA || ""} ${selectedB || ""}`.trim();
}

// -----------------------------
// Supabase fetchers
// -----------------------------
async function fetchElementsFromSupabase() {
  const { data, error } = await supabase
    .from("elements")
    .select("element_id, element_name, tier, description");

  if (error) {
    console.error("Error fetching elements:", error);
    return null;
  }
  return data;
}

async function fetchCombinationsFromSupabase() {
  const { data, error } = await supabase
    .from("combinations")
    .select("combo_id, element_a_id, element_b_id, result_id, notes");

  if (error) {
    console.error("Error fetching combinations:", error);
    return null;
  }
  return data;
}

async function fetchHints(comboId) {
  const { data, error } = await supabase
    .from("hints")
    .select("hint_level, hint_text")
    .eq("combo_id", comboId)
    .order("hint_level", { ascending: true });

  if (error) {
    console.error("Error fetching hints:", error);
    return [];
  }
  return data || [];
}

// -----------------------------
// Data transformation
// -----------------------------
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

function buildComboLookup(nameBasedCombos) {
  comboLookup = {};
  for (const c of nameBasedCombos) {
    const key = normalizeCombo(c.elementA, c.elementB);
    comboLookup[key] = c.combo_id;
  }
}

// -----------------------------
// UI Rendering
// -----------------------------
function renderElementsTierGrouped() {
  const container = document.getElementById("elements-container");
  if (!container) return;

  container.innerHTML = "";

  // Group elements by tier
  const tiers = {};
  for (const el of elements) {
    if (!tiers[el.tier]) tiers[el.tier] = [];
    tiers[el.tier].push(el);
  }

  // Sort tiers numerically
  const sortedTierKeys = Object.keys(tiers).sort((a, b) => Number(a) - Number(b));

  for (const tier of sortedTierKeys) {
    const header = document.createElement("h2");
    header.innerText = `Tier ${tier}`;
    container.appendChild(header);

    const groupDiv = document.createElement("div");
    groupDiv.className = "tier-group";

    tiers[tier].forEach((el) => {
      const btn = document.createElement("button");
      btn.className = "element-button";
      btn.innerText = el.element_name;
      btn.addEventListener("click", () => selectElement(el.element_name));
      groupDiv.appendChild(btn);
    });

    container.appendChild(groupDiv);
  }
}

// -----------------------------
// Selection & Combine Logic
// -----------------------------
function selectElement(name) {
  if (!selectedA) {
    selectedA = name;
  } else if (!selectedB) {
    if (selectedA === name) {
      selectedA = null;
    } else {
      selectedB = name;
    }
  } else {
    selectedA = name;
    selectedB = null;
  }
  updateSelectedDisplay();
}

function resetSelectionUI() {
  selectedA = null;
  selectedB = null;
  updateSelectedDisplay();
}

function handleCombine() {
  if (!selectedA || !selectedB) return;

  const key = normalizeCombo(selectedA, selectedB);
  currentComboId = comboLookup[key] || null;

  currentHintLevel = 0;
  currentHints = [];
  displayHint("");

  const result = combinationsNameBased.find(
    (c) =>
      (c.elementA === selectedA && c.elementB === selectedB) ||
      (c.elementA === selectedB && c.elementB === selectedA)
  );

  if (result) {
    alert(`You discovered: ${result.result}`);
  } else {
    alert("No discovery found.");
  }

  resetSelectionUI();
}

// -----------------------------
// Hint Logic
// -----------------------------
async function handleHintButton() {
  if (!currentComboId) {
    displayHint("Try combining elements first to get a relevant hint.");
    return;
  }

  if (currentHints.length === 0) {
    currentHints = await fetchHints(currentComboId);
  }

  if (currentHintLevel < currentHints.length) {
    const hint = currentHints[currentHintLevel];
    displayHint(hint.hint_text);
    currentHintLevel++;
  } else {
    displayHint("No more hints available for this combo.");
  }
}

// -----------------------------
// Initialization
// -----------------------------
let combinationsNameBased = [];

async function init() {
  try {
    let fetchedElements = null;
    let fetchedCombos = null;

    if (USE_SUPABASE) {
      fetchedElements = await fetchElementsFromSupabase();
      fetchedCombos = await fetchCombinationsFromSupabase();
    }

    // Fallback logic
    elements = fetchedElements || localElements;
    combinations = fetchedCombos || localCombinations;

    buildNameMap();

    combinationsNameBased = convertCombinationsToNameBased();
    buildComboLookup(combinationsNameBased);

    renderElementsTierGrouped();

    document.getElementById("combineButton").addEventListener("click", handleCombine);
    document.getElementById("hintButton").addEventListener("click", handleHintButton);

    updateSelectedDisplay();
  } catch (err) {
    console.error("Initialization error:", err);
    displayHint("Initialization failed. Check console for details.");
  }
}

document.addEventListener("DOMContentLoaded", init);
