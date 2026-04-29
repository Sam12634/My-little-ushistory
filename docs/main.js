// -----------------------------
// Import Supabase client
// -----------------------------
import supabase from "./supabaseClient.js";

// -----------------------------
// Game State
// -----------------------------
let selectedA = null;
let selectedB = null;

let currentComboId = null;
let currentHintLevel = 0;
let currentHints = [];

// -----------------------------
// Normalize combo (A+B == B+A)
// -----------------------------
function normalizeCombo(a, b) {
    return [a, b].sort().join("-");
}

// -----------------------------
// Build combo lookup table
// -----------------------------
const comboLookup = {};

combinations.forEach(combo => {
    const key = normalizeCombo(combo.elementA, combo.elementB);
    comboLookup[key] = combo.combo_id;
});

// -----------------------------
// Fetch hints from Supabase
// -----------------------------
async function getHintsForCombo(comboId) {
    const { data, error } = await supabase
        .from("hints")
        .select("*")
        .eq("combo_id", comboId)
        .order("hint_level", { ascending: true });

    if (error) {
        console.error("Error fetching hints:", error);
        return [];
    }

    return data;
}

// -----------------------------
// UI: Display a hint
// -----------------------------
function displayHint(text) {
    document.getElementById("hintDisplay").innerText = text;
}

// -----------------------------
// Handle hint button click
// -----------------------------
document.getElementById("hintButton").addEventListener("click", async () => {
    if (!currentComboId) return;

    // Load hints if not loaded yet
    if (currentHints.length === 0) {
        currentHints = await getHintsForCombo(currentComboId);
    }

    // Reveal next hint
    if (currentHintLevel < currentHints.length) {
        const hint = currentHints[currentHintLevel];
        displayHint(hint.hint_text);
        currentHintLevel++;
    }
});

// -----------------------------
// Handle combining elements
// -----------------------------
document.getElementById("combineButton").addEventListener("click", () => {
    if (!selectedA || !selectedB) return;

    const key = normalizeCombo(selectedA, selectedB);
    currentComboId = comboLookup[key];

    // Reset hint state for new combo
    currentHintLevel = 0;
    currentHints = [];
    displayHint("");

    // Your existing combination logic:
    const result = combinations.find(
        c =>
            (c.elementA === selectedA && c.elementB === selectedB) ||
            (c.elementA === selectedB && c.elementB === selectedA)
    );

    if (result) {
        alert(`You discovered: ${result.result}`);
    } else {
        alert("No discovery found.");
    }

    // Reset selections
    selectedA = null;
    selectedB = null;
    document.getElementById("selected-elements").innerText = "";
});

// -----------------------------
// Element selection logic
// -----------------------------
function selectElement(name) {
    if (!selectedA) {
        selectedA = name;
    } else if (!selectedB) {
        selectedB = name;
    }

    document.getElementById("selected-elements").innerText =
        `${selectedA || ""} ${selectedB || ""}`;
}

// Render elements
const container = document.getElementById("elements-container");
elements.forEach(el => {
    const btn = document.createElement("button");
    btn.innerText = el.name;
    btn.addEventListener("click", () => selectElement(el.name));
    container.appendChild(btn);
});
