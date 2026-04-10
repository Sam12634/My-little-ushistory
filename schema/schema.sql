-- ============================================================
-- U.S. History Alchemy Game - Database Schema
-- ============================================================

-- ===========================
-- 1. Elements Table
-- Stores every element in the game (base, first-tier, second-tier, etc.)
-- ===========================

create table if not exists elements (
  element_id uuid primary key default gen_random_uuid(),
  element_name text not null unique,
  tier int not null default 0,
  description text,
  created_at timestamp with time zone default now()
);

-- ===========================
-- 2. Combinations Table
-- Defines which two elements combine to create a new one.
-- Each combination references elements by ID.
-- ===========================

create table if not exists combinations (
  combo_id uuid primary key default gen_random_uuid(),
  element_a_id uuid not null references elements(element_id) on delete cascade,
  element_b_id uuid not null references elements(element_id) on delete cascade,
  result_id uuid not null references elements(element_id) on delete cascade,
  notes text,
  created_at timestamp with time zone default now(),

  -- Prevent duplicate recipes (A+B and B+A)
  constraint unique_combo_pair unique (element_a_id, element_b_id)
);

-- ===========================
-- 3. User Progress Table
-- Tracks which elements each user has unlocked.
-- ===========================

create table if not exists user_progress (
  progress_id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  element_id uuid not null references elements(element_id) on delete cascade,
  unlocked_at timestamp with time zone default now(),

  -- Prevent unlocking the same element twice
  constraint unique_user_element unique (user_id, element_id)
);

-- ============================================================
-- End of Schema
-- ============================================================
