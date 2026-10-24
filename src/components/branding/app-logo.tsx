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
