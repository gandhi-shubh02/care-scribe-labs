-- Add review_text column to exp3_contribution table
ALTER TABLE exp3_contribution ADD COLUMN review_text TEXT;

-- Add file upload tracking to exp2_verification_flow
ALTER TABLE exp2_verification_flow ADD COLUMN uploaded_id_document BOOLEAN DEFAULT false;
ALTER TABLE exp2_verification_flow ADD COLUMN uploaded_medical_bill BOOLEAN DEFAULT false;
ALTER TABLE exp2_verification_flow ADD COLUMN uploaded_selfie BOOLEAN DEFAULT false;

-- Add more fields to exp1_responses for additional questions
ALTER TABLE exp1_responses ADD COLUMN share_appointment_type BOOLEAN DEFAULT false;
ALTER TABLE exp1_responses ADD COLUMN appointment_type_value TEXT;
ALTER TABLE exp1_responses ADD COLUMN share_insurance_accepted BOOLEAN DEFAULT false;
ALTER TABLE exp1_responses ADD COLUMN insurance_accepted_value TEXT;
ALTER TABLE exp1_responses ADD COLUMN share_office_accessibility BOOLEAN DEFAULT false;
ALTER TABLE exp1_responses ADD COLUMN office_accessibility_value TEXT;