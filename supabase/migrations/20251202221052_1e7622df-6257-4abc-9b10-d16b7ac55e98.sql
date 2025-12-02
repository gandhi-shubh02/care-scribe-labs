-- Add UPDATE policy for experiment_sessions
CREATE POLICY "Anyone can update experiment sessions"
ON public.experiment_sessions
FOR UPDATE
USING (true)
WITH CHECK (true);