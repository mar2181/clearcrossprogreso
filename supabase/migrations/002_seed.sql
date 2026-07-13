-- ============================================================
-- ClearCross Progreso — seed (GENERATED from lib/mock-data.ts)
-- Regenerate with: node scripts/generate-seed.mjs
-- Idempotent: deterministic UUIDs + ON CONFLICT upserts.
-- ============================================================

-- Categories
INSERT INTO public.clearcross_categories (id, name, slug, icon, description, active, sort_order)
VALUES ('196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Dentists', 'dentists', 'smile', 'Compare prices for dental work in Nuevo Progreso, Mexico. Find verified dentists offering cleanings, crowns, implants, veneers, and more at transparent prices.', true, 1)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, icon=EXCLUDED.icon, description=EXCLUDED.description, active=EXCLUDED.active, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_categories (id, name, slug, icon, description, active, sort_order)
VALUES ('5795a7c3-de3e-5aba-aff0-5ef6d409f038', 'Pharmacies', 'pharmacies', 'pill', 'Find prescription prices from pharmacies in Nuevo Progreso. Compare costs for common medications without a US prescription.', true, 2)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, icon=EXCLUDED.icon, description=EXCLUDED.description, active=EXCLUDED.active, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_categories (id, name, slug, icon, description, active, sort_order)
VALUES ('6e325b0b-7021-508b-bd46-b06030be9a02', 'Spas', 'spas', 'sparkles', 'Relax and rejuvenate at spas in Nuevo Progreso. Compare massage, facial, and body treatment prices.', true, 3)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, icon=EXCLUDED.icon, description=EXCLUDED.description, active=EXCLUDED.active, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_categories (id, name, slug, icon, description, active, sort_order)
VALUES ('7403381c-a634-5d31-9bfd-b8f19d15a437', 'Optometrists', 'optometrists', 'eye', 'Compare prices for eye exams, glasses, and contact lenses in Nuevo Progreso.', true, 4)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, icon=EXCLUDED.icon, description=EXCLUDED.description, active=EXCLUDED.active, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_categories (id, name, slug, icon, description, active, sort_order)
VALUES ('209c155c-ad48-5413-8327-0026dd6b82ec', 'Cosmetic Surgery', 'cosmetic-surgery', 'heart', 'Find board-certified cosmetic surgeons in Nuevo Progreso offering procedures at a fraction of US prices.', true, 5)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, icon=EXCLUDED.icon, description=EXCLUDED.description, active=EXCLUDED.active, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_categories (id, name, slug, icon, description, active, sort_order)
VALUES ('89bd3e7e-4c68-5d11-b207-981d84db3c2d', 'Doctors', 'doctors', 'stethoscope', 'Find general medicine doctors and family practice physicians in Nuevo Progreso. Compare consultation fees, lab work costs, and walk-in clinic prices.', true, 6)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, icon=EXCLUDED.icon, description=EXCLUDED.description, active=EXCLUDED.active, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_categories (id, name, slug, icon, description, active, sort_order)
VALUES ('95d6bb92-7100-5657-9034-9dc5aa38261e', 'Liquor', 'liquor', 'wine', 'Compare prices for spirits, wine, and beer from shops in Nuevo Progreso.', true, 6)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, icon=EXCLUDED.icon, description=EXCLUDED.description, active=EXCLUDED.active, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_categories (id, name, slug, icon, description, active, sort_order)
VALUES ('11005ce5-d48e-5b2c-a228-54cfbd41b42d', 'Vets', 'vets', 'dog', 'Find affordable veterinary care in Nuevo Progreso for your pets.', true, 7)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, icon=EXCLUDED.icon, description=EXCLUDED.description, active=EXCLUDED.active, sort_order=EXCLUDED.sort_order;

-- Procedures
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('b132e1cb-6b2a-55eb-b7d5-79ab7988297b', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Consultation / Exam', 'consultation-exam', 'Initial dental exam or consultation', 1)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('41b545ca-b9c2-59cc-88cc-2959dd9c63d7', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Dental Cleaning', 'dental-cleaning', 'Routine prophylaxis cleaning', 2)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('7e6093d0-ba2d-5875-90bd-b685acc7ee0a', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Deep Cleaning', 'deep-cleaning', 'Scaling and root planing per quadrant', 3)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('f6b6bc12-2a0b-5efc-8cd9-2936f652957d', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Periapical X-Ray', 'periapical-xray', 'Single tooth X-ray', 4)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('493aabf6-d305-58c7-85dd-c013009007fb', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Composite Filling', 'composite-filling', 'White composite dental filling', 5)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('35a00367-8405-54e3-b675-15debc8d7c9e', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Tooth Extraction', 'tooth-extraction', 'Non-wisdom tooth extraction', 6)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('8f5606c9-bf0b-5498-819d-ada2e59d3d45', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Wisdom Tooth Extraction', 'wisdom-tooth-extraction', 'Wisdom tooth removal', 7)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('8c39494f-b810-5478-9801-0f3b90e14dc3', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Root Canal', 'root-canal', 'Root canal therapy', 8)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('cacf0037-3aa4-5464-a131-e2d1b331c928', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Metal Porcelain Crown', 'metal-porcelain-crown', 'Porcelain fused to metal crown', 9)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('41b654d0-150e-5b6e-b11c-eb4caee78133', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Zirconia Crown', 'zirconia-crown', 'Full zirconia dental crown', 10)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('b1ddbf93-0d3a-5324-ba33-2b10153d7be5', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'E-Max Crown', 'emax-crown', 'Lithium disilicate crown', 11)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('e77021cf-fe7a-53b0-82e6-367eb15b021a', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Composite Veneer', 'composite-veneer', 'Composite resin veneer per tooth', 12)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('df87f7b6-8b0f-50e6-8115-59436be7395f', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Porcelain Veneer', 'porcelain-veneer', 'Porcelain veneer per tooth', 13)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('38cb6aca-4c5d-56cd-89f5-178bae738e09', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Lumineer', 'lumineer', 'Ultra-thin porcelain veneer', 14)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('e9402b18-ed60-5924-97e2-5196a041cdc7', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Teeth Whitening', 'teeth-whitening', 'Professional teeth whitening', 15)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('3e633d44-be6e-5e82-9d60-8a9bcd2b1596', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Dental Implant', 'dental-implant', 'Single titanium implant', 16)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('ac76843f-e4c4-50b3-b5fd-6b4d65b4740a', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Crown Over Implant', 'crown-over-implant', 'Zirconia crown on implant abutment', 17)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('624a80cb-476c-5731-85f8-4495f2c82f1f', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Dentures', 'dentures', 'Complete denture per arch', 18)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('67172125-1748-59ba-b403-efdb97b0f3e2', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'All-on-4 Implants', 'all-on-4', 'Full arch on 4 implants', 19)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('198d5c6d-e5c2-552c-a91e-65de0d28334d', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'All-on-6 Implants', 'all-on-6', 'Full arch on 6 implants', 20)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('ef5e89fa-0b30-5289-8cd5-4d16b4745621', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Braces', 'braces', 'Traditional orthodontic braces', 21)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('887fe60c-3ad9-5426-8cb8-1de30f94eccb', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', '3-Unit Dental Bridge', '3-unit-bridge', 'Three-unit fixed dental bridge', 22)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('e6996d06-7f5d-5106-9469-3bf29639233b', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Bone Graft', 'bone-graft', 'Bone grafting for implant preparation', 23)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('bdc342be-2f53-5afd-a74c-49cf55e33bb5', '5795a7c3-de3e-5aba-aff0-5ef6d409f038', 'Weight Loss (Ozempic / Wegovy / Semaglutide)', 'weight-loss-ozempic-wegovy', 'Semaglutide injections and oral tablets for weight loss and diabetes', 1)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('3e90c993-d773-5fbc-9fe6-b9464248890d', '5795a7c3-de3e-5aba-aff0-5ef6d409f038', 'Insulin', 'insulin', 'Insulin pens, vials, and supplies for diabetes management', 2)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('50fcc6d0-951e-5729-9731-e7982e48367b', '5795a7c3-de3e-5aba-aff0-5ef6d409f038', 'Pain Relief / Anti-Inflammatory', 'pain-relief', 'Ibuprofen, Advil, Motrin, and other NSAID medications', 3)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('591ec2d9-c01b-5759-8c87-19ef251cb168', '5795a7c3-de3e-5aba-aff0-5ef6d409f038', 'Antibiotics', 'antibiotics', 'Azithromycin (Z-Pak), Amoxicillin, and other antibiotics', 4)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('13f7dab5-3091-5365-b0eb-6fe80fc1c73b', '5795a7c3-de3e-5aba-aff0-5ef6d409f038', 'Erectile Dysfunction', 'erectile-dysfunction', 'Sildenafil (Viagra), Tadalafil (Cialis), and generics', 5)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('7a9f4773-2501-5273-aba9-462a32a2afe6', '5795a7c3-de3e-5aba-aff0-5ef6d409f038', 'Respiratory / Asthma', 'respiratory-asthma', 'Albuterol inhalers, Salbutamol, nebulizer solutions', 6)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('dd848c80-b299-5a6d-b53c-28cb7bdc298e', '5795a7c3-de3e-5aba-aff0-5ef6d409f038', 'Acid Reflux / GI', 'acid-reflux', 'Omeprazole, Esomeprazole (Nexium), and stomach medications', 7)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('9ad787dc-c12c-5e70-8523-7c4a000cea8a', '5795a7c3-de3e-5aba-aff0-5ef6d409f038', 'Anti-Parasitic (Ivermectin)', 'ivermectin', 'Ivermectin tablets and creams', 8)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('f30d8c67-5e22-56fb-bceb-6f769704f674', '5795a7c3-de3e-5aba-aff0-5ef6d409f038', 'Blood Pressure', 'blood-pressure', 'Losartan, ACE inhibitors, and blood pressure medications', 9)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('0c632dfc-2d77-5fb6-9d5f-c19c36d41540', '5795a7c3-de3e-5aba-aff0-5ef6d409f038', 'Blood Thinner (Apixaban / Eliquis)', 'blood-thinner', 'Apixaban, Eliquis, and anticoagulant medications', 10)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('cad6df88-aaed-56c0-88f0-da98ce4003c8', '5795a7c3-de3e-5aba-aff0-5ef6d409f038', 'Skin Care (Tretinoin)', 'skin-care-tretinoin', 'Tretinoin creams and topical skin care prescriptions', 11)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('75f41a19-7c01-54b2-80a2-8eaf9eb6c648', '5795a7c3-de3e-5aba-aff0-5ef6d409f038', 'Nerve Pain (Gabapentin)', 'nerve-pain-gabapentin', 'Gabapentin, Neurontin, and neuropathic pain medications', 12)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('60b38748-ae6f-5d1f-b65f-6864a7db7877', '5795a7c3-de3e-5aba-aff0-5ef6d409f038', 'Contraceptives', 'contraceptives', 'Birth control pills and contraceptive medications', 13)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('8ea30a69-5b8a-59a8-875a-b6ea10db58d9', '209c155c-ad48-5413-8327-0026dd6b82ec', 'Cosmetic Consultation', 'cosmetic-consultation', 'Initial cosmetic surgery consultation', 1)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('713128c7-7065-5b28-a770-cdd6acd72859', '209c155c-ad48-5413-8327-0026dd6b82ec', 'Botox / Wrinkle Treatment', 'botox-wrinkle-treatment', 'Botulinum toxin injections for wrinkle reduction', 2)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('7658e2e4-96ff-5974-ae05-3655ee15c353', '209c155c-ad48-5413-8327-0026dd6b82ec', 'Dermal Fillers', 'dermal-fillers', 'Injectable dermal fillers for volume and contouring', 3)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('0a306e4b-c7d3-521b-ade9-347662bb82cc', '209c155c-ad48-5413-8327-0026dd6b82ec', 'Lip Filler', 'lip-filler', 'Lip augmentation with injectable filler', 4)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('f8bf2e81-a79f-58a2-a87a-a2fda2c54e42', '209c155c-ad48-5413-8327-0026dd6b82ec', 'Jaw Filler', 'jaw-filler', 'Jawline contouring with injectable filler', 5)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('1f69a0dc-7158-5fa0-9b55-ae940562aff4', '209c155c-ad48-5413-8327-0026dd6b82ec', 'Thread Lift', 'thread-lift', 'Non-surgical facelift using dissolvable threads', 6)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('0db80dfd-8389-559a-bac9-40bd9d673ec4', '209c155c-ad48-5413-8327-0026dd6b82ec', 'Chemical Peel', 'chemical-peel', 'Chemical exfoliation for skin rejuvenation', 7)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('2b6cf09a-30af-5afb-915f-b3ca4b75f23f', '209c155c-ad48-5413-8327-0026dd6b82ec', 'Mesotherapy', 'mesotherapy', 'Microinjections of vitamins and nutrients into the skin', 8)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('790fd46d-92aa-5be9-b66a-fe5b1146310c', '209c155c-ad48-5413-8327-0026dd6b82ec', 'Laser Skin Resurfacing', 'laser-skin-resurfacing', 'Laser treatment for skin texture and tone improvement', 9)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('5f85cd0d-d7fa-5bcf-94d5-9ed21ee3cbf1', '209c155c-ad48-5413-8327-0026dd6b82ec', 'Liposuction', 'liposuction', 'Surgical fat removal and body contouring', 10)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('2ed5686f-631a-57b1-a82c-8cbc30dc445f', '209c155c-ad48-5413-8327-0026dd6b82ec', 'Tummy Tuck', 'tummy-tuck', 'Abdominoplasty for a flatter abdomen', 11)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('488f3753-d64b-5541-b60b-d2e51e046245', '209c155c-ad48-5413-8327-0026dd6b82ec', 'Breast Augmentation', 'breast-augmentation', 'Breast implant surgery for augmentation', 12)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('bc889471-45d9-5d82-a60e-74ec4030826a', '209c155c-ad48-5413-8327-0026dd6b82ec', 'Facelift', 'facelift', 'Surgical facelift for facial rejuvenation', 13)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('415101fa-acc8-500c-a131-7aa8b6f11952', '209c155c-ad48-5413-8327-0026dd6b82ec', 'Mommy Makeover', 'mommy-makeover', 'Combined procedures to restore pre-pregnancy body', 14)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('cb89bc57-8071-5543-a92b-e552ba09c8f1', '209c155c-ad48-5413-8327-0026dd6b82ec', 'Endolift / Facial Rejuvenation', 'endolift-facial-rejuvenation', 'Minimally invasive laser skin tightening', 15)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('879ff58e-a135-56ec-807a-142d8275ef52', '209c155c-ad48-5413-8327-0026dd6b82ec', 'Spider Veins Treatment', 'spider-veins-treatment', 'Treatment for spider veins and small varicose veins', 16)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('ccf3410e-9308-5cb2-9379-029f38486241', '209c155c-ad48-5413-8327-0026dd6b82ec', 'Collagen Stimulator', 'collagen-stimulator', 'Injectable collagen-stimulating treatment', 17)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('2673edb5-1f4d-56c4-ac01-218f08732838', '209c155c-ad48-5413-8327-0026dd6b82ec', 'Profhilo', 'profhilo', 'Hyaluronic acid skin remodeling treatment', 18)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('e8791b8a-bc5a-5e59-b7e0-46aece0f7545', '209c155c-ad48-5413-8327-0026dd6b82ec', 'Tattoo Removal', 'tattoo-removal', 'Laser tattoo removal treatment', 19)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('2b62ba49-f0be-58d5-94fb-0ba131e0025b', '209c155c-ad48-5413-8327-0026dd6b82ec', 'Excessive Sweating Treatment', 'excessive-sweating-treatment', 'Hyperhidrosis treatment to reduce excessive sweating', 20)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('3d1da7d8-682e-504e-b6f3-f5dcfe11c867', '6e325b0b-7021-508b-bd46-b06030be9a02', 'Facial / Skincare Treatment', 'facial-skincare-treatment', 'Professional facial and skincare treatment', 1)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('48c711e1-6f4b-59aa-9d7a-fc0215b0acc9', '6e325b0b-7021-508b-bd46-b06030be9a02', 'Body Massage', 'body-massage', 'Full body massage therapy', 2)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('3158323d-d694-5994-a5b0-420144fe11eb', '6e325b0b-7021-508b-bd46-b06030be9a02', 'Body Scrub & Wrap', 'body-scrub-wrap', 'Exfoliating body scrub and detox wrap', 3)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('4235b5c2-fdc2-58ff-aae6-73b39c29fb8c', '6e325b0b-7021-508b-bd46-b06030be9a02', 'Manicure / Pedicure', 'manicure-pedicure', 'Nail care including manicure and pedicure services', 4)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('e4abda76-c754-5ada-a5df-3d2e73ffb864', '6e325b0b-7021-508b-bd46-b06030be9a02', 'Microblading', 'microblading', 'Semi-permanent eyebrow microblading', 5)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('25bc9f3c-bf57-53e0-9994-a20ed956ca93', '6e325b0b-7021-508b-bd46-b06030be9a02', 'Eyebrow Services (Threading / Shaping)', 'eyebrow-services', 'Eyebrow threading, shaping, and grooming', 6)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('194c2074-5552-598f-855d-e5f7551ab82c', '6e325b0b-7021-508b-bd46-b06030be9a02', 'Haircut & Styling', 'haircut-styling', 'Professional haircut and styling services', 7)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('ff59abc4-ac01-5d20-8d4c-774c966bf74d', '6e325b0b-7021-508b-bd46-b06030be9a02', 'Body Sculpting / Cellulite Treatment', 'body-sculpting-cellulite', 'Non-invasive body sculpting and cellulite reduction', 8)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('bfc7b72c-e459-5857-b2be-bab7da2f28a0', '6e325b0b-7021-508b-bd46-b06030be9a02', 'Laser Hair Removal', 'laser-hair-removal', 'Laser-based permanent hair removal', 9)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('65227a36-cbb7-5ee3-9745-6ffc2421711c', '6e325b0b-7021-508b-bd46-b06030be9a02', 'Waxing & Threading', 'waxing-threading', 'Hair removal via waxing and threading', 10)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('e7f52415-9be7-518a-9c4b-4e563e81e378', '6e325b0b-7021-508b-bd46-b06030be9a02', 'Microdermabrasion', 'microdermabrasion', 'Exfoliating skin treatment for smoother texture', 11)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('5d394a65-5842-5666-871a-7588bcd9de42', '6e325b0b-7021-508b-bd46-b06030be9a02', 'Sauna / Steam Bath', 'sauna-steam-bath', 'Relaxing sauna or steam bath session', 12)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('65814bae-4c22-543e-9dd2-261f887fe11f', '7403381c-a634-5d31-9bfd-b8f19d15a437', 'Eye Exam', 'eye-exam', 'Comprehensive eye examination', 1)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('93dc8df4-828d-515e-9d8f-5f0cde050d64', '7403381c-a634-5d31-9bfd-b8f19d15a437', 'Prescription Glasses', 'prescription-glasses', 'Prescription eyeglasses with frames and lenses', 2)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('4ece7e96-dcd0-57c2-ac35-bf364bdfcc89', '7403381c-a634-5d31-9bfd-b8f19d15a437', 'Contact Lenses', 'contact-lenses', 'Prescription contact lenses', 3)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('3ea52946-1ac4-57a6-9201-decf188c70b8', '7403381c-a634-5d31-9bfd-b8f19d15a437', 'Sunglasses', 'sunglasses', 'Prescription and non-prescription sunglasses', 4)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('aeb26298-0653-54c9-868b-d4d4d4e613b7', '7403381c-a634-5d31-9bfd-b8f19d15a437', 'Progressive Lenses', 'progressive-lenses', 'Progressive multifocal lenses', 5)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('766c94fe-c6fc-5432-b9b7-e45bbfec212e', '7403381c-a634-5d31-9bfd-b8f19d15a437', 'Eye Exam + Glasses Package', 'eye-exam-glasses-package', 'Bundled eye exam and glasses package', 6)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('0cd94470-2f0a-5da4-b85f-c4d2b2f4c253', '7403381c-a634-5d31-9bfd-b8f19d15a437', 'Same-Day Glasses', 'same-day-glasses', 'Glasses made and delivered same day', 7)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('d623b283-0a49-58de-a062-f863454de4bd', '89bd3e7e-4c68-5d11-b207-981d84db3c2d', 'Doctor Consultation', 'doctor-consultation', 'General medicine office visit / consultation', 1)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('28d57e63-70f7-51b8-8e2a-0d6a387a8cac', '89bd3e7e-4c68-5d11-b207-981d84db3c2d', 'Blood Work (CBC)', 'blood-work-cbc', 'Complete blood count lab test', 2)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('95171a4d-6b2f-5a03-95ff-6f94887aa752', '89bd3e7e-4c68-5d11-b207-981d84db3c2d', 'Metabolic Panel', 'metabolic-panel', 'Comprehensive metabolic panel lab test', 3)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('7dc08d06-5c30-5889-b649-073e8a0ec304', '89bd3e7e-4c68-5d11-b207-981d84db3c2d', 'House Call / Home Visit', 'house-call', 'Doctor visit at your location', 4)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('9f33643e-c502-5ef4-a2fb-dc8022421c8e', '89bd3e7e-4c68-5d11-b207-981d84db3c2d', 'Full Physical / Checkup', 'full-physical-checkup', 'Complete physical exam and health checkup', 5)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('99a06c1d-7678-5688-a075-c7417d0aca1b', '89bd3e7e-4c68-5d11-b207-981d84db3c2d', 'X-Ray', 'doctor-xray', 'Diagnostic X-ray imaging', 6)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('77b8aad7-5ce7-50f0-aa29-b4596211a518', '89bd3e7e-4c68-5d11-b207-981d84db3c2d', 'Injection / Vaccination', 'injection-vaccination', 'Intramuscular injection or vaccination', 7)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;
INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES ('84f02b7f-1fa1-5076-9ef8-46cb74de141a', '89bd3e7e-4c68-5d11-b207-981d84db3c2d', 'Wound Care', 'wound-care', 'Chronic wound treatment and care', 8)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;

-- Providers
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('84239a70-e0b3-5e7b-9269-f932d2201cf4', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Fernando Rodriguez DDS', 'fernando-rodriguez-dds', 'Plaza Rincones de Mexico Local 11, Benito Juárez esquina con Coahuila, 88810 Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Trusted ClearCross partner dentist in Nuevo Progreso with nearly 30 years of experience. Licensed since 1997. Full-service dental care including cleanings, crowns, implants, veneers, and cosmetic dentistry. Competitive pricing across all procedures.', NULL, '/images/providers/fernando-rodriguez.jpg', 1997, true, true, 'featured', 5, 1, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('005e8f2d-d63c-5f9a-83ff-ab3672c867bc', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Progreso Smile Dental Center', 'progreso-smile-dental-center', 'Calle Reynosa & Calle Coahuila 300, Zona Centro, 88810 Nuevo Progreso, Tamaulipas, Mexico', '956-246-1139', '956-376-5887', 'https://www.progresosmile.net', 'Family-owned dental office for over 20 years. Second-generation practice offering implants, crowns, dentures, root canals. Free consultations. Same-day emergency service. 6 staff members. High confidence pricing from clinic-owned website.', NULL, '/images/providers/clinic-exterior-modern.jpg', NULL, true, true, 'featured', 4.8, 187, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('0f9ee5e8-e5a3-5b05-a0ea-5024336e61d4', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Texas Dental Clinic', 'texas-dental-clinic', 'Av. Benito Juárez 119, Col. Nuevo Progreso, 93340 Nuevo Progreso, Tamaulipas', '+529564671535', '+529564671535', 'https://dentalimplantsmexico.com.mx', '30+ years of dental excellence (founded 1992). Dr. Cortez. Full-service with state-of-the-art technology. Virtual consultations available. The most comprehensive official price list in Nuevo Progreso. Specializes in implants and full-mouth rehabilitation.', NULL, '/images/providers/operatory-room.jpg', NULL, true, true, 'featured', 4.7, 156, 26.0548, -97.9527)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('188d9842-ef74-5a13-9e29-e1a84326d6a6', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Dental Artistry / World Dental Center', 'dental-artistry', 'Av. Benito Juárez 217, Zona Centro, 88810 Nuevo Progreso, Tamaulipas, Mexico', '956-742-8735', NULL, NULL, 'Dental clinic with some of the lowest published prices for cleanings and composite veneers in Nuevo Progreso. Offers a wide range of cosmetic and restorative procedures including All-on-4 and invisible aligners.', NULL, '/images/providers/premium-interior.jpg', NULL, true, false, 'free', 4.6, 98, 26.0542, -97.9535)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('91e424de-2c39-5859-97c1-6d5939bff1e3', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Magic Dental Clinic', 'magic-dental-clinic', 'Av. Benito Juárez 146, 88810 Nuevo Progreso, Tamaulipas, Mexico', '956-903-5241', NULL, NULL, 'Dental clinic offering a range of services from basic cleanings to crowns and veneers. Known for competitive pricing on standard procedures.', NULL, '/images/providers/reception-waiting-room.jpg', NULL, true, false, 'free', 4.5, 72, 26.055, -97.952)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('0dfee5f7-806a-5085-985e-e32e6107b987', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Guadalcazar Dental Clinic', 'guadalcazar-dental-clinic', 'Victoria 325, Dentro de Plaza San Jose, Nuevo Progreso, Tamaulipas, 88810, Mexico', '(805) 867-7850', NULL, 'https://www.guadalcazardentistryclinic.com', 'Wide range of dental services from cleanings to implants and orthodontics. Experienced dentists with personalized care. Published pricing for a wide range of procedures.', NULL, '/images/providers/dental-team.jpg', NULL, true, false, 'free', 4.3, 42, 26.0538, -97.9545)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('d6cbbac9-932f-50f5-ad26-cca07c619758', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Creative Smile', 'creative-smile', 'Calle Coahuila 364, Nuevo Progreso, Tamaulipas, 88810, Mexico', '956-275-2495', NULL, NULL, 'Dental clinic specializing in cosmetic dentistry, veneers, and full-mouth rehabilitation. Offers implant services, braces, and comprehensive smile makeovers.', NULL, '/images/providers/luxury-chair.jpg', NULL, true, false, 'free', 4.3, 45, 26.054, -97.954)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('88c05614-90f2-5973-99c6-a7cc6a984345', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Salazar Dental Implant Center', 'salazar-dental-implant-center', 'Avenida Benito Juarez c/ Sonora 209 B 101, Nuevo Progreso, Tamaulipas, 88810, Mexico', '(805) 774-1801', NULL, NULL, 'Implant-focused dental clinic with published pricing for single implants, All-on-4, All-on-6, veneers, crowns, and routine cleanings.', NULL, '/images/providers/implant-surgery-room.jpg', NULL, true, false, 'free', 4.4, 64, 26.0555, -97.9518)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('9d3cbfe8-8fec-59db-b301-1718071f394a', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Benitez Dental Clinic', 'benitez-dental-clinic', 'Av. Benito Juárez 227, Col. Centro 88810 Nuevo Progreso, Tamaulipas', NULL, NULL, NULL, 'Up-to-date technologically advanced office. Comfortable, attentive dental care with friendly staff. 2,875 Facebook likes — strong social presence.', NULL, '/images/providers/smile-design.jpg', NULL, true, false, 'free', 4.4, 53, 26.0547, -97.9528)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('3e5b4432-d1b4-5ed4-8665-db9f2e54bb7c', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'My Dentist in Nuevo Progreso', 'my-dentist-nuevo-progreso', 'Calle Reynosa #115 Local 14-B, Nuevo Progreso', '956-363-1253', NULL, 'https://www.dentaldepartures.com/dentist/my-dentist-in-nuevo-progreso', 'Multi-specialty team with 10+ years experience. ADA and ICOI affiliated. Full-arch restorations, implants, cosmetic dentistry, orthodontics, sedation. Cleanliness 4.92, Communication 4.93, Value 4.89.', NULL, '/images/providers/sterilization-room.jpg', NULL, true, false, 'free', 4.92, 61, 26.0543, -97.9532)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('c32d6cee-3857-551a-b005-36d75ece4bc3', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Muñoz Dental Care', 'munoz-dental-care', 'Plaza Rio Suite 18, Nuevo Progreso, Tamaulipas, 88810, Mexico', NULL, NULL, NULL, 'Dental clinic offering affordable cleanings, root canals, crowns, bridges, and implants. Free exam and estimation available.', NULL, '/images/providers/greeting-patient.jpg', NULL, true, false, 'free', 4.2, 38, 26.0551, -97.9523)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('553147f8-f793-57fc-820b-f36ac550ed87', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Pier Dental Clinic', 'pier-dental-clinic', 'Arturo''s Plaza 9B, Nuevo Progreso, Tamaulipas, 88810, Mexico', NULL, NULL, NULL, 'General and implant dentistry clinic offering bone grafts, braces, bridges, crowns, dentures, and extractions at published prices. Free dental checkup and consultation.', NULL, '/images/providers/consultation-desk.jpg', NULL, true, false, 'free', 4.3, 52, 26.0553, -97.9522)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('744b04ae-8ad5-53e2-b7e1-879b815cc43e', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Platinum Dental Care', 'platinum-dental-care', 'Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Dental clinic with published pricing for cleanings, implants, braces, Invisalign, crowns, veneers, and dentures. Offers competitive implant pricing starting at $800.', NULL, '/images/providers/simple-operatory.jpg', NULL, true, false, 'free', 4.1, 29, 26.0546, -97.9536)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('6579000d-4070-54f5-8b4f-bf813e929e6f', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Pro Dental Clinic Mx', 'pro-dental-clinic-mx', 'Ave. Benito Juarez 242 Local 6, Nuevo Progreso, Tamaulipas, Mexico', '956-532-1845', NULL, NULL, 'Dental clinic offering implants, All-on-4, All-on-6, veneers, crowns, and whitening services at published prices.', NULL, '/images/providers/clinic-hallway.jpg', NULL, true, false, 'free', 4.2, 34, 26.0549, -97.9525)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('f730b329-660d-5411-b31f-8566738edef2', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Rio Dental Office', 'rio-dental-office', 'Coahuila St #12, Plaza Rio Suite 19, Nuevo Progreso, Tamaulipas, Mexico', '+1 956-377-1265', NULL, NULL, 'Dental office with published pricing for cleanings, veneers, implants, crowns, root canals, and whitening.', NULL, '/images/providers/intraoral-camera.jpg', NULL, true, false, 'free', 4.1, 31, 26.0544, -97.9533)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('e8aa5ed0-ea06-5072-9b69-a736de490317', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Alpha Dental Implant Center', 'alpha-dental-implant-center', 'Plaza Arturo''s Local 12A, Nuevo Progreso, Tamps. MX', '956-567-0231', '956-567-0231', 'https://alphaddsmx.com', 'Full-service dental clinic specializing in dental implants since 1999. Dr. Edgar Guerrero Loaeza with Masters in Implantology from multiple institutions. Private units for comfort. One block from border — walk across, no car needed.', NULL, '/images/providers/perfect-smile.jpg', NULL, true, false, 'free', 4.2, 27, 26.0541, -97.9538)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('c2711f7f-2040-5122-af80-6700c121eda6', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Dr. Juan Carlos Martinez Martinez', 'dr-juan-carlos-martinez', 'Calle Coahuila Plaza Arturos Local No. 10 A, Nuevo Progreso, Tamaulipas, 88810, Mexico', NULL, NULL, NULL, 'Private dental practice offering implants, braces, veneers, extractions, and whitening services.', NULL, '/images/providers/clinic-entrance-plaza.jpg', NULL, true, false, 'free', 4, 22, 26.0552, -97.9519)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('ac5e149d-5e09-55b9-b18b-1e6dcc455198', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'SMILE MAKEOVERS / Stetic Implant & Dental Centers', 'smile-makeovers-stetic', '100 Avenida Benito Juarez, Nuevo Progreso, Tamaulipas, 88810, Mexico', NULL, NULL, NULL, 'Since 2009. Thousands of US and Canadian patients. From simple fillings to extreme full mouth makeovers. Free consultations, veneers, Lumineers, root canals, deep cleaning, and bone grafting services.', NULL, '/images/providers/neighborhood-clinic.jpg', NULL, true, false, 'free', 4.1, 35, 26.0556, -97.9516)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('47aa5a0a-a36f-5848-9dec-c600f73af74c', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Dental Rocío', 'dental-rocio', 'Plaza Arturos, Planta Alta, Calle Coahuila 192-Local 7b, 88810 Nuevo Progreso, Tamaulipas, Mexico', '979-505-0568', NULL, 'https://dentalrocionuevoprogreso.me/', 'Dental clinic offering cleaning, whitening, crowns, implants, braces, fillings, root canal, and dentures. Official website available but no public price list posted.', NULL, '/images/providers/cadcam-milling.jpg', NULL, true, false, 'free', 4.6, 78, 26.0539, -97.9542)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('4571cbe2-1d15-5944-ae98-c10a6a0ccabd', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Dental Progreso', 'dental-progreso', 'Nuevo Progreso, Tamaulipas, MX (2-min walk from International Bridge)', NULL, NULL, 'https://www.dentaldepartures.com/dentist/dental-progreso', 'Premium clinic. Dr. Jesus Xavier Aguirre — degree in implantology from UT-San Antonio, two Masters in Implantology. ADA certified, member of ICOI and AAID. 18 years in business. Specializes in complex implantology and full-mouth restorations. Digital imaging. Walkable from border.', NULL, '/images/providers/implant-surgery-room.jpg', NULL, true, false, 'free', 4.77, 93, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('c0d1278b-dfa7-5c8c-a8dd-9beb6a6b37e0', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Dr. Luz Marely Garcia Alvarez', 'luz-marely-garcia-alvarez', 'Plaza Rio, Nuevo Progreso, Tamaulipas, MX', NULL, NULL, 'https://www.dentaldepartures.com/dentist/luz-marely-garcia-alvarez', 'Dr. Luz Marely Garcia — Odontology degree 2004, practiced in Reynosa and Rio Bravo before opening Nuevo Progreso clinic in 2007. Full range of general and specialist dental care. 229 reviews. Plaza Rio location near border.', NULL, '/images/providers/dental-team.jpg', NULL, true, false, 'free', 4.87, 229, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('b4d0aabf-26e3-552d-bf2a-ce841b9b8261', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Mustre Dental Clinic', 'mustre-dental-clinic', 'Nuevo Progreso, Tamaulipas, MX', '956-393-7951', NULL, 'https://mustredentalclinic.com', 'Established over 20 years. Dr. Mustre and staff have attended thousands of American patients. Services include general dentistry, orthodontics, and Invisalign.', NULL, '/images/providers/consultation-desk.jpg', NULL, false, false, 'free', 0, 0, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('506d9e45-f958-5ad6-b0f7-33066a9ae72c', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Dr. Santana Clinic', 'dr-santana-clinic', 'Av. Benito Juarez #142 Zona Centro, Nuevo Progreso, Mexico', '956-472-4098', '956-472-4098', NULL, 'Where experience, quality and your satisfaction matters! 100% recommend on Facebook (16 reviews).', NULL, '/images/providers/smile-design.jpg', NULL, false, false, 'free', 0, 0, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('ee8a282c-f02c-51fb-9e22-2bdad9682ec4', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Bucardo Dental Clinic', 'bucardo-dental-clinic', 'First block past Mexican Customs + Arturo''s Plaza Suite 7A, Nuevo Progreso, Tamps. MX', '956-571-3310', '956-571-3310', 'https://www.bucardodentalclinic.com', 'Dra. Sandra Bucardo — Master Implant Specialist. DDS from UANL (top 5 Mexico university), graduated 1986. Two offices in Nuevo Progreso. Services: implants, crowns, bridges, veneers, whitening, root canals, child dentistry, emergencies.', NULL, '/images/providers/clinic-entrance-plaza.jpg', NULL, true, false, 'free', 0, 0, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('159068ec-ce7c-5d05-af75-5a32c0c43cc4', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Garcia''s Dental Clinic', 'garcias-dental-clinic', 'Av. Benito Juárez #213, Nuevo Progreso, Mexico', '+52 899 233 7678', '+52 899 233 7678', NULL, 'Family Dental Business. Life Is Better When You Smile! 100% recommend on Facebook (5 reviews).', NULL, '/images/providers/greeting-patient.jpg', NULL, false, false, 'free', 0, 0, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('a5220b44-4439-5636-9236-3bf5cc37e6ac', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Doctor Dan DDS', 'doctor-dan-dds', 'Coahuila 100 Suite 15, Nuevo Progreso, Mexico', NULL, NULL, NULL, 'General dentist with in-house laboratory. 100% recommend on Facebook (11 reviews). Active posting (posted 11 hours ago).', NULL, '/images/providers/simple-operatory.jpg', NULL, false, false, 'free', 0, 0, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('b345d46b-b808-5259-a78d-6f5d9d80b2f4', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Dental World by ODC', 'dental-world-by-odc', 'Benito Juarez #218, Colonia Centro, Nuevo Progreso, Mexico', '956-217-0525', '956-217-0525', NULL, 'Experts in All-on-4 Implants. Save $100s-$1000s on top-tier dental treatments. Newer clinic (3 reviews, not yet rated).', NULL, '/images/providers/premium-interior.jpg', NULL, false, false, 'free', 0, 0, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('a64f50d6-9e67-5789-a654-2f93f4b7ec8d', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Bridge Point Dental Clinic', 'bridge-point-dental-clinic', 'Nuevo Progreso, Tamaulipas, MX', NULL, NULL, NULL, 'Dental clinic near the International Bridge. Dental implants from $1,284.', NULL, '/images/providers/neighborhood-clinic.jpg', NULL, false, false, 'free', 4.82, 0, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('07042f0a-0034-58ed-9408-dc02385671ed', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Valdez Aesthetic Dentistry', 'valdez-aesthetic-dentistry', 'Nuevo Progreso, Tamaulipas, MX', NULL, NULL, NULL, 'High-end cosmetic dentistry. Perfect 5.0 rating on Dental Departures. Premium pricing suggests luxury positioning. Dental implants from $2,569 (highest in Progreso).', NULL, '/images/providers/luxury-chair.jpg', NULL, true, false, 'free', 5, 0, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('a96b9f21-d43d-5a49-a1d4-016427c58051', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Dr. Bernardo Rodriguez Alonso - Orthodontics', 'dr-bernardo-rodriguez-orthodontics', 'Nuevo Progreso, Tamaulipas, MX', NULL, NULL, NULL, 'Specialized orthodontic practice with specialized equipment for demanding orthodontic needs.', NULL, '/images/providers/clinic-hallway.jpg', NULL, false, false, 'free', 0, 0, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('b4a54304-ab8a-55bf-b97b-e85799f51362', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Hernandez Dental Clinic', 'hernandez-dental-clinic', 'Nuevo Progreso, Tamaulipas, MX', NULL, NULL, NULL, 'Best dental specialists. Complete dental group handling any types of dental procedures.', NULL, '/images/providers/clinic-exterior-modern.jpg', NULL, false, false, 'free', 0, 0, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('a2e83f94-22c4-52fc-a3c9-396b9cd1af23', '196eddc0-8a3e-59d8-ad7b-a61b70d49261', 'Doctors in the Sun', 'doctors-in-the-sun', 'Nuevo Progreso, Tamaulipas, MX', '956-373-9566', '956-373-9566', 'https://www.doctorsinthesun.com', 'Full mouth dental specialists. Crowns, bridges, veneers, implants. Package deals include 4 nights hotel + airport transport. Also offers plastic surgery and bariatric surgery.', NULL, '/images/providers/doctor-consultation-room.jpg', NULL, true, false, 'free', 0, 0, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('853ec9de-0fce-583f-8800-d16dc786cec2', '5795a7c3-de3e-5aba-aff0-5ef6d409f038', 'Farmacias Benavides', 'farmacias-benavides', 'Calle Coahuila / Esq. Coahuila y Reynosa, 88810 Nuevo Progreso, Tamaulipas, Mexico', '+52 81 8126 0000', NULL, 'https://www.benavides.com.mx', 'Major Mexican pharmacy chain with a location in Nuevo Progreso. Full catalog of prescription and OTC medications. Published pricing on their official website — high confidence pricing for most products.', NULL, '/images/providers/pharmacy-chain-exterior.jpg', NULL, true, true, 'featured', 4.3, 89, 26.0547, -97.953)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('27be76b7-e7d6-5bf1-bdc7-4cdae75e7ac4', '5795a7c3-de3e-5aba-aff0-5ef6d409f038', 'Pancho''s Pharmacy / El Disco', 'panchos-pharmacy', 'Av. Benito Juárez 206, 88810 Nuevo Progreso, Tamaulipas, Mexico', '011 52 899 937 0033', NULL, 'https://eldiscosupercenter.com/panchos-pharmacy-nuevo-progreso-tamaulipas/', 'Well-known local pharmacy inside El Disco Super Center on the main strip. Popular with Winter Texans and day-trippers. Carries Ozempic, inhalers, skin care, and a wide range of prescriptions at competitive prices.', NULL, '/images/providers/pharmacy-local-exterior.jpg', NULL, true, true, 'featured', 4.5, 134, 26.0546, -97.9528)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('bbde7181-7d9c-597d-8296-188d4d9e2c57', '5795a7c3-de3e-5aba-aff0-5ef6d409f038', 'Jessica''s Med Center', 'jessicas-med-center', 'Nuevo Progreso, Tamaulipas, Mexico', '+52 899 937 0775', NULL, NULL, 'Local pharmacy and medical supplies store. Known for affordable insulin, gabapentin, and generic blood thinner medications. Frequently mentioned in community forums.', NULL, '/images/providers/pharmacy-chain-counter.jpg', NULL, true, false, 'free', 4.4, 67, 26.0543, -97.9535)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('7d034c6b-3fd7-5ded-b9e9-475f57677e5f', '5795a7c3-de3e-5aba-aff0-5ef6d409f038', 'Linda Pharmacy', 'linda-pharmacy', 'Av. Benito Juárez 200, Centro, 88810 Nuevo Progreso, Tamaulipas, Mexico', '+52 899 937 0105', NULL, NULL, 'Independent pharmacy on the main Juárez strip. Featured in diabetes community guides for affordable insulin (Novolog, Levemir). Well-documented pricing from buying guides.', NULL, '/images/providers/pharmacy-local-counter.jpg', NULL, true, false, 'free', 4.3, 45, 26.0545, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('62341662-e3cc-5790-bd07-e82dd297fea2', '5795a7c3-de3e-5aba-aff0-5ef6d409f038', 'Shammah Pharmacy & Yumi Spa', 'shammah-pharmacy', 'Plaza Juárez, Av. Benito Juárez 140-Suite 11, 88810 Nuevo Progreso, Tamaulipas, Mexico', '+52 899 937 0870', NULL, NULL, 'Combined pharmacy and spa in Plaza Juárez. Known in community groups for very low prices on antibiotics. Also offers spa services.', NULL, '/images/providers/pharmacy-boutique.jpg', NULL, true, false, 'free', 4.2, 32, 26.0544, -97.9532)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('eddc556e-2ac0-55f5-8418-e7126073fc71', '5795a7c3-de3e-5aba-aff0-5ef6d409f038', 'Angel''s Pharmacy', 'angels-pharmacy', 'Av. Benito Juárez 301, 88810 Nuevo Progreso, Tamaulipas, Mexico', '(956) 314-0433', NULL, NULL, 'Independent pharmacy on Juárez Avenue. Known for affordable albuterol inhalers and general prescriptions.', NULL, '/images/providers/pharmacy-consultation.jpg', NULL, true, false, 'free', 4.1, 28, 26.0549, -97.9525)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('c726b1f4-1490-543a-b914-532b2cc9df68', '5795a7c3-de3e-5aba-aff0-5ef6d409f038', 'El Disco Super Center Pharmacy', 'el-disco-pharmacy', 'Av. Benito Juárez 200, 88810 Nuevo Progreso, Tamaulipas, Mexico', '+52 899 937 0120', NULL, NULL, 'Pharmacy inside El Disco Super Center. Carries oral semaglutide and other popular medications. Convenient one-stop shopping with the supermarket.', NULL, '/images/providers/pharmacy-chain-interior.jpg', NULL, true, false, 'free', 4, 41, 26.0546, -97.9527)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('fc4522a9-22b8-560a-b9d7-2457b276eaa1', '5795a7c3-de3e-5aba-aff0-5ef6d409f038', 'LM Pharmacy', 'lm-pharmacy', 'Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Local independent pharmacy. Community reports mention Ozempic availability.', NULL, '/images/providers/pharmacy-local-service.jpg', NULL, true, false, 'free', 3.9, 15, 26.0541, -97.9538)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('102c9284-2c93-5493-9c39-b0ea1ab2623e', '5795a7c3-de3e-5aba-aff0-5ef6d409f038', 'Angie''s Pharmacy', 'angies-pharmacy', 'Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Local pharmacy mentioned in community groups for Ozempic availability.', NULL, '/images/providers/pharmacy-medcenter-exterior.jpg', NULL, true, false, 'free', 4, 12, 26.054, -97.954)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('51565e96-0b92-5f67-9b93-1b4f142060b1', '5795a7c3-de3e-5aba-aff0-5ef6d409f038', 'El Ezaby Pharmacy', 'el-ezaby-pharmacy', 'Plaza Jalisco, Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Pharmacy in Plaza Jalisco. Community reports on Mounjaro pricing available.', NULL, '/images/providers/pharmacy-counting-pills.jpg', NULL, true, false, 'free', 3.8, 9, 26.0537, -97.9543)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('ed1e2bea-21ed-5ace-acfe-9cfccc935291', '209c155c-ad48-5413-8327-0026dd6b82ec', 'International Clinic of Cosmetics', 'international-clinic-of-cosmetics', 'Av. Benito Juárez 211, Nuevo Progreso, Tamaulipas, Mexico', '(956) 246-4136', NULL, 'http://www.internationalclinicm.com/', 'Full-service medical aesthetics and cosmetic clinic offering Botox, fillers, laser treatments, PRP, Hollywood Peel, endolifting, and facial rejuvenation. One of the highest-rated clinics in Nuevo Progreso.', NULL, '/images/providers/cosmetic-consultation.jpg', NULL, true, true, 'featured', 4.9, 47, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('8af0db92-4598-5398-b7ea-66a194d3f9cf', '209c155c-ad48-5413-8327-0026dd6b82ec', 'Integra Medical Center', 'integra-medical-center', 'Av. Benito Juárez 239 Centro, Nuevo Progreso (Rio Bravo), Tamaulipas, Mexico', '(956) 475-4368', NULL, 'https://integramedicalcenter.com/', 'Plastic surgery and medical spa offering consultations, breast implants, facelift, liposuction, tummy tuck, dermal fillers, mesotherapy, and mole removal. Perfect 5-star rating.', NULL, '/images/providers/cosmetic-treatment-room.jpg', NULL, true, true, 'featured', 5, 22, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('b7d11a74-7326-51cd-b107-92e5c99f8ee7', '209c155c-ad48-5413-8327-0026dd6b82ec', 'Accualaser Plastic Surgery Associates', 'accualaser-plastic-surgery', 'B and P Bridge Colonia, Nuevo Progreso, Tamaulipas, Mexico', '+52 956 225 3164', NULL, NULL, 'Plastic surgery clinic near the international bridge, offering cosmetic surgery procedures.', NULL, '/images/providers/cosmetic-botox-injection.jpg', NULL, false, false, 'free', 3.4, 8, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('c847ca62-af88-5061-b8dc-f15f3c3e2c43', '209c155c-ad48-5413-8327-0026dd6b82ec', 'CLÍNICA NOVO CORPO', 'clinica-novo-corpo', 'Av. Benito Juárez 194, Nuevo Progreso, Tamaulipas, Mexico', '(956) 803-6029', NULL, NULL, 'Cosmetic and body aesthetics clinic on the main avenue in Nuevo Progreso.', NULL, '/images/providers/doctor-consultation-room.jpg', NULL, false, false, 'free', 0, 0, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('fc2ff05d-a8c1-5f3d-a750-995889a47411', '209c155c-ad48-5413-8327-0026dd6b82ec', 'Clinica de Imagen', 'clinica-de-imagen', 'Sonora 117, Nuevo Progreso, Tamaulipas, Mexico', '+52 956 878 5885', NULL, NULL, 'Cosmetic and aesthetic clinic offering Botox and injectable treatments in Nuevo Progreso.', NULL, '/images/providers/doctor-stethoscope.jpg', NULL, false, false, 'free', 0, 0, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('8dee2cef-fad4-5694-97fa-3b4181d8d89a', '209c155c-ad48-5413-8327-0026dd6b82ec', 'Dr. Paulina Verastegui', 'dr-paulina-verastegui', 'Avenida Benito Juarez 224, Col Centro, Nuevo Progreso, Tamaulipas, 88810 Mexico', NULL, NULL, 'https://www.whatclinic.com/beauty-clinics/mexico/nuevo-progreso/dr-paulina-verastegui', 'Medical aesthetics specialist offering dermal fillers, jaw fillers, lip fillers, mesotherapy, thread lifts, collagen stimulators, spider vein treatment, and excessive sweating treatment. Transparent pricing with strong online presence.', NULL, '/images/providers/ct-scanner.jpg', NULL, true, true, 'featured', 5, 88, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('ae037cf6-c8ee-5c98-a074-a0b1c2ad09b0', '209c155c-ad48-5413-8327-0026dd6b82ec', 'Dr. Victoria Navarro', 'dr-victoria-navarro', 'COMERCIAL GONZALEZ, Av. Benito Juárez 321, Nuevo Progreso, Tamaulipas, Mexico', '(956) 607-0314', NULL, NULL, 'Specialist in orofacial harmonization and facial aesthetics. Strong social media presence showcasing facial rejuvenation work.', NULL, '/images/providers/doctor-waiting-area.jpg', NULL, false, false, 'free', 5, 12, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('f6124153-0056-5cad-8efe-2bd8f087d568', '209c155c-ad48-5413-8327-0026dd6b82ec', 'Dr. Estrada - Medical & Dental Group', 'dr-estrada-medical-dental', 'Av. Benito Juárez 240-A, Nuevo Progreso, Tamaulipas, Mexico', '(956) 865-3215', NULL, 'http://www.drulisesestrada.com/', 'Combined cosmetic dentistry and aesthetics practice offering dental and facial cosmetic procedures.', NULL, '/images/providers/happy-result.jpg', NULL, false, false, 'free', 4.7, 15, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('4406ee2f-ce79-5db9-a5e1-daff1a970ab0', '209c155c-ad48-5413-8327-0026dd6b82ec', 'Dra. Katya Corona - Aesthetic Clinic', 'dra-katya-corona-aesthetic', 'Av. Benito Juarez #144, Nuevo Progreso, Tamaulipas, 88810 Mexico', NULL, NULL, 'https://www.whatclinic.com/beauty-clinics/mexico/nuevo-progreso/dra-katya-corona-aesthetic-clinic', 'Non-surgical aesthetics clinic offering chemical peels, dermal fillers, mesotherapy, thread lifts, laser resurfacing, tattoo removal, and Profhilo treatments at very competitive prices.', NULL, '/images/providers/family-waiting.jpg', NULL, true, false, 'free', 0, 0, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('a6e9b234-038e-5bbd-9af5-64ad0e3cb7f5', '6e325b0b-7021-508b-bd46-b06030be9a02', 'Yomi''s Spa', 'yomis-spa', 'Av. Benito Juárez 231A, 88810 Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, 'https://www.fresha.com/lvp/yomis-spa-avenida-benito-juarez-nuevo-progreso-bxN0Pg', 'Full-service spa offering body scrubs, body wraps, sauna, pedicures, manicures, and beauty services. Open daily on the main avenue.', NULL, '/images/providers/spa-facial-treatment.jpg', NULL, false, false, 'free', 4.2, 15, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('42b0f688-0b89-5b05-b475-7b668eb8f823', '6e325b0b-7021-508b-bd46-b06030be9a02', 'ALMITAS SPA', 'almitas-spa', '251 Benito Juarez, Calle Principal, 88810 Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, 'https://www.fresha.com/lvp/almitas-spa-nuevo-progreso-46NE4q', 'Popular spa and salon offering facials, acne treatments, dermaplaning, body sculpting, cellulite treatment, eyebrow threading, bridal makeup, massages, nails, and waxing. 94% recommended on Facebook.', NULL, '/images/providers/spa-massage-room.jpg', NULL, false, true, 'featured', 4.3, 24, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('b0977e6f-37d9-524a-acae-50832205c0a1', '6e325b0b-7021-508b-bd46-b06030be9a02', 'Spa Las Flores', 'spa-las-flores', 'Reynosa, Zona Centro, 88810 Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Relaxing spa in the heart of Nuevo Progreso with a perfect 5-star rating. Open Monday through Saturday.', NULL, '/images/providers/spa-salon-interior.jpg', NULL, false, false, 'free', 5, 5, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('b76dd227-4a4d-5504-9f27-4c1fbe3f9a8a', '6e325b0b-7021-508b-bd46-b06030be9a02', 'Erika''s Salon Spa', 'erikas-salon-spa', 'Av. Benito Juárez, 88810 Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, 'https://www.fresha.com/lvp/erikas-salon-spa-avenida-benito-juarez-nuevo-progreso-loB5Be', 'Salon and spa on the main avenue offering spa treatments and beauty services. Open daily 8AM-7PM.', NULL, '/images/providers/spa-nail-station.jpg', NULL, false, false, 'free', 3.4, 3, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('ee635796-abb3-54ad-93bb-fb67f1240cbc', '6e325b0b-7021-508b-bd46-b06030be9a02', 'Mariel''s Salon Spa', 'mariels-salon-spa', 'Av. Benito Juárez 329, Centro, 88810 Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, 'https://www.fresha.com/lvp/mariels-salon-spa-avenida-benito-juarez-nuevo-progreso-jbjL2R', 'Full-service salon and spa specializing in microblading, eyebrow services, balayage, beard trims, and beauty treatments. Open daily 8AM-6PM.', NULL, '/images/providers/spa-microblading.jpg', NULL, false, true, 'featured', 4.4, 18, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('3c308679-4267-557b-a477-8cfc83633317', '6e325b0b-7021-508b-bd46-b06030be9a02', 'Elegance Boutique & Spa', 'elegance-boutique-spa', 'Av. Benito Juárez 132, 88810 Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, 'https://eleganceboutiquespa.com/', 'Combined boutique and spa offering laser hair removal, nail services, barber/haircut services, and beauty products.', NULL, '/images/providers/spa-body-sculpting.jpg', NULL, false, false, 'free', 2.6, 2, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('f82ad699-9b5b-54b3-a28c-5b7f3fee3c19', '6e325b0b-7021-508b-bd46-b06030be9a02', 'Spa Miranda', 'spa-miranda', 'C. Baja California 330, 88810 Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Beauty and cosmetics spa specializing in microblading, microshading, tattooing, full lips, eyeliner, and artistic cosmetic work. Perfect 5-star rating.', NULL, '/images/providers/spa-relaxation-area.jpg', NULL, false, false, 'free', 5, 4, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('7418bc86-8755-5cc4-91aa-12b86c7476c4', '6e325b0b-7021-508b-bd46-b06030be9a02', 'Slim Spa', 'slim-spa', 'Ave. Benito Juarez, 88810 Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Spa and health club on the main avenue. Open Saturdays.', NULL, '/images/providers/spa-sauna-steam.jpg', NULL, false, false, 'free', 0, 0, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('60b023da-4250-563a-8f05-bc1ae2781b1d', '7403381c-a634-5d31-9bfd-b8f19d15a437', 'FLORES OPTICAL', 'flores-optical', 'Av. Benito Juárez 110, B and P Bridge Colonia, 88810 Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, 'https://www.instagram.com/floresoptical/', 'Leading eye care center on the main avenue with 700+ frames from top brands including Ray-Ban Meta smart glasses. Offers eye exams, contacts (Acuvue, Air Optix, Biofinity), same-day glasses, and prescription options including anti-reflective and transition lenses.', NULL, '/images/providers/optical-exam-room.jpg', NULL, true, true, 'featured', 4.6, 35, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('189b05a2-2bf7-591e-ab62-077180ed1cdf', '7403381c-a634-5d31-9bfd-b8f19d15a437', 'Ramirez Optical', 'ramirez-optical', 'Av. Benito Juárez 321, Centro, 88810 Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, 'https://www.facebook.com/ramirezoptical/', 'Established optical shop offering free eye exams, prescription glasses, progressive Blueray Transition lenses, and contact lenses in a variety of brands and colors. Ships to any location.', NULL, '/images/providers/optical-frames-display.jpg', NULL, false, true, 'featured', 0, 0, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('318bdd46-391c-528f-86e5-29ed73fcae08', '7403381c-a634-5d31-9bfd-b8f19d15a437', 'Bocanegra Ópticas', 'bocanegra-opticas', 'Reynosa 222-Local 1, 88810 Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Highly-rated optician offering free eye exams, modern eyeglass frames, contact lenses, and same-day specialty glasses at affordable prices. Perfect 5-star rating.', NULL, '/images/providers/optical-storefront.jpg', NULL, false, true, 'featured', 5, 12, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('2b5756a1-8859-5565-a48f-347d3065df7e', '7403381c-a634-5d31-9bfd-b8f19d15a437', 'EXPERT VISION OPTICAL', 'expert-vision-optical', 'Reynosa 328, 88810 Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Optical shop offering lenses and glasses with special discounts — 30% off for adults 65+ and 25% off for students during promotional periods.', NULL, '/images/providers/optical-exam-room.jpg', NULL, false, false, 'free', 0, 0, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('18fe0582-9593-51f0-bfc2-8bed009e61d4', '7403381c-a634-5d31-9bfd-b8f19d15a437', 'Optical Jesslife', 'optical-jesslife', 'Plaza Río, Calle Coahuila 339-Local #12, 88810 Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Optometrist located in Plaza Río offering eye care services. Open daily with extended hours.', NULL, '/images/providers/optical-frames-display.jpg', NULL, false, false, 'free', 0, 0, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('8496594e-e615-5b0e-aa45-24e580babfd2', '7403381c-a634-5d31-9bfd-b8f19d15a437', 'RIVERSIDE FARMACIA Y OPTICA', 'riverside-farmacia-optica', 'Calle Coahuila 330, 88810 Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Combined pharmacy and optical shop. Perfect 5-star rating. Open daily 8AM-7PM.', NULL, '/images/providers/optical-storefront.jpg', NULL, false, false, 'free', 5, 3, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('5e03ca91-b695-53f3-a511-a83180beb492', '7403381c-a634-5d31-9bfd-b8f19d15a437', 'Óptica Almaguer', 'optica-almaguer', 'Chihuahua, 88810 Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Local optician offering free eye exams and eyeglasses.', NULL, '/images/providers/optical-exam-room.jpg', NULL, false, false, 'free', 0, 0, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('bc7a075e-4919-51ed-a327-c57ceb3e9c02', '7403381c-a634-5d31-9bfd-b8f19d15a437', 'Oftalmólogo', 'oftalmologo-nuevo-progreso', 'Sonora 115, 88810 Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Ophthalmology medical office offering specialized eye care. Perfect 5-star rating.', NULL, '/images/providers/optical-frames-display.jpg', NULL, false, false, 'free', 5, 4, 26.0545, -97.9531)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('ca564e65-4650-579e-aa80-3b5e9bb4e7e0', '89bd3e7e-4c68-5d11-b207-981d84db3c2d', 'Dr. Jose Ma. De Leon Cantu', 'dr-jose-de-leon-cantu', 'Matamoros 114, Centro, 88810 Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Highest-rated general practitioner in Nuevo Progreso with perfect 5-star reviews on Doctoralia. Offers house calls, primary care, chronic wound care, and pain medicine. Private practice with personal attention.', NULL, '/images/providers/doctor-consultation-room.jpg', NULL, false, true, 'free', 5, 6, 26.0582, -97.9526)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('ce4f3833-67ee-5dd4-b31f-ac0b45dcd82f', '89bd3e7e-4c68-5d11-b207-981d84db3c2d', 'Centro Medico Emanuel', 'centro-medico-emanuel', 'Calle Coahuila 201, 88810 Nuevo Progreso, Tamaulipas, Mexico', '+52 899 937 0370', NULL, NULL, 'Popular family practice clinic run by Dr. Esequiel Gonzalez and Dr. Juan Pulido. Dr. Pulido speaks perfect English and is highly recommended by winter Texans on TripAdvisor. Walk-in visits, lab work available next door with 45-minute turnaround. $35 USD per visit.', NULL, '/images/providers/doctor-stethoscope.jpg', NULL, false, true, 'free', 4.8, 12, 26.0558, -97.954)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('3007d1ba-7fa4-57b9-a384-e78feec6704a', '89bd3e7e-4c68-5d11-b207-981d84db3c2d', 'Anaya Medical Center', 'anaya-medical-center', 'Calle Chihuahua 206, 88810 Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'General medicine clinic led by Dr. Marco Antonio Anaya Perez. Open 8 AM to 7 PM. Perfect 5-star rating on Doctoralia with positive patient reviews.', NULL, '/images/providers/doctor-waiting-area.jpg', NULL, false, false, 'free', 5, 3, 26.056, -97.9535)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('f9516d06-ec82-51d8-9e8b-4a4b25d40196', '89bd3e7e-4c68-5d11-b207-981d84db3c2d', 'Dr. Pedro Martin Hurtado Ortiz', 'dr-pedro-hurtado-ortiz', 'Calle Coahuila 192, 88810 Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'General medicine practitioner with a 5-star rating on Doctoralia. Private practice on Calle Coahuila in the center of Nuevo Progreso.', NULL, '/images/providers/ct-scanner.jpg', NULL, false, false, 'free', 5, 2, 26.0555, -97.9542)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('4dd2ce76-83b4-54e3-be4e-1dc3b477338c', '89bd3e7e-4c68-5d11-b207-981d84db3c2d', 'Dra. Cintya Gonzalez Suarez', 'dra-cintya-gonzalez-suarez', 'Calle Sonora 222, Local 10, 88810 Nuevo Progreso, Tamaulipas, Mexico', '+52 899 937 0739', NULL, NULL, 'General medicine doctor with a confirmed office in Nuevo Progreso. Listed on Doctoralia, Doctuo, and Guiatel directories.', NULL, '/images/providers/family-waiting.jpg', NULL, false, false, 'free', 4.5, 0, 26.055, -97.9528)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('381292f8-e79d-5c16-aa1f-3118dc4c09df', '89bd3e7e-4c68-5d11-b207-981d84db3c2d', 'Consultorio Medico Juárez', 'consultorio-medico-juarez', 'Calle Benito Juarez 231, Manuel Cavazos Lerma, 88810 Nuevo Progreso, Tamaulipas, Mexico', '+52 899 937 0091', NULL, NULL, 'Walk-in medical office open 7 days a week on the main avenue. Convenient location for visitors crossing the border. General consultations available daily from 8 AM to 7 PM.', NULL, '/images/providers/doctor-consultation-room.jpg', NULL, false, false, 'free', 4, 0, 26.0565, -97.953)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('83007b77-c4df-5895-8704-097816dc8a73', '89bd3e7e-4c68-5d11-b207-981d84db3c2d', 'Consultorio Del Mondragon', 'consultorio-del-mondragon', 'Ave Reynosa 198, 88810 Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'General medicine practice on Avenida Reynosa. Listed on medical directories including Doctuo and Doctoralia.', NULL, '/images/providers/doctor-stethoscope.jpg', NULL, false, false, 'free', 4, 0, 26.0548, -97.9538)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('e10ce77e-6da2-5232-aea1-5614171d12a8', '89bd3e7e-4c68-5d11-b207-981d84db3c2d', 'Dr. Eliezer Martinez Salinas', 'dr-eliezer-martinez-salinas', 'Ave Benito Juarez 320, 88810 Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'General medicine practitioner on the main avenue. Also practices in Rio Bravo. Listed on Doctuo and Doctoralia directories.', NULL, '/images/providers/doctor-waiting-area.jpg', NULL, false, false, 'free', 4, 0, 26.057, -97.9525)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('d4fcf44a-fd02-50c5-88ad-47ac0a7dfcff', '89bd3e7e-4c68-5d11-b207-981d84db3c2d', 'Dr. Jose Elier Eng Leo', 'dr-jose-eng-leo', 'Calle Benito Juarez 104, 88810 Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'General medicine doctor on Benito Juárez avenue near the bridge. 5-star rated on Doctoralia.', NULL, '/images/providers/ct-scanner.jpg', NULL, false, false, 'free', 5, 1, 26.0575, -97.952)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('ecc10b0d-9a2c-5cab-868e-1d563e700f92', '89bd3e7e-4c68-5d11-b207-981d84db3c2d', 'Farmacia Centro Medico', 'farmacia-centro-medico', 'Juarez 322, Centro, 88810 Nuevo Progreso, Tamaulipas, Mexico', '+52 899 937 0355', NULL, NULL, 'Pharmacy with an attached doctor consultation office — a common model in Mexico. Patients can see a doctor and fill prescriptions in the same visit. Reviewed on Yelp with praise for good bedside manner.', NULL, '/images/providers/family-waiting.jpg', NULL, false, false, 'free', 4.2, 3, 26.0572, -97.9522)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('25e4a912-3535-5e48-b4fe-49b5262ee4a3', '5795a7c3-de3e-5aba-aff0-5ef6d409f038', 'Crystal Pharmacy', 'crystal-pharmacy', 'Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Part of Progreso Pharmacies consortium. "Ask for the special prices!" 30+ years serving the community.', NULL, NULL, NULL, true, false, 'free', 0, 0, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('ccbf6240-3740-52d5-9ca0-7aaf94df194d', '5795a7c3-de3e-5aba-aff0-5ef6d409f038', 'American Pharmacy', 'american-pharmacy', 'Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, '"We have the lowest prices in town!" Part of Progreso Pharmacies consortium. 30+ years in market.', NULL, NULL, NULL, true, false, 'free', 0, 0, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('aaf2115e-61bb-5f61-ba8e-611651599eac', '5795a7c3-de3e-5aba-aff0-5ef6d409f038', 'Almost Free Pharmacy', 'almost-free-pharmacy', 'Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, '"The real almost free spot in town!" Part of Progreso Pharmacies consortium. Yelp top 10 pharmacy.', NULL, NULL, NULL, true, false, 'free', 0, 0, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('a2366b06-bcae-5f3f-be10-368ae740fd00', '5795a7c3-de3e-5aba-aff0-5ef6d409f038', 'Susy Pharmacy', 'susy-pharmacy', 'Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, '"Over 30 years taking care of you and your family!" Part of Progreso Pharmacies consortium.', NULL, NULL, NULL, true, false, 'free', 0, 0, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('ac6ec7a1-2cb7-5861-bf9b-75732e720d87', '5795a7c3-de3e-5aba-aff0-5ef6d409f038', 'Good Prices Pharmacy', 'good-prices-pharmacy', 'Av. Benito Juarez #300-B, Zona Centro, Nuevo Progreso, Mexico', '011528999371000', '956-373-9500', NULL, '22 years of experience since 1998. WhatsApp ordering available. Goodpricespharmacyprogreso@gmail.com', NULL, NULL, NULL, false, false, 'free', 0, 0, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('ef42325e-a1bb-5394-8a60-33b5664ffd31', '5795a7c3-de3e-5aba-aff0-5ef6d409f038', 'Pancho''s Pharmacy', 'panchos-pharmacy', 'Nuevo Progreso, Tamaulipas, Mexico', '011528999370033', NULL, 'https://eldiscosupercenter.com/panchos-pharmacy-nuevo-progreso-tamaulipas/', 'Save hundreds to thousands on OTC and prescription medications. Wide selection. Person must purchase medications in person.', NULL, NULL, NULL, false, false, 'free', 0, 0, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('f96e4f20-1353-5c2f-b54e-582ead60fa3d', '5795a7c3-de3e-5aba-aff0-5ef6d409f038', 'Farmacia Economy', 'farmacia-economy', 'Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Wide variety of generics and medical consultation at excellent prices. 809 Facebook likes.', NULL, NULL, NULL, false, false, 'free', 0, 0, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('d49e5ae6-8f9d-5f91-904d-60f5378b1bb7', '5795a7c3-de3e-5aba-aff0-5ef6d409f038', 'Tommy''s Pharmacy', 'tommys-pharmacy', 'Nuevo Progreso, Tamaulipas, Mexico (2 locations near border)', NULL, NULL, NULL, 'Two convenient locations within walking distance from International Border. Natural medicines, generics, brand name medications. Best prices available.', NULL, NULL, NULL, false, false, 'free', 0, 0, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('1c328d30-840d-510a-bcf2-f914b0684b66', '7403381c-a634-5d31-9bfd-b8f19d15a437', 'Valle Vista Optical', 'valle-vista-optical', 'Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Top-rated optometrist on Yelp for Nuevo Progreso. Eye exams, prescription glasses, contact lenses.', NULL, NULL, NULL, false, false, 'free', 0, 0, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('966a5cae-8f5d-568b-91c8-827a9f5fd22e', '7403381c-a634-5d31-9bfd-b8f19d15a437', 'The Eye Experts', 'the-eye-experts', 'Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Eye exams, glasses, and contacts. Yelp top 10 optometrists in Nuevo Progreso.', NULL, NULL, NULL, false, false, 'free', 0, 0, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('a60f93b9-7b59-5db5-bb0e-574eeeadb087', '7403381c-a634-5d31-9bfd-b8f19d15a437', 'Optic Trend', 'optic-trend', 'Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Optical shop and eye care. Yelp top 10 optometrists in Nuevo Progreso.', NULL, NULL, NULL, false, false, 'free', 0, 0, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('72c10b24-2e23-574a-85fe-65561464bf5d', '7403381c-a634-5d31-9bfd-b8f19d15a437', 'Eye Max', 'eye-max', 'Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Eye exams and optical services. Yelp top 10 optometrists in Nuevo Progreso.', NULL, NULL, NULL, false, false, 'free', 0, 0, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('84ccc2c4-d69e-5a8a-a246-d0cd4dd227a6', '209c155c-ad48-5413-8327-0026dd6b82ec', 'State of Art Medical Center (956)', 'state-of-art-medical-center', 'Nuevo Progreso, Tamaulipas, Mexico', NULL, '19562253164', 'https://plasticsurgery956.com', 'Board-certified plastic and aesthetic surgeons with 30+ years experience. Dr. Carlos Vergara, Dr. Mauricio Vergara, Dr. Jose Luis Villareal. Free consultation via WhatsApp. Surgeries at Hospital Los Lagos in Reynosa.', NULL, NULL, NULL, true, false, 'free', 0, 0, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('e787fcb2-9506-5131-8c87-34c123aaba55', '209c155c-ad48-5413-8327-0026dd6b82ec', 'Accualaser Medical Spa', 'accualaser-medical-spa', 'Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, 'https://www.bordercrxing.com/accualaser-medical-spa.html', 'State-of-the-art facility in Nuevo Progreso. Full cosmetic surgery services. Surgeries performed at Hospital Los Lagos in Reynosa by surgeons certified by the Plastic Surgery Association of Mexico.', NULL, NULL, NULL, true, false, 'free', 0, 0, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('377e1221-676d-5a8a-83d5-24a6ca286555', '209c155c-ad48-5413-8327-0026dd6b82ec', 'Skin Perfections Medical Spa', 'skin-perfections-medical-spa', 'Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Top-rated medical spa on Yelp for Nuevo Progreso. Botox, fillers, skin treatments.', NULL, NULL, NULL, false, false, 'free', 0, 0, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('ce4f3833-67ee-5dd4-b31f-ac0b45dcd82f', '89bd3e7e-4c68-5d11-b207-981d84db3c2d', 'Centro Medico Emanuel', 'centro-medico-emanuel', 'Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Medical center in Nuevo Progreso offering general medicine consultations.', NULL, NULL, NULL, false, false, 'free', 0, 0, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('a88db18b-c237-55da-91b1-25b71a42ffa4', '89bd3e7e-4c68-5d11-b207-981d84db3c2d', 'Anaya Medical Center', 'anaya-medical-center', 'Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Medical center offering doctor consultations and general health services.', NULL, NULL, NULL, false, false, 'free', 0, 0, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('8b4bffb3-46fa-56fa-9da2-926ddbe53411', '7403381c-a634-5d31-9bfd-b8f19d15a437', 'Flores Hernandez Nancy Abigail - Optometrist', 'flores-hernandez-optical', 'Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Individual optometrist practice. Yelp top 10 optometrists in Nuevo Progreso.', NULL, NULL, NULL, false, false, 'free', 0, 0, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('4ce46f43-a003-5c14-963d-9768cec6437f', '7403381c-a634-5d31-9bfd-b8f19d15a437', 'Flores Castillo Cleto - Optometrist', 'flores-castillo-optical', 'Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Optometrist practice in Nuevo Progreso. Yelp top 10 optometrists.', NULL, NULL, NULL, false, false, 'free', 0, 0, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('cc621871-01a2-5ab3-be0e-e6a8b15094b8', '7403381c-a634-5d31-9bfd-b8f19d15a437', 'America''s Best Contacts & Eyeglasses', 'americas-best-contacts-eyeglasses', 'Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'National chain with location in Nuevo Progreso. Eye exams, contact lenses, prescription eyeglasses. Known for affordable pricing.', NULL, NULL, NULL, false, false, 'free', 0, 0, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('189b05a2-2bf7-591e-ab62-077180ed1cdf', '7403381c-a634-5d31-9bfd-b8f19d15a437', 'Ramirez Optical', 'ramirez-optical', 'Nuevo Progreso / Rio Bravo, Tamaulipas, Mexico', NULL, NULL, 'https://www.facebook.com/ramirezoptical/', 'FREE eye exam! Sale of lenses and contact lenses. Shipping available to any location. 359 Facebook likes, 253 check-ins.', NULL, NULL, NULL, false, false, 'free', 0, 0, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('77813852-7536-5f10-9f08-e9ebc50f426f', '7403381c-a634-5d31-9bfd-b8f19d15a437', 'Riverside Farmacia y Optica', 'riverside-farmacia-optica', 'Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Combined pharmacy and optical shop. Eye exams and glasses in one stop.', NULL, NULL, NULL, false, false, 'free', 0, 0, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('fda6e7fa-0fd2-5057-b582-438247fcd65f', '6e325b0b-7021-508b-bd46-b06030be9a02', 'Desiree''s Spa & Massage', 'desirees-spa-massage', 'Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, '#1 rated massage in Nuevo Progreso on Yelp (multiple years). Full body massage, therapeutic massage, spa treatments.', NULL, NULL, NULL, false, false, 'free', 0, 0, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('40601325-656a-5242-ac77-26f39a7b8499', '6e325b0b-7021-508b-bd46-b06030be9a02', '325 Massage Studio', '325-massage-studio', 'Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Yelp top 3 massage in Nuevo Progreso. Professional massage studio.', NULL, NULL, NULL, false, false, 'free', 0, 0, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('fb889d50-007e-57f0-b707-206186e1fde4', '6e325b0b-7021-508b-bd46-b06030be9a02', 'Sundara Spa', 'sundara-spa', 'Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Yelp top 5 massage in Nuevo Progreso. Spa and wellness treatments.', NULL, NULL, NULL, false, false, 'free', 0, 0, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('0f247acf-3781-50c0-a611-e7092cc42b66', '6e325b0b-7021-508b-bd46-b06030be9a02', 'Alpha Male Spa', 'alpha-male-spa', 'Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Yelp top 10 massage in Nuevo Progreso. Massage and spa services.', NULL, NULL, NULL, false, false, 'free', 0, 0, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('139af4b9-3703-5f4d-9728-4b266aa30e71', '6e325b0b-7021-508b-bd46-b06030be9a02', 'Massage By Pippa', 'massage-by-pippa', 'Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Yelp top 5 massage in Nuevo Progreso. Therapeutic and relaxation massage.', NULL, NULL, NULL, false, false, 'free', 0, 0, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('56785173-05b0-53d5-8b7b-1cadc58e32c7', '6e325b0b-7021-508b-bd46-b06030be9a02', 'RELAX STATION', 'relax-station', 'Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Yelp top 10 massage in Nuevo Progreso. Full body massage and relaxation services.', NULL, NULL, NULL, false, false, 'free', 0, 0, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('13d051bc-8fed-5009-bd8a-55d1fe2ed284', '6e325b0b-7021-508b-bd46-b06030be9a02', 'Gabriela Alvarez Massages', 'gabriela-alvarez-massages', 'Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Individual massage therapist. Yelp top 10 in Nuevo Progreso.', NULL, NULL, NULL, false, false, 'free', 0, 0, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('5bca363d-a89d-51fe-80b7-0dcb3f1b8cd1', '6e325b0b-7021-508b-bd46-b06030be9a02', 'Sapphire Spa', 'sapphire-spa', 'Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Spa and massage services. Yelp top 10 in Nuevo Progreso.', NULL, NULL, NULL, false, false, 'free', 0, 0, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('d62d3a07-3173-5183-83ae-77c6cc87ebda', '11005ce5-d48e-5b2c-a228-54cfbd41b42d', 'Nuevo Progreso Veterinary Specialists', 'nuevo-progreso-vetspecialists', 'Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Specialized veterinary hospital for dogs and cats. 459 Facebook likes, 332 Instagram followers, 89 posts. Active social media presence.', NULL, NULL, NULL, true, false, 'free', 0, 0, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;
INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES ('b47278b9-c878-52d8-8c1a-a40332bd32e3', '11005ce5-d48e-5b2c-a228-54cfbd41b42d', 'Meds for Pets Nuevo Progreso', 'meds-for-pets-nuevo-progreso', 'Nuevo Progreso, Tamaulipas, Mexico', NULL, NULL, NULL, 'Pet medications and veterinary services. Recommended on Reddit RioGrandeValley community for affordable pet meds.', NULL, NULL, NULL, false, false, 'free', 0, 0, 26.0547, -97.9529)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;

-- Provider prices
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('43dbbda6-2676-564c-bccb-170e2d636467', '84239a70-e0b3-5e7b-9269-f932d2201cf4', 'b132e1cb-6b2a-55eb-b7d5-79ab7988297b', 0, 'Free consultation')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('82f486a8-00ee-548b-8e94-2c4146543df6', '84239a70-e0b3-5e7b-9269-f932d2201cf4', '41b545ca-b9c2-59cc-88cc-2959dd9c63d7', 30, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('bd57e282-1d34-5780-a966-7cbf2d84f683', '84239a70-e0b3-5e7b-9269-f932d2201cf4', '7e6093d0-ba2d-5875-90bd-b685acc7ee0a', 55, '$55–$240 per quadrant')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('7ddcd408-e020-5686-8a3e-0b05447f1d2c', '84239a70-e0b3-5e7b-9269-f932d2201cf4', 'f6b6bc12-2a0b-5efc-8cd9-2936f652957d', 10, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('b3875c4f-b32a-527b-a1e8-070f20b3f760', '84239a70-e0b3-5e7b-9269-f932d2201cf4', '493aabf6-d305-58c7-85dd-c013009007fb', 45, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('9242e707-70e2-5e1b-bc43-843dcfc3d625', '84239a70-e0b3-5e7b-9269-f932d2201cf4', '35a00367-8405-54e3-b675-15debc8d7c9e', 45, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('13c81c4f-e217-5657-9141-b15626b503ba', '84239a70-e0b3-5e7b-9269-f932d2201cf4', '8f5606c9-bf0b-5498-819d-ada2e59d3d45', 145, '$145–$350')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('bffe1659-00b8-5713-91b0-b01c6e57b38e', '84239a70-e0b3-5e7b-9269-f932d2201cf4', '8c39494f-b810-5478-9801-0f3b90e14dc3', 215, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('dbbcada8-d9aa-5a4f-938b-8d6490fe2035', '84239a70-e0b3-5e7b-9269-f932d2201cf4', 'cacf0037-3aa4-5464-a131-e2d1b331c928', 200, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('d3d870f9-892a-59d3-a3d6-ad4808a35257', '84239a70-e0b3-5e7b-9269-f932d2201cf4', '41b654d0-150e-5b6e-b11c-eb4caee78133', 360, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('ba0df0ac-5ab2-5b33-ab05-2f9c6f3c171c', '84239a70-e0b3-5e7b-9269-f932d2201cf4', 'b1ddbf93-0d3a-5324-ba33-2b10153d7be5', 390, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('9988269a-726b-5f0d-a9cc-859a74155c70', '84239a70-e0b3-5e7b-9269-f932d2201cf4', 'e77021cf-fe7a-53b0-82e6-367eb15b021a', 200, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('a532e1c6-28f8-528f-8ba1-e3e9c991e708', '84239a70-e0b3-5e7b-9269-f932d2201cf4', 'df87f7b6-8b0f-50e6-8115-59436be7395f', 380, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('493724f5-e2dc-5d68-aa1e-16e2e4c06794', '84239a70-e0b3-5e7b-9269-f932d2201cf4', '38cb6aca-4c5d-56cd-89f5-178bae738e09', 450, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('5e5cbd90-9be6-51fc-bcf7-c5ec49d6bac3', '84239a70-e0b3-5e7b-9269-f932d2201cf4', 'e9402b18-ed60-5924-97e2-5196a041cdc7', 150, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('3f0db584-e598-5d0b-956e-9fc85b66fa88', '84239a70-e0b3-5e7b-9269-f932d2201cf4', '3e633d44-be6e-5e82-9d60-8a9bcd2b1596', 1050, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('14b6377c-ee9c-5123-ae9a-d2ca01f335ff', '84239a70-e0b3-5e7b-9269-f932d2201cf4', 'ac76843f-e4c4-50b3-b5fd-6b4d65b4740a', 600, 'Zirconia crown over implant')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('c747ac0b-0953-5189-b3bd-4d4ed4d5c142', '84239a70-e0b3-5e7b-9269-f932d2201cf4', '624a80cb-476c-5731-85f8-4495f2c82f1f', 290, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('58ab0653-f099-54e8-994c-3b999c5aa92b', '84239a70-e0b3-5e7b-9269-f932d2201cf4', '67172125-1748-59ba-b403-efdb97b0f3e2', 9000, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('cf0493c6-ffe3-58e2-9820-3be39a014e0f', '84239a70-e0b3-5e7b-9269-f932d2201cf4', '198d5c6d-e5c2-552c-a91e-65de0d28334d', 11000, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('9d3f2d2f-0481-5d30-b709-af3b987fe6a0', '84239a70-e0b3-5e7b-9269-f932d2201cf4', 'ef5e89fa-0b30-5289-8cd5-4d16b4745621', 300, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('895b7e60-a8c3-594a-a706-41b42b849dc2', '84239a70-e0b3-5e7b-9269-f932d2201cf4', '887fe60c-3ad9-5426-8cb8-1de30f94eccb', 850, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('443e186a-e231-5bba-8375-a004b94c191c', '84239a70-e0b3-5e7b-9269-f932d2201cf4', 'e6996d06-7f5d-5106-9469-3bf29639233b', 500, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('e6713c2b-5b01-5ffa-9fa5-9998238cdfb5', '005e8f2d-d63c-5f9a-83ff-ab3672c867bc', 'b132e1cb-6b2a-55eb-b7d5-79ab7988297b', 0, 'Free routine exam')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('25e0ae0a-70fb-5ed5-a64a-59972e88267a', '005e8f2d-d63c-5f9a-83ff-ab3672c867bc', '41b545ca-b9c2-59cc-88cc-2959dd9c63d7', 30, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('7a47a036-c70c-5152-a263-4482a4ce722a', '005e8f2d-d63c-5f9a-83ff-ab3672c867bc', '7e6093d0-ba2d-5875-90bd-b685acc7ee0a', 60, '$60–$240 per quadrant')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('9597fadf-05fb-56c7-b629-a42aaff89b74', '005e8f2d-d63c-5f9a-83ff-ab3672c867bc', '493aabf6-d305-58c7-85dd-c013009007fb', 30, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('3a9903a9-83e2-53e3-bc6e-58cb711a3ac7', '005e8f2d-d63c-5f9a-83ff-ab3672c867bc', '35a00367-8405-54e3-b675-15debc8d7c9e', 30, 'From $30')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('223c9af9-9e92-53b1-a708-8c6a3421ae1f', '005e8f2d-d63c-5f9a-83ff-ab3672c867bc', '8c39494f-b810-5478-9801-0f3b90e14dc3', 200, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('f470e6fa-c903-5b30-a864-61c4d0cad789', '005e8f2d-d63c-5f9a-83ff-ab3672c867bc', 'cacf0037-3aa4-5464-a131-e2d1b331c928', 200, '$200–$250')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('2e9f5737-396b-534b-b4e8-4cc0c8c84091', '005e8f2d-d63c-5f9a-83ff-ab3672c867bc', 'b1ddbf93-0d3a-5324-ba33-2b10153d7be5', 350, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('8879227f-c4da-5182-b78e-6d531708628c', '005e8f2d-d63c-5f9a-83ff-ab3672c867bc', '41b654d0-150e-5b6e-b11c-eb4caee78133', 350, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('e8eaef04-04cb-5472-939d-f08bbd6deb96', '005e8f2d-d63c-5f9a-83ff-ab3672c867bc', 'e77021cf-fe7a-53b0-82e6-367eb15b021a', 120, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('4cf6dce4-f811-55ec-83aa-f25fd0027f94', '005e8f2d-d63c-5f9a-83ff-ab3672c867bc', 'df87f7b6-8b0f-50e6-8115-59436be7395f', 400, 'From $400')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('fa486713-39da-57f6-aff8-51805f663d30', '005e8f2d-d63c-5f9a-83ff-ab3672c867bc', '38cb6aca-4c5d-56cd-89f5-178bae738e09', 450, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('932e1f9d-5cb4-5abe-b3f8-a38dbdf6dd28', '005e8f2d-d63c-5f9a-83ff-ab3672c867bc', 'e9402b18-ed60-5924-97e2-5196a041cdc7', 170, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('4d9053a7-08b7-5d24-931c-4df4fe5b0126', '005e8f2d-d63c-5f9a-83ff-ab3672c867bc', '3e633d44-be6e-5e82-9d60-8a9bcd2b1596', 800, 'Implant only; promo $1,100 includes CT scan + abutment + crown')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('b4d00ff7-6d2c-598b-b89d-16b5e8eb18e4', '005e8f2d-d63c-5f9a-83ff-ab3672c867bc', '624a80cb-476c-5731-85f8-4495f2c82f1f', 250, 'Single plate')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('21a05164-daec-5b12-9b95-fb2e5f05e3fa', '0f9ee5e8-e5a3-5b05-a0ea-5024336e61d4', 'b132e1cb-6b2a-55eb-b7d5-79ab7988297b', 0, 'Free first consultation')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('be9d4d55-de8c-52b3-ad78-85cd4ae1a26f', '0f9ee5e8-e5a3-5b05-a0ea-5024336e61d4', '41b545ca-b9c2-59cc-88cc-2959dd9c63d7', 35, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('015b5e3c-ed6c-5a7b-b30c-c76163e7322f', '0f9ee5e8-e5a3-5b05-a0ea-5024336e61d4', '7e6093d0-ba2d-5875-90bd-b685acc7ee0a', 100, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('d0755a81-a675-504b-9eba-cfac4faecb46', '0f9ee5e8-e5a3-5b05-a0ea-5024336e61d4', 'f6b6bc12-2a0b-5efc-8cd9-2936f652957d', 10, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('db75572c-3b75-5030-b417-1ebe2bedc6e0', '0f9ee5e8-e5a3-5b05-a0ea-5024336e61d4', '493aabf6-d305-58c7-85dd-c013009007fb', 50, 'From $50')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('37fd1245-833b-59d4-84c0-272a7cf589c8', '0f9ee5e8-e5a3-5b05-a0ea-5024336e61d4', '35a00367-8405-54e3-b675-15debc8d7c9e', 50, 'From $50')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('6cc5fefa-0012-5f56-bb77-83f8e1b403cc', '0f9ee5e8-e5a3-5b05-a0ea-5024336e61d4', '8f5606c9-bf0b-5498-819d-ada2e59d3d45', 150, '$150–$400')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('4cc2f35e-6f93-5a89-9395-653edf08c145', '0f9ee5e8-e5a3-5b05-a0ea-5024336e61d4', '8c39494f-b810-5478-9801-0f3b90e14dc3', 240, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('5aa9f8bd-3dc3-5eca-a11d-440f5fd35cbf', '0f9ee5e8-e5a3-5b05-a0ea-5024336e61d4', 'cacf0037-3aa4-5464-a131-e2d1b331c928', 280, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('e923b9ef-7617-567e-b908-1377d73b6026', '0f9ee5e8-e5a3-5b05-a0ea-5024336e61d4', '41b654d0-150e-5b6e-b11c-eb4caee78133', 430, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('f00725e9-3cf5-5214-ba1d-8666240d7c19', '0f9ee5e8-e5a3-5b05-a0ea-5024336e61d4', 'b1ddbf93-0d3a-5324-ba33-2b10153d7be5', 430, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('cb1319f1-dd60-5bb9-b00a-8a6ddb448d08', '0f9ee5e8-e5a3-5b05-a0ea-5024336e61d4', 'df87f7b6-8b0f-50e6-8115-59436be7395f', 430, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('c5e04a3c-a0a4-5990-9a5e-eaf614e804d2', '0f9ee5e8-e5a3-5b05-a0ea-5024336e61d4', 'e9402b18-ed60-5924-97e2-5196a041cdc7', 250, 'Laser')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('314048d5-a207-5bb6-a0d8-17ff2097fb29', '0f9ee5e8-e5a3-5b05-a0ea-5024336e61d4', '3e633d44-be6e-5e82-9d60-8a9bcd2b1596', 1000, 'Single titanium implant (screw only)')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('8ce2ea53-faa7-5de6-95c5-f232f4065353', '0f9ee5e8-e5a3-5b05-a0ea-5024336e61d4', 'ac76843f-e4c4-50b3-b5fd-6b4d65b4740a', 850, 'Zirconia crown over implant')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('94a15903-4fcd-5e9f-9251-bd5b597b0c32', '0f9ee5e8-e5a3-5b05-a0ea-5024336e61d4', '624a80cb-476c-5731-85f8-4495f2c82f1f', 350, 'Acrylic denture per tooth')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('81a599b6-0859-5701-b5c2-04de20f2bf64', '0f9ee5e8-e5a3-5b05-a0ea-5024336e61d4', '887fe60c-3ad9-5426-8cb8-1de30f94eccb', 1290, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('9c3032e0-05db-5c49-85ab-ad324e18eea3', '0f9ee5e8-e5a3-5b05-a0ea-5024336e61d4', 'ef5e89fa-0b30-5289-8cd5-4d16b4745621', 1800, '$1,800–$2,000')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('7e81925c-f66e-59b8-9bfc-2c9ce04df059', '0f9ee5e8-e5a3-5b05-a0ea-5024336e61d4', '67172125-1748-59ba-b403-efdb97b0f3e2', 14000, 'Full mouth implants per arch')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('ffd116ee-e16a-5545-a3f9-ea72f8be97b1', '188d9842-ef74-5a13-9e29-e1a84326d6a6', '41b545ca-b9c2-59cc-88cc-2959dd9c63d7', 25, '$25–$40')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('597ae08d-6415-5365-a2b1-525b5f895df3', '188d9842-ef74-5a13-9e29-e1a84326d6a6', '7e6093d0-ba2d-5875-90bd-b685acc7ee0a', 60, '$60–$380 scaling & root planing')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('17b7ed7e-bbaf-5344-921a-5953512c167d', '188d9842-ef74-5a13-9e29-e1a84326d6a6', '493aabf6-d305-58c7-85dd-c013009007fb', 35, '$30–$80')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('daa66d78-0768-5f2c-99bd-41792e2749dd', '188d9842-ef74-5a13-9e29-e1a84326d6a6', '35a00367-8405-54e3-b675-15debc8d7c9e', 60, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('075db293-a802-503b-99dc-5157dfd80efb', '188d9842-ef74-5a13-9e29-e1a84326d6a6', '8c39494f-b810-5478-9801-0f3b90e14dc3', 200, '$200–$250')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('7a4e4f4b-0ded-5cb4-a430-9b729f1cefa2', '188d9842-ef74-5a13-9e29-e1a84326d6a6', '41b654d0-150e-5b6e-b11c-eb4caee78133', 350, '$350–$400')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('6616575a-ff0b-5e0c-95fb-c2d50914fa87', '188d9842-ef74-5a13-9e29-e1a84326d6a6', 'e77021cf-fe7a-53b0-82e6-367eb15b021a', 80, '$80–$250')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('cd689ca6-7373-5b27-8e36-5277ea43e299', '188d9842-ef74-5a13-9e29-e1a84326d6a6', 'df87f7b6-8b0f-50e6-8115-59436be7395f', 350, '$350–$400')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('a90c9cfa-de5a-5ac7-9dd3-df4de1141f96', '188d9842-ef74-5a13-9e29-e1a84326d6a6', 'e9402b18-ed60-5924-97e2-5196a041cdc7', 150, '$150–$250')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('b45ba087-c706-569d-8e4b-f535cb72cc18', '188d9842-ef74-5a13-9e29-e1a84326d6a6', '3e633d44-be6e-5e82-9d60-8a9bcd2b1596', 1300, '$1,300–$1,500')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('73f97d6c-d1ae-59a8-a7b6-a9d2cb45dbd2', '188d9842-ef74-5a13-9e29-e1a84326d6a6', '67172125-1748-59ba-b403-efdb97b0f3e2', 7000, '$7,000–$8,000')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('525d4809-25db-507a-a843-cb483d3ec9d3', '188d9842-ef74-5a13-9e29-e1a84326d6a6', '198d5c6d-e5c2-552c-a91e-65de0d28334d', 11000, '$11,000–$12,000')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('6901811a-33a7-5b36-9028-0e0000f82ef0', '188d9842-ef74-5a13-9e29-e1a84326d6a6', 'ef5e89fa-0b30-5289-8cd5-4d16b4745621', 350, '$350–$500')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('1ebd8ef7-cedb-5cca-9aa9-487ac0abe5e3', '91e424de-2c39-5859-97c1-6d5939bff1e3', '41b545ca-b9c2-59cc-88cc-2959dd9c63d7', 30, 'From $30')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('1789ca96-9c4a-5b22-a0c3-993e092aa8cd', '91e424de-2c39-5859-97c1-6d5939bff1e3', '493aabf6-d305-58c7-85dd-c013009007fb', 45, 'White filling from $45')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('45e62aa0-91a6-5a92-8be9-7d4cedbe113d', '91e424de-2c39-5859-97c1-6d5939bff1e3', '35a00367-8405-54e3-b675-15debc8d7c9e', 40, '$40–$50')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('93715252-3cec-51ca-b59d-7f8bb5407997', '91e424de-2c39-5859-97c1-6d5939bff1e3', '8c39494f-b810-5478-9801-0f3b90e14dc3', 200, 'From $200')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('8e47d194-b027-5707-9d5a-e06037afe944', '91e424de-2c39-5859-97c1-6d5939bff1e3', '41b654d0-150e-5b6e-b11c-eb4caee78133', 350, '$350–$500')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('ee94433a-d179-59d0-9866-a7fc2638c42f', '91e424de-2c39-5859-97c1-6d5939bff1e3', 'e9402b18-ed60-5924-97e2-5196a041cdc7', 120, 'From $120')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('60f1bb39-9de4-5526-b2d4-e782b673f330', '91e424de-2c39-5859-97c1-6d5939bff1e3', 'df87f7b6-8b0f-50e6-8115-59436be7395f', 450, 'From $450')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('615d1dfb-4491-53d0-b956-4ef4342a6ea1', '91e424de-2c39-5859-97c1-6d5939bff1e3', '624a80cb-476c-5731-85f8-4495f2c82f1f', 250, '$250–$300')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('f3de4999-6634-5fdc-baf4-d36652d2347b', '91e424de-2c39-5859-97c1-6d5939bff1e3', '887fe60c-3ad9-5426-8cb8-1de30f94eccb', 600, 'Up to $600')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('acafe871-5df4-5c4b-9b9e-b3693e089957', '0dfee5f7-806a-5085-985e-e32e6107b987', '41b545ca-b9c2-59cc-88cc-2959dd9c63d7', 39, 'From $39')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('aa466234-0d71-5917-a2c0-01610610ab4e', '0dfee5f7-806a-5085-985e-e32e6107b987', '493aabf6-d305-58c7-85dd-c013009007fb', 56, '$56–$113')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('ce770b7c-3ae7-5c05-9cd2-938d34aef2d1', '0dfee5f7-806a-5085-985e-e32e6107b987', '35a00367-8405-54e3-b675-15debc8d7c9e', 56, '$56–$79')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('4d5ae825-2fd7-57c0-9ce8-09105302253f', '0dfee5f7-806a-5085-985e-e32e6107b987', '8f5606c9-bf0b-5498-819d-ada2e59d3d45', 135, '$135–$248')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('8bca1900-226a-5470-8195-5202ff23c3f6', '0dfee5f7-806a-5085-985e-e32e6107b987', '8c39494f-b810-5478-9801-0f3b90e14dc3', 226, 'From $226')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('bd8cbc67-94cf-5996-ba23-e774b3666196', '0dfee5f7-806a-5085-985e-e32e6107b987', '41b654d0-150e-5b6e-b11c-eb4caee78133', 339, '$339–$395')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('8b27bac7-3758-5e03-bb52-c966b49bfa87', '0dfee5f7-806a-5085-985e-e32e6107b987', 'e77021cf-fe7a-53b0-82e6-367eb15b021a', 113, '$113–$169')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('b0ab2293-8601-549c-8b47-9e0ea06636fb', '0dfee5f7-806a-5085-985e-e32e6107b987', 'df87f7b6-8b0f-50e6-8115-59436be7395f', 339, '$339–$395')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('73c6a6d8-8f27-5cdc-998a-d5e7c472e280', '0dfee5f7-806a-5085-985e-e32e6107b987', 'e9402b18-ed60-5924-97e2-5196a041cdc7', 113, '$113–$169')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('80afa200-6b19-5c6b-b2f3-03586e8c6016', '0dfee5f7-806a-5085-985e-e32e6107b987', '3e633d44-be6e-5e82-9d60-8a9bcd2b1596', 790, '$790–$1,016')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('41cab6ce-d017-5184-9934-8794593fedfd', '0dfee5f7-806a-5085-985e-e32e6107b987', '624a80cb-476c-5731-85f8-4495f2c82f1f', 282, '$282–$564')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('0950cf60-8f4c-5884-87ba-5466aa46e17e', '0dfee5f7-806a-5085-985e-e32e6107b987', '67172125-1748-59ba-b403-efdb97b0f3e2', 6771, '$6,771–$7,335')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('e35698b2-51a4-5bfd-afd8-cfe965babe6a', '0dfee5f7-806a-5085-985e-e32e6107b987', '198d5c6d-e5c2-552c-a91e-65de0d28334d', 9028, 'From $9,028')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('eec22c23-f236-5c85-bdcf-58cd44637ee4', '0dfee5f7-806a-5085-985e-e32e6107b987', 'ef5e89fa-0b30-5289-8cd5-4d16b4745621', 254, '$254–$367')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('be18abd9-7f30-5d85-9c02-d74dfff52968', 'd6cbbac9-932f-50f5-ad26-cca07c619758', '41b545ca-b9c2-59cc-88cc-2959dd9c63d7', 25, '$25–$50 hygienist session')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('b795e389-0614-5512-b55c-c17e97de083e', 'd6cbbac9-932f-50f5-ad26-cca07c619758', '41b654d0-150e-5b6e-b11c-eb4caee78133', 350, '$350–$500')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('ce538e64-45b9-5ab0-88c6-cced2bf7b062', 'd6cbbac9-932f-50f5-ad26-cca07c619758', 'e77021cf-fe7a-53b0-82e6-367eb15b021a', 350, 'From $350')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('d54f71ad-3aa6-5f8d-b1be-55b162528a02', 'd6cbbac9-932f-50f5-ad26-cca07c619758', 'df87f7b6-8b0f-50e6-8115-59436be7395f', 350, '$350–$500')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('be521733-ee5b-5075-a011-22523940a4e9', 'd6cbbac9-932f-50f5-ad26-cca07c619758', '3e633d44-be6e-5e82-9d60-8a9bcd2b1596', 1350, '$1,350–$1,500')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('581747b4-1f09-51fa-acb9-e371e891142e', 'd6cbbac9-932f-50f5-ad26-cca07c619758', 'ef5e89fa-0b30-5289-8cd5-4d16b4745621', 240, '$240–$500')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('3e293de7-92eb-522d-a984-3eedfea126f0', 'd6cbbac9-932f-50f5-ad26-cca07c619758', 'cacf0037-3aa4-5464-a131-e2d1b331c928', 150, '$150–$180 PFM crown')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('e61ad4dd-9867-5928-ba2f-76a0fe9435ac', '88c05614-90f2-5973-99c6-a7cc6a984345', '41b545ca-b9c2-59cc-88cc-2959dd9c63d7', 30, 'From $30')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('e6ffcf41-bb94-5458-b1dd-98423b0427dd', '88c05614-90f2-5973-99c6-a7cc6a984345', '7e6093d0-ba2d-5875-90bd-b685acc7ee0a', 30, 'Ultrasonic scaling $30–$150')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('b459caab-37f6-5bf2-911f-e6eea7d1c3ce', '88c05614-90f2-5973-99c6-a7cc6a984345', 'e9402b18-ed60-5924-97e2-5196a041cdc7', 120, '$120–$150')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('2bcc252f-5d6e-5ace-acc9-d0d71358e336', '88c05614-90f2-5973-99c6-a7cc6a984345', '8c39494f-b810-5478-9801-0f3b90e14dc3', 200, 'From $200')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('d8a8c65d-68cd-5ab7-84d2-0533b82c4b33', '88c05614-90f2-5973-99c6-a7cc6a984345', '41b654d0-150e-5b6e-b11c-eb4caee78133', 350, '$350–$450')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('6325e6c7-f8f9-57a9-a3d4-0f8965d73845', '88c05614-90f2-5973-99c6-a7cc6a984345', 'df87f7b6-8b0f-50e6-8115-59436be7395f', 350, '$350–$450')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('b5300352-a0d8-519a-ab1b-eb9736ac74d2', '88c05614-90f2-5973-99c6-a7cc6a984345', '3e633d44-be6e-5e82-9d60-8a9bcd2b1596', 1000, 'From $1,000; immediate implant placement available')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('729de13d-bdca-5c2a-a22e-f99156f25bbc', '88c05614-90f2-5973-99c6-a7cc6a984345', '67172125-1748-59ba-b403-efdb97b0f3e2', 8000, '$8,000–$8,500')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('2a56ef57-1bd6-548c-ad6d-c99727c0c86c', '88c05614-90f2-5973-99c6-a7cc6a984345', '198d5c6d-e5c2-552c-a91e-65de0d28334d', 11000, '$11,000–$11,500')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('217875fd-82da-5e10-a020-60acc8b8887c', '88c05614-90f2-5973-99c6-a7cc6a984345', 'e6996d06-7f5d-5106-9469-3bf29639233b', 800, '$800–$1,500')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('c6606b5f-73c1-5e94-8fa7-e20062853565', '9d3cbfe8-8fec-59db-b301-1718071f394a', 'b132e1cb-6b2a-55eb-b7d5-79ab7988297b', 0, 'Free consultation')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('cb5d9ef4-33e0-5960-8d04-b7a74e76d640', '9d3cbfe8-8fec-59db-b301-1718071f394a', '41b545ca-b9c2-59cc-88cc-2959dd9c63d7', 30, '$30–$45')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('90dbf73f-2c09-5b73-8cdd-0ab46a1dabb3', '9d3cbfe8-8fec-59db-b301-1718071f394a', '7e6093d0-ba2d-5875-90bd-b685acc7ee0a', 40, '$40–$100')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('b03f25f3-ed1d-5513-a4a8-6f3f20ad5c15', '9d3cbfe8-8fec-59db-b301-1718071f394a', '493aabf6-d305-58c7-85dd-c013009007fb', 50, 'From $50')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('15d1c8cb-5d51-5de3-85dd-33bb140f98d4', '9d3cbfe8-8fec-59db-b301-1718071f394a', '8c39494f-b810-5478-9801-0f3b90e14dc3', 250, '$250–$300')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('e7c25d23-59b3-54c8-be20-119a9a9dced3', '9d3cbfe8-8fec-59db-b301-1718071f394a', '41b654d0-150e-5b6e-b11c-eb4caee78133', 400, '$400–$450')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('79e92860-ea5c-54b8-b86d-8f6587fe0a30', '9d3cbfe8-8fec-59db-b301-1718071f394a', 'df87f7b6-8b0f-50e6-8115-59436be7395f', 430, '$430–$480')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('0aed02e2-1f81-560e-b137-963f96f3957d', '9d3cbfe8-8fec-59db-b301-1718071f394a', '8f5606c9-bf0b-5498-819d-ada2e59d3d45', 150, '$150–$350')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('04789cc6-72dc-55c0-bd92-56652f66ccc4', '9d3cbfe8-8fec-59db-b301-1718071f394a', '3e633d44-be6e-5e82-9d60-8a9bcd2b1596', 1650, 'From $1,650')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('a0ea838e-a05c-59dc-8a48-422674e3b03a', '9d3cbfe8-8fec-59db-b301-1718071f394a', '67172125-1748-59ba-b403-efdb97b0f3e2', 9000, '$9,000–$18,000')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('ebe7d4f8-a7f4-5eca-a82c-b38c46abf2df', '9d3cbfe8-8fec-59db-b301-1718071f394a', '624a80cb-476c-5731-85f8-4495f2c82f1f', 300, '$300–$1,000')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('100e507c-4678-5ade-9a17-6720c7ccd8f2', '9d3cbfe8-8fec-59db-b301-1718071f394a', 'e6996d06-7f5d-5106-9469-3bf29639233b', 900, '$900–$2,000')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('44daaadf-9604-5601-94ab-8a23f3d4bac9', '9d3cbfe8-8fec-59db-b301-1718071f394a', '887fe60c-3ad9-5426-8cb8-1de30f94eccb', 1200, '$1,200–$1,350')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('34c0d141-5e44-597d-83de-4f2fb649d382', '3e5b4432-d1b4-5ed4-8665-db9f2e54bb7c', '41b545ca-b9c2-59cc-88cc-2959dd9c63d7', 20, '$20–$30')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('b2487590-94dd-5344-9d0c-6c465eef050d', '3e5b4432-d1b4-5ed4-8665-db9f2e54bb7c', '7e6093d0-ba2d-5875-90bd-b685acc7ee0a', 50, '$50–$80 per quadrant')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('995afc71-0f94-56b3-93e0-cec47a23e1fc', '3e5b4432-d1b4-5ed4-8665-db9f2e54bb7c', '493aabf6-d305-58c7-85dd-c013009007fb', 40, '$40–$50')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('c0e69d6f-2024-5cf4-a045-25103a965a7a', '3e5b4432-d1b4-5ed4-8665-db9f2e54bb7c', '35a00367-8405-54e3-b675-15debc8d7c9e', 50, 'Simple extraction')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('f501f3fa-2eec-58c5-bb96-12c4b205665b', '3e5b4432-d1b4-5ed4-8665-db9f2e54bb7c', 'e77021cf-fe7a-53b0-82e6-367eb15b021a', 180, '$180–$200')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('1df409de-253c-59a6-9797-2d7b42262e42', '3e5b4432-d1b4-5ed4-8665-db9f2e54bb7c', 'df87f7b6-8b0f-50e6-8115-59436be7395f', 350, '$350–$400')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('f2d62110-9500-5cba-9ab9-190e12ed7c5c', '3e5b4432-d1b4-5ed4-8665-db9f2e54bb7c', '41b654d0-150e-5b6e-b11c-eb4caee78133', 350, '$350–$400')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('2a97cf9d-ee11-51f6-ac55-34ef475302cf', '3e5b4432-d1b4-5ed4-8665-db9f2e54bb7c', 'cacf0037-3aa4-5464-a131-e2d1b331c928', 180, '$180–$200 PFM crown')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('0ef90fcc-f7a7-5136-b9a0-18cb9ddf817a', '3e5b4432-d1b4-5ed4-8665-db9f2e54bb7c', 'e9402b18-ed60-5924-97e2-5196a041cdc7', 80, '$80–$150 laser')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('185cb3a4-a66e-51e4-ac37-7e9b0568ee4d', '3e5b4432-d1b4-5ed4-8665-db9f2e54bb7c', '3e633d44-be6e-5e82-9d60-8a9bcd2b1596', 975, '$975–$1,100 implant only')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('72989c91-19aa-5219-9e17-f6c9234e7e9a', '3e5b4432-d1b4-5ed4-8665-db9f2e54bb7c', 'ac76843f-e4c4-50b3-b5fd-6b4d65b4740a', 350, '$350–$450 crown incl. abutment')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('56cfd570-2afa-5136-92c6-03f0d298c54c', '3e5b4432-d1b4-5ed4-8665-db9f2e54bb7c', 'e6996d06-7f5d-5106-9469-3bf29639233b', 300, '$300–$2,000')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('f432f1b8-f03a-557e-9995-34bdc7f3ce8a', 'c32d6cee-3857-551a-b005-36d75ece4bc3', 'b132e1cb-6b2a-55eb-b7d5-79ab7988297b', 0, 'Free exam and estimation')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('ffe7d12b-29af-5bbf-a338-45a86ffb8002', 'c32d6cee-3857-551a-b005-36d75ece4bc3', '41b545ca-b9c2-59cc-88cc-2959dd9c63d7', 25, 'From $25')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('80dc0c66-c136-583c-8dbe-6db51c1b7dcd', 'c32d6cee-3857-551a-b005-36d75ece4bc3', '8c39494f-b810-5478-9801-0f3b90e14dc3', 200, 'From $200')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('2eb3ebc0-1aeb-5c46-881d-c8c7170d5baf', 'c32d6cee-3857-551a-b005-36d75ece4bc3', '41b654d0-150e-5b6e-b11c-eb4caee78133', 200, 'From $200')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('881a5a4a-e164-5757-9587-955582e380e1', 'c32d6cee-3857-551a-b005-36d75ece4bc3', 'e9402b18-ed60-5924-97e2-5196a041cdc7', 150, '$150–$300')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('3b4495a4-b597-5fb2-b2e6-e46830714331', 'c32d6cee-3857-551a-b005-36d75ece4bc3', '3e633d44-be6e-5e82-9d60-8a9bcd2b1596', 1200, '$1,200–$1,500')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('216ea3c1-0305-5fd5-9bab-db0b6e0a3357', 'c32d6cee-3857-551a-b005-36d75ece4bc3', 'ef5e89fa-0b30-5289-8cd5-4d16b4745621', 300, 'From $300')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('79c0e160-9721-55bc-a709-40a17deac29f', 'c32d6cee-3857-551a-b005-36d75ece4bc3', 'e6996d06-7f5d-5106-9469-3bf29639233b', 300, 'From $300')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('907b4836-e50d-5a71-8503-692d03d184ff', '553147f8-f793-57fc-820b-f36ac550ed87', 'b132e1cb-6b2a-55eb-b7d5-79ab7988297b', 0, 'Free dental checkup')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('33bdd58a-a02b-5455-ad4e-bc9135886a8c', '553147f8-f793-57fc-820b-f36ac550ed87', '35a00367-8405-54e3-b675-15debc8d7c9e', 40, 'From $40')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('14518fc2-112e-59a4-a367-79eeef4557bc', '553147f8-f793-57fc-820b-f36ac550ed87', '8c39494f-b810-5478-9801-0f3b90e14dc3', 200, 'From $200')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('bce4966a-cfd0-5a72-8a86-25d3fd4123dd', '553147f8-f793-57fc-820b-f36ac550ed87', '41b654d0-150e-5b6e-b11c-eb4caee78133', 200, 'From $200')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('0919e479-7b5b-53d6-b49f-ac3de0d8482f', '553147f8-f793-57fc-820b-f36ac550ed87', 'e9402b18-ed60-5924-97e2-5196a041cdc7', 160, 'From $160')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('511e8d19-90f5-54fb-be96-bd791c48ee4b', '553147f8-f793-57fc-820b-f36ac550ed87', '3e633d44-be6e-5e82-9d60-8a9bcd2b1596', 1200, 'From $1,200')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('ac6c618f-ee57-5bc6-88e2-6c33c401f6fb', '553147f8-f793-57fc-820b-f36ac550ed87', '624a80cb-476c-5731-85f8-4495f2c82f1f', 250, '$250–$500')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('7a98ee2b-723e-5ab5-be9f-eda0e4c4d277', '553147f8-f793-57fc-820b-f36ac550ed87', 'ef5e89fa-0b30-5289-8cd5-4d16b4745621', 250, 'From $250')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('176d3872-e5bb-5d5b-b457-ece8f0eeaeb5', '553147f8-f793-57fc-820b-f36ac550ed87', '887fe60c-3ad9-5426-8cb8-1de30f94eccb', 600, '$600–$1,200')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('502b319f-9062-52d7-84f7-bfc3e221a339', '553147f8-f793-57fc-820b-f36ac550ed87', 'e6996d06-7f5d-5106-9469-3bf29639233b', 300, 'From $300')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('1402008d-ee00-5811-adfc-a78cffb7cc21', '744b04ae-8ad5-53e2-b7e1-879b815cc43e', '41b545ca-b9c2-59cc-88cc-2959dd9c63d7', 30, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('0dcaa0e8-bc46-5967-b39a-5255245ccef5', '744b04ae-8ad5-53e2-b7e1-879b815cc43e', '7e6093d0-ba2d-5875-90bd-b685acc7ee0a', 60, '$60/quadrant, $240 full mouth')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('330d3fe0-bb0d-51fe-9dbd-89e23bc473ba', '744b04ae-8ad5-53e2-b7e1-879b815cc43e', '3e633d44-be6e-5e82-9d60-8a9bcd2b1596', 800, 'From $800')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('55e2b426-54c7-511d-a62e-f0170f4787dd', '744b04ae-8ad5-53e2-b7e1-879b815cc43e', 'ef5e89fa-0b30-5289-8cd5-4d16b4745621', 350, '$350–$400')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('d7b5346d-d30d-5691-ae44-8ba6a9983506', '744b04ae-8ad5-53e2-b7e1-879b815cc43e', 'df87f7b6-8b0f-50e6-8115-59436be7395f', 400, '$400–$500')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('6a1f62a1-0632-5012-83f8-76ff5be7a427', '744b04ae-8ad5-53e2-b7e1-879b815cc43e', '41b654d0-150e-5b6e-b11c-eb4caee78133', 800, 'Zirconia from $800')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('08750b01-acce-5182-bcf1-c7d6bba77e31', '744b04ae-8ad5-53e2-b7e1-879b815cc43e', '624a80cb-476c-5731-85f8-4495f2c82f1f', 300, '$300–$600')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('dd9c636f-f08e-512a-97dc-6504ed8c810c', '744b04ae-8ad5-53e2-b7e1-879b815cc43e', '8c39494f-b810-5478-9801-0f3b90e14dc3', 200, '$200–$450')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('4a9aa9cb-c71a-5870-8c7c-a96e048fe2b3', '6579000d-4070-54f5-8b4f-bf813e929e6f', '3e633d44-be6e-5e82-9d60-8a9bcd2b1596', 1290, 'From $1,290')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('17dbd1e1-311c-5a5e-88f2-aa4ffc96cef7', '6579000d-4070-54f5-8b4f-bf813e929e6f', 'df87f7b6-8b0f-50e6-8115-59436be7395f', 400, 'From $400')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('0faf4239-3fb8-5016-99de-e69f64ffc820', '6579000d-4070-54f5-8b4f-bf813e929e6f', '41b654d0-150e-5b6e-b11c-eb4caee78133', 400, 'From $400')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('bbb98aca-9d3f-5e0e-99e2-4838acc06961', '6579000d-4070-54f5-8b4f-bf813e929e6f', 'e9402b18-ed60-5924-97e2-5196a041cdc7', 160, '$160–$200')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('4f9715d8-9cd5-5ec6-a764-2fa9b4c71f2b', '6579000d-4070-54f5-8b4f-bf813e929e6f', '624a80cb-476c-5731-85f8-4495f2c82f1f', 350, 'From $350')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('4c07577b-9ffe-5506-b09e-9db3317b70a0', '6579000d-4070-54f5-8b4f-bf813e929e6f', '67172125-1748-59ba-b403-efdb97b0f3e2', 11000, '$11,000–$13,000')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('aa5f3e7d-6099-5a32-b494-7f2528c18a57', '6579000d-4070-54f5-8b4f-bf813e929e6f', '198d5c6d-e5c2-552c-a91e-65de0d28334d', 14000, '$14,000–$16,000')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('20092870-b178-53d6-8b1a-8715accea770', '6579000d-4070-54f5-8b4f-bf813e929e6f', '493aabf6-d305-58c7-85dd-c013009007fb', 45, 'From $45')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('63684240-d7f8-55bc-9b2b-166640084a3b', '6579000d-4070-54f5-8b4f-bf813e929e6f', 'e6996d06-7f5d-5106-9469-3bf29639233b', 250, '$250–$400')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('2873678a-d027-5dc3-82f7-335471d82f41', 'f730b329-660d-5411-b31f-8566738edef2', '41b545ca-b9c2-59cc-88cc-2959dd9c63d7', 30, '$30–$50')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('e47585f0-78ab-579a-b0fc-a45776dd051c', 'f730b329-660d-5411-b31f-8566738edef2', 'e77021cf-fe7a-53b0-82e6-367eb15b021a', 350, '$350–$400')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('bb4171e0-c555-5a32-975f-387fd1246562', 'f730b329-660d-5411-b31f-8566738edef2', 'df87f7b6-8b0f-50e6-8115-59436be7395f', 400, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('0b0200b5-18cd-5a1c-83a9-17c0dbc28220', 'f730b329-660d-5411-b31f-8566738edef2', '3e633d44-be6e-5e82-9d60-8a9bcd2b1596', 1000, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('d4ee731e-4f09-58d4-b9a7-4db170116eed', 'f730b329-660d-5411-b31f-8566738edef2', '8c39494f-b810-5478-9801-0f3b90e14dc3', 200, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('9449702f-5e0e-53fa-a043-fb5b333ab7dd', 'f730b329-660d-5411-b31f-8566738edef2', 'e9402b18-ed60-5924-97e2-5196a041cdc7', 220, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('fd120b43-8495-5d7d-a3c3-35b5b70142c0', 'f730b329-660d-5411-b31f-8566738edef2', '493aabf6-d305-58c7-85dd-c013009007fb', 50, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('46004af2-2151-513a-ac59-2bbbfe8e0d0a', 'e8aa5ed0-ea06-5072-9b69-a736de490317', '3e633d44-be6e-5e82-9d60-8a9bcd2b1596', 1200, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('996dba19-6dc2-5571-a44a-2ef58eb7300a', 'c2711f7f-2040-5122-af80-6700c121eda6', '41b545ca-b9c2-59cc-88cc-2959dd9c63d7', 30, '$30–$40 ultrasonic scaling')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('86e28c58-3493-5810-9f86-44e164ce8dd6', 'c2711f7f-2040-5122-af80-6700c121eda6', '3e633d44-be6e-5e82-9d60-8a9bcd2b1596', 850, '$850–$1,000')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('c475a0f1-88dd-58d1-a2d3-c93d2554a672', 'c2711f7f-2040-5122-af80-6700c121eda6', 'df87f7b6-8b0f-50e6-8115-59436be7395f', 380, '$380–$450')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('a7804a7c-efd7-5154-b1f1-5682098d43ad', 'c2711f7f-2040-5122-af80-6700c121eda6', 'ef5e89fa-0b30-5289-8cd5-4d16b4745621', 300, '$300–$400')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('c948e57e-6561-53fe-aeb5-ebe23a5b3ca5', 'c2711f7f-2040-5122-af80-6700c121eda6', 'e9402b18-ed60-5924-97e2-5196a041cdc7', 150, '$150–$200')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('da681e34-a2bf-5935-b332-922070d87a07', 'c2711f7f-2040-5122-af80-6700c121eda6', '41b654d0-150e-5b6e-b11c-eb4caee78133', 200, '$200–$250 porcelain crown')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('6a18e860-94e3-5d32-920f-4366a76ef3b5', 'c2711f7f-2040-5122-af80-6700c121eda6', '887fe60c-3ad9-5426-8cb8-1de30f94eccb', 600, '$600–$650')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('3efac58e-404a-5f63-8508-0f312b63aa58', 'ac5e149d-5e09-55b9-b18b-1e6dcc455198', 'b132e1cb-6b2a-55eb-b7d5-79ab7988297b', 0, 'Free consultation')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('b6b99db8-6329-54bf-8715-c167fddf5ebd', 'ac5e149d-5e09-55b9-b18b-1e6dcc455198', '7e6093d0-ba2d-5875-90bd-b685acc7ee0a', 60, '$60–$240 per quadrant')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('efa08f7b-f27a-5c0a-af4f-2121493eb6a3', 'ac5e149d-5e09-55b9-b18b-1e6dcc455198', '8c39494f-b810-5478-9801-0f3b90e14dc3', 250, '$250–$300')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('0b4509c3-01a4-5ce9-80e1-7ed94c5e4fce', 'ac5e149d-5e09-55b9-b18b-1e6dcc455198', 'df87f7b6-8b0f-50e6-8115-59436be7395f', 250, '$250–$300')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('0250121e-5866-5e3e-9be9-76158f7059dc', 'ac5e149d-5e09-55b9-b18b-1e6dcc455198', '38cb6aca-4c5d-56cd-89f5-178bae738e09', 400, 'Up to $400')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('f740cc41-2b79-51e9-b668-257b1c393e0f', 'ac5e149d-5e09-55b9-b18b-1e6dcc455198', 'e6996d06-7f5d-5106-9469-3bf29639233b', 500, '$500 per cubic centimeter')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('20a09609-fba3-526d-a1b5-e62dd3e1f809', '853ec9de-0fce-583f-8800-d16dc786cec2', 'bdc342be-2f53-5afd-a74c-49cf55e33bb5', 340, 'Ozempic 1 mg semaglutide pen — MXN $5,789')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('3df77af4-adc5-5ce4-8642-7d3687103ef3', '853ec9de-0fce-583f-8800-d16dc786cec2', 'bdc342be-2f53-5afd-a74c-49cf55e33bb5', 251, 'Ozempic 1.34 mg/ml pen — MXN $4,274')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('09849819-3d34-5912-a777-b5a2f61cf37e', '853ec9de-0fce-583f-8800-d16dc786cec2', 'bdc342be-2f53-5afd-a74c-49cf55e33bb5', 138, 'Rybelsus 3 mg oral semaglutide (30 tabs) — MXN $2,351')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('b0efe966-b72a-5632-9457-33bf089e23f7', '853ec9de-0fce-583f-8800-d16dc786cec2', 'bdc342be-2f53-5afd-a74c-49cf55e33bb5', 230, 'Rybelsus 7 mg oral semaglutide (30 tabs) — MXN $3,906')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('2c509c23-285c-5672-a34d-0de35ddc1f0d', '853ec9de-0fce-583f-8800-d16dc786cec2', 'bdc342be-2f53-5afd-a74c-49cf55e33bb5', 258, 'Rybelsus 14 mg oral semaglutide (30 tabs) — MXN $4,379')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('d0748d7a-79fb-5537-94cd-3342bfe0146c', '853ec9de-0fce-583f-8800-d16dc786cec2', 'bdc342be-2f53-5afd-a74c-49cf55e33bb5', 187, 'Wegovy 0.25 mg pen — MXN $3,178')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('6a7bff03-4451-5f39-8e9c-77218f1be798', '853ec9de-0fce-583f-8800-d16dc786cec2', 'bdc342be-2f53-5afd-a74c-49cf55e33bb5', 227, 'Wegovy 0.5 mg pen — MXN $3,866')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('fe750df6-06c2-50a3-a8ec-3ae75a2c096f', '853ec9de-0fce-583f-8800-d16dc786cec2', 'bdc342be-2f53-5afd-a74c-49cf55e33bb5', 309, 'Wegovy 1 mg pen — MXN $5,245')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('9787ba72-7d7f-5379-827f-cf54b2d98e3b', '853ec9de-0fce-583f-8800-d16dc786cec2', 'bdc342be-2f53-5afd-a74c-49cf55e33bb5', 393, 'Wegovy 1.7 mg pen — MXN $6,687')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('1a3d4fc0-1155-5323-b58c-fc1ce3d26e5a', '853ec9de-0fce-583f-8800-d16dc786cec2', '50fcc6d0-951e-5729-9731-e7982e48367b', 5, 'Generic Ibuprofen 600 mg (10 caps) — MXN $77')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('1d367128-b617-5c3d-84e9-a75631a80a99', '853ec9de-0fce-583f-8800-d16dc786cec2', '50fcc6d0-951e-5729-9731-e7982e48367b', 7, 'Ibuprofen 600 mg (20 caps) — MXN $126')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('324905b9-018c-5430-9c39-3687f4f827e7', '853ec9de-0fce-583f-8800-d16dc786cec2', '50fcc6d0-951e-5729-9731-e7982e48367b', 8, 'Actron 600 mg Ibuprofen (10 caps) — MXN $133')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('b3a4f947-a169-5e59-a3de-18bcfabcb2f6', '853ec9de-0fce-583f-8800-d16dc786cec2', '50fcc6d0-951e-5729-9731-e7982e48367b', 5, 'Advil 200 mg (24 tabs) — MXN $89')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('5ebb85d8-faa7-50b6-bf03-5d85f054dad1', '853ec9de-0fce-583f-8800-d16dc786cec2', '50fcc6d0-951e-5729-9731-e7982e48367b', 11, 'Advil 400 mg (20 caps) — MXN $185')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('9b06a6ac-399a-5d08-9dc2-35cb25d2f7e5', '853ec9de-0fce-583f-8800-d16dc786cec2', '50fcc6d0-951e-5729-9731-e7982e48367b', 11, 'Advil 12-hour 600 mg (12 tabs) — MXN $184')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('1d8161ea-3542-5b06-a2ec-e297ec93159e', '853ec9de-0fce-583f-8800-d16dc786cec2', '50fcc6d0-951e-5729-9731-e7982e48367b', 13, 'Motrin 800 mg (10 tabs) — MXN $216')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('e44b6d7c-a9e4-5e2b-b268-dea3650ef230', '853ec9de-0fce-583f-8800-d16dc786cec2', '50fcc6d0-951e-5729-9731-e7982e48367b', 7, 'Febratic 600 mg (10 caps) — MXN $124')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('3e5975ee-63b8-5193-adac-dfa7d4743389', '853ec9de-0fce-583f-8800-d16dc786cec2', '50fcc6d0-951e-5729-9731-e7982e48367b', 12, 'Tabalon 400 mg (10 tabs) — MXN $210')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('e3611ddc-2ebc-5ddd-8501-63f5991e78b5', '853ec9de-0fce-583f-8800-d16dc786cec2', '13f7dab5-3091-5365-b0eb-6fe80fc1c73b', 4, 'Generic Sildenafil 100 mg (1 tab) — MXN $68')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('33011b6f-f942-5bff-b7a2-2a7884ccba45', '853ec9de-0fce-583f-8800-d16dc786cec2', '13f7dab5-3091-5365-b0eb-6fe80fc1c73b', 17, 'Viagra 100 mg Sildenafil — MXN $286')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('9f9c5085-a0c5-52a8-b18a-5439490535ee', '853ec9de-0fce-583f-8800-d16dc786cec2', '13f7dab5-3091-5365-b0eb-6fe80fc1c73b', 28, 'Generic Tadalafil 20 mg (1 tab) — MXN $474')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('78cf3d3d-733f-5c64-8014-568c654e6a71', '853ec9de-0fce-583f-8800-d16dc786cec2', '13f7dab5-3091-5365-b0eb-6fe80fc1c73b', 38, 'Generic Tadalafil 20 mg (8 tabs) — MXN $649')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('f2c14708-089c-5dd6-8f5c-8299cae26774', '853ec9de-0fce-583f-8800-d16dc786cec2', '13f7dab5-3091-5365-b0eb-6fe80fc1c73b', 23, 'Generic Tadalafil 5 mg daily (14 tabs) — MXN $396')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('2fb5ab97-746e-5296-99bf-142e013faac0', '853ec9de-0fce-583f-8800-d16dc786cec2', '13f7dab5-3091-5365-b0eb-6fe80fc1c73b', 35, 'Generic Tadalafil 5 mg daily (28 tabs) — MXN $594')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('aabd2737-3356-5a28-a1d4-e7cf21d7a2f9', '853ec9de-0fce-583f-8800-d16dc786cec2', '13f7dab5-3091-5365-b0eb-6fe80fc1c73b', 6, 'Invictus 20 mg Tadalafil (1 tab) — MXN $100')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('ab0bc22f-d04e-5d16-8b5b-adc6d10da912', '853ec9de-0fce-583f-8800-d16dc786cec2', '13f7dab5-3091-5365-b0eb-6fe80fc1c73b', 5, 'Poverful 20 mg Tadalafil (1 tab) — MXN $91')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('67205ee6-ccbc-559b-8182-df9fc87add4d', '853ec9de-0fce-583f-8800-d16dc786cec2', '7a9f4773-2501-5273-aba9-462a32a2afe6', 4, 'Generic Salbutamol 100 mcg aerosol (200 doses) — MXN $71')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('9e60a09a-4e1a-5e3a-b3f5-7f7676029836', '853ec9de-0fce-583f-8800-d16dc786cec2', '7a9f4773-2501-5273-aba9-462a32a2afe6', 7, 'Salbutamol 5 mg/ml nebulizer solution (10 ml) — MXN $118')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('8a7a0bbd-a2f0-5403-9a85-bf03853eb313', '853ec9de-0fce-583f-8800-d16dc786cec2', '7a9f4773-2501-5273-aba9-462a32a2afe6', 32, 'Ventolin 100 mcg inhaler (200 doses) — MXN $552')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('4df57c02-fb40-5ced-8c04-04f41af59f19', '853ec9de-0fce-583f-8800-d16dc786cec2', '7a9f4773-2501-5273-aba9-462a32a2afe6', 35, 'Ventolin 40 mg Salbutamol syrup (200 ml) — MXN $602')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('2ba13d7a-e2db-52d8-bab0-cadf973bc431', '853ec9de-0fce-583f-8800-d16dc786cec2', '7a9f4773-2501-5273-aba9-462a32a2afe6', 22, 'Oivila Salbutamol + Ipratropio (5 ampules) — MXN $368')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('4e79cc21-0e16-5390-8263-1fdedbae8607', '853ec9de-0fce-583f-8800-d16dc786cec2', '7a9f4773-2501-5273-aba9-462a32a2afe6', 19, 'Vinza Ipratropio + Salbutamol (10 ampules) — MXN $326')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('5ed3538f-19d4-5698-9ed0-e8854eb1a9cf', '853ec9de-0fce-583f-8800-d16dc786cec2', 'dd848c80-b299-5a6d-b53c-28cb7bdc298e', 27, 'Generic Esomeprazol 40 mg (14 tabs) — MXN $459')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('200b13dc-13a8-5381-8730-354c64a7818f', '853ec9de-0fce-583f-8800-d16dc786cec2', 'dd848c80-b299-5a6d-b53c-28cb7bdc298e', 29, 'Generic de Marca Esomeprazol 40 mg (14 tabs) — MXN $485')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('c3c7ba48-01d5-53e2-a0ff-e5265c4577b6', '853ec9de-0fce-583f-8800-d16dc786cec2', 'dd848c80-b299-5a6d-b53c-28cb7bdc298e', 36, 'Amably Esomeprazol 40 mg (14 tabs) — MXN $611')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('8a414052-349a-53c5-b7ba-1757b39d576b', '853ec9de-0fce-583f-8800-d16dc786cec2', 'dd848c80-b299-5a6d-b53c-28cb7bdc298e', 34, 'Pamezone Esomeprazol 40 mg (14 tabs) — MXN $580')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('91e290c9-2da3-5f61-aae1-b2e2bb4f32d9', '853ec9de-0fce-583f-8800-d16dc786cec2', 'dd848c80-b299-5a6d-b53c-28cb7bdc298e', 44, 'Nexium Mups Esomeprazol (brand) — MXN $741')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('931a547e-cfcd-5136-9c67-6c7953fd642d', '853ec9de-0fce-583f-8800-d16dc786cec2', 'dd848c80-b299-5a6d-b53c-28cb7bdc298e', 28, 'Ulsen Pcs Omeprazol 40 mg (14 caps) — MXN $472')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('859504b3-b470-5635-996c-90b959b607d2', '853ec9de-0fce-583f-8800-d16dc786cec2', '9ad787dc-c12c-5e70-8523-7c4a000cea8a', 6, 'Generic Ivermectin 6 mg (2 tabs) — MXN $99')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('9893a94a-0536-567c-b034-ca2e29c596d4', '853ec9de-0fce-583f-8800-d16dc786cec2', '9ad787dc-c12c-5e70-8523-7c4a000cea8a', 10, 'Generic Ivermectin 6 mg (4 tabs) — MXN $175')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('b0c56c41-697e-59ce-9e35-11a9fc88d389', '853ec9de-0fce-583f-8800-d16dc786cec2', '9ad787dc-c12c-5e70-8523-7c4a000cea8a', 12, 'Ivexterm 6 mg Ivermectin (2 tabs) — MXN $209')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('9086b0c9-b947-50e0-a1c8-dc80e62dfd92', '853ec9de-0fce-583f-8800-d16dc786cec2', '9ad787dc-c12c-5e70-8523-7c4a000cea8a', 17, 'Ivexterm 6 mg Ivermectin (4 tabs) — MXN $289')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('70f8a6e4-3c7f-5619-b46d-8443777c339a', '853ec9de-0fce-583f-8800-d16dc786cec2', '9ad787dc-c12c-5e70-8523-7c4a000cea8a', 59, 'Presteme 10 mg Ivermectin cream (30g) — MXN $1,003')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('d78dc18d-82f8-515c-9921-53972c5cc84f', '853ec9de-0fce-583f-8800-d16dc786cec2', 'f30d8c67-5e22-56fb-bceb-6f769704f674', 10, 'Losartán 50 mg — MXN $177')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('c5c6c9e2-0d9c-50f5-be44-e24e429ddb1f', '853ec9de-0fce-583f-8800-d16dc786cec2', '591ec2d9-c01b-5759-8c87-19ef251cb168', 11, 'Amoxicillin/Clavulanic acid 875/125 mg — MXN $195')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('c3e45c1e-24f3-5ff5-beaf-f8c8f48d07e8', '27be76b7-e7d6-5bf1-bdc7-4cdae75e7ac4', 'bdc342be-2f53-5afd-a74c-49cf55e33bb5', 300, 'Ozempic — community reported')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('32a4dcd5-2391-5f7b-83db-d105cf3585be', '27be76b7-e7d6-5bf1-bdc7-4cdae75e7ac4', 'bdc342be-2f53-5afd-a74c-49cf55e33bb5', 250, 'Ozempic 0.50 mg box')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('68042a49-26e5-5525-b317-dc8b80a1b6a3', '27be76b7-e7d6-5bf1-bdc7-4cdae75e7ac4', 'bdc342be-2f53-5afd-a74c-49cf55e33bb5', 41, 'Oral semaglutide pills (90 pills)')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('a6dde649-5611-5f1b-bf9a-a90e4c811055', '27be76b7-e7d6-5bf1-bdc7-4cdae75e7ac4', '7a9f4773-2501-5273-aba9-462a32a2afe6', 8, 'Albuterol inhalers (3-pack) — $7.50')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('efa91bc7-b107-5115-9a98-a75eaa4315cc', '27be76b7-e7d6-5bf1-bdc7-4cdae75e7ac4', 'cad6df88-aaed-56c0-88f0-da98ce4003c8', 5, 'Tretinoin 0.05% (smaller tube) — under $5')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('d0f54873-dc97-5411-99ab-14c91650e372', '27be76b7-e7d6-5bf1-bdc7-4cdae75e7ac4', '0c632dfc-2d77-5fb6-9d5f-c19c36d41540', 50, 'Generic Apixaban/Eliquis equivalent (100 pills)')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('87323369-92d4-5881-b1e9-6322b5c3bed8', '27be76b7-e7d6-5bf1-bdc7-4cdae75e7ac4', '9ad787dc-c12c-5e70-8523-7c4a000cea8a', 38, 'Ivermectin cream')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('a43371d1-ce79-5831-aa45-c5ab004f9753', 'bbde7181-7d9c-597d-8296-188d4d9e2c57', '75f41a19-7c01-54b2-80a2-8eaf9eb6c648', 6, 'Gabapentin 300 mg (30 caps) — $6.00')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('869aa765-6316-5f22-bcc0-838be2731752', 'bbde7181-7d9c-597d-8296-188d4d9e2c57', '0c632dfc-2d77-5fb6-9d5f-c19c36d41540', 50, 'Generic Apixaban 5 mg (100 pills) — $50')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('b3c35635-ead5-5cbf-8898-ea6c10afdef0', 'bbde7181-7d9c-597d-8296-188d4d9e2c57', '3e90c993-d773-5fbc-9fe6-b9464248890d', 5, 'Insulin FlexPen — $5 per pen')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('8252c970-2799-5682-9304-35b9ebd9bb2d', 'bbde7181-7d9c-597d-8296-188d4d9e2c57', '3e90c993-d773-5fbc-9fe6-b9464248890d', 35, 'Insulin glargine (Lantus) — $35 per month supply')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('783bb429-d7c5-5153-b31a-9cfaea940ebb', 'bbde7181-7d9c-597d-8296-188d4d9e2c57', '3e90c993-d773-5fbc-9fe6-b9464248890d', 7, 'Insulin vial — MXN $119 (~$7)')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('efdb5e4c-ad55-525b-ba60-cfde120e6986', '7d034c6b-3fd7-5ded-b9e9-475f57677e5f', '3e90c993-d773-5fbc-9fe6-b9464248890d', 22, 'Novolog FlexPen — $21.60 per pen')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('fa3b0142-b950-52c4-909e-c75e8d42acaf', '7d034c6b-3fd7-5ded-b9e9-475f57677e5f', '3e90c993-d773-5fbc-9fe6-b9464248890d', 65, 'Levemir FlexPen (box of 5 pens) — $65')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('8b625fbb-cbbe-536e-8687-4eea27ac4243', '62341662-e3cc-5790-bd07-e82dd297fea2', '591ec2d9-c01b-5759-8c87-19ef251cb168', 3, 'Z-Pak / Azithromycin (box of 3) — $2.95')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('2d8c7fd4-9454-5312-9beb-4b8fa68ed376', 'eddc556e-2ac0-55f5-8418-e7126073fc71', '7a9f4773-2501-5273-aba9-462a32a2afe6', 19, 'Albuterol inhalers — $18-19')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('7eae5e72-44da-5fba-8e8a-1b8f6f3d44e5', 'c726b1f4-1490-543a-b914-532b2cc9df68', 'bdc342be-2f53-5afd-a74c-49cf55e33bb5', 69, 'Oral semaglutide pills (90 pills) — $69')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('2d74efb9-82fb-58df-a272-86234ed2e23f', 'fc4522a9-22b8-560a-b9d7-2457b276eaa1', 'bdc342be-2f53-5afd-a74c-49cf55e33bb5', 360, 'Ozempic injections — $360')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('ebd340be-4b8b-5bd5-96b6-52f394fa1e19', '102c9284-2c93-5493-9c39-b0ea1ab2623e', 'bdc342be-2f53-5afd-a74c-49cf55e33bb5', 115, 'Ozempic — $115 (community reported)')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('8abbc7e4-27d7-5506-bb47-ebe10456abb6', '8af0db92-4598-5398-b7ea-66a194d3f9cf', '8ea30a69-5b8a-59a8-875a-b6ea10db58d9', 3, 'Plastic surgeon consultation')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('bf2b7f0e-f8bd-564d-90ad-717657983829', '8af0db92-4598-5398-b7ea-66a194d3f9cf', '713128c7-7065-5b28-a770-cdd6acd72859', 199, '$199–$299 per treatment')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('25a0f5a0-7b54-5801-877e-d3b6c7763543', '8dee2cef-fad4-5694-97fa-3b4181d8d89a', '8ea30a69-5b8a-59a8-875a-b6ea10db58d9', 30, 'Medical aesthetics consultation')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('3627b9da-aa3f-52de-8eb5-3e83840dcf8a', '8dee2cef-fad4-5694-97fa-3b4181d8d89a', '7658e2e4-96ff-5974-ae05-3655ee15c353', 300, '$300–$350 per treatment')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('eaefe6c7-09a3-5dfc-a47b-7a9269382de2', '8dee2cef-fad4-5694-97fa-3b4181d8d89a', 'f8bf2e81-a79f-58a2-a87a-a2fda2c54e42', 250, '$250–$350 per treatment')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('3b4bd58c-d056-5e42-ab43-c7bd38f949d9', '8dee2cef-fad4-5694-97fa-3b4181d8d89a', '0a306e4b-c7d3-521b-ade9-347662bb82cc', 300, 'Starting price')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('354893c2-e79b-5305-b1e4-fbeb9187d236', '8dee2cef-fad4-5694-97fa-3b4181d8d89a', 'ccf3410e-9308-5cb2-9379-029f38486241', 100, 'Starting price')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('e0e631b9-8372-5c1d-b68a-d32a00f3bf62', '8dee2cef-fad4-5694-97fa-3b4181d8d89a', '2b6cf09a-30af-5afb-915f-b3ca4b75f23f', 100, 'Starting price')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('05f1a357-b2bd-566c-aa37-b2f3c4089694', '8dee2cef-fad4-5694-97fa-3b4181d8d89a', '879ff58e-a135-56ec-807a-142d8275ef52', 200, 'Starting price')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('5326b2c0-918c-5184-8911-7e95d13ff091', '8dee2cef-fad4-5694-97fa-3b4181d8d89a', '1f69a0dc-7158-5fa0-9b55-ae940562aff4', 150, 'Starting price')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('8b31aa1b-1c8d-5676-8b2b-513ac3c938d8', '8dee2cef-fad4-5694-97fa-3b4181d8d89a', '2b62ba49-f0be-58d5-94fb-0ba131e0025b', 500, 'Starting price')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('d1bc3647-beda-5eab-9ec5-5785db0e1b6c', '4406ee2f-ce79-5db9-a5e1-daff1a970ab0', '8ea30a69-5b8a-59a8-875a-b6ea10db58d9', 0, 'Free consultation')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('e0ee1ddc-45d6-59b7-92d9-adff0fdb8460', '4406ee2f-ce79-5db9-a5e1-daff1a970ab0', '0db80dfd-8389-559a-bac9-40bd9d673ec4', 7, '$7–$11 per treatment')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('aad7b6fd-0bb3-55cd-b9e1-076a8ae7c77b', '4406ee2f-ce79-5db9-a5e1-daff1a970ab0', '7658e2e4-96ff-5974-ae05-3655ee15c353', 14, '$14–$17 per treatment (verify live)')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('48522017-feb0-5c55-8aec-c1f8c4f53e4d', '4406ee2f-ce79-5db9-a5e1-daff1a970ab0', '2b6cf09a-30af-5afb-915f-b3ca4b75f23f', 7, '$7–$17 per treatment')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('49f5f04d-4afd-52c5-a648-f350050b4272', '4406ee2f-ce79-5db9-a5e1-daff1a970ab0', '1f69a0dc-7158-5fa0-9b55-ae940562aff4', 39, '$39–$56 per treatment')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('d9e57cf6-0a7c-59a0-a854-c9037c2c57b3', '4406ee2f-ce79-5db9-a5e1-daff1a970ab0', '790fd46d-92aa-5be9-b66a-fe5b1146310c', 8, '$8–$11 per treatment')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('9f71d757-e560-5088-9b87-04b8c292961e', '4406ee2f-ce79-5db9-a5e1-daff1a970ab0', 'e8791b8a-bc5a-5e59-b7e0-46aece0f7545', 3, '$3–$8 per treatment')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('b612b0fa-8b23-5dfc-87e7-82bd0a12ac4e', '4406ee2f-ce79-5db9-a5e1-daff1a970ab0', '2673edb5-1f4d-56c4-ac01-218f08732838', 22, '$22–$45 per treatment')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('16076bda-1b5c-5bd6-887c-76d98b0fa31f', 'fc2ff05d-a8c1-5f3d-a750-995889a47411', '713128c7-7065-5b28-a770-cdd6acd72859', 350, '$350 for 50 units (community-reported)')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('b9aa48e2-5cac-5da3-a369-5039200e105f', 'ed1e2bea-21ed-5ace-acfe-9cfccc935291', 'cb89bc57-8071-5543-a92b-e552ba09c8f1', 999, 'Full face special (regular $1,999)')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('e25a0325-cdb7-556e-9d23-419d3f56c3d2', 'a6e9b234-038e-5bbd-9af5-64ad0e3cb7f5', '4235b5c2-fdc2-58ff-aae6-73b39c29fb8c', 25, 'Shellac pedicure (customer-reported)')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('1333ce1b-e917-524e-a3fe-c02308a7e202', 'a6e9b234-038e-5bbd-9af5-64ad0e3cb7f5', '194c2074-5552-598f-855d-e5f7551ab82c', 6, 'Men''s haircut (customer-reported)')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('5efa288d-a4e1-5f86-8002-a579a8c707b3', 'ee635796-abb3-54ad-93bb-fb67f1240cbc', 'e4abda76-c754-5ada-a5df-3d2e73ffb864', 100, 'Facebook promo pricing')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('8ca44bef-7a98-573a-a01a-7725e0f9c3aa', 'ee635796-abb3-54ad-93bb-fb67f1240cbc', '25bc9f3c-bf57-53e0-9994-a20ed956ca93', 60, 'Compact eyebrows')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('9cc3165b-b5cc-53c0-993f-d1194db4e8a2', 'ee635796-abb3-54ad-93bb-fb67f1240cbc', '25bc9f3c-bf57-53e0-9994-a20ed956ca93', 45, 'Microblading touch-up')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('cebcb05f-4bce-51ef-8592-4cda3914f50a', '60b023da-4250-563a-8f05-bc1ae2781b1d', '766c94fe-c6fc-5432-b9b7-e45bbfec212e', 99, 'Instagram promo package')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('39be9bfd-0228-5523-b69a-655736e69f6c', '60b023da-4250-563a-8f05-bc1ae2781b1d', '65814bae-4c22-543e-9dd2-261f887fe11f', 20, 'Community-reported pricing')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('9ab7cb89-ef3b-5a04-a9af-f0af43d49a54', '60b023da-4250-563a-8f05-bc1ae2781b1d', '4ece7e96-dcd0-57c2-ac35-bf364bdfcc89', 80, '6-month supply (community-reported)')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('ff76b1d7-8d8e-599b-b4cd-9228b4371818', '189b05a2-2bf7-591e-ab62-077180ed1cdf', '65814bae-4c22-543e-9dd2-261f887fe11f', 0, 'Free eye exam (advertised)')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('07edd696-7d6b-54d2-ab96-d2038e4297e4', '189b05a2-2bf7-591e-ab62-077180ed1cdf', '93dc8df4-828d-515e-9d8f-5f0cde050d64', 200, 'Community-reported pricing')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('22a9b117-701b-5d11-870b-aa6e51dd099e', '318bdd46-391c-528f-86e5-29ed73fcae08', '65814bae-4c22-543e-9dd2-261f887fe11f', 0, 'Free eye exam (publicly promoted)')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('9cb081eb-8e87-5739-8272-8e4e1724b02c', '5e03ca91-b695-53f3-a511-a83180beb492', '65814bae-4c22-543e-9dd2-261f887fe11f', 0, 'Free eye exam (Facebook promotion)')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('13e83413-7d70-5d79-943b-eb7879f36fa8', 'ce4f3833-67ee-5dd4-b31f-ac0b45dcd82f', 'd623b283-0a49-58de-a062-f863454de4bd', 35, 'Per visit (TripAdvisor confirmed by multiple winter Texans)')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('026f6fe7-61ab-554c-bd2b-8bcdbfa73a73', 'ce4f3833-67ee-5dd4-b31f-ac0b45dcd82f', '28d57e63-70f7-51b8-8e2a-0d6a387a8cac', 20, 'CBC at lab next door, 45-min turnaround (TripAdvisor report)')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('8bb0a593-db95-5ee1-a5e8-f66d497f0b30', 'ce4f3833-67ee-5dd4-b31f-ac0b45dcd82f', '9f33643e-c502-5ef4-a2fb-dc8022421c8e', 35, 'Full checkup included in standard visit fee')
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('2c27e113-927a-55ac-9cf6-a1991dfa6d15', '0f9ee5e8-e5a3-5b05-a0ea-5024336e61d4', '198d5c6d-e5c2-552c-a91e-65de0d28334d', 14000, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('61ee1531-57f7-5f44-9ad2-4716ff56729e', '188d9842-ef74-5a13-9e29-e1a84326d6a6', 'b1ddbf93-0d3a-5324-ba33-2b10153d7be5', 450, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('c456b690-f6d0-55a2-b4e0-606726ed84e0', '188d9842-ef74-5a13-9e29-e1a84326d6a6', 'ac76843f-e4c4-50b3-b5fd-6b4d65b4740a', 700, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('8a8c0c0c-e432-5195-b1b5-8486d6eae9da', '188d9842-ef74-5a13-9e29-e1a84326d6a6', '8f5606c9-bf0b-5498-819d-ada2e59d3d45', 150, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('5dbfd8af-5dcc-508a-b907-a44a3bac38f7', '188d9842-ef74-5a13-9e29-e1a84326d6a6', '624a80cb-476c-5731-85f8-4495f2c82f1f', 350, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('5ca19907-c30f-5552-85d1-e7a78122203b', '3e5b4432-d1b4-5ed4-8665-db9f2e54bb7c', '8c39494f-b810-5478-9801-0f3b90e14dc3', 200, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('ee7eaa68-8d33-5e24-8c61-e4102e53e14d', '3e5b4432-d1b4-5ed4-8665-db9f2e54bb7c', '624a80cb-476c-5731-85f8-4495f2c82f1f', 250, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('027fddd7-12fb-5654-91df-65f1e293e59f', '3e5b4432-d1b4-5ed4-8665-db9f2e54bb7c', '67172125-1748-59ba-b403-efdb97b0f3e2', 9000, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('2ee218e4-928e-563b-b47e-975afc3b5cff', '4571cbe2-1d15-5944-ae98-c10a6a0ccabd', '3e633d44-be6e-5e82-9d60-8a9bcd2b1596', 975, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('d35eab4d-ba78-5837-b53c-6ade20bba2d4', '4571cbe2-1d15-5944-ae98-c10a6a0ccabd', '41b654d0-150e-5b6e-b11c-eb4caee78133', 514, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('93cd7c7e-ce85-5f33-b417-a05e668e71a9', '4571cbe2-1d15-5944-ae98-c10a6a0ccabd', '8c39494f-b810-5478-9801-0f3b90e14dc3', 257, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('760e12bc-7e5b-5ae7-aca9-4c54078d8056', '4571cbe2-1d15-5944-ae98-c10a6a0ccabd', '67172125-1748-59ba-b403-efdb97b0f3e2', 12203, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('13d25ad5-05fa-543b-a8d4-efd8a12cbd08', '4571cbe2-1d15-5944-ae98-c10a6a0ccabd', '493aabf6-d305-58c7-85dd-c013009007fb', 77, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('66b37052-d98e-5f5c-b327-cd2b587dbc02', 'c0d1278b-dfa7-5c8c-a8dd-9beb6a6b37e0', '41b654d0-150e-5b6e-b11c-eb4caee78133', 350, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('d222cd7d-bf80-57ca-8312-412f39fd8ce9', 'c0d1278b-dfa7-5c8c-a8dd-9beb6a6b37e0', '8c39494f-b810-5478-9801-0f3b90e14dc3', 200, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('90c765d4-8f0b-54f9-9781-24f93ed85e81', 'c0d1278b-dfa7-5c8c-a8dd-9beb6a6b37e0', '493aabf6-d305-58c7-85dd-c013009007fb', 40, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('245af28a-8ffc-57b4-b767-9007438f2a4c', 'c0d1278b-dfa7-5c8c-a8dd-9beb6a6b37e0', '41b545ca-b9c2-59cc-88cc-2959dd9c63d7', 35, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('feb63fc0-eb06-5134-a103-62771535d4ac', 'c0d1278b-dfa7-5c8c-a8dd-9beb6a6b37e0', 'e9402b18-ed60-5924-97e2-5196a041cdc7', 180, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('322f3203-e80f-5ff6-82d0-935bd3749a05', 'c0d1278b-dfa7-5c8c-a8dd-9beb6a6b37e0', 'ef5e89fa-0b30-5289-8cd5-4d16b4745621', 500, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('fe58d19f-6020-52cc-87fd-ca5ad5a52e59', 'c0d1278b-dfa7-5c8c-a8dd-9beb6a6b37e0', '35a00367-8405-54e3-b675-15debc8d7c9e', 40, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES ('633415c1-6d37-520d-9847-2c5cff5dd33c', 'c0d1278b-dfa7-5c8c-a8dd-9beb6a6b37e0', 'df87f7b6-8b0f-50e6-8115-59436be7395f', 350, NULL)
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;
