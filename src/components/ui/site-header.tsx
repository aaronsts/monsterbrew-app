import { MainNavigation } from "../main-navigation";
import { MobileNavigation } from "./mobile-navigation";

export function SiteHeader() {
  return (
    <header className="bg-carrara-50 fixed top-0 z-50 w-full ">
      <div className="flex h-14 items-center gap-2 md:gap-4">
        <MainNavigation />
        <MobileNavigation />
      </div>
    </header>
  );
}
