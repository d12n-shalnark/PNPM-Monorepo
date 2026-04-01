-- Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- https://supabase.com/dashboard/project/_/sql/new

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
-- Extends auth.users with additional profile data

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS Policies for profiles
alter table public.profiles enable row level security;

-- Anyone can view profiles
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Users can insert their own profile (for signup)
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- ============================================
-- POSTS TABLE
-- ============================================
-- Main content table for blog posts/articles

create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  content text,
  status text default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS Policies for posts
alter table public.posts enable row level security;

-- Anyone can view published posts
create policy "Published posts are viewable by everyone"
  on public.posts for select using (status = 'published');

-- Users can view their own posts (including drafts)
create policy "Users can view own posts"
  on public.posts for select using (auth.uid() = user_id);

-- Users can create posts
create policy "Users can create posts"
  on public.posts for insert with check (auth.uid() = user_id);

-- Users can update their own posts
create policy "Users can update own posts"
  on public.posts for update using (auth.uid() = user_id);

-- Users can delete their own posts
create policy "Users can delete own posts"
  on public.posts for delete using (auth.uid() = user_id);

-- ============================================
-- TAGS TABLE
-- ============================================
-- Tags for categorizing posts

create table if not exists public.tags (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  color text,
  created_at timestamptz default now()
);

-- RLS Policies for tags
alter table public.tags enable row level security;

-- Anyone can view tags
create policy "Tags are viewable by everyone"
  on public.tags for select using (true);

-- Only authenticated users can create tags
create policy "Authenticated users can create tags"
  on public.tags for insert with check (auth.role() = 'authenticated');

-- ============================================
-- POST_TAGS TABLE
-- ============================================
-- Many-to-many relationship between posts and tags

create table if not exists public.post_tags (
  post_id uuid references public.posts(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- RLS Policies for post_tags
alter table public.post_tags enable row level security;

-- Anyone can view post tags
create policy "Post tags are viewable by everyone"
  on public.post_tags for select using (true);

-- Users can manage post tags for their own posts
create policy "Users can manage tags for own posts"
  on public.post_tags for insert with check (
    auth.uid() = (select user_id from public.posts where id = post_id)
  );

create policy "Users can remove tags from own posts"
  on public.post_tags for delete using (
    auth.uid() = (select user_id from public.posts where id = post_id)
  );

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at trigger to posts
create trigger posts_updated_at
  before update on public.posts
  for each row execute function public.handle_updated_at();

-- Apply updated_at trigger to profiles
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Function to create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id, 
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile when a new user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- INDEXES
-- ============================================

-- Index for faster post queries by status and date
create index if not exists idx_posts_status_created
  on public.posts(status, created_at desc);

-- Index for faster post queries by user
create index if not exists idx_posts_user_id
  on public.posts(user_id);

-- Index for faster tag lookups
create index if not exists idx_tags_name
  on public.tags(name);

-- ============================================
-- SAMPLE DATA (Optional - remove in production)
-- ============================================

-- Insert sample tags
insert into public.tags (name, color) values
  ('Technology', '#3B82F6'),
  ('Design', '#EC4899'),
  ('Business', '#10B981'),
  ('Tutorial', '#F59E0B'),
  ('News', '#6366F1')
on conflict (name) do nothing;
