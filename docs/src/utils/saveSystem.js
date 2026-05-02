// src/utils/saveSystem.js

import supabase from "./supabaseClient.js";

const USERNAME_KEY = "mlh_username";
const LOCAL_PROGRESS_KEY = "mlh_local_progress";

// -----------------------------
// Username handling
// -----------------------------
export function loadUsername() {
  return localStorage.getItem(USERNAME_KEY);
}

export function saveUsername(name) {
  localStorage.setItem(USERNAME_KEY, name);
}

// -----------------------------
// Local fallback progress
// -----------------------------
function loadLocalProgress() {
  const raw = localStorage.getItem(LOCAL_PROGRESS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveLocalProgress(progress) {
  localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(progress));
}

// -----------------------------
// Supabase progress
// -----------------------------
export async function loadProgress(username) {
  const { data, error } = await supabase
    .from("player_progress")
    .select("element_id, discovered_at")
    .eq("username", username);

  if (error) {
    console.warn("Supabase offline, using local progress");
    return loadLocalProgress();
  }

  return data || [];
}

export async function saveDiscovery(username, elementId) {
  // Save locally first
  const local = loadLocalProgress();
  if (!local.find((e) => e.element_id === elementId)) {
    local.push({ element_id: elementId, discovered_at: new Date().toISOString() });
    saveLocalProgress(local);
  }

  // Try Supabase
  const { error } = await supabase.from("player_progress").insert({
    username,
    element_id: elementId
  });

  if (error) {
    console.warn("Supabase save failed, will sync later");
  }
}

// -----------------------------
// Sync offline progress
// -----------------------------
export async function syncLocalToSupabase(username) {
  const local = loadLocalProgress();
  if (local.length === 0) return;

  for (const entry of local) {
    await supabase.from("player_progress").insert({
      username,
      element_id: entry.element_id,
      discovered_at: entry.discovered_at
    });
  }

  // Clear local cache after sync
  saveLocalProgress([]);
}
