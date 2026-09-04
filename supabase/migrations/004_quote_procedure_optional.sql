-- 004_quote_procedure_optional.sql
--
-- Lets a visitor ask for a quote when the clinic has no published price list.
--
-- ⛔ THE FAILURE THIS ENDS. `procedure_id` was `uuid NOT NULL REFERENCES
-- clearcross_procedures(id)`, and the form sent the literal string 'general'
-- whenever the visitor had not picked one. Postgres cannot cast that to a uuid,
-- so the insert threw and the visitor got "500 Failed to create quote request".
--
-- It was not an edge case. The procedure <select> only renders for providers
-- that publish prices, so on every other provider page the value was
-- permanently empty and EVERY submission failed. Measured 2026-09-04: 63 of
-- 104 providers (61%) publish no prices, and on roughly two-thirds of pages
-- that form is the only contact affordance the page has -- phone is populated
-- on 37 of 104 providers and WhatsApp on 10. So for most visitors the site had
-- no working way to reach anybody at all.
--
-- A quote request is a person asking a question. Requiring them to classify it
-- against our procedure taxonomy first -- from a dropdown we did not render --
-- was never the right shape. The column stays a real FK; it is simply optional,
-- and `description` (min 20 chars, already enforced in the API) carries the ask.
--
-- Additive and idempotent. Dropping NOT NULL cannot invalidate an existing row,
-- and every row written so far necessarily has a procedure_id -- the old code
-- could not have inserted one without it.

ALTER TABLE public.clearcross_quote_requests
  ALTER COLUMN procedure_id DROP NOT NULL;

-- The FK itself is deliberately untouched: a procedure_id that IS supplied must
-- still name a real procedure. This makes the column optional, not unvalidated.
