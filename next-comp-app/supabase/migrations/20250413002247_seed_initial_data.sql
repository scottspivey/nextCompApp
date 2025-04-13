-- Supabase Seed Data Script (Revised)
-- Run this AFTER running the initial_schema migration.
-- Contains only 2 users and updated rate data.
-- Added claims and notes for the 5 newest workers.

-- Seed Profiles (Link to Auth Users)
-- Only Keeping Users 1 and 2
INSERT INTO public.profiles (user_id, full_name, role, firm_name)
VALUES
  ('228e529e-255d-43aa-a659-a5f28cdb2baf', 'Scott Spivey', 'Attorney', 'Example Law Firm'),
  ('f98dd6ea-a8c5-4e7b-aaac-c956f17e328a', 'John Doe', 'Adjuster', 'Example Insurance Co')
ON CONFLICT (user_id) DO NOTHING; -- Avoid errors if profile already exists

-- Seed Rate Settings (Example Years)
-- Updated with accurate Max Comp Rates 1979-2025
-- Removed Discount Rates except for 2025
INSERT INTO public.rate_settings (year, rate_type, value, effective_date, description)
VALUES
  -- Max Comp Rates
  (2025, 'max_comp', 1134.43, '2025-01-01', 'SC Max Comp Rate 2025'),
  (2024, 'max_comp', 1093.67, '2024-01-01', 'SC Max Comp Rate 2024'), -- Updated Value
  (2023, 'max_comp', 1035.78, '2023-01-01', 'SC Max Comp Rate 2023'),
  (2022, 'max_comp', 963.37, '2022-01-01', 'SC Max Comp Rate 2022'),
  (2021, 'max_comp', 903.4, '2021-01-01', 'SC Max Comp Rate 2021'),
  (2020, 'max_comp', 866.67, '2020-01-01', 'SC Max Comp Rate 2020'),
  (2019, 'max_comp', 845.74, '2019-01-01', 'SC Max Comp Rate 2019'),
  (2018, 'max_comp', 838.21, '2018-01-01', 'SC Max Comp Rate 2018'),
  (2017, 'max_comp', 806.92, '2017-01-01', 'SC Max Comp Rate 2017'),
  (2016, 'max_comp', 784.03, '2016-01-01', 'SC Max Comp Rate 2016'),
  (2015, 'max_comp', 766.05, '2015-01-01', 'SC Max Comp Rate 2015'),
  (2014, 'max_comp', 752.16, '2014-01-01', 'SC Max Comp Rate 2014'),
  (2013, 'max_comp', 743.72, '2013-01-01', 'SC Max Comp Rate 2013'),
  (2012, 'max_comp', 725.47, '2012-01-01', 'SC Max Comp Rate 2012'),
  (2011, 'max_comp', 704.92, '2011-01-01', 'SC Max Comp Rate 2011'),
  (2010, 'max_comp', 689.71, '2010-01-01', 'SC Max Comp Rate 2010'),
  (2009, 'max_comp', 681.36, '2009-01-01', 'SC Max Comp Rate 2009'),
  (2008, 'max_comp', 661.29, '2008-01-01', 'SC Max Comp Rate 2008'),
  (2007, 'max_comp', 645.94, '2007-01-01', 'SC Max Comp Rate 2007'),
  (2006, 'max_comp', 616.48, '2006-01-01', 'SC Max Comp Rate 2006'),
  (2005, 'max_comp', 592.56, '2005-01-01', 'SC Max Comp Rate 2005'),
  (2004, 'max_comp', 577.73, '2004-01-01', 'SC Max Comp Rate 2004'),
  (2003, 'max_comp', 563.55, '2003-01-01', 'SC Max Comp Rate 2003'),
  (2002, 'max_comp', 549.42, '2002-01-01', 'SC Max Comp Rate 2002'),
  (2001, 'max_comp', 532.77, '2001-01-01', 'SC Max Comp Rate 2001'),
  (2000, 'max_comp', 507.34, '2000-01-01', 'SC Max Comp Rate 2000'),
  (1999, 'max_comp', 483.47, '1999-01-01', 'SC Max Comp Rate 1999'),
  (1998, 'max_comp', 465.18, '1998-01-01', 'SC Max Comp Rate 1998'),
  (1997, 'max_comp', 450.62, '1997-01-01', 'SC Max Comp Rate 1997'),
  (1996, 'max_comp', 437.79, '1996-01-01', 'SC Max Comp Rate 1996'),
  (1995, 'max_comp', 422.48, '1995-01-01', 'SC Max Comp Rate 1995'),
  (1994, 'max_comp', 410.26, '1994-01-01', 'SC Max Comp Rate 1994'),
  (1993, 'max_comp', 393.06, '1993-01-01', 'SC Max Comp Rate 1993'),
  (1992, 'max_comp', 379.82, '1992-01-01', 'SC Max Comp Rate 1992'),
  (1991, 'max_comp', 364.37, '1991-01-01', 'SC Max Comp Rate 1991'),
  (1990, 'max_comp', 350.19, '1990-01-01', 'SC Max Comp Rate 1990'),
  (1989, 'max_comp', 334.87, '1989-01-01', 'SC Max Comp Rate 1989'),
  (1988, 'max_comp', 319.20, '1988-01-01', 'SC Max Comp Rate 1988'),
  (1987, 'max_comp', 308.24, '1987-01-01', 'SC Max Comp Rate 1987'),
  (1986, 'max_comp', 294.95, '1986-01-01', 'SC Max Comp Rate 1986'),
  (1985, 'max_comp', 287.02, '1985-01-01', 'SC Max Comp Rate 1985'),
  (1984, 'max_comp', 268.99, '1984-01-01', 'SC Max Comp Rate 1984'),
  (1983, 'max_comp', 254.38, '1983-01-01', 'SC Max Comp Rate 1983'),
  (1982, 'max_comp', 235.00, '1982-01-01', 'SC Max Comp Rate 1982'),
  (1981, 'max_comp', 216.00, '1981-01-01', 'SC Max Comp Rate 1981'),
  (1980, 'max_comp', 197.00, '1980-01-01', 'SC Max Comp Rate 1980'),
  (1979, 'max_comp', 185.00, '1979-01-01', 'SC Max Comp Rate 1979'),
  -- Discount Rates (Only 2025)
  (2025, 'discount_gt_100w', 0.0438, '2025-01-01', 'Discount Rate > 100 weeks'),
  (2025, 'discount_lte_100w', 0.02, '2025-01-01', 'Discount Rate <= 100 weeks')
ON CONFLICT (year, rate_type) DO NOTHING; -- Avoid errors if rates already exist

-- Seed Injured Workers (Linked to Profiles)
-- Original Workers for Users 1 & 2
INSERT INTO public.injured_workers (profile_id, first_name, last_name, date_of_birth, city, state, zip_code)
VALUES
  ((SELECT id from public.profiles WHERE user_id = '228e529e-255d-43aa-a659-a5f28cdb2baf'), 'John', 'Smith', '1985-05-15', 'Columbia', 'SC', '29201'),
  ((SELECT id from public.profiles WHERE user_id = '228e529e-255d-43aa-a659-a5f28cdb2baf'), 'Maria', 'Garcia', '1992-11-20', 'Charleston', 'SC', '29401'),
  ((SELECT id from public.profiles WHERE user_id = 'f98dd6ea-a8c5-4e7b-aaac-c956f17e328a'), 'David', 'Williams', '1978-02-10', 'Greenville', 'SC', '29601'),
  -- Keep workers linked to Scott Spivey ('228e529e-255d-43aa-a659-a5f28cdb2baf')
  ((SELECT id from public.profiles WHERE user_id = '228e529e-255d-43aa-a659-a5f28cdb2baf'), 'Emily', 'Jones', '1990-08-25', 'Myrtle Beach', 'SC', '29577'),
  ((SELECT id from public.profiles WHERE user_id = '228e529e-255d-43aa-a659-a5f28cdb2baf'), 'Michael', 'Brown', '1982-03-12', 'Rock Hill', 'SC', '29730'),
  -- Keep worker linked to John Doe ('f98dd6ea-a8c5-4e7b-aaac-c956f17e328a')
  ((SELECT id from public.profiles WHERE user_id = 'f98dd6ea-a8c5-4e7b-aaac-c956f17e328a'), 'Sarah', 'Davis', '1995-01-30', 'Sumter', 'SC', '29150'),
-- Adding 5 New Workers (Linked to remaining profiles)
-- Linked to Scott Spivey ('228e529e-255d-43aa-a659-a5f28cdb2baf')
  ((SELECT id from public.profiles WHERE user_id = '228e529e-255d-43aa-a659-a5f28cdb2baf'), 'Olivia', 'Martinez', '1993-06-18', 'Columbia', 'SC', '29205'),
  ((SELECT id from public.profiles WHERE user_id = '228e529e-255d-43aa-a659-a5f28cdb2baf'), 'William', 'Rodriguez', '1980-09-01', 'North Charleston', 'SC', '29405'),
  ((SELECT id from public.profiles WHERE user_id = '228e529e-255d-43aa-a659-a5f28cdb2baf'), 'Sophia', 'Hernandez', '1999-04-11', 'Mount Pleasant', 'SC', '29464'),
  -- Linked to John Doe ('f98dd6ea-a8c5-4e7b-aaac-c956f17e328a')
  ((SELECT id from public.profiles WHERE user_id = 'f98dd6ea-a8c5-4e7b-aaac-c956f17e328a'), 'James', 'Lopez', '1976-11-25', 'Greenville', 'SC', '29607'),
  ((SELECT id from public.profiles WHERE user_id = 'f98dd6ea-a8c5-4e7b-aaac-c956f17e328a'), 'Isabella', 'Gonzalez', '1989-02-14', 'Spartanburg', 'SC', '29302');


-- Seed Claims (Linked to Injured Workers and Profiles)
-- Keeping only claims related to Users 1 & 2 and their workers
INSERT INTO public.claims (injured_worker_id, profile_id, wcc_file_number, employer_name, date_of_injury, claim_status)
VALUES
  -- Claims for Scott Spivey's workers
  ((SELECT id from public.injured_workers WHERE first_name = 'John' AND last_name = 'Smith' AND profile_id = (SELECT id from public.profiles WHERE user_id = '228e529e-255d-43aa-a659-a5f28cdb2baf')), (SELECT id from public.profiles WHERE user_id = '228e529e-255d-43aa-a659-a5f28cdb2baf'), 'SCWCC-JSMITH01', 'ABC Construction', '2024-03-10', 'Open'),
  ((SELECT id from public.injured_workers WHERE first_name = 'Maria' AND last_name = 'Garcia' AND profile_id = (SELECT id from public.profiles WHERE user_id = '228e529e-255d-43aa-a659-a5f28cdb2baf')), (SELECT id from public.profiles WHERE user_id = '228e529e-255d-43aa-a659-a5f28cdb2baf'), 'SCWCC-MGARCIA01', 'XYZ Restaurant', '2023-12-01', 'Settled'),
  ((SELECT id from public.injured_workers WHERE first_name = 'Emily' AND last_name = 'Jones' AND profile_id = (SELECT id from public.profiles WHERE user_id = '228e529e-255d-43aa-a659-a5f28cdb2baf')), (SELECT id from public.profiles WHERE user_id = '228e529e-255d-43aa-a659-a5f28cdb2baf'), 'SCWCC-EJONES01', 'Coastal Resorts LLC', '2024-05-20', 'Open'),
  ((SELECT id from public.injured_workers WHERE first_name = 'Michael' AND last_name = 'Brown' AND profile_id = (SELECT id from public.profiles WHERE user_id = '228e529e-255d-43aa-a659-a5f28cdb2baf')), (SELECT id from public.profiles WHERE user_id = '228e529e-255d-43aa-a659-a5f28cdb2baf'), 'SCWCC-MBROWN01', 'Rock Hill Manufacturing', '2023-11-15', 'Denied'),
  -- Claims for John Doe's workers
  ((SELECT id from public.injured_workers WHERE first_name = 'David' AND last_name = 'Williams' AND profile_id = (SELECT id from public.profiles WHERE user_id = 'f98dd6ea-a8c5-4e7b-aaac-c956f17e328a')), (SELECT id from public.profiles WHERE user_id = 'f98dd6ea-a8c5-4e7b-aaac-c956f17e328a'), 'SCWCC-DWILL01', 'Greenville Logistics', '2024-01-25', 'Open'),
  ((SELECT id from public.injured_workers WHERE first_name = 'Sarah' AND last_name = 'Davis' AND profile_id = (SELECT id from public.profiles WHERE user_id = 'f98dd6ea-a8c5-4e7b-aaac-c956f17e328a')), (SELECT id from public.profiles WHERE user_id = 'f98dd6ea-a8c5-4e7b-aaac-c956f17e328a'), 'SCWCC-SDAVIS01', 'Sumter Retail Group', '2024-02-01', 'Open');

-- Claims for the 5 newest workers (Added in this revision)
INSERT INTO public.claims (injured_worker_id, profile_id, wcc_file_number, employer_name, date_of_injury, claim_status)
VALUES
  -- Claim for Olivia Martinez (Managed by Scott Spivey)
  ((SELECT id from public.injured_workers WHERE first_name = 'Olivia' AND last_name = 'Martinez' AND profile_id = (SELECT id from public.profiles WHERE user_id = '228e529e-255d-43aa-a659-a5f28cdb2baf')), (SELECT id from public.profiles WHERE user_id = '228e529e-255d-43aa-a659-a5f28cdb2baf'), 'SCWCC-OMART01', 'Columbia Services Inc.', '2024-07-15', 'Open'),
  -- Claim for William Rodriguez (Managed by Scott Spivey)
  ((SELECT id from public.injured_workers WHERE first_name = 'William' AND last_name = 'Rodriguez' AND profile_id = (SELECT id from public.profiles WHERE user_id = '228e529e-255d-43aa-a659-a5f28cdb2baf')), (SELECT id from public.profiles WHERE user_id = '228e529e-255d-43aa-a659-a5f28cdb2baf'), 'SCWCC-WRODR01', 'Charleston Shipping Co.', '2023-09-05', 'Settled'),
  -- Claim for Sophia Hernandez (Managed by Scott Spivey)
  ((SELECT id from public.injured_workers WHERE first_name = 'Sophia' AND last_name = 'Hernandez' AND profile_id = (SELECT id from public.profiles WHERE user_id = '228e529e-255d-43aa-a659-a5f28cdb2baf')), (SELECT id from public.profiles WHERE user_id = '228e529e-255d-43aa-a659-a5f28cdb2baf'), 'SCWCC-SHERN01', 'Pleasant Hospitality Group', '2024-08-01', 'Open'),
  -- Claim for James Lopez (Managed by John Doe)
  ((SELECT id from public.injured_workers WHERE first_name = 'James' AND last_name = 'Lopez' AND profile_id = (SELECT id from public.profiles WHERE user_id = 'f98dd6ea-a8c5-4e7b-aaac-c956f17e328a')), (SELECT id from public.profiles WHERE user_id = 'f98dd6ea-a8c5-4e7b-aaac-c956f17e328a'), 'SCWCC-JLOPEZ01', 'Greenville Automotive', '2024-06-10', 'Open'),
  -- Claim for Isabella Gonzalez (Managed by John Doe)
  ((SELECT id from public.injured_workers WHERE first_name = 'Isabella' AND last_name = 'Gonzalez' AND profile_id = (SELECT id from public.profiles WHERE user_id = 'f98dd6ea-a8c5-4e7b-aaac-c956f17e328a')), (SELECT id from public.profiles WHERE user_id = 'f98dd6ea-a8c5-4e7b-aaac-c956f17e328a'), 'SCWCC-IGONZ01', 'Spartanburg Textiles', '2023-05-22', 'Denied');


-- Seed Courses (Example - Unchanged)
INSERT INTO public.courses (title, description, cle_credits, is_premium, published)
VALUES
  ('Introduction to SC Workers Comp', 'Fundamentals of the SC WC system.', 1.0, false, true),
  ('Advanced AWW Calculations', 'Deep dive into complex Average Weekly Wage scenarios.', 1.5, true, true),
  ('Ethics in Workers Comp Practice', 'Review of ethical considerations for SC attorneys.', 1.0, true, false), -- Example unpublished
  ('SC WC Forms Guide', 'A practical guide to completing common SC WCC forms.', 2.0, false, true),
  ('Medical Treatment Guidelines in SC WC', 'Understanding the rules and procedures for medical care.', 1.0, true, true),
  ('Settlement Strategies in SC', 'Techniques and considerations for settling WC claims.', 1.5, true, true),
  ('Appeals Process in SC WC', 'Navigating the steps for appealing a WC decision.', 1.0, false, false) -- Unpublished example
ON CONFLICT (title) DO NOTHING;

-- Seed Modules (Example, linked to courses - Unchanged)
INSERT INTO public.modules (course_id, title, content_type, "order", published)
VALUES
  -- Modules for 'Introduction to SC Workers Comp'
  ((SELECT id from public.courses WHERE title = 'Introduction to SC Workers Comp'), 'Module 1: Basic Concepts', 'text', 1, true),
  ((SELECT id from public.courses WHERE title = 'Introduction to SC Workers Comp'), 'Module 2: Filing a Claim', 'video', 2, true),
  ((SELECT id from public.courses WHERE title = 'Introduction to SC Workers Comp'), 'Module 3: Types of Benefits', 'text', 3, true),
  ((SELECT id from public.courses WHERE title = 'Introduction to SC Workers Comp'), 'Module 4: Quiz', 'quiz', 4, true),
  -- Modules for 'Advanced AWW Calculations'
  ((SELECT id from public.courses WHERE title = 'Advanced AWW Calculations'), 'Module 1: Concurrent Employment', 'text', 1, true),
  ((SELECT id from public.courses WHERE title = 'Advanced AWW Calculations'), 'Module 2: Overtime and Bonuses', 'video', 2, true),
  ((SELECT id from public.courses WHERE title = 'Advanced AWW Calculations'), 'Module 3: Case Studies', 'text', 3, true),
  -- Modules for 'SC WC Forms Guide'
  ((SELECT id from public.courses WHERE title = 'SC WC Forms Guide'), 'Module 1: Form 50 (Employer First Report)', 'video', 1, true),
  ((SELECT id from public.courses WHERE title = 'SC WC Forms Guide'), 'Module 2: Form 15 (Agreement for Comp)', 'text', 2, true),
  ((SELECT id from public.courses WHERE title = 'SC WC Forms Guide'), 'Module 3: Form 18 (Physician Report)', 'text', 3, true),
  -- Modules for 'Medical Treatment Guidelines in SC WC'
  ((SELECT id from public.courses WHERE title = 'Medical Treatment Guidelines in SC WC'), 'Module 1: Authorized Treating Physician', 'text', 1, true),
  ((SELECT id from public.courses WHERE title = 'Medical Treatment Guidelines in SC WC'), 'Module 2: Utilization Review', 'video', 2, true);

-- Seed Notes (Example)
-- Keeping only notes related to Users 1 & 2 and their workers
INSERT INTO public.notes (profile_id, injured_worker_id, note_type, content)
VALUES
  -- Notes for Scott Spivey
  ((SELECT id from public.profiles WHERE user_id = '228e529e-255d-43aa-a659-a5f28cdb2baf'), (SELECT id from public.injured_workers WHERE first_name = 'John' AND last_name = 'Smith' AND profile_id = (SELECT id from public.profiles WHERE user_id = '228e529e-255d-43aa-a659-a5f28cdb2baf')), 'Worker', 'Initial client meeting notes. Discussed DOI and mechanism.'),
  ((SELECT id from public.profiles WHERE user_id = '228e529e-255d-43aa-a659-a5f28cdb2baf'), NULL, 'Scratchpad', 'Remember to check Form 50 deadline for Garcia case.'),
  ((SELECT id from public.profiles WHERE user_id = '228e529e-255d-43aa-a659-a5f28cdb2baf'), (SELECT id from public.injured_workers WHERE first_name = 'Emily' AND last_name = 'Jones' AND profile_id = (SELECT id from public.profiles WHERE user_id = '228e529e-255d-43aa-a659-a5f28cdb2baf')), 'Claim', 'Received initial medical records for E. Jones. Review needed.'),
  -- Note for John Doe
  ((SELECT id from public.profiles WHERE user_id = 'f98dd6ea-a8c5-4e7b-aaac-c956f17e328a'), (SELECT id from public.injured_workers WHERE first_name = 'David' AND last_name = 'Williams' AND profile_id = (SELECT id from public.profiles WHERE user_id = 'f98dd6ea-a8c5-4e7b-aaac-c956f17e328a')), 'Worker', 'Follow up call scheduled with D. Williams re: PT progress.');

-- Notes for the 5 newest workers (Added in this revision)
INSERT INTO public.notes (profile_id, injured_worker_id, note_type, content)
VALUES
  -- Note for Scott Spivey about Olivia Martinez
  ((SELECT id from public.profiles WHERE user_id = '228e529e-255d-43aa-a659-a5f28cdb2baf'), (SELECT id from public.injured_workers WHERE first_name = 'Olivia' AND last_name = 'Martinez' AND profile_id = (SELECT id from public.profiles WHERE user_id = '228e529e-255d-43aa-a659-a5f28cdb2baf')), 'Claim', 'Filed Form 50 for Martinez claim.'),
  -- Note for Scott Spivey about William Rodriguez
  ((SELECT id from public.profiles WHERE user_id = '228e529e-255d-43aa-a659-a5f28cdb2baf'), (SELECT id from public.injured_workers WHERE first_name = 'William' AND last_name = 'Rodriguez' AND profile_id = (SELECT id from public.profiles WHERE user_id = '228e529e-255d-43aa-a659-a5f28cdb2baf')), 'Settlement', 'Clincher conference scheduled for Rodriguez.'),
  -- Note for Scott Spivey about Sophia Hernandez
  ((SELECT id from public.profiles WHERE user_id = '228e529e-255d-43aa-a659-a5f28cdb2baf'), (SELECT id from public.injured_workers WHERE first_name = 'Sophia' AND last_name = 'Hernandez' AND profile_id = (SELECT id from public.profiles WHERE user_id = '228e529e-255d-43aa-a659-a5f28cdb2baf')), 'Worker', 'Client call - S. Hernandez reported increased pain levels.'),
  -- Note for John Doe about James Lopez
  ((SELECT id from public.profiles WHERE user_id = 'f98dd6ea-a8c5-4e7b-aaac-c956f17e328a'), (SELECT id from public.injured_workers WHERE first_name = 'James' AND last_name = 'Lopez' AND profile_id = (SELECT id from public.profiles WHERE user_id = 'f98dd6ea-a8c5-4e7b-aaac-c956f17e328a')), 'Medical', 'Requesting updated medical records for J. Lopez from Dr. Allen.'),
  -- Note for John Doe about Isabella Gonzalez
  ((SELECT id from public.profiles WHERE user_id = 'f98dd6ea-a8c5-4e7b-aaac-c956f17e328a'), (SELECT id from public.injured_workers WHERE first_name = 'Isabella' AND last_name = 'Gonzalez' AND profile_id = (SELECT id from public.profiles WHERE user_id = 'f98dd6ea-a8c5-4e7b-aaac-c956f17e328a')), 'Claim', 'Reviewing denial basis for Gonzalez claim. Consider requesting hearing.');


-- End of Revised Seed Data Script
