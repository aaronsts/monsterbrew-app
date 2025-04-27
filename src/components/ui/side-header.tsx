import Link from "next/link";
import { Button } from "./button";
import { MainNavigation } from "../main-navigation";
import { MobileNavigation } from "./mobile-navigation";

export function SiteHeader() {
  return (
    <header className=" sticky top-0 z-50 w-full ">
      <div>
        <div className="flex h-14 items-center gap-2 md:gap-4">
          <MainNavigation />
          <MobileNavigation />
        </div>
      </div>
    </header>
  );
}
