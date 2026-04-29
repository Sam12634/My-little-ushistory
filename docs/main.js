// main.js
import supabase from "./supabaseClient.js";

// If you keep a local elements.js, import it. If not, leave this commented.
// import { elements as localElements } from "./elements.js";

// -----------------------------
// Config
// -----------------------------
const USE_ELEMENTS_FROM_SUPABASE = true; // set false to use local elements array

// -----------------------------
// Game state
// -----------------------------
let elements = []; // will be populated from Supabase or local
let combinations = []; // will be populated from Supabase
const comboLookup = {}; // normalized key -> combo_id
let selectedA = null;
let selectedB = null;

let currentComboId = null;
let currentHintLevel = 0;
let currentHints = [];

// -----------------------------
// Utilities
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
async function fetchCombinationsFromSupabase() {
  const { data, error } = await supabase
    .from("combinations")
    .select("elementA, elementB, combo_id, result");

  if (error) {
    console.error("Error fetching combinations:", error);
    return [];
  }
  return data || [];
}

async function fetchElementsFromSupabase() {
  const { data, error } = await supabase
    .from("elements")
    .select("id, name");

  if (error) {
    console.error("Error fetching elements:", error);
    return [];
  }
  return data || [];
}

async function getHintsForCombo(comboId) {
  if (!comboId) return [];
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
// Build lookup and render
// -----------------------------
function buildComboLookup() {
  comboLookup = {}; // reset (reassign below)
  // eslint-disable-next-line no-unused-vars
  for (const c of combinations) {
    const key = normalizeCombo(c.elementA, c.elementB);
    comboLookup[key] = c.combo_id;
  }
}

function renderElements() {
  const container = document.getElementById("elements-container");
  if (!container) return;
  container.innerHTML = "";

  elements.forEach((el) => {
    const btn = document.createElement("button");
    btn.className = "element-button";
    btn.innerText = el.name;
    btn.addEventListener("click", () => {
      selectElement(el.name);
    });
    container.appendChild(btn);
  });
}

// -----------------------------
// Selection and combine logic
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

  // Reset hint state for this new combo attempt
  currentHintLevel = 0;
  currentHints = [];
  displayHint("");

  // Find result
  const result = combinations.find(
    (c) =>
      (c.elementA === selectedA && c.elementB === selectedB) ||
      (c.elementA === selectedB && c.elementB === selectedA)
  );

  if (result) {
    // Replace with your in-game discovery flow
    alert(`You discovered: ${result.result}`);
  } else {
    alert("No discovery found.");
  }

  resetSelectionUI();
}

// -----------------------------
// Hint handler
// -----------------------------
async function handleHintButton() {
  if (!currentComboId) {
    displayHint("Try combining elements first to get a relevant hint.");
    return;
  }

  if (currentHints.length === 0) {
    currentHints = await getHintsForCombo(currentComboId);
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
async function init() {
  try {
    // Load combinations from Supabase
    combinations = await fetchCombinationsFromSupabase();

    // Load elements either from Supabase or local fallback
    if (USE_ELEMENTS_FROM_SUPABASE) {
      elements = await fetchElementsFromSupabase();
      // If table stores id and name, ensure name exists
      elements = elements.map(e => ({ id: e.id, name: e.name }));
    } else {
      // If you keep a local elements.js, uncomment the import at top and use:
      // elements = localElements;
      elements = [
        { id: "colonies", name: "Colonies" },
        { id: "revolution", name: "Revolution" }
      ];
    }

    // Build lookup and render UI
    buildComboLookup();
    renderElements();

    // Hook up buttons
    const combineBtn = document.getElementById("combineButton");
    if (combineBtn) combineBtn.addEventListener("click", handleCombine);

    const hintBtn = document.getElementById("hintButton");
    if (hintBtn) hintBtn.addEventListener("click", handleHintButton);

    updateSelectedDisplay();
  } catch (err) {
    console.error("Initialization error:", err);
    displayHint("Initialization failed. Check console for details.");
  }
}

document.addEventListener("DOMContentLoaded", init);
