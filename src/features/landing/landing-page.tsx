import { Capabilities } from "./components/capabilities";
import { FinalCta } from "./components/final-cta";
import { LandingHero } from "./components/hero/hero";
import { Security } from "./components/security";

export function LandingPage() {
  return (
    <div className="flex w-full flex-col">
      <LandingHero />
      <Capabilities />
      <Security />
      <FinalCta />
    </div>
  );
}
