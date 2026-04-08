create table elements (
  element_id uuid primary key default gen_random_uuid(),
  element_name text not null,
  tier int not null,
  description text,
  created_at timestamp default now()
);

create table combinations (
  combo_id uuid primary key default gen_random_uuid(),
  element_a_id uuid references elements(element_id),
  element_b_id uuid references elements(element_id),
  result_id uuid references elements(element_id),
  notes text
);

create table user_progress (
  progress_id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  element_id uuid references elements(element_id),
  unlocked_at timestamp default now()
);
