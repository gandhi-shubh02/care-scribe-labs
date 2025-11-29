-- Fix security warning: Drop trigger first, then function, then recreate with search_path
DROP TRIGGER IF EXISTS update_provider_averages_trigger ON reviews;
DROP FUNCTION IF EXISTS update_provider_averages();

CREATE OR REPLACE FUNCTION update_provider_averages()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE providers
  SET 
    avg_billing_clarity = (
      SELECT COALESCE(AVG(billing_clarity), 0)
      FROM reviews
      WHERE provider_id = NEW.provider_id
    ),
    avg_responsiveness = (
      SELECT COALESCE(AVG(responsiveness), 0)
      FROM reviews
      WHERE provider_id = NEW.provider_id
    ),
    avg_claim_process = (
      SELECT COALESCE(AVG(claim_process), 0)
      FROM reviews
      WHERE provider_id = NEW.provider_id
    ),
    avg_prior_auth = (
      SELECT COALESCE(AVG(prior_auth_rating), 0)
      FROM reviews
      WHERE provider_id = NEW.provider_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE provider_id = NEW.provider_id
    )
  WHERE id = NEW.provider_id;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER update_provider_averages_trigger
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_provider_averages();