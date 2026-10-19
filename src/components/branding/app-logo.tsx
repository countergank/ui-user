import { CountergankLogo } from "./countergank-logo";

/**
 * The Countergank mark for the public surface (COU-310, S11).
 *
 * Two artworks, one slot, because the brand has two colours that behave differently:
 *
 * - **Light theme** uses the colour artwork (black + violet), trimmed to the mark alone —
 *   without the "COUNTERGANK" wordmark, which the title next to it already says — and with
 *   its white background turned into real transparency, so it needs no tile behind it.
 * - **Dark theme** uses the inlined monochrome mark. The colour artwork's "C" is black, and
 *   black on a dark background is not a brand decision, it is a missing logo.
 *
 * Both are decorative: the surrounding link or heading carries the accessible name.
 */
export function AppLogo({ className }: { className?: string }) {
  return (
    <>
      <img
        src="/logo-countergank-color.png"
        alt=""
        aria-hidden="true"
        width={512}
        height={263}
        decoding="async"
        className={`${className ?? ""} block w-auto dark:hidden`}
      />
      <CountergankLogo className={`${className ?? ""} hidden dark:block`} />
    </>
  );
}
