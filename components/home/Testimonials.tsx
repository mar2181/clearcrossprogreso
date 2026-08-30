'use client';

/**
 * Customer stories.
 *
 * WARNING: THIS SECTION IS EMPTY ON PURPOSE, AND IT MUST STAY EMPTY UNTIL A REAL
 * CUSTOMER HAS SAID SOMETHING.
 *
 * Until 2026-08-30 this rendered four testimonials with invented names, Texas
 * cities, procedures and dollar figures -- "Robert M., San Antonio, TX. I was
 * quoted $5,500 for an implant..." -- on a site with zero completed
 * transactions and zero rows in clearcross_reviews.
 *
 * It carried its own disclaimer, "Names and identifying details have been
 * changed to protect privacy", which is not a mitigation: there was nobody to
 * protect, so the disclaimer was a second false statement holding up the first.
 *
 * Do not repopulate this by softening the wording. A vaguer invented customer is
 * the same claim with less detail. A story goes in here when a real person has
 * been through a real appointment and agreed to be quoted -- at which point the
 * shape below already carries a `source` field, because a quote nobody can trace
 * back to a review or a signed permission is how the last four got here.
 */

export interface Story {
  /** How this quote can be traced back to a real person. Never optional. */
  source: { kind: 'review'; reviewId: string } | { kind: 'written-permission'; note: string };
  name: string;
  location: string;
  procedure: string;
  rating: number;
  text: string;
}

/** Real, attributable customer stories. Empty until one exists. */
export const REAL_STORIES: Story[] = [];

export default function Testimonials() {
  if (REAL_STORIES.length === 0) return null;

  // Intentionally unreachable today. The renderer is rebuilt alongside the first
  // real story, so that nothing here can drift into shipping placeholder people
  // while nobody is looking.
  return null;
}
