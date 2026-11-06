-- ==============================================================================
-- NEXUS — ORBIT STUDIO INTELLIGENCE
-- PostgreSQL Database Schema & Row Level Security (RLS) for Supabase
-- ==============================================================================

-- 1. Create custom enum types
CREATE TYPE user_role AS ENUM ('FOUNDER', 'BUSINESS_PARTNER', 'SALES_REPRESENTATIVE');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'interested', 'negotiation', 'converted', 'lost');
CREATE TYPE lead_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE website_status AS ENUM ('no_website', 'outdated_website', 'redesign_needed', 'ecommerce_upgrade');
CREATE TYPE project_status AS ENUM ('planning', 'designing', 'development', 'review', 'completed', 'delivered');
CREATE TYPE invoice_status AS ENUM ('draft', 'pending', 'paid', 'overdue', 'cancelled');
CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE action_type AS ENUM (
  'send_email',
  'send_whatsapp',
  'confirm_appointment',
  'send_invoice',
  'confirm_quotation',
  'financial_commitment',
  'external_dispatch'
);

-- 2. Profiles table (linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'SALES_REPRESENTATIVE',
  avatar_url TEXT,
  phone TEXT,
  commission_rate NUMERIC(5,2) DEFAULT 10.00, -- e.g. 10.00%
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Clients table (CRM)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  business_category TEXT NOT NULL,
  website_requirements TEXT,
  budget NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active', -- active, in_negotiation, completed, archived
  notes TEXT,
  follow_up_date DATE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Leads table (Sales Pipeline)
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  business_category TEXT NOT NULL,
  website_status website_status NOT NULL DEFAULT 'outdated_website',
  potential_requirements TEXT,
  lead_source TEXT NOT NULL DEFAULT 'Outreach',
  assigned_rep_id UUID REFERENCES profiles(id),
  priority lead_priority NOT NULL DEFAULT 'medium',
  status lead_status NOT NULL DEFAULT 'new',
  score INTEGER DEFAULT 50 CHECK (score >= 0 AND score <= 100),
  follow_up_date DATE,
  notes TEXT,
  converted_client_id UUID REFERENCES clients(id),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 5. Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  package_selected TEXT NOT NULL,
  project_price NUMERIC(12,2) NOT NULL,
  advance_payment NUMERIC(12,2) NOT NULL DEFAULT 0,
  remaining_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  assigned_members JSONB DEFAULT '[]'::JSONB,
  deadline DATE NOT NULL,
  status project_status NOT NULL DEFAULT 'planning',
  requirements TEXT,
  progress_checklist JSONB DEFAULT '[]'::JSONB,
  delivery_status TEXT DEFAULT 'on_track',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 6. Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id),
  due_date DATE,
  priority TEXT DEFAULT 'medium',
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 7. Invoices & Quotations
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  items JSONB NOT NULL DEFAULT '[]'::JSONB,
  subtotal NUMERIC(12,2) NOT NULL,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  advance_paid NUMERIC(12,2) DEFAULT 0,
  balance_due NUMERIC(12,2) NOT NULL,
  status invoice_status NOT NULL DEFAULT 'draft',
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  approved_by_founder BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 8. Financial Transactions (Income & Expenses)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type transaction_type NOT NULL,
  category TEXT NOT NULL, -- client_advance, client_final_payment, hosting_infrastructure, software_tools, contractor_payout, etc.
  amount NUMERIC(12,2) NOT NULL,
  description TEXT NOT NULL,
  related_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  related_client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  related_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  payment_method TEXT DEFAULT 'Bank Transfer',
  recorded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 9. Sales Commissions
CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_rep_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  deal_value NUMERIC(12,2) NOT NULL,
  commission_rate NUMERIC(5,2) NOT NULL,
  commission_amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_clearance', -- pending_clearance, paid
  payout_date DATE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 10. Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 45,
  meeting_type TEXT DEFAULT 'video_call',
  meeting_link TEXT,
  status TEXT DEFAULT 'scheduled',
  assigned_to UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 11. Founder Approval Queue (Critical Governance)
CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type action_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  prepared_content JSONB NOT NULL,
  requesting_member_id UUID NOT NULL REFERENCES profiles(id),
  status approval_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  reviewer_comments TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 12. Activity & Audit Logs
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id),
  actor_name TEXT NOT NULL,
  actor_role user_role NOT NULL,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- 1. Profiles Policies
CREATE POLICY "Public profile view for authenticated members"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Founder manages profiles"
  ON profiles FOR ALL TO authenticated
  USING (get_current_user_role() = 'FOUNDER');

-- 2. Clients Policies
CREATE POLICY "Founder and Business Partner full access to clients"
  ON clients FOR ALL TO authenticated
  USING (get_current_user_role() IN ('FOUNDER', 'BUSINESS_PARTNER'));

CREATE POLICY "Sales reps can view and create clients"
  ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Sales reps can insert clients"
  ON clients FOR INSERT TO authenticated
  WITH CHECK (get_current_user_role() = 'SALES_REPRESENTATIVE');

-- 3. Leads Policies
CREATE POLICY "Founder and Partner view all leads"
  ON leads FOR ALL TO authenticated
  USING (get_current_user_role() IN ('FOUNDER', 'BUSINESS_PARTNER'));

CREATE POLICY "Sales reps access assigned leads and can insert"
  ON leads FOR SELECT TO authenticated
  USING (get_current_user_role() = 'SALES_REPRESENTATIVE' AND (assigned_rep_id = auth.uid() OR assigned_rep_id IS NULL));

CREATE POLICY "Sales reps can update own assigned leads"
  ON leads FOR UPDATE TO authenticated
  USING (get_current_user_role() = 'SALES_REPRESENTATIVE' AND assigned_rep_id = auth.uid());

CREATE POLICY "Sales reps can insert leads"
  ON leads FOR INSERT TO authenticated
  WITH CHECK (get_current_user_role() = 'SALES_REPRESENTATIVE');

-- 4. Projects Policies
CREATE POLICY "Founder and Partner manage projects"
  ON projects FOR ALL TO authenticated
  USING (get_current_user_role() IN ('FOUNDER', 'BUSINESS_PARTNER'));

CREATE POLICY "Sales reps view projects"
  ON projects FOR SELECT TO authenticated USING (true);

-- 5. Financial Transactions Policies (Strict Security)
CREATE POLICY "Founder full access to transactions"
  ON transactions FOR ALL TO authenticated
  USING (get_current_user_role() = 'FOUNDER');

CREATE POLICY "Business Partner view transactions"
  ON transactions FOR SELECT TO authenticated
  USING (get_current_user_role() = 'BUSINESS_PARTNER');
-- NOTE: Sales Representatives have NO select, insert, or update policy on company transactions!

-- 6. Invoices Policies
CREATE POLICY "Founder and Partner manage invoices"
  ON invoices FOR ALL TO authenticated
  USING (get_current_user_role() IN ('FOUNDER', 'BUSINESS_PARTNER'));

CREATE POLICY "Sales reps can view invoices"
  ON invoices FOR SELECT TO authenticated USING (true);

-- 7. Commissions Policies
CREATE POLICY "Founder manages all commissions"
  ON commissions FOR ALL TO authenticated
  USING (get_current_user_role() = 'FOUNDER');

CREATE POLICY "Partner views commissions"
  ON commissions FOR SELECT TO authenticated
  USING (get_current_user_role() = 'BUSINESS_PARTNER');

CREATE POLICY "Sales reps can ONLY view their own commissions"
  ON commissions FOR SELECT TO authenticated
  USING (sales_rep_id = auth.uid());

-- 8. Approvals Queue Policies
CREATE POLICY "Anyone authenticated can submit an approval request"
  ON approvals FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "All authenticated can view approvals"
  ON approvals FOR SELECT TO authenticated USING (true);

CREATE POLICY "ONLY Founder can approve or reject approval requests"
  ON approvals FOR UPDATE TO authenticated
  USING (get_current_user_role() = 'FOUNDER')
  WITH CHECK (get_current_user_role() = 'FOUNDER');

-- 9. Activity Logs Policies
CREATE POLICY "All members can read activity logs"
  ON activity_logs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated members can insert activity logs"
  ON activity_logs FOR INSERT TO authenticated WITH CHECK (true);
