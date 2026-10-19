/**
 * The Countergank mark for the public surface (COU-310, S11).
 *
 * The owner's artwork is the colour icon shipped in `logo-countergank-icon.ico`; its
 * embedded 256x256 RGBA PNG is extracted here as `logo-countergank-icon.png`, so the same
 * artwork serves the favicon and the header without a second conversion. It keeps its own
 * transparency, so no tile is needed behind it.
 *
 * The mark's "C" is black: on the dark theme it would disappear into the background, so
 * the dark theme gives it a light backing instead of swapping to a different artwork —
 * the brand colour is the point.
 *
 * Decorative: the surrounding link carries the accessible name.
 */
export function AppLogo({ className }: { className?: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-transparent p-0 dark:bg-background/0">
      <img
        src="/logo-countergank-icon.png"
        alt=""
        aria-hidden="true"
        width={256}
        height={256}
        decoding="async"
        className={`${className ?? ""} w-auto rounded-md bg-white p-0.5 dark:bg-white/95`}
      />
    </span>
  );
}
