import { useEffect, useRef, useState, type ReactNode } from "react"

/* ══ Checklist ════════════════════════════════════════════
   Adapted from Bencho's "Checklist" (MIT — bencho.dev/licence).

   KEPT: the check itself — one spring per row, the box that
   fills, the tick that draws, the rule that crosses the words
   out and the words giving up their ink.

   REMOVED: the finish where the list falls into a heap once
   every task is ticked, the three-second reset back to the
   demo tasks, and the "Add new task" row. Here a ticked
   watering stays ticked where it is, and the tasks come from
   the plants, not from typing. framer-motion was only needed
   for the fall, so it is not a dependency any more.

   ONE SPRING PER ROW, AND EVERYTHING IS READ OFF IT. The box
   filling, the tick drawing, the rule crossing the words and
   the words giving up their ink are four readings of a single
   number, not four things animated toward the same moment.
   With four transitions there are four chances for one to
   arrive early and break the illusion that this is one event;
   with one number there are none — and the reason nothing in
   this component's stylesheet carries a transition of its own.

   WHERE THE OVERSHOOT IS ALLOWED, AND WHERE IT IS NOT. A
   spring goes past its target and comes back, which is what
   makes a check feel like a press rather than a state change
   — but only some of these can survive that. The fill takes
   the raw value, so the box swells past full and settles. The
   TICK and the RULE take it clamped: a tick that overshoots
   draws itself past its own end and pulls back, which is a
   glitch rather than a bounce, and a rule that overshoots
   runs off the end of the word it is crossing out.

   One spring, two readings of it, and the difference is one
   `clamp`. */

/* ── one spring, for everything that settles ───────────────
   Frames, not milliseconds. `dt` is expressed in sixtieths of
   a second and the damping is RAISED to it rather than
   multiplied by it, so a dropped frame decays the same amount
   of energy as the two frames it replaced. Multiplying is the
   version that makes a spring behave differently on a busy
   page, which is the hardest kind of bug to see.

   The loop parks itself the moment the value has settled, so
   a list of rows at rest runs no animation frames at all. */

/* 0..100 into the two numbers a spring actually has.

   Both ends have to be usable, which is what fixes the range:
   at 0 it is slow and heavy and still arrives, at 100 it is
   quick with a visible overshoot, and nowhere in between does
   it ring for longer than it takes to read. */
/* The pair is chosen by DAMPING RATIO and then written back
   as stiffness and decay, because the ratio is the thing a
   person is actually setting and the two numbers on their own
   do not say what they add up to.

     zeta = -ln(d) / (2 * sqrt(k))

     0   → zeta ~0.85, heavy, arrives without a ring
     50  → zeta ~0.41
     100 → zeta ~0.20, lively, two visible rebounds */
const springOf = (tune: number) => ({
  /* stiffness: how hard it is pulled toward the target */
  k: 0.08 + (tune / 100) * 0.16,
  /* decay, per frame: how much of the velocity survives */
  d: 0.62 + (tune / 100) * 0.2,
})

/* Units matter. The snap threshold is absolute, so a caller
   works in pixels or in 0..100 — a spring driven over 0..1
   would be "settled" before it had visibly moved. */
function useSpring(target: number, tune = 50, instant = false) {
  const [at, setAt] = useState(target)
  const cur = useRef(target)
  const vel = useRef(0)
  const raf = useRef(0)

  useEffect(() => {
    if (instant) {
      /* no loop: the value is returned as the target below */
      cur.current = target
      vel.current = 0
      return
    }
    const { k, d } = springOf(tune)
    let prev = 0
    const tick = (t: number) => {
      const dt = prev ? clamp((t - prev) / 16.67, 0, 2.5) : 1
      prev = t
      vel.current += (target - cur.current) * k * dt
      vel.current *= Math.pow(d, dt)
      cur.current += vel.current * dt
      if (Math.abs(target - cur.current) < 0.02 && Math.abs(vel.current) < 0.02) {
        cur.current = target
        vel.current = 0
        setAt(target)
        raf.current = 0
        return
      }
      setAt(cur.current)
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf.current)
      raf.current = 0
    }
    /* `tune` sits here beside `target` because the loop closes
       over it, so without it a change mid-flight would do
       nothing until something else restarted the effect.
       Restarting picks up from the refs, so it continues rather
       than snapping. */
  }, [target, tune, instant])

  return instant ? target : at
}

/* Read once. A preference, not a live input. */
const stillness = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const mix = (a: number, b: number, t: number) => a + (b - a) * t

/* 18, against 14px text. A checkbox is sized against the LINE
   it sits beside, and at 22 it was half again the cap height
   of the words it belonged to and read as the subject of the
   row rather than as its switch. */
const BOX = 18
/* how far the box swells past full before it settles, 0..100 —
   0 is a spring that arrives dead, which is a perfectly good
   checkbox and is what most of them do */
const BOUNCE = 50

/* ── the rule follows the tick, it does not race it ────────
   Both are read off the same spring, but the rule starts a
   tenth of the way in and finishes a little early — so the
   box answers first and the words are crossed out after,
   which is the order the two things actually happen in when a
   person ticks something off a list. Started together they
   read as one wipe across the whole row; started apart they
   read as cause and effect.

   It is a window on the same number rather than a second
   timer, so there is nothing to keep in step. */
const LAG = 0.12
const RUN = 0.72

type ChecklistItemProps = {
  checked: boolean
  onToggle: () => void
  label: string // the words that get crossed out
  description?: ReactNode // under the label, not crossed out
  media?: ReactNode // between the box and the label (e.g. a photo)
  aside?: ReactNode // on the right
  disabled?: boolean
  className?: string
}

export function ChecklistItem({
  checked,
  onToggle,
  label,
  description,
  media,
  aside,
  disabled,
  className,
}: ChecklistItemProps) {
  /* ── the one number ──────────────────────────────────────
     A component per row rather than a loop, because this is a
     hook. It costs nothing at rest: a spring sitting on its
     target runs no loop at all. */
  const t = useSpring(checked ? 1 : 0, BOUNCE, stillness())
  const held = clamp(t, 0, 1)
  /* the rule's own window on the same number */
  const cut = clamp((held - LAG) / RUN, 0, 1)

  return (
    /* the ROW is the target, not the box. An 18px checkbox is
       an 18px hit area, and the words beside it are the part
       anybody actually points at */
    <button
      type="button"
      className={`chk-row ${className ?? ""}`}
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      disabled={disabled}
    >
      {/* ── the box ───────────────────────────────────────
          Two layers and neither is a border being recoloured:
          the ring is always there and the FILL grows inside
          it. A checkbox that swaps its background is a
          different colour arriving; one whose fill opens from
          the middle is the box being filled in, which is what
          the word means. */}
      <span
        className="chk-box"
        style={{ width: BOX, height: BOX, borderRadius: BOX * 0.32 }}
      >
        <span
          className="chk-fill"
          style={{
            borderRadius: BOX * 0.32,
            /* RAW, so it goes past full and settles — this is
               the one place the overshoot belongs */
            transform: `scale(${t.toFixed(4)})`,
          }}
        />
        {/* ── the tick DRAWS ─────────────────────────────
            `pathLength="1"` normalises the dash to the
            stroke's own length, so the offset is a fraction
            rather than a number somebody measured off this
            particular path — change the checkmark and nothing
            here needs to know.

            Clamped, because a tick that overshoots draws
            itself past its own end and pulls back. */}
        <svg className="chk-tick" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M6 12.4 L10.3 16.7 L18 7.6"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - held}
          />
        </svg>
      </span>

      {media}

      <span className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <span className="chk-say">
          {/* the words give up their ink as the rule crosses
              them — read off the same number, so a half-crossed
              line is half-faded and the two can never disagree */}
          <span className="chk-word" style={{ opacity: mix(1, 0.42, held) }}>
            {label}
          </span>
          {/* ── the rule is scaled, not grown ───────────────
              A width in pixels would need the word measured;
              `scaleX` from the left edge needs nothing, and a
              1.5px line has no corner for a scale to distort.
              The span is sized to the WORD rather than the row,
              so the rule stops where the text does. */}
          <span
            className="chk-rule"
            aria-hidden="true"
            style={{ transform: `scaleX(${cut.toFixed(4)})` }}
          />
        </span>
        {description}
      </span>

      {aside}
    </button>
  )
}

export default ChecklistItem
