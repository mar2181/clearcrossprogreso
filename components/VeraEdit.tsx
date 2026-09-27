import Script from 'next/script'

/**
 * Edit my website: the one page editor every client site loads, served by
 * this site's Vera brain (site_edit.py, panel_assets/vera-edit.js).
 *
 * For every visitor it applies the owner's saved picture, video and wording
 * swaps; opened from the Vera console with an edit ticket it is the editor.
 * A failed read shows the page exactly as the code wrote it. Deleting this
 * one tag removes it completely.
 */
export default function VeraEdit() {
  return (
    <Script
      id='vera-edit'
      src='https://clearcross-progreso-brain.vercel.app/site-assets/vera-edit.js'
      strategy='afterInteractive'
    />
  )
}
