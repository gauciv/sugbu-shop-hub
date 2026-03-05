-- Migration: Add banner position column to shops

ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS banner_position_y integer NOT NULL DEFAULT 50;
