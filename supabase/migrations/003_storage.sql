insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('shop-assets', 'shop-assets', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');
create policy "Anyone can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');
create policy "Authenticated users can upload shop assets"
  on storage.objects for insert
  with check (bucket_id = 'shop-assets' and auth.role() = 'authenticated');
create policy "Anyone can view shop assets"
  on storage.objects for select
  using (bucket_id = 'shop-assets');
create policy "Users can update own uploads"
  on storage.objects for update
  using (auth.role() = 'authenticated');
create policy "Users can delete own uploads"
  on storage.objects for delete
  using (auth.role() = 'authenticated');
