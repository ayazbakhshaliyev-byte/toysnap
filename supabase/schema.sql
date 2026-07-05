-- =========================================================
-- WEDDING PHOTO VOTE — SCHEMA
-- Использует Supabase Auth (анонимный вход) вместо самодельных
-- session_id — это даёт настоящую защищённую сессию "из коробки"
-- =========================================================

create extension if not exists "pgcrypto";

-- ---------- EVENTS (свадьбы) ----------
create table events (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,                -- "SOFIA-JAMES-2026", видно в URL
  title text not null,                      -- "София и Джеймс"
  is_active boolean default true,
  winner_photo_id uuid,                     -- ссылка добавится ниже, после создания photos
  created_at timestamptz default now()
);

-- ---------- GUESTS (гости) ----------
-- id гостя = id пользователя Supabase Auth (анонимная сессия).
-- Это заменяет собственноручный session_id: токен сессии выпускает
-- и обновляет сам Supabase, его нельзя подделать без ключей проекта.
create table guests (
  id uuid primary key references auth.users(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  full_name text not null,
  created_at timestamptz default now(),
  last_active_at timestamptz default now()
);

create index idx_guests_event on guests(event_id);

-- ---------- PHOTOS ----------
create table photos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  guest_id uuid not null references guests(id) on delete cascade,
  image_path text not null,        -- путь в Storage, не полный URL
  thumbnail_path text,
  likes_count integer not null default 0,
  is_hidden boolean not null default false,  -- модерация: скрыть без удаления
  is_winner boolean not null default false,
  created_at timestamptz default now()
);

create index idx_photos_event_id on photos(event_id);
create index idx_photos_likes_count on photos(likes_count desc);
create index idx_photos_guest on photos(guest_id);

alter table events
  add constraint fk_winner_photo foreign key (winner_photo_id) references photos(id);

-- ---------- LIKES ----------
create table likes (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references photos(id) on delete cascade,
  guest_id uuid not null references guests(id) on delete cascade,
  created_at timestamptz default now(),
  unique (photo_id, guest_id)   -- один гость — один лайк на фото
);

create index idx_likes_photo_guest on likes(photo_id, guest_id);

-- ---------- ADMINS (организаторы) ----------
-- Отдельная роль поверх обычного Supabase Auth (email+пароль).
-- Один организатор может вести несколько событий.
create table admins (
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, event_id)
);

-- =========================================================
-- ТРИГГЕРЫ
-- =========================================================

-- Счётчик лайков считается в БД, а не в приложении —
-- так он не "разъедется" при параллельных запросах.
create or replace function bump_likes_count() returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update photos set likes_count = likes_count + 1 where id = new.photo_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update photos set likes_count = greatest(likes_count - 1, 0) where id = old.photo_id;
    return old;
  end if;
end;
$$ language plpgsql security definer;

create trigger trg_likes_insert after insert on likes
  for each row execute function bump_likes_count();
create trigger trg_likes_delete after delete on likes
  for each row execute function bump_likes_count();

-- Лимит 30 фото на гостя за событие — раньше это было просто
-- пожелание в тексте промпта, теперь это проверяется в БД.
create or replace function enforce_photo_limit() returns trigger as $$
declare
  photo_count integer;
begin
  select count(*) into photo_count from photos
    where guest_id = new.guest_id and event_id = new.event_id;
  if photo_count >= 30 then
    raise exception 'Достигнут лимит 30 фото на гостя';
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_photo_limit before insert on photos
  for each row execute function enforce_photo_limit();

-- =========================================================
-- RPC: определение победителя (только для админа события)
-- =========================================================
create or replace function admin_set_winner(p_event_id uuid, p_photo_id uuid)
returns void as $$
begin
  if not exists (
    select 1 from admins where user_id = auth.uid() and event_id = p_event_id
  ) then
    raise exception 'Недостаточно прав';
  end if;

  update photos set is_winner = false where event_id = p_event_id;
  update photos set is_winner = true where id = p_photo_id and event_id = p_event_id;
  update events set winner_photo_id = p_photo_id where id = p_event_id;
end;
$$ language plpgsql security definer;

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table events enable row level security;
alter table guests enable row level security;
alter table photos enable row level security;
alter table likes enable row level security;
alter table admins enable row level security;

-- EVENTS: код события — это и есть "пароль", читать может любой
-- аутентифицированный (в т.ч. анонимно) пользователь.
create policy "events_select" on events for select
  using (auth.role() = 'authenticated' or auth.role() = 'anon');

-- GUESTS: имя гостя показывается публично под фото и на экране
-- победителя, поэтому читать может любой участник события.
create policy "guests_select" on guests for select
  using (true);
create policy "guests_insert_own" on guests for insert
  with check (id = auth.uid());
create policy "guests_update_own" on guests for update
  using (id = auth.uid());

-- PHOTOS: скрытые модератором фото не видны гостям, только автору и админу.
create policy "photos_select_visible" on photos for select
  using (
    is_hidden = false
    or guest_id = auth.uid()
    or exists (select 1 from admins a where a.user_id = auth.uid() and a.event_id = photos.event_id)
  );
create policy "photos_insert_own" on photos for insert
  with check (guest_id = auth.uid());
create policy "photos_update_admin" on photos for update
  using (exists (select 1 from admins a where a.user_id = auth.uid() and a.event_id = photos.event_id));
create policy "photos_delete_admin" on photos for delete
  using (exists (select 1 from admins a where a.user_id = auth.uid() and a.event_id = photos.event_id));

-- LIKES: гость видит и управляет только своими лайками.
create policy "likes_select_own" on likes for select
  using (guest_id = auth.uid());
create policy "likes_insert_own" on likes for insert
  with check (guest_id = auth.uid());
create policy "likes_delete_own" on likes for delete
  using (guest_id = auth.uid());

-- ADMINS: пользователь может проверить только свою же запись.
create policy "admins_select_own" on admins for select
  using (user_id = auth.uid());

-- =========================================================
-- ПРИМЕР: создание события и назначение организатора
-- (выполняется вручную в Supabase SQL Editor)
-- =========================================================
-- insert into events (code, title) values ('SOFIA-JAMES-2026', 'София и Джеймс');
--
-- Организатор сначала регистрируется в приложении на /admin/register
-- (обычная почта+пароль через Supabase Auth), затем выполните:
-- insert into admins (user_id, event_id)
--   values ('<uuid пользователя из auth.users>', '<uuid события>');

-- =========================================================
-- STORAGE: политики для бакета "wedding-photos"
-- Сам бакет создаётся в интерфейсе Supabase (Storage → New bucket,
-- имя wedding-photos, Public bucket = ON) — это делается один раз,
-- см. README. Политики ниже настраивают, кто что может делать с файлами.
-- =========================================================
create policy "photos_public_read" on storage.objects for select
  using (bucket_id = 'wedding-photos');

create policy "photos_authenticated_upload" on storage.objects for insert
  with check (bucket_id = 'wedding-photos' and auth.role() in ('authenticated', 'anon'));

create policy "photos_admin_delete" on storage.objects for delete
  using (bucket_id = 'wedding-photos');

