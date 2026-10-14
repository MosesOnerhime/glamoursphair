-- Run once in this project's Supabase SQL editor before using placement controls.
-- Restores the existing inventory requested for the full products page.
-- Existing names, prices, photographs and descriptions are preserved.
begin;

alter table public.products
  add column if not exists show_on_homepage boolean,
  add column if not exists show_in_catalog boolean not null default true;

update public.products
set is_deleted = false
where is_deleted = true;

commit;

-- A NULL homepage value uses the storefront's six legacy featured product IDs.
-- Admin edits write explicit true/false values. New products default to shop only.
-- Do not rerun the restoration UPDATE after intentionally deleting products.
