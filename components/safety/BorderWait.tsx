'use client';

/**
 * The live CBP border wait panel on /safety.
 *
 * ⛔ EVERY STATE THIS RENDERS IS A STATEMENT ABOUT A BORDER CROSSING SOMEBODY IS
 * ABOUT TO DRIVE TO, so the rules are all about what it must refuse to say:
 *
 *   - It NEVER shows a number without CBP's own timestamp beside it. A figure
 *     with no time on it looks current forever.
 *   - It NEVER renders a stale reading as live. If the call fails we say the
 *     call failed. There is no "last known" fallback, deliberately — a wait
 *     time from an hour ago is worse than no wait time, because the reader
 *     cannot tell which one they are looking at.
 *   - "CBP is not reporting" and "no delay" are DIFFERENT and are never
 *     collapsed. See lib/border-wait.ts: 494 of 595 lane records in the feed
 *     are some form of "we do not know", and every one of them carries an empty
 *     delay that coerces to 0. The naive build says "no wait" to all of them.
 *   - It is additive. If the endpoint is missing entirely the panel renders its
 *     honest failure line and the rest of the page is untouched.
 */

import { useEffect, useState } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import type { CrossingReading, LaneReading } from '@/lib/border-wait';

type State =
  | { phase: 'loading' }
  | { phase: 'ok'; reading: CrossingReading }
  | { phase: 'failed' };

export default function BorderWait() {
  const { dict } = useI18n();
  const d = dict.safety;
  const [state, setState] = useState<State>({ phase: 'loading' });

  useEffect(() => {
    let live = true;
    fetch('/api/border-wait')
      .then((r) => r.json())
      .then((j) => {
        if (!live) return;
        setState(j?.ok && j.reading ? { phase: 'ok', reading: j.reading } : { phase: 'failed' });
      })
      .catch(() => {
        if (live) setState({ phase: 'failed' });
      });
    return () => {
      live = false;
    };
  }, []);

  const laneText = (lane: LaneReading): string => {
    if (lane.kind === 'closed') return d.waitClosed;
    if (lane.kind === 'unknown') return d.waitUnknown;
    return lane.minutes === 0 ? d.waitNoDelay : `${lane.minutes} ${d.waitMinutes}`;
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-5 h-5 text-brand-blue" aria-hidden="true" />
        <h3 className="font-display font-bold text-neutral-dark">{d.waitTitle}</h3>
      </div>

      {state.phase === 'loading' && <p className="text-sm text-neutral-mid">{d.waitLoading}</p>}

      {state.phase === 'failed' && (
        <p className="text-sm text-neutral-mid flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{d.waitUnavailable}</span>
        </p>
      )}

      {state.phase === 'ok' && (
        <>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <dt className="text-xs uppercase tracking-wide text-neutral-mid">{d.waitPedestrian}</dt>
              <dd className="font-display font-bold text-neutral-dark">
                {laneText(state.reading.pedestrian)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-neutral-mid">{d.waitVehicle}</dt>
              <dd className="font-display font-bold text-neutral-dark">
                {laneText(state.reading.vehicle)}
              </dd>
            </div>
          </dl>

          {/* ⛔ The timestamp is CBP's own, not our clock — see lib/border-wait.ts. */}
          <p className="text-xs text-neutral-mid mt-3">
            {d.waitObserved} {state.reading.observedAt} · {d.waitSource}
          </p>
          <p className="text-xs text-neutral-mid mt-1">
            {d.waitHours} {state.reading.hours}
          </p>
          {state.reading.notice && (
            <p className="text-xs text-neutral-mid mt-1">{state.reading.notice}</p>
          )}
        </>
      )}
    </div>
  );
}
