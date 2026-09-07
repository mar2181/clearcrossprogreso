/**
 * The live border wait at the Progreso bridge — reading CBP's own feed.
 *
 * ⛔ WHY THIS EXISTS. Measured 2026-09-06 across five live SERPs, there are four
 * separate competitive fields around Nuevo Progreso, not one. The price queries
 * are held by the medical-tourism aggregators and are hard. The LOGISTICS
 * queries — where do I park, what does the bridge cost, how long is the wait —
 * are held by Wikivoyage, a 2017 TripAdvisor thread, a travel blog and one
 * clinic's FAQ page. That field is wide open, and it is exactly the reader this
 * site is for: the person in McAllen driving over for the afternoon, not the
 * patient in Chicago comparing Cancun and Los Algodones.
 *
 * A live official wait time is the one thing on that page no competitor has. It
 * is unique, genuinely useful, and it is a real reason to link to us.
 *
 * ⛔ THIS MODULE IS PURE ON PURPOSE — no fetch, no React, no Next. Every rule
 * below is a decision about whether we are telling somebody the truth about a
 * border crossing, so a guard has to be able to EXECUTE it against fixtures
 * rather than scan a component for it.
 *
 * Feed: https://bwt.cbp.gov/api/waittimes — JSON, 85 ports, no key, and it
 * answers `Access-Control-Allow-Origin: *`. We still read it server-side (see
 * app/api/border-wait/route.ts) so one call serves every visitor.
 */

/**
 * ⛔ SELECT BY PORT NUMBER, NEVER BY NAME.
 *
 * The feed carries TWO ports named "Progreso" and a substring match returns
 * both — measured, 2 matches. The other one is 230902, the DONNA International
 * Bridge, which is a different crossing several miles away with different
 * hours: CBP lists Donna as "6 am-10 pm" and Progreso as "24 hrs/day".
 *
 * That is not hypothetical drift. The site's own safety page said the bridge
 * was "open daily from 6:00 AM to midnight" until 2026-09-07 — a garbled
 * version of DONNA's hours, on the page about the Progreso crossing. Matching
 * loosely here would have rebuilt that same error from the authoritative
 * source, which is the worst possible way to get it wrong.
 */
export const PROGRESO_PORT_NUMBER = '230901';
export const PROGRESO_CROSSING_NAME = 'Progreso International Bridge';

/**
 * ⛔ THE ONLY TWO STATUSES THAT CARRY A READING.
 *
 * Measured across the whole feed (595 lane records, 2026-09-07):
 *   "Update Pending"  287    <- no reading
 *   "N/A"             146    <- no reading
 *   "no delay"         67    <- a reading
 *   "Lanes Closed"     61    <- no reading
 *   "delay"            34    <- a reading
 *
 * So 494 of 595 records are some form of "we do not know" — and EVERY ONE of
 * them carries `delay_minutes: ""`. An empty string coerces to 0, so the naive
 * read (`Number(delay_minutes)`) turns the majority state of the feed into
 * "no wait". Telling somebody the pedestrian crossing is instant when CBP is
 * actually saying the lanes are closed is the single worst output this module
 * could produce, and it is what you get by accident.
 *
 * ⛔ An absent number is not zero. Anything outside this set reports UNKNOWN.
 */
const REPORTING_STATUSES = new Set(['no delay', 'delay']);

/** A lane group we cannot report on, and the reason, so the UI can say which. */
export type LaneUnknown =
  | { kind: 'closed' }
  | { kind: 'unknown'; status: string };

export type LaneReading =
  | { kind: 'reported'; minutes: number; lanesOpen: number | null; updatedText: string }
  | LaneUnknown;

export interface CrossingReading {
  /** CBP's own hours string for this port, e.g. "24 hrs/day". */
  hours: string;
  /** CBP's own port_status. */
  portOpen: boolean;
  pedestrian: LaneReading;
  vehicle: LaneReading;
  /**
   * The feed's OWN date + time, verbatim. ⛔ Never our clock: if CBP stops
   * updating, our clock keeps advancing and a stale reading looks fresh.
   */
  observedAt: string;
  /** CBP's construction notice for this port, when there is one. */
  notice: string | null;
}

/** The shape we read out of the feed. Everything is optional — it is theirs. */
interface RawLane {
  operational_status?: unknown;
  delay_minutes?: unknown;
  lanes_open?: unknown;
  update_time?: unknown;
}
interface RawPort {
  port_number?: unknown;
  crossing_name?: unknown;
  hours?: unknown;
  date?: unknown;
  time?: unknown;
  port_status?: unknown;
  construction_notice?: unknown;
  passenger_vehicle_lanes?: { standard_lanes?: RawLane } | unknown;
  pedestrian_lanes?: { standard_lanes?: RawLane } | unknown;
}

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/**
 * ⛔ AN EMPTY OR NON-NUMERIC DELAY IS NOT ZERO — it is the absence of a reading.
 * Returns null rather than 0 so the caller cannot accidentally print "0 min".
 */
const minutesOf = (v: unknown): number | null => {
  const s = str(v);
  if (s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

const laneOf = (raw: unknown): LaneReading => {
  const lane: RawLane =
    raw && typeof raw === 'object' && 'standard_lanes' in (raw as Record<string, unknown>)
      ? (((raw as Record<string, unknown>).standard_lanes as RawLane) ?? {})
      : {};

  const status = str(lane.operational_status);

  // ⛔ "Lanes Closed" is reported separately from "we have no reading". They
  // read the same on the wire (both carry an empty delay) and mean opposite
  // things to somebody deciding whether to walk over: one is "you cannot use
  // this lane", the other is "we cannot tell you how long it is".
  if (status === 'Lanes Closed') return { kind: 'closed' };
  if (!REPORTING_STATUSES.has(status)) return { kind: 'unknown', status: status || 'no status' };

  const minutes = minutesOf(lane.delay_minutes);
  // A status of "delay"/"no delay" with no number is still not a number.
  if (minutes === null) return { kind: 'unknown', status };

  return {
    kind: 'reported',
    minutes,
    lanesOpen: minutesOf(lane.lanes_open),
    updatedText: str(lane.update_time),
  };
};

/**
 * Pull the Progreso International Bridge reading out of a parsed CBP feed.
 *
 * Returns null when the feed is unusable or the port is absent — ⛔ never a
 * zeroed-out reading, because "CBP did not answer" and "there is no wait" must
 * not be the same value on the way to the screen.
 */
export function readProgreso(feed: unknown): CrossingReading | null {
  const ports: unknown[] = Array.isArray(feed)
    ? feed
    : feed && typeof feed === 'object'
      ? (((feed as Record<string, unknown>).ports as unknown[]) ??
         ((feed as Record<string, unknown>).data as unknown[]) ??
         [])
      : [];
  if (!Array.isArray(ports) || ports.length === 0) return null;

  const port = ports.find(
    (p) => p && typeof p === 'object' && str((p as RawPort).port_number) === PROGRESO_PORT_NUMBER,
  ) as RawPort | undefined;
  if (!port) return null;

  // ⛔ A belt-and-braces check that the port number still names the crossing we
  // think it does. If CBP ever renumbers, we would rather report nothing than
  // report the Donna bridge's wait under Progreso's heading.
  if (str(port.crossing_name) !== PROGRESO_CROSSING_NAME) return null;

  const date = str(port.date);
  const time = str(port.time);
  if (!date || !time) return null;

  return {
    hours: str(port.hours),
    portOpen: str(port.port_status).toLowerCase() === 'open',
    pedestrian: laneOf(port.pedestrian_lanes),
    vehicle: laneOf(port.passenger_vehicle_lanes),
    observedAt: `${date} ${time}`,
    notice: str(port.construction_notice) || null,
  };
}
