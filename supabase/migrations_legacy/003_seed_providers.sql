-- ClearCross Progreso — Provider Seed Data
-- Generated: 2026-04-01
-- Run after 002_clearcross_tables.sql

-- First, get category IDs
DO $$
DECLARE
  cat_dentists uuid;
  cat_pharmacies uuid;
  cat_spas uuid;
  cat_optometrists uuid;
  cat_cosmetic uuid;
  cat_doctors uuid;
  cat_vets uuid;
BEGIN
  SELECT id INTO cat_dentists FROM categories WHERE slug = 'dentists';
  SELECT id INTO cat_pharmacies FROM categories WHERE slug = 'pharmacies';
  SELECT id INTO cat_spas FROM categories WHERE slug = 'spas';
  SELECT id INTO cat_optometrists FROM categories WHERE slug = 'optometrists';
  SELECT id INTO cat_cosmetic FROM categories WHERE slug = 'cosmetic-surgery';
  SELECT id INTO cat_doctors FROM categories WHERE slug = 'doctors';
  SELECT id INTO cat_vets FROM categories WHERE slug = 'vets';

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified, featured, avg_rating, review_count)
  VALUES (cat_dentists, 'Progreso Smile Dental Center', 'progreso-smile-dental-center', 'Calle Reynosa & Coahuila 300, Nuevo Progreso, Tamps. MX 88810', '956-246-1139', '956-376-5887', 'https://www.progresosmile.net', 'Family-owned dental office for over 20 years. Second-generation practice offering implants, crowns, dentures, root canals. Free consultations. Same-day emergency service. 6 staff members.', true, true, NULL, 14)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified, featured, avg_rating, review_count)
  VALUES (cat_dentists, 'Alpha Dental Implant Center', 'alpha-dental-implant-center', 'Plaza Arturo''s Local 12A, Nuevo Progreso, Tamps. MX', '956-567-0231', '956-567-0231', 'https://alphaddsmx.com', 'Full-service dental clinic specializing in dental implants since 1999. Dr. Edgar Guerrero Loaeza with Masters in Implantology from multiple institutions. Private units for comfort. One block from border — walk across, no car needed.', true, false, NULL, 0)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified, featured, avg_rating, review_count)
  VALUES (cat_dentists, 'Bucardo Dental Clinic', 'bucardo-dental-clinic', 'First block past Mexican Customs + Arturo''s Plaza Suite 7A, Nuevo Progreso, Tamps. MX', '956-571-3310', '956-571-3310', 'https://www.bucardodentalclinic.com', 'Dra. Sandra Bucardo — Master Implant Specialist. DDS from UANL (top 5 Mexico university), graduated 1986. Two offices in Nuevo Progreso. Services: implants, crowns, bridges, veneers, whitening, root canals, child dentistry, emergencies.', true, false, NULL, 0)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified, featured, avg_rating, review_count)
  VALUES (cat_dentists, 'Dental Artistry World Dental Centers', 'dental-artistry-world-dental-centers', 'Nuevo Progreso, Tamaulipas, MX', NULL, NULL, NULL, 'CAD/CAM technology with in-house laboratory. Leading cosmetic dentistry center. Same-day crowns and dentures available.', true, false, NULL, 0)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified, featured, avg_rating, review_count)
  VALUES (cat_dentists, 'Texas Dental Clinic', 'texas-dental-clinic', 'Av. Benito Juárez 119, Col. Nuevo Progreso, 93340 Nuevo Progreso, Tamaulipas', '+529564671535', '+529564671535', NULL, '30+ years of dental excellence (founded 1992). Dr. Cortez. Full-service with state-of-the-art technology. Virtual consultations available. Benito Juarez 119. 94% recommend on Facebook (40 reviews).', true, false, NULL, 0)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified, featured, avg_rating, review_count)
  VALUES (cat_dentists, 'Benitez Dental Clinic', 'benitez-dental-clinic', 'Av. Benito Juárez 227, Col. Centro 88810 Nuevo Progreso, Tamaulipas', NULL, NULL, NULL, 'Up-to-date technologically advanced office. Comfortable, attentive dental care with friendly staff.', false, false, NULL, 0)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified, featured, avg_rating, review_count)
  VALUES (cat_dentists, 'Mustre Dental Clinic', 'mustre-dental-clinic', 'Nuevo Progreso, Tamaulipas, MX', NULL, NULL, 'https://mustredentalclinic.com', 'Established over 20 years. Dr. Mustre and staff have attended thousands of American patients.', false, false, NULL, 0)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified, featured, avg_rating, review_count)
  VALUES (cat_dentists, 'Rio Dental Office', 'rio-dental-office', 'Nuevo Progreso, Tamaulipas, MX', NULL, NULL, NULL, 'High-quality and affordable dentistry. Up to 70% savings on dental work. Specializes in reconstructive work.', false, false, NULL, 0)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified, featured, avg_rating, review_count)
  VALUES (cat_dentists, 'Stetic Implant & Dental Centers', 'stetic-implant-dental-centers', 'Nuevo Progreso, Tamaulipas, MX', NULL, NULL, NULL, 'Since 2009. Thousands of US and Canadian patients. From simple fillings to extreme full mouth makeovers.', false, false, NULL, 0)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified, featured, avg_rating, review_count)
  VALUES (cat_dentists, 'Dr. Bernardo Rodriguez Alonso - Orthodontics', 'dr-bernardo-rodriguez-orthodontics', 'Nuevo Progreso, Tamaulipas, MX', NULL, NULL, NULL, 'Specialized orthodontic practice with specialized equipment for demanding orthodontic needs.', false, false, NULL, 0)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified, featured, avg_rating, review_count)
  VALUES (cat_dentists, 'Guadalcazar Dental Clinic', 'guadalcazar-dental-clinic', 'Nuevo Progreso, Tamaulipas, MX', NULL, NULL, 'https://www.guadalcazardentistryclinic.com', 'Wide range of dental services from cleanings to implants and orthodontics. Experienced dentists with personalized care.', false, false, NULL, 0)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified, featured, avg_rating, review_count)
  VALUES (cat_dentists, 'Hernandez Dental Clinic', 'hernandez-dental-clinic', 'Nuevo Progreso, Tamaulipas, MX', NULL, NULL, NULL, 'Best dental specialists. Complete dental group handling any types of dental procedures.', false, false, NULL, 0)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified, featured, avg_rating, review_count)
  VALUES (cat_dentists, 'Pro Dental Clinic MX', 'pro-dental-clinic-mx', 'Ave. Benito Juarez 242 Local 6, Nuevo Progreso, Tamaulipas, 88810', NULL, NULL, NULL, 'Dental clinic on main avenue (Benito Juarez).', false, false, NULL, 0)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified, featured, avg_rating, review_count)
  VALUES (cat_dentists, 'Doctors in the Sun', 'doctors-in-the-sun', 'Nuevo Progreso, Tamaulipas, MX', '956-373-9566', '956-373-9566', 'https://www.doctorsinthesun.com', 'Full mouth dental specialists. Crowns, bridges, veneers, implants. Package deals include 4 nights hotel + airport transport. Also offers plastic surgery and bariatric surgery.', true, false, NULL, 0)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified, featured, avg_rating, review_count)
  VALUES (cat_dentists, 'Dental Progreso', 'dental-progreso', 'Nuevo Progreso, Tamaulipas, MX (2-min walk from International Bridge)', NULL, NULL, 'https://www.dentaldepartures.com/dentist/dental-progreso', 'Premium clinic. Dr. Jesus Xavier Aguirre — degree in implantology from UT-San Antonio, two Masters in Implantology. ADA certified, member of ICOI and AAID. 18 years in business. Specializes in complex implantology and full-mouth restorations. Digital imaging. Walkable from border.', true, false, 4.77, 93)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified, featured, avg_rating, review_count)
  VALUES (cat_dentists, 'My Dentist in Nuevo Progreso', 'my-dentist-in-nuevo-progreso', 'Calle Reynosa #115 Local 14-B, Nuevo Progreso', '956-363-1253', NULL, 'https://www.dentaldepartures.com/dentist/my-dentist-in-nuevo-progreso', 'Multi-specialty team with 10+ years experience. ADA and ICOI affiliated. Full-arch restorations, implants, cosmetic dentistry, orthodontics, sedation. Cleanliness 4.92, Communication 4.93, Value 4.89.', true, false, 4.92, 61)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified, featured, avg_rating, review_count)
  VALUES (cat_dentists, 'Dr. Luz Marely Garcia Alvarez', 'luz-marely-garcia-alvarez', 'Plaza Rio, Nuevo Progreso, Tamaulipas, MX', NULL, NULL, 'https://www.dentaldepartures.com/dentist/luz-marely-garcia-alvarez', 'Dr. Luz Marely Garcia — Odontology degree 2004, practiced in Reynosa and Rio Bravo before opening Nuevo Progreso clinic in 2007. Full range of general and specialist dental care. 229 reviews. Plaza Rio location near border.', true, false, 4.87, 229)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified, featured, avg_rating, review_count)
  VALUES (cat_dentists, 'Valdez Aesthetic Dentistry', 'valdez-aesthetic-dentistry', 'Nuevo Progreso, Tamaulipas, MX', NULL, NULL, NULL, 'High-end cosmetic dentistry. Perfect 5.0 rating on Dental Departures. Premium pricing suggests luxury positioning.', true, false, 5.0, 0)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified, featured, avg_rating, review_count)
  VALUES (cat_dentists, 'Bridge Point Dental Clinic', 'bridge-point-dental-clinic', 'Nuevo Progreso, Tamaulipas, MX', NULL, NULL, NULL, 'Dental clinic near the International Bridge. Dental implants from $1,284.', false, false, 4.82, 0)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified, featured, avg_rating, review_count)
  VALUES (cat_dentists, 'Dr. Santana Clinic', 'dr-santana-clinic', 'Av. Benito Juarez #142 Zona Centro, Nuevo Progreso, Mexico', '956-472-4098', '956-472-4098', NULL, 'Where experience, quality and your satisfaction matters! 100% recommend on Facebook (16 reviews).', false, false, NULL, 16)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified, featured, avg_rating, review_count)
  VALUES (cat_dentists, 'Garcia''s Dental Clinic', 'garcias-dental-clinic', 'Av. Benito Juárez #213, Nuevo Progreso, Mexico', '+52 899 233 7678', '+52 899 233 7678', NULL, 'Family Dental Business. Life Is Better When You Smile! 100% recommend on Facebook (5 reviews).', false, false, NULL, 5)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified, featured, avg_rating, review_count)
  VALUES (cat_dentists, 'Doctor Dan DDS', 'doctor-dan-dds', 'Coahuila 100 Suite 15, Nuevo Progreso, Mexico', NULL, NULL, NULL, 'General dentist with in-house laboratory. 100% recommend on Facebook (11 reviews). Active posting (posted 11 hours ago).', false, false, NULL, 11)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified, featured, avg_rating, review_count)
  VALUES (cat_dentists, 'Dental World by ODC', 'dental-world-by-odc', 'Benito Juarez #218, Colonia Centro, Nuevo Progreso, Mexico', '956-217-0525', '956-217-0525', NULL, 'Experts in All-on-4 Implants. Save 50% to 70% on top-tier dental treatments. Newer clinic (3 reviews, not yet rated).', false, false, NULL, 3)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified)
  VALUES (cat_pharmacies, 'Crystal Pharmacy', 'crystal-pharmacy', 'Nuevo Progreso, Tamaulipas, MX', NULL, NULL, NULL, 'Part of Progreso Pharmacies consortium. Member of the curated ''best pharmacies'' listing. 30+ years in market.', true)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified)
  VALUES (cat_pharmacies, 'American Pharmacy', 'american-pharmacy', 'Nuevo Progreso, Tamaulipas, MX', NULL, NULL, NULL, '"We have the lowest prices in town!" Part of Progreso Pharmacies consortium. 30+ years in market.', true)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified)
  VALUES (cat_pharmacies, 'Valley Pharmacy', 'valley-pharmacy', 'Nuevo Progreso, Tamaulipas, MX', NULL, NULL, NULL, '"Your health is our priority!" Part of Progreso Pharmacies consortium. 30+ years in market.', true)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified)
  VALUES (cat_pharmacies, 'Linda Pharmacy', 'linda-pharmacy', 'Nuevo Progreso, Tamaulipas, MX', NULL, NULL, NULL, '"It''s a pleasure to work for you!" Part of Progreso Pharmacies consortium. 30+ years. Also on Yelp.', true)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified)
  VALUES (cat_pharmacies, 'Progreso Pharmacy', 'progreso-pharmacy', 'Nuevo Progreso, Tamaulipas, MX', NULL, NULL, NULL, '"Hello my friends!" Part of Progreso Pharmacies consortium. 30+ years in market.', true)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified)
  VALUES (cat_pharmacies, 'Almost Free Pharmacy', 'almost-free-pharmacy', 'Nuevo Progreso, Tamaulipas, MX', NULL, NULL, NULL, '"The real almost free spot in town!" Part of Progreso Pharmacies consortium. Also on Yelp top 10.', true)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified)
  VALUES (cat_pharmacies, 'Down Town Pharmacy', 'down-town-pharmacy', 'Nuevo Progreso, Tamaulipas, MX', NULL, NULL, NULL, '"Come talk to us and you won''t go anywhere else!" Part of Progreso Pharmacies consortium.', true)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified)
  VALUES (cat_pharmacies, 'Susy Pharmacy', 'susy-pharmacy', 'Nuevo Progreso, Tamaulipas, MX', NULL, NULL, NULL, '"Over 30 years taking care of you and your family!" Part of Progreso Pharmacies consortium. Also on Yelp.', true)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified)
  VALUES (cat_pharmacies, 'Rivera Pharmacy', 'rivera-pharmacy', 'Nuevo Progreso, Tamaulipas, MX', NULL, NULL, NULL, '"We are always ready to serve you!" Part of Progreso Pharmacies consortium.', true)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified)
  VALUES (cat_pharmacies, 'JC Pharmacy', 'jc-pharmacy', 'Nuevo Progreso, Tamaulipas, MX', NULL, NULL, NULL, '"Where you''ll find the best options for your health!" Part of Progreso Pharmacies consortium.', true)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified)
  VALUES (cat_pharmacies, 'Pancho''s Pharmacy', 'panchos-pharmacy', 'Nuevo Progreso, Tamaulipas, MX', '011528999370033', '011528999370033', 'https://eldiscosupercenter.com/panchos-pharmacy-nuevo-progreso-tamaulipas/', 'Save up to 80% on OTC and prescription medications. Conveniently located. Wide selection. Contact pharmacy to verify medication availability — person must purchase in person.', false)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified)
  VALUES (cat_pharmacies, 'Good Prices Pharmacy', 'good-prices-pharmacy', 'Av. Benito Juarez #300-B entre Sonora y Tamaulipas, Zona Centro, Nuevo Progreso, MX', '011528999371000', '956-373-9500', NULL, '22 years of experience (since 1998). WhatsApp ordering available.', false)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified)
  VALUES (cat_pharmacies, 'Farmacia Economy', 'farmacia-economy', 'Nuevo Progreso, Tamaulipas, MX', NULL, NULL, NULL, 'Wide variety of generics and medical consultation at excellent prices. 809 Facebook likes, 239 check-ins.', false)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified)
  VALUES (cat_pharmacies, 'Tommy''s Pharmacy', 'tommys-pharmacy', 'Nuevo Progreso, Tamaulipas, MX (two locations, walking distance from border)', NULL, NULL, 'https://bordercrxing.com/tommys-pharmacy.html', 'Two convenient locations within walking distance from International Border. Natural medicines, generics, brand name, and psychotropic medicines. Best prices available.', false)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified)
  VALUES (cat_pharmacies, 'Farmacia Centro Medico', 'farmacia-centro-medico', 'Nuevo Progreso, Tamaulipas, MX', NULL, NULL, NULL, 'Top-rated pharmacy on Yelp (2026). Also on Yelp top 10 drugstores list.', false)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, description)
  VALUES (cat_spas, 'Desiree's Spa & Massage', 'desirees-spa-massage', 'Nuevo Progreso, Tamaulipas, Mexico', '#1 rated massage in Nuevo Progreso on Yelp. Full body massage, therapeutic massage, spa treatments.')
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, description)
  VALUES (cat_spas, '325 Massage Studio', '325-massage-studio', 'Nuevo Progreso, Tamaulipas, Mexico', 'Yelp top 3 massage in Nuevo Progreso. Professional massage studio.')
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, description)
  VALUES (cat_spas, 'Sundara Spa', 'sundara-spa', 'Nuevo Progreso, Tamaulipas, Mexico', 'Yelp top 5 massage. Spa and wellness treatments.')
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, description)
  VALUES (cat_spas, 'Massage By Pippa', 'massage-by-pippa', 'Nuevo Progreso, Tamaulipas, Mexico', 'Yelp top 5 massage. Therapeutic and relaxation massage.')
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, description)
  VALUES (cat_spas, 'Alpha Male Spa', 'alpha-male-spa', 'Nuevo Progreso, Tamaulipas, Mexico', 'Yelp top 10 massage. Massage and spa services.')
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, description)
  VALUES (cat_spas, 'RELAX STATION', 'relax-station', 'Nuevo Progreso, Tamaulipas, Mexico', 'Yelp top 10 massage. Full body massage and relaxation services.')
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, description)
  VALUES (cat_spas, 'Gabriela Alvarez Massages', 'gabriela-alvarez-massages', 'Nuevo Progreso, Tamaulipas, Mexico', 'Individual massage therapist. Yelp top 10.')
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, description)
  VALUES (cat_spas, 'Sapphire Spa', 'sapphire-spa', 'Nuevo Progreso, Tamaulipas, Mexico', 'Spa and massage services. Yelp top 10.')
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, description)
  VALUES (cat_optometrists, 'Valle Vista Optical', 'valle-vista-optical', 'Nuevo Progreso, Tamaulipas, Mexico', 'Top-rated optometrist on Yelp. Eye exams, prescription glasses, contact lenses.')
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, description)
  VALUES (cat_optometrists, 'The Eye Experts', 'the-eye-experts', 'Nuevo Progreso, Tamaulipas, Mexico', 'Eye exams, glasses, and contacts. Yelp top 10.')
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, description)
  VALUES (cat_optometrists, 'Optic Trend', 'optic-trend', 'Nuevo Progreso, Tamaulipas, Mexico', 'Optical shop and eye care. Yelp top 10.')
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, description)
  VALUES (cat_optometrists, 'Eye Max', 'eye-max', 'Nuevo Progreso, Tamaulipas, Mexico', 'Eye exams and optical services. Yelp top 10.')
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, description)
  VALUES (cat_optometrists, 'Flores Hernandez Nancy Abigail', 'flores-hernandez-optical', 'Nuevo Progreso, Tamaulipas, Mexico', 'Individual optometrist practice. Yelp top 10.')
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, description)
  VALUES (cat_optometrists, 'Flores Castillo Cleto', 'flores-castillo-optical', 'Nuevo Progreso, Tamaulipas, Mexico', 'Optometrist practice. Yelp top 10.')
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, description)
  VALUES (cat_optometrists, 'America's Best Contacts & Eyeglasses', 'americas-best-contacts-eyeglasses', 'Nuevo Progreso, Tamaulipas, Mexico', 'National chain. Eye exams, contacts, prescription eyeglasses.')
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, description)
  VALUES (cat_optometrists, 'Ramirez Optical', 'ramirez-optical', 'Nuevo Progreso, Tamaulipas, Mexico', 'FREE eye exam! Lenses and contact lenses. Shipping available. 359 FB likes.')
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, description)
  VALUES (cat_optometrists, 'Riverside Farmacia y Optica', 'riverside-farmacia-optica', 'Nuevo Progreso, Tamaulipas, Mexico', 'Combined pharmacy and optical shop.')
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, description)
  VALUES (cat_cosmetic, 'State of Art Medical Center (956)', 'state-of-art-medical-center', 'Nuevo Progreso, Tamaulipas, Mexico', 'Board-certified surgeons, 30+ years. Dr. Carlos Vergara. Free WhatsApp consultation.')
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, description)
  VALUES (cat_cosmetic, 'Accualaser Medical Spa', 'accualaser-medical-spa', 'Nuevo Progreso, Tamaulipas, Mexico', 'State-of-the-art facility. Certified by Plastic Surgery Association of Mexico.')
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, description)
  VALUES (cat_cosmetic, 'Skin Perfections Medical Spa', 'skin-perfections-medical-spa', 'Nuevo Progreso, Tamaulipas, Mexico', 'Top-rated medical spa on Yelp. Botox, fillers, skin treatments.')
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, description)
  VALUES (cat_doctors, 'Centro Medico Emanuel', 'centro-medico-emanuel', 'Nuevo Progreso, Tamaulipas, Mexico', 'Medical center offering general medicine consultations.')
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, description)
  VALUES (cat_doctors, 'Anaya Medical Center', 'anaya-medical-center', 'Nuevo Progreso, Tamaulipas, Mexico', 'Medical center offering doctor consultations and general health services.')
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, description)
  VALUES (cat_vets, 'Nuevo Progreso Veterinary Specialists', 'nuevo-progreso-vetspecialists', 'Nuevo Progreso, Tamaulipas, Mexico', 'Specialized veterinary hospital for dogs and cats. 459 FB likes.')
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO providers (category_id, name, slug, address, description)
  VALUES (cat_vets, 'Meds for Pets Nuevo Progreso', 'meds-for-pets-nuevo-progreso', 'Nuevo Progreso, Tamaulipas, Mexico', 'Pet medications and veterinary services. Reddit-recommended.')
  ON CONFLICT (slug) DO NOTHING;

END $$;

-- Provider prices will be seeded via the app once providers exist
-- The mock-data.ts has 212 price entries that can be migrated