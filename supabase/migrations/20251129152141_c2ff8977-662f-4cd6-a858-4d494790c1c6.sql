-- Create enum for verification methods
CREATE TYPE verification_method AS ENUM ('redacted_document', 'zkp_insurer');

-- Create enum for experiment status
CREATE TYPE experiment_status AS ENUM ('started', 'completed', 'abandoned');

-- Create enum for contribution responses
CREATE TYPE contribution_response AS ENUM ('yes', 'no');

-- Providers table
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  location TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  avg_billing_clarity NUMERIC(3,2) DEFAULT 0,
  avg_responsiveness NUMERIC(3,2) DEFAULT 0,
  avg_claim_process NUMERIC(3,2) DEFAULT 0,
  avg_prior_auth NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE NOT NULL,
  verification_method verification_method NOT NULL,
  verification_hash TEXT NOT NULL,
  billing_clarity INTEGER CHECK (billing_clarity BETWEEN 1 AND 5),
  responsiveness INTEGER CHECK (responsiveness BETWEEN 1 AND 5),
  claim_process INTEGER CHECK (claim_process BETWEEN 1 AND 5),
  prior_auth_rating INTEGER CHECK (prior_auth_rating BETWEEN 1 AND 5),
  experience_text TEXT,
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Verifications table
CREATE TABLE verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
  method TEXT NOT NULL,
  proof_data JSONB,
  status TEXT DEFAULT 'approved',
  verified_at TIMESTAMPTZ DEFAULT now()
);

-- Experiment sessions table
CREATE TABLE experiment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id TEXT NOT NULL,
  user_session_id TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status experiment_status DEFAULT 'started'
);

-- Experiment 1: Anonymous form responses
CREATE TABLE exp1_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES experiment_sessions(id) ON DELETE CASCADE NOT NULL,
  shared_cost BOOLEAN DEFAULT false,
  shared_condition BOOLEAN DEFAULT false,
  shared_wait_time BOOLEAN DEFAULT false,
  cost_value TEXT,
  condition_value TEXT,
  wait_time_value TEXT,
  rpi_count INTEGER DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- Experiment 2: Verification flow tracking
CREATE TABLE exp2_verification_flow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES experiment_sessions(id) ON DELETE CASCADE NOT NULL,
  step_1_start TIMESTAMPTZ,
  step_1_complete TIMESTAMPTZ,
  step_2_start TIMESTAMPTZ,
  step_2_complete TIMESTAMPTZ,
  step_3_start TIMESTAMPTZ,
  step_3_complete TIMESTAMPTZ,
  total_duration_seconds INTEGER,
  completed_successfully BOOLEAN DEFAULT false,
  drop_off_step TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- Experiment 3: Contribution willingness
CREATE TABLE exp3_contribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES experiment_sessions(id) ON DELETE CASCADE NOT NULL,
  initial_prompt_response contribution_response NOT NULL,
  incentive_shown BOOLEAN DEFAULT false,
  post_incentive_response contribution_response,
  final_contributed BOOLEAN DEFAULT false,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exp1_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE exp2_verification_flow ENABLE ROW LEVEL SECURITY;
ALTER TABLE exp3_contribution ENABLE ROW LEVEL SECURITY;

-- Public read policies (no auth required for this platform)
CREATE POLICY "Anyone can view providers" ON providers FOR SELECT USING (true);
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can view verifications" ON verifications FOR SELECT USING (true);
CREATE POLICY "Anyone can view experiment sessions" ON experiment_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can view exp1 responses" ON exp1_responses FOR SELECT USING (true);
CREATE POLICY "Anyone can view exp2 flow" ON exp2_verification_flow FOR SELECT USING (true);
CREATE POLICY "Anyone can view exp3 contribution" ON exp3_contribution FOR SELECT USING (true);

-- Public insert policies (anonymous contributions)
CREATE POLICY "Anyone can insert reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert verifications" ON verifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert experiment sessions" ON experiment_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert exp1 responses" ON exp1_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert exp2 flow" ON exp2_verification_flow FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert exp3 contribution" ON exp3_contribution FOR INSERT WITH CHECK (true);

-- Function to update provider averages after review insert
CREATE OR REPLACE FUNCTION update_provider_averages()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update provider averages
CREATE TRIGGER update_provider_averages_trigger
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_provider_averages();

-- Seed sample providers across specialties
INSERT INTO providers (name, specialty, location, phone, email) VALUES
('Dr. Sarah Chen', 'Dermatology', 'San Francisco, CA', '(415) 555-0123', 'schen@healthmail.com'),
('Dr. Michael Rodriguez', 'Cardiology', 'Los Angeles, CA', '(310) 555-0145', 'mrodriguez@heartcare.com'),
('Dr. Emily Johnson', 'Pediatrics', 'New York, NY', '(212) 555-0198', 'ejohnson@kidsdocs.com'),
('Dr. James Thompson', 'Primary Care', 'Chicago, IL', '(312) 555-0176', 'jthompson@primarymed.com'),
('Dr. Lisa Park', 'Psychiatry', 'Seattle, WA', '(206) 555-0134', 'lpark@mindhealth.com'),
('Dr. Robert Williams', 'Orthopedics', 'Austin, TX', '(512) 555-0167', 'rwilliams@bonedocs.com'),
('Dr. Maria Garcia', 'Oncology', 'Boston, MA', '(617) 555-0189', 'mgarcia@cancercare.com'),
('Dr. David Kim', 'Neurology', 'Denver, CO', '(303) 555-0142', 'dkim@neurohealth.com'),
('Dr. Jennifer Lee', 'Endocrinology', 'Portland, OR', '(503) 555-0156', 'jlee@hormoneclinic.com'),
('Dr. Christopher Brown', 'Gastroenterology', 'Miami, FL', '(305) 555-0178', 'cbrown@digestivecare.com');

-- Seed some sample reviews
INSERT INTO reviews (provider_id, verification_method, verification_hash, billing_clarity, responsiveness, claim_process, prior_auth_rating, experience_text) VALUES
((SELECT id FROM providers WHERE name = 'Dr. Sarah Chen'), 'zkp_insurer', 'zkp_hash_abc123', 5, 5, 4, 5, 'Excellent dermatologist. Clear communication about costs upfront, no surprise bills. My insurance claim was processed smoothly.'),
((SELECT id FROM providers WHERE name = 'Dr. Sarah Chen'), 'redacted_document', 'doc_hash_xyz789', 4, 5, 5, 4, 'Great experience overall. The billing was transparent and my prior authorization went through without issues.'),
((SELECT id FROM providers WHERE name = 'Dr. Michael Rodriguez'), 'zkp_insurer', 'zkp_hash_def456', 3, 4, 3, 3, 'Good cardiologist but billing was confusing. Had to call multiple times to understand charges. Prior auth took longer than expected.'),
((SELECT id FROM providers WHERE name = 'Dr. Emily Johnson'), 'redacted_document', 'doc_hash_mno012', 5, 5, 5, 5, 'Outstanding pediatrician. Completely transparent about costs, responsive to questions, and insurance claims were handled perfectly.'),
((SELECT id FROM providers WHERE name = 'Dr. James Thompson'), 'zkp_insurer', 'zkp_hash_ghi789', 4, 4, 4, 4, 'Solid primary care doctor. Billing is straightforward and my insurance worked with them smoothly.');