-- Drop existing restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Anyone can insert experiment sessions" ON experiment_sessions;
DROP POLICY IF EXISTS "Anyone can update experiment sessions" ON experiment_sessions;
DROP POLICY IF EXISTS "Anyone can view experiment sessions" ON experiment_sessions;

DROP POLICY IF EXISTS "Anyone can insert exp2 flow" ON exp2_verification_flow;
DROP POLICY IF EXISTS "Anyone can view exp2 flow" ON exp2_verification_flow;

DROP POLICY IF EXISTS "Anyone can insert exp3 contribution" ON exp3_contribution;
DROP POLICY IF EXISTS "Anyone can view exp3 contribution" ON exp3_contribution;

DROP POLICY IF EXISTS "Anyone can insert exp1 responses" ON exp1_responses;
DROP POLICY IF EXISTS "Anyone can view exp1 responses" ON exp1_responses;

-- Recreate as PERMISSIVE policies for experiment_sessions
CREATE POLICY "Allow insert experiment sessions" ON experiment_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update experiment sessions" ON experiment_sessions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow select experiment sessions" ON experiment_sessions FOR SELECT USING (true);

-- Recreate as PERMISSIVE policies for exp2_verification_flow  
CREATE POLICY "Allow insert exp2 flow" ON exp2_verification_flow FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select exp2 flow" ON exp2_verification_flow FOR SELECT USING (true);

-- Recreate as PERMISSIVE policies for exp3_contribution
CREATE POLICY "Allow insert exp3 contribution" ON exp3_contribution FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select exp3 contribution" ON exp3_contribution FOR SELECT USING (true);

-- Recreate as PERMISSIVE policies for exp1_responses
CREATE POLICY "Allow insert exp1 responses" ON exp1_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select exp1 responses" ON exp1_responses FOR SELECT USING (true);