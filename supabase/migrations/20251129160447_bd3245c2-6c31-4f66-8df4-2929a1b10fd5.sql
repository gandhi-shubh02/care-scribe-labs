-- Add time tracking columns to exp1_responses
ALTER TABLE exp1_responses
ADD COLUMN session_start_at TIMESTAMPTZ,
ADD COLUMN session_duration_seconds INTEGER;

-- Add time tracking columns to exp3_contribution
ALTER TABLE exp3_contribution
ADD COLUMN initial_prompt_at TIMESTAMPTZ,
ADD COLUMN incentive_shown_at TIMESTAMPTZ,
ADD COLUMN final_decision_at TIMESTAMPTZ,
ADD COLUMN total_duration_seconds INTEGER;