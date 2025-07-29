-- Kanban Board Schema

-- Boards table
create table public.boards (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Lists table  
create table public.lists (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  board_id uuid references public.boards(id) on delete cascade not null,
  position integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Cards table
create table public.cards (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  list_id uuid references public.lists(id) on delete cascade not null,
  position integer not null,
  due_date timestamp with time zone,
  due_time time,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) policies

-- Enable RLS
alter table public.boards enable row level security;
alter table public.lists enable row level security;
alter table public.cards enable row level security;

-- Boards policies
create policy "Users can view their own boards" on public.boards
  for select using (auth.uid() = user_id);

create policy "Users can insert their own boards" on public.boards
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own boards" on public.boards
  for update using (auth.uid() = user_id);

create policy "Users can delete their own boards" on public.boards
  for delete using (auth.uid() = user_id);

-- Lists policies (can access lists if they own the board)
create policy "Users can view lists from their boards" on public.lists
  for select using (
    exists (
      select 1 from public.boards 
      where boards.id = lists.board_id 
      and boards.user_id = auth.uid()
    )
  );

create policy "Users can insert lists to their boards" on public.lists
  for insert with check (
    exists (
      select 1 from public.boards 
      where boards.id = lists.board_id 
      and boards.user_id = auth.uid()
    )
  );

create policy "Users can update lists from their boards" on public.lists
  for update using (
    exists (
      select 1 from public.boards 
      where boards.id = lists.board_id 
      and boards.user_id = auth.uid()
    )
  );

create policy "Users can delete lists from their boards" on public.lists
  for delete using (
    exists (
      select 1 from public.boards 
      where boards.id = lists.board_id 
      and boards.user_id = auth.uid()
    )
  );

-- Cards policies (can access cards if they own the board containing the list)
create policy "Users can view cards from their boards" on public.cards
  for select using (
    exists (
      select 1 from public.lists 
      join public.boards on boards.id = lists.board_id
      where lists.id = cards.list_id 
      and boards.user_id = auth.uid()
    )
  );

create policy "Users can insert cards to their boards" on public.cards
  for insert with check (
    exists (
      select 1 from public.lists 
      join public.boards on boards.id = lists.board_id
      where lists.id = cards.list_id 
      and boards.user_id = auth.uid()
    )
  );

create policy "Users can update cards from their boards" on public.cards
  for update using (
    exists (
      select 1 from public.lists 
      join public.boards on boards.id = lists.board_id
      where lists.id = cards.list_id 
      and boards.user_id = auth.uid()
    )
  );

create policy "Users can delete cards from their boards" on public.cards
  for delete using (
    exists (
      select 1 from public.lists 
      join public.boards on boards.id = lists.board_id
      where lists.id = cards.list_id 
      and boards.user_id = auth.uid()
    )
  );

-- Functions to handle updated_at timestamps
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_boards_updated_at
  before update on public.boards
  for each row execute function handle_updated_at();

create trigger handle_lists_updated_at
  before update on public.lists
  for each row execute function handle_updated_at();

create trigger handle_cards_updated_at
  before update on public.cards
  for each row execute function handle_updated_at();