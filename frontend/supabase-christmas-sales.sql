-- Non-destructive upgrade. Existing collections, prices and deletions stay intact.
-- Seed the existing two campaign selections only when the column is first added.
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products'
      and column_name = 'in_christmas_sale'
  ) then
    alter table public.products
      add column in_christmas_sale boolean not null default false;
    update public.products
      set in_christmas_sale = true
      where id in (11, 112)
        and coalesce(is_deleted, false) = false
        and coalesce(show_in_catalog, true) = true;
  end if;
end;
$$;

notify pgrst, 'reload schema';
