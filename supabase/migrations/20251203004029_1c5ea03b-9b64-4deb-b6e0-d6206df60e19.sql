-- Add max_time_willing column to exp1_responses
ALTER TABLE public.exp1_responses 
ADD COLUMN max_time_willing_minutes integer;

-- Add max_time_willing column to exp2_verification_flow
ALTER TABLE public.exp2_verification_flow 
ADD COLUMN max_time_willing_minutes integer;

-- Add max_time_willing column to exp3_contribution
ALTER TABLE public.exp3_contribution 
ADD COLUMN max_time_willing_minutes integer;