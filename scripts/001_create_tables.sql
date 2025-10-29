-- Create profiles table for user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  default_from_currency TEXT DEFAULT 'USD',
  default_to_currency TEXT DEFAULT 'BRL',
  theme TEXT DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversion history table
CREATE TABLE IF NOT EXISTS public.conversion_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  result NUMERIC NOT NULL,
  rate NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create watchlist table for favorite currency pairs
CREATE TABLE IF NOT EXISTS public.watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  alert_enabled BOOLEAN DEFAULT FALSE,
  alert_rate NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, from_currency, to_currency)
);

-- Create currency rates cache table
CREATE TABLE IF NOT EXISTS public.currency_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency TEXT NOT NULL,
  target_currency TEXT NOT NULL,
  rate NUMERIC NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(base_currency, target_currency)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currency_rates ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Conversion history policies
CREATE POLICY "Users can view own conversion history"
  ON public.conversion_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversion history"
  ON public.conversion_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversion history"
  ON public.conversion_history FOR DELETE
  USING (auth.uid() = user_id);

-- Watchlist policies
CREATE POLICY "Users can view own watchlist"
  ON public.watchlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlist"
  ON public.watchlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watchlist"
  ON public.watchlist FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlist"
  ON public.watchlist FOR DELETE
  USING (auth.uid() = user_id);

-- Currency rates policies (public read, no write for users)
CREATE POLICY "Anyone can view currency rates"
  ON public.currency_rates FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_conversion_history_user_id ON public.conversion_history(user_id);
CREATE INDEX idx_conversion_history_created_at ON public.conversion_history(created_at DESC);
CREATE INDEX idx_watchlist_user_id ON public.watchlist(user_id);
CREATE INDEX idx_currency_rates_lookup ON public.currency_rates(base_currency, target_currency);
